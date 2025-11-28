import React, { useEffect, useState, useCallback } from "react";
import { NavLink, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MoveRight, Search, Calendar, CheckCircle, XCircle } from "lucide-react";
import { getAllBookings, updateBookingStatus, getAllHotels } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [infoMessage, setInfoMessage] = useState("");
  const [managerHotelId, setManagerHotelId] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("bookingStatus") || "all");
  const [dateFilter, setDateFilter] = useState(searchParams.get("checkInStart") || "");
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (statusFilter !== "all") params.set("bookingStatus", statusFilter.toUpperCase());
    if (dateFilter) {
      params.set("checkInStart", dateFilter);
      params.set("checkInEnd", dateFilter);
    }
    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter, dateFilter, setSearchParams]);
  
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setInfoMessage("");
    try {
      const paramHotelId = params?.hotelId;
      const stateHotelId = location?.state?.hotelId;
      let resolvedHotelId = paramHotelId || stateHotelId || user?.hotelId || user?.hotel?.id;

      if (!resolvedHotelId) {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            resolvedHotelId = parsedUser?.hotelId || parsedUser?.hotel?.id;
          }
        } catch (e) {}
      }

      if (!resolvedHotelId && user) {
        try {
          const hotelsRes = await getAllHotels();
          const hotels = hotelsRes?.data?.data || hotelsRes?.data || [];
          const email = user?.email || JSON.parse(localStorage.getItem("user") || "{}")?.email;
          const phone = user?.contactNumber || JSON.parse(localStorage.getItem("user") || "{}")?.contactNumber;
          
          const match = hotels.find((h) => {
            const m = h?.manager;
            if (!m) return false;
            const matchByEmail = email && m.email && m.email.toLowerCase() === email.toLowerCase();
            const matchByPhone = phone && m.contactNumber && String(m.contactNumber) === String(phone);
            return matchByEmail || matchByPhone;
          });
          
          if (match?.id) {
            resolvedHotelId = match.id;
          }
        } catch (error) {}
      }

      const hotelId = resolvedHotelId != null ? Number(resolvedHotelId) : null;
      if (!hotelId || Number.isNaN(hotelId)) {
        setInfoMessage("Could not resolve your hotel. Please re-login as manager.");
        setBookings([]);
        setLoading(false);
        return;
      }
      setManagerHotelId(hotelId);

      const filters = { hotelId };
      if (searchTerm && searchTerm.trim()) filters.search = searchTerm.trim();
      if (statusFilter !== "all") filters.bookingStatus = statusFilter.toUpperCase();
      if (dateFilter) {
        filters.checkInStart = dateFilter;
        filters.checkInEnd = dateFilter;
      }
      filters.sortBy = "checkindate";
      filters.sortDirection = "desc";

      const res = await getAllBookings(filters);
      const list = res?.data?.data ?? res?.data ?? [];
      setBookings(Array.isArray(list) ? list : []);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404) {
        setBookings([]);
        setInfoMessage("");
      } else {
        setBookings([]);
        setInfoMessage("Failed to load bookings. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [location, params, user, searchTerm, statusFilter, dateFilter]);
  
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getAllowedTransitions = (status) => {
    switch (status) {
      case "pending":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["checked-in"];
      case "checked-in":
        return ["checked-out"];
      default:
        return [];
    }
  };

  const getActionButtonClass = (action) => {
    switch (action) {
      case "confirmed":
        return "bg-green-600 hover:bg-green-700";
      case "cancelled":
        return "bg-red-600 hover:bg-red-700";
      case "checked-in":
        return "bg-blue-600 hover:bg-blue-700";
      case "checked-out":
        return "bg-gray-600 hover:bg-gray-700";
      default:
        return "bg-gray-800 hover:bg-black";
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case "confirmed":
        return "Confirm";
      case "cancelled":
        return "Cancel";
      case "checked-in":
        return "Check-in";
      case "checked-out":
        return "Check-out";
      default:
        return action.replace("-", " ");
    }
  };

  const handleChangeStatus = async (booking, nextStatus) => {
    try {
      await updateBookingStatus(booking.id, nextStatus.toUpperCase().replace("-", "_"));
      fetchBookings();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status. Please try again.");
    }
  };

  const handleViewDetails = (booking) => {
    navigate(`/manager/bookings/view/${booking.id}`, { state: { booking } });
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "checked-in":
        return "bg-green-100 text-green-700 border-green-200";
      case "checked-out":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Bookings</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-6 rounded-2xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">
            Bookings Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage all bookings and reservations
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row flex-1 gap-3 md:gap-4 w-full md:w-auto">
              <div className="relative w-full md:flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by guest name, booking ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white pl-10 pr-4 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                />
              </div>
              <div className="flex flex-row gap-2 md:gap-4">
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white w-full md:w-auto md:px-6 px-3 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-xs md:text-sm appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked-in">Checked-in</option>
                    <option value="checked-out">Checked-out</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="relative flex-1 md:flex-none">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4.5 h-4.5 md:w-5 md:h-5" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-white w-full md:w-auto md:pl-10 pl-9 pr-3 md:pr-4 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-xs md:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-black mb-1">All Bookings</h3>
            <p className="text-xs text-gray-500">
              {bookings.length} bookings
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {infoMessage || "No bookings found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-black">
                      Booking ID
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-black">
                      Guest
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-black">
                      Room
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-black">
                      Check-in / Check-out
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-black">
                      Amount
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-black">
                      Status
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-black">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const bookingId = booking.transactionId || `BK${booking.id}`;
                    const guestName = `${booking.appUser?.firstname || ''} ${booking.appUser?.lastname || ''}`.trim() || 'Guest';
                    const guestEmail = booking.appUser?.email || '';
                    const roomNumber = booking.room?.roomNumber || '';
                    const roomType = booking.room?.roomType || '';
                    const status = (booking.bookingStatus || '').toString().toLowerCase().replace(/_/g, '-');
                    return (
                    <tr
                      key={booking.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="font-semibold text-black">
                          {bookingId}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-black">
                            {guestName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {guestEmail}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-black">
                            {(roomNumber || roomType) ? `${roomNumber || ""}${roomNumber && roomType ? " • " : ""}${roomType || ""}` : "-"}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="text-black">
                            <Calendar size={12} className="inline mr-1" />
                            {booking.checkInDate || ''}
                          </p>
                          <p className="text-gray-500">
                            <Calendar size={12} className="inline mr-1" />
                            {booking.checkOutDate || ''}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-black">
                          ₹{booking.totalAmount || 0}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border shadow ${getStatusColor(status)}`}
                        >
                          {status === "confirmed" && <CheckCircle size={12} />}
                          {status === "checked-in" && <CheckCircle size={12} />}
                          {status === "checked-out" && <CheckCircle size={12} />}
                          {status === "cancelled" && <XCircle size={12} />}
                          {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-start justify-start gap-2 flex-nowrap whitespace-nowrap">
                          <button
                            className="px-4 py-1.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all hover:scale-95 inline-flex items-center gap-1 whitespace-nowrap shadow border-none"
                            title="View"
                            onClick={() => handleViewDetails(booking)}
                          >
                            <span className="text-xs font-semibold">View</span>
                          </button>
                          {getAllowedTransitions(status).map((s) => (
                            <button
                              key={s}
                              className={`px-2.5 py-1.5 rounded-xl text-white transition-all hover:scale-95 inline-flex items-center gap-1 whitespace-nowrap shadow border-none ${getActionButtonClass(s)}`}
                              title={`Mark as ${s}`}
                              onClick={() => handleChangeStatus(booking, s)}
                            >
                              <span className="text-xs font-semibold">{getActionLabel(s)}</span>
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Bookings;
