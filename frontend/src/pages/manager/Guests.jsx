import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Mail, Eye, Download, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL, getAllHotels, getHotelBookings, sendEmailToGuest } from "../../services/apiService";

const EMAIL_PRESETS = [
  {
    label: "Stay Reminder",
    subject: "Upcoming Stay Reminder from StayEase",
    body: "Hello {{name}},\n\nWe’re excited to welcome you soon at {{hotel}}! This is a friendly reminder about your upcoming stay. Let us know if you need anything before arrival.\n\nWarm regards,\n{{hotel}} Team",
  },
  {
    label: "Post-Stay Thanks",
    subject: "Thank You for Staying with StayEase",
    body: "Dear {{name}},\n\nThank you for choosing {{hotel}} for your recent stay. We hope you enjoyed your time with us and hope to see you again soon.\n\nBest wishes,\n{{hotel}} Team",
  },
  {
    label: "Promotional Offer",
    subject: "A Special Offer from StayEase",
    body: "Hello {{name}},\n\nWe have curated an exclusive offer for your next getaway at {{hotel}}. Reach out to us or visit the app to grab it before it expires.\n\nCheers,\n{{hotel}} Team",
  },
  {
    label: "Policy Update",
    subject: "Important Information about Your Stay",
    body: "Dear {{name}},\n\nWe’d like to share a quick update regarding our property guidelines at {{hotel}}. Please take a moment to review them before your next visit.\n\nThank you,\n{{hotel}} Team",
  },
];

