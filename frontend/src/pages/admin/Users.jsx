import React, { useEffect, useState } from "react";
import { Search, Mail, Download, Trash2, X } from "lucide-react";
import { API_URL, sendEmailToGuest, deleteUser, getAllUsers } from "../../services/apiService";
import { useSearchParams } from "react-router-dom";

const EMAIL_PRESETS = [
  {
    label: "Account Update",
    subject: "Important Update From StayEase",
    body: "Hello {{name}},\n\nThere is an important update about your StayEase account. Please sign in to review it.\n\nThanks,\nStayEase Support Team",
  },
  {
    label: "Policy Notice",
    subject: "StayEase Policy Notice",
    body: "Dear {{name}},\n\nWe have refreshed our policies. Kindly review them at your convenience.\n\nWarm regards,\nStayEase Support Team",
  },
  {
    label: "Special Offer",
    subject: "Exclusive Offer For You",
    body: "Hello {{name}},\n\nAs a valued StayEase guest we have curated a limited-time offer for you. Visit StayEase to explore now.\n\nCheers,\nStayEase Support Team",
  },
  {
    label: "Feedback Request",
    subject: "Share Your StayEase Experience",
    body: "Hi {{name}},\n\nWe hope you enjoyed your recent stay. We'd love to hear your feedback.\n\nBest,\nStayEase Support Team",
  },
];


const formatName = (first = "", last = "", email = "") => {
  const name = `${first} ${last}`.trim();
  return name || email || "User";
};

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedUser, setSelectedUser] = useState(null);
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
    const origin = new URL(API_URL).origin;
    const toAbsolute = (path) => (!path ? "" : /^https?:/i.test(path) ? path : `${origin}${path.startsWith("/") ? path : `/${path}`}`);

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const filters = {};
        if (search && search.trim()) filters.search = search.trim();
        
        const res = await getAllUsers(filters).catch(() => ({ data: { data: [] } }));
        const rawUsers = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];

        const normalized = rawUsers.map((user) => {
          const email = user.user?.email || user.email || "";
          return {
            id: user.id,
            firstname: user.firstname || "",
            lastname: user.lastname || "",
            email: email,
            phone: user.contactNumber || user.phone || "",
            avatar: toAbsolute(user.profilePicture),
            displayName: formatName(user.firstname, user.lastname, email),
          };
        });

        setUsers(normalized);
      } catch (err) {
        setUsers([]);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search]);

  const tableColumns = [
    { key: "email", label: "Email", render: (user) => user.email || "-" },
    { key: "phone", label: "Phone", render: (user) => user.phone || "-" },
  ];

  const exportToCSV = () => {
    const headers = ["Name", ...tableColumns.map((c) => c.label)];
    const rows = users.map((user) => [
      user.displayName,
      ...tableColumns.map((col) => col.render(user)),
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const res = await deleteUser(id);
      if (res?.status === 200 || res?.status === 204) {
        setUsers((prev) => prev.filter((user) => user.id !== id));
      } else {
        alert("Failed to delete user.");
      }
    } catch {
      alert("Failed to delete user.");
    }
  };

  const openEmailModal = (user) => {
    if (!user.email) {
      alert("Email not available for this user.");
      return;
    }
    setSelectedUser(user);
    setEmailType("");
    setEmailSubject("");
    setEmailBody("");
  };

  const applyPreset = (type) => {
    setEmailType(type);
    const preset = EMAIL_PRESETS.find((p) => p.label === type);
    if (!preset || !selectedUser) {
      setEmailSubject("");
      setEmailBody("");
      return;
    }
    const name = selectedUser.displayName || "User";
    setEmailSubject(preset.subject);
    setEmailBody(preset.body.replace("{{name}}", name));
  };

  const sendEmail = async () => {
    if (!selectedUser?.email || !emailSubject || !emailBody) {
      alert("Please complete the email fields.");
      return;
    }
    try {
      setSendingEmail(true);
      await sendEmailToGuest({
        toEmail: selectedUser.email,
        guestName: selectedUser.displayName,
        emailType: emailType || "Custom",
        subject: emailSubject,
        body: emailBody,
      });
      setSelectedUser(null);
    } catch {
      alert("Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  const closeEmailModal = () => {
    setSelectedUser(null);
    setEmailType("");
    setEmailSubject("");
    setEmailBody("");
  };

  const initials = (user) => `${user.firstname?.[0] || "U"}${user.lastname?.[0] || ""}`.toUpperCase();

  return (
    <div className="flex flex-col gap-4 sm:gap-6 bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl min-h-[80vh]">
      <header className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-xs sm:text-sm text-gray-600">Total Users: {users.length}</p>
      </header>

      <section className="bg-white rounded-2xl shadow p-4 sm:p-5 flex flex-row gap-2 sm:gap-3 md:gap-4 items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone"
            className="w-full bg-white pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none text-sm"
          />
        </div>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm rounded-xl bg-black text-white hover:bg-gray-900 transition flex-shrink-0 whitespace-nowrap"
        >
          <Download size={14} /> <span className="hidden sm:inline">Download CSV</span><span className="sm:hidden">CSV</span>
        </button>
      </section>

      <section className="bg-white rounded-2xl shadow p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">All Users</h2>
          <p className="text-[10px] sm:text-xs text-gray-500">{users.length} users found</p>
        </div>

        {loading ? (
          <div className="text-center py-8 sm:py-12 text-gray-500 text-sm">Loading users...</div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12 text-red-500 text-sm">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-gray-500 text-sm">No users found.</div>
        ) : (
          <div className="w-full">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">User</th>
                  {tableColumns.map((col) => (
                    <th key={col.key} className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black hidden sm:table-cell">
                      {col.label}
                    </th>
                  ))}
                  <th className="text-center py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.displayName}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = "";
                              e.currentTarget.style.display = "none";
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs sm:text-sm font-semibold ${
                            user.avatar ? "hidden" : ""
                          }`}
                        >
                          {initials(user)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{user.displayName}</p>
                          <div className="sm:hidden text-[10px] text-gray-500 mt-0.5">
                            <div>{user.email || "-"}</div>
                            <div>{user.phone || "-"}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    {tableColumns.map((col) => (
                      <td key={col.key} className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">
                        {col.render(user)}
                      </td>
                    ))}
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => openEmailModal(user)}
                          className="p-1.5 sm:p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                          title="Send Email"
                        >
                          <Mail size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 sm:p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
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

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Send Email</h3>
              <button onClick={closeEmailModal} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto">
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                To: {selectedUser.displayName} ({selectedUser.email})
              </p>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700">
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
              <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                Subject
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="mt-1 w-full bg-white px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                  placeholder="Email subject"
                />
              </label>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                Message
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={6}
                  className="mt-1 w-full bg-white px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none resize-none text-sm"
                  placeholder="Type your message..."
                />
              </label>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 border-t border-gray-200">
                <button onClick={closeEmailModal} className="px-4 sm:px-6 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm">
                  Cancel
                </button>
                <button
                  onClick={sendEmail}
                  disabled={sendingEmail}
                  className="px-4 sm:px-6 py-2 rounded-xl bg-black text-white hover:bg-gray-900 transition disabled:opacity-50 text-sm"
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

export default Users;

