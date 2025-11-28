import React, { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {Calendar,User,CheckCircle,XCircle,MoveRight} from "lucide-react";
import { getAllBookings, updateBookingStatus, getAllHotels } from "../../services/apiService";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch {
    return dateString;
  }
};

const getStatusBadge = (status) => {
  const s = (status || "").toString().toLowerCase();
  const map = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-green-100 text-green-700 border-green-200",
    "checked-in": "bg-blue-100 text-blue-700 border-blue-200",
    "checked-out": "bg-gray-100 text-gray-700 border-gray-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };
  return map[s] || "bg-gray-100 text-gray-700 border-gray-200";
};

const Bookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [hotelFilter, setHotelFilter] = useState(searchParams.get("hotelId") || "all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("bookingStatus") || "all");
  const [dateFilter, setDateFilter] = useState(searchParams.get("checkInStart") || "");

  useEffect(() => {
    const params = new URLSearchParams();
    if (hotelFilter !== "all") params.set("hotelId", hotelFilter);
    if (statusFilter !== "all") params.set("bookingStatus", statusFilter.toUpperCase());
    if (dateFilter) {
      params.set("checkInStart", dateFilter);
      params.set("checkInEnd", dateFilter);
    }
    setSearchParams(params, { replace: true });
  }, [hotelFilter, statusFilter, dateFilter, setSearchParams]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await getAllHotels();
        const data = res?.data?.data ?? res?.data ?? [];
        setHotels(Array.isArray(data) ? data : []);
      } catch (e) {
        setHotels([]);
      }
    };
    fetchHotels();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        const filters = {};
        if (statusFilter !== "all") filters.bookingStatus = statusFilter.toUpperCase();
        if (hotelFilter !== "all") filters.hotelId = parseInt(hotelFilter);
        if (dateFilter && dateFilter.trim()) {
          filters.checkInStart = dateFilter.trim();
          filters.checkInEnd = dateFilter.trim();
        }
        filters.sortBy = "checkindate";
        filters.sortDirection = "desc";
        
        const res = await getAllBookings(filters);
        const data = res?.data?.data ?? res?.data ?? [];
        setBookings(Array.isArray(data) ? data : []);
      } catch (e) {
        setError("Failed to load bookings");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [statusFilter, hotelFilter, dateFilter]);

  const handleCancel = async (id) => {
    if (window.confirm("Cancel this booking?")) {
      try {
        await updateBookingStatus(id, "CANCELLED");
        setBookings((prev) => prev.filter((b) => b.id !== id));
      } catch (e) {
        alert("Failed to cancel booking. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mb-3 sm:mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Bookings</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-14 rounded-2xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">
            Bookings Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Monitor and manage all bookings across hotels
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-row gap-1.5 sm:gap-3 md:gap-4 items-center">
            <div className="flex flex-1 gap-1.5 sm:gap-3 md:gap-4 min-w-0">
              <div className="relative flex-1 min-w-0">
                <select
                  value={hotelFilter}
                  onChange={(e) => setHotelFilter(e.target.value)}
                  className="bg-white px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-[10px] sm:text-xs md:text-sm appearance-none w-full"
                >
                  <option value="all">All Hotels</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.hotelName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 min-w-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-[10px] sm:text-xs md:text-sm appearance-none w-full"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked-in">Checked-in</option>
                  <option value="checked-out">Checked-out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="relative flex-1 min-w-0">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-white px-1.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-[10px] sm:text-xs md:text-sm w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-black mb-1">All Bookings</h3>
            <p className="text-[10px] sm:text-xs text-gray-500">
              {bookings.length} bookings
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm">Loading bookings...</div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12 text-red-600 text-sm">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm">
              No bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 sm:py-3 px-2 text-[10px] sm:text-xs font-semibold text-black whitespace-nowrap">
                      Booking ID
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 text-[10px] sm:text-xs font-semibold text-black whitespace-nowrap">
                      Hotel
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 text-[10px] sm:text-xs font-semibold text-black whitespace-nowrap hidden sm:table-cell">
                      Guest
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 text-[10px] sm:text-xs font-semibold text-black whitespace-nowrap hidden md:table-cell">
                      Room
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 text-[10px] sm:text-xs font-semibold text-black whitespace-nowrap">
                      Dates
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 text-[10px] sm:text-xs font-semibold text-black whitespace-nowrap">
                      Amount
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 text-[10px] sm:text-xs font-semibold text-black whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-center py-2 sm:py-3 px-2 text-[10px] sm:text-xs font-semibold text-black whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const bookingId = b.transactionId || `BK${b.id}`;
                    const hotelName = b.hotel?.hotelName || "";
                    const guestName = `${b.appUser?.firstname || ''} ${b.appUser?.lastname || ''}`.trim() || 'Guest';
                    const roomNumber = b.room?.roomNumber || "";
                    const status = (b.bookingStatus || "").toString().toLowerCase();
                    const paymentStatus = (b.paymentStatus || "").toString().toLowerCase() || "pending";
                    return (
                    <tr
                      key={b.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2 sm:py-3 px-2">
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-700 whitespace-nowrap">
                          <Calendar size={10} className="text-gray-500 flex-shrink-0" />
                          <span className="truncate">{bookingId}</span>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2">
                        <div className="text-[10px] sm:text-xs text-gray-800 font-medium truncate max-w-[100px] sm:max-w-[120px]">
                          {hotelName}
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-800 whitespace-nowrap">
                          <User size={10} className="text-gray-500 flex-shrink-0" />
                          <span className="truncate max-w-[100px]">{guestName}</span>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 hidden md:table-cell">
                        <div className="text-[10px] sm:text-xs text-gray-800 whitespace-nowrap">
                          {roomNumber || "N/A"}
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2">
                        <div className="text-[10px] sm:text-xs text-gray-800">
                          <div className="whitespace-nowrap">{formatDate(b.checkInDate)}</div>
                          <div className="whitespace-nowrap">to {formatDate(b.checkOutDate)}</div>
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">
                          {b.totalGuests || 1} guest{(b.totalGuests || 1) !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2">
                        <div className="text-[10px] sm:text-xs text-gray-800 whitespace-nowrap">
                          ₹{b.totalAmount || 0}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-gray-500">
                          {paymentStatus ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1) : "Pending"}
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2">
                        <span
                          className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-semibold border ${getStatusBadge(status)}`}
                        >
                          {status === "confirmed" && <CheckCircle size={9} />}
                          {status === "checked-in" && <CheckCircle size={9} />}
                          {status === "checked-out" && <CheckCircle size={9} />}
                          {status === "cancelled" && <XCircle size={9} />}
                          <span className="whitespace-nowrap">
                            {status ? status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ") : "N/A"}
                          </span>
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2">
                        <div className="flex items-center justify-center gap-1">
                          {status === "pending" && (
                            <button
                              className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] bg-red-500 text-white hover:bg-red-600 transition-all hover:scale-95 inline-flex items-center gap-1 whitespace-nowrap shadow border-none"
                              title="Cancel"
                              onClick={() => handleCancel(b.id)}
                            >
                              Cancel
                            </button>
                          )}
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