const formatDate = (value) => {
  if (!value) return "-";
  const ts = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(ts)
    ? "-"
    : new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatName = (first = "", last = "", email = "") => {
  const name = `${first} ${last}`.trim();
  return name || email || "Guest";
};

const Guests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [emailType, setEmailType] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search && search.trim()) params.set("search", search.trim());
    setSearchParams(params, { replace: true });
  }, [search, setSearchParams]);

  useEffect(() => {
    const resolveHotelId = async () => {
      let hotelId = user?.hotelId || user?.hotel?.id;
      if (!hotelId) {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          hotelId = parsed?.hotelId || parsed?.hotel?.id;
        }
      }
      if (!hotelId && user) {
        try {
          const hotelsRes = await getAllHotels();
          const hotels = Array.isArray(hotelsRes?.data?.data)
            ? hotelsRes.data.data
            : Array.isArray(hotelsRes?.data)
            ? hotelsRes.data
            : [];
          const email = user?.email || JSON.parse(localStorage.getItem("user") || "{}")?.email;
          const phone = user?.contactNumber || JSON.parse(localStorage.getItem("user") || "{}")?.contactNumber;
          const match = hotels.find((h) => {
            const mgr = h?.manager;
            if (!mgr) return false;
            const byEmail = email && mgr.email && mgr.email.toLowerCase() === email.toLowerCase();
            const byPhone = phone && mgr.contactNumber && String(mgr.contactNumber) === String(phone);
            return byEmail || byPhone;
          });
          if (match?.id) hotelId = match.id;
        } catch {        }
      }
      return hotelId != null ? Number(hotelId) : null;
    };

    const fetchGuests = async () => {
      setLoading(true);
      setError("");
      try {
        const hotelId = await resolveHotelId();
        if (!hotelId || Number.isNaN(hotelId)) {
          setGuests([]);
          setLoading(false);
          return;
        }

        const filters = {};
        if (search && search.trim()) filters.search = search.trim();
        
        const bookingsRes = await getHotelBookings(hotelId, filters).catch(() => ({ data: { data: [] } }));
        const bookings = Array.isArray(bookingsRes?.data?.data)
          ? bookingsRes.data.data
          : Array.isArray(bookingsRes?.data)
          ? bookingsRes.data
          : [];

        const origin = new URL(API_URL).origin;
        const guestMap = new Map();
        const statsMap = {};
        const detailsMap = {};

        bookings.forEach((booking) => {
          const guest = booking?.appUser;
          if (!guest?.id) return;
          const id = guest.id;
          const email = guest.user?.email || guest.email || "";
          if (!guestMap.has(id)) {
            guestMap.set(id, {
              id,
              firstname: guest.firstname || "",
              lastname: guest.lastname || "",
              email: email,
              phone: guest.contactNumber || guest.phone || "",
              avatar: guest.profilePicture
                ? /^https?:/i.test(guest.profilePicture)
                  ? guest.profilePicture
                  : `${origin}${guest.profilePicture.startsWith("/") ? guest.profilePicture : `/${guest.profilePicture}`}`
                : "",
            });
          }
          statsMap[id] = statsMap[id] || { count: 0, lastStay: null, lastHotel: "-" };
          detailsMap[id] = detailsMap[id] || [];
          statsMap[id].count += 1;
          detailsMap[id].push(booking);
          const stayDate = booking.checkOutDate || booking.checkInDate;
          if (stayDate) {
            const stayTs = Date.parse(stayDate);
            const currentTs = statsMap[id].lastStay ? Date.parse(statsMap[id].lastStay) : null;
            if (!Number.isNaN(stayTs) && (!currentTs || stayTs > currentTs)) {
              statsMap[id].lastStay = stayDate;
              statsMap[id].lastHotel = booking?.hotel?.hotelName || statsMap[id].lastHotel;
            }
          }
        });

        const normalized = Array.from(guestMap.values()).map((guest) => {
          const stats = statsMap[guest.id] || { count: 0, lastStay: null, lastHotel: "-" };
          return {
            id: guest.id,
            name: formatName(guest.firstname, guest.lastname, guest.email),
            firstname: guest.firstname,
            lastname: guest.lastname,
            email: guest.email,
            phone: guest.phone,
            avatar: guest.avatar,
            totalBookings: stats.count,
            lastStay: stats.lastStay,
            lastHotel: stats.lastHotel,
            bookings: detailsMap[guest.id] || [],
          };
        });

        setGuests(normalized);
      } catch (err) {
        setGuests([]);
        setError("Failed to load guests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, [user, search]);

  const columnDefs = [
    { key: "email", label: "Email", render: (g) => g.email || "-" },
    { key: "phone", label: "Phone", render: (g) => g.phone || "-" },
    { key: "totalBookings", label: "Total Bookings", render: (g) => g.totalBookings || 0 },
    { key: "lastStay", label: "Last Stay", render: (g) => formatDate(g.lastStay) },
  ];

  const downloadCSV = () => {
    const headers = ["Guest Name", ...columnDefs.map((c) => c.label)];
    const rows = guests.map((guest) => [guest.name, ...columnDefs.map((c) => c.render(guest))]);
    const csv = [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guests_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewGuest = (guest) => {
    const targetId = guest?.id || guest?.userId;
    if (!targetId) {
      alert("Guest details unavailable.");
      return;
    }
    navigate(`/manager/guests/view/${targetId}`, { state: { guest } });
  };

  const openEmailModal = (guest) => {
    if (!guest.email) {
      alert("Email not available for this guest.");
      return;
    }
    setSelectedGuest(guest);
    setEmailType("");
    setEmailSubject("");
    setEmailBody("");
  };

  const applyPreset = (label) => {
    setEmailType(label);
    const preset = EMAIL_PRESETS.find((p) => p.label === label);
    if (!preset || !selectedGuest) {
      setEmailSubject("");
      setEmailBody("");
      return;
    }
    const name = selectedGuest.name || "Guest";
    const hotel = selectedGuest.lastHotel || "our StayEase property";
    setEmailSubject(preset.subject);
    setEmailBody(preset.body.replace("{{name}}", name).replace(/{{hotel}}/g, hotel));
  };

  const sendEmail = async () => {
    if (!selectedGuest?.email || !emailSubject || !emailBody) {
      alert("Please complete the email fields.");
      return;
    }
    try {
      setSendingEmail(true);
      await sendEmailToGuest({
        toEmail: selectedGuest.email,
        guestName: selectedGuest.name,
        emailType: emailType || "Custom",
        subject: emailSubject,
        body: emailBody,
      });
      setSelectedGuest(null);
    } catch {
      alert("Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  const closeEmailModal = () => {
    setSelectedGuest(null);
    setEmailType("");
    setEmailSubject("");
    setEmailBody("");
  };

  const initials = (guest) => `${guest.firstname?.[0] || "G"}${guest.lastname?.[0] || ""}`.toUpperCase();


  return (
    <div className="flex flex-col gap-4 sm:gap-6 bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl min-h-[80vh]">
      <header className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Guests Management</h1>
        <p className="text-xs sm:text-sm text-gray-600">Total Guests: {guests.length}</p>
      </header>

      <section className="bg-white rounded-2xl shadow p-4 sm:p-5 flex flex-col md:flex-row gap-3 md:gap-4 md:items-center md:justify-between">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by guest name or email"
            className="w-full bg-white pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none text-sm"
          />
        </div>
        <button
          onClick={downloadCSV}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl bg-black text-white hover:bg-gray-900 transition w-full md:w-auto"
        >
          <Download size={16} className="sm:w-4 sm:h-4" /> <span>Download CSV</span>
        </button>
      </section>

      <section className="bg-white rounded-2xl shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Guests</h2>
          <p className="text-xs text-gray-500">{guests.length} guests found</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading guests...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : guests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No guests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-black">Guest Name</th>
                  {columnDefs.map((col) => (
                    <th key={col.key} className="text-left py-4 px-4 text-sm font-semibold text-black">
                      {col.label}
                    </th>
                  ))}
                  <th className="text-center py-4 px-4 text-sm font-semibold text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {guest.avatar ? (
                          <img
                            src={guest.avatar}
                            alt={guest.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = "";
                              e.currentTarget.style.display = "none";
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold ${
                            guest.avatar ? "hidden" : ""
                          }`}
                        >
                          {initials(guest)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{guest.name}</p>
                        </div>
                      </div>
                    </td>
                    {columnDefs.map((col) => (
                      <td key={col.key} className="py-4 px-4 text-sm text-gray-700">
                        {col.render(guest)}
                      </td>
                    ))}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewGuest(guest)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="View Guest"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => openEmailModal(guest)}
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                          title="Send Email"
                        >
                          <Mail size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedGuest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Send Email</h3>
              <button onClick={closeEmailModal} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <p className="text-sm font-semibold text-gray-700">
                To: {selectedGuest.name} ({selectedGuest.email})
              </p>
              <label className="block text-sm font-semibold text-gray-700">
                Email Type
                <select
                  value={emailType}
                  onChange={(e) => applyPreset(e.target.value)}
                  className="mt-1 w-full bg-white px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                >
                  <option value="">Custom...</option>
                  {EMAIL_PRESETS.map((preset) => (
                    <option key={preset.label} value={preset.label}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-gray-700">
                Subject
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="mt-1 w-full bg-white px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                  placeholder="Email subject"
                />
              </label>
              <label className="block text-sm font-semibold text-gray-700">
                Message
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={6}
                  className="mt-1 w-full bg-white px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none resize-none text-sm"
                  placeholder="Type your message..."
                />
              </label>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button onClick={closeEmailModal} className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                  Cancel
                </button>
                <button
                  onClick={sendEmail}
                  disabled={sendingEmail}
                  className="px-6 py-2 rounded-xl bg-black text-white hover:bg-gray-900 transition disabled:opacity-50"
                >
                  {sendingEmail ? "Sending..." : "Send Email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;
