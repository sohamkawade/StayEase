import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { MoveRight, Mail, Phone, ArrowLeft, Calendar, History } from "lucide-react";
import { getUserBookings } from "../../services/apiService";

const GuestView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const guest = location.state?.guest || null;
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

  useEffect(() => {
    const loadBookingData = async () => {
      if (!guest?.userId && !guest?.id) return;
      
      setLoading(true);
      try {
        const userId = guest?.userId || guest?.id;
        
        const res = await getUserBookings(userId);
        const history = res?.data?.data || res?.data || [];
        const bookings = Array.isArray(history) ? history : [];
        
        const current = bookings.sort((a, b) => 
          new Date(b.checkInDate || 0) - new Date(a.checkInDate || 0)
        )[0] || null;
        
        setCurrentBooking(current);
        setBookingHistory(bookings);
      } catch (e) {
        console.error("Failed to load booking history:", e);
        setBookingHistory([]);
        setCurrentBooking(null);
      } finally {
        setLoading(false);
      }
    };

    if (guest) {
      loadBookingData();
    }
  }, [guest]);

  if (!guest) {
    navigate("/manager/guests");
    return null;
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGuestEmail = () => {
    return guest?.user?.email || guest?.email || "";
  };

  const getPaymentStatusColor = (status) => {
    const s = (status || "").toString().toLowerCase();
    switch (s) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "refunded":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    const s = (status || "").toString().toLowerCase();
    switch (s) {
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "checked-in":
        return "bg-green-100 text-green-700 border-green-200";
      case "checked-out":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const room = currentBooking?.room || {};
  const roomNumber = room.roomNumber || room.number || currentBooking?.roomNumber || guest?.roomNumber || "";
  const roomType = room.roomType || room.type || currentBooking?.roomType || guest?.roomType || "";

  return (
    <>
      <div className="flex items-center justify-center mb-4 gap-2 flex-wrap">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">back to home</span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <NavLink to="/manager/guests">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">Guests</span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Guest View</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-6 rounded-2xl">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">Guest Profile</h1>
            <p className="text-sm sm:text-base text-gray-600">Detailed information about the guest</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200">
            {guest.avatar ? (
              <img src={guest.avatar} alt={guest.name} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-2 sm:border-4 border-gray-200 flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl sm:text-2xl md:text-3xl border-2 sm:border-4 border-gray-200 flex-shrink-0">
                {getInitials(guest.name)}
              </div>
            )}
            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-1">{guest.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {roomNumber ? `Room ${roomNumber}` : ""} {roomType ? `• ${roomType}` : ""}
              </p>
              {bookingHistory.length > 0 && (
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  {bookingHistory.length} booking{bookingHistory.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-bold text-black mb-3 sm:mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-xs sm:text-sm font-medium text-black break-words">{getGuestEmail() || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Phone</p>
                  <p className="text-xs sm:text-sm font-medium text-black">{guest.phone || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {currentBooking && (
            <div className="border-t border-gray-200 pt-4 sm:pt-6">
              <h4 className="text-base sm:text-lg font-bold text-black mb-3 sm:mb-4">Current Booking</h4>
              <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                    <p className="text-sm font-semibold text-black">
                      {currentBooking.transactionId || `BK${currentBooking.id}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border shadow ${getStatusColor(currentBooking.bookingStatus)}`}>
                      {currentBooking.bookingStatus ? currentBooking.bookingStatus.toString().replace("_", " ") : "N/A"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Room</p>
                    <p className="text-sm font-medium text-black">
                      {roomNumber || "-"} • {roomType || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getPaymentStatusColor(currentBooking.paymentStatus)}`}>
                      {currentBooking.paymentStatus ? currentBooking.paymentStatus.toString().replace("_", " ") : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Check-in Date</p>
                      <p className="text-xs sm:text-sm font-medium text-black">{currentBooking.checkInDate || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Check-out Date</p>
                      <p className="text-xs sm:text-sm font-medium text-black">{currentBooking.checkOutDate || "-"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Total Amount</p>
                    <p className="text-base sm:text-lg font-bold text-black">₹{currentBooking.totalAmount || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Guests</p>
                    <p className="text-xs sm:text-sm font-medium text-black">{currentBooking.totalGuests || 1} guest(s)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
              <h4 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
                <History className="w-4 h-4 sm:w-5 sm:h-5" /> <span>Booking History</span>
              </h4>
              {bookingHistory.length > 0 && (
                <span className="text-xs sm:text-sm text-gray-500">
                  {bookingHistory.length} booking{bookingHistory.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-gray-500">Loading booking history...</div>
            ) : bookingHistory.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-gray-500">
                <History className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                <p>No booking history found.</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {bookingHistory.map((booking, idx) => {
                  const bRoom = booking.room || {};
                  const bRoomNumber = bRoom.roomNumber || bRoom.number || booking.roomNumber || "";
                  const bRoomType = bRoom.roomType || bRoom.type || booking.roomType || "";
                  
                  return (
                    <div key={booking.id || idx} className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-black text-sm sm:text-base md:text-lg">
                            {booking.transactionId || `Booking #${booking.id}`}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            {booking.checkInDate ? `Check-in: ${booking.checkInDate}` : ""}
                            {booking.checkOutDate ? ` • Check-out: ${booking.checkOutDate}` : ""}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-semibold border shadow flex-shrink-0 ${getStatusColor(booking.bookingStatus)}`}>
                          {booking.bookingStatus ? booking.bookingStatus.toString().replace("_", " ") : "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Room Details</p>
                          <p className="text-xs sm:text-sm font-medium text-black">
                            {bRoomNumber || "N/A"} • {bRoomType || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Payment</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <p className="text-xs sm:text-sm font-semibold text-black">₹{booking.totalAmount || 0}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-medium border w-fit ${getPaymentStatusColor(booking.paymentStatus)}`}>
                              {booking.paymentStatus ? booking.paymentStatus.toString().replace("_", " ") : "Pending"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Guests</p>
                          <p className="text-xs sm:text-sm font-medium text-black">{booking.totalGuests || 1} guest(s)</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {bookingHistory.length > 0 && (
            <div className="border-t border-gray-200 pt-4 sm:pt-6">
              <h4 className="text-base sm:text-lg font-bold text-black mb-3 sm:mb-4">Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Total Bookings</p>
                  <p className="text-xl sm:text-2xl font-bold text-black">{bookingHistory.length}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Total Spent</p>
                  <p className="text-xl sm:text-2xl font-bold text-black">
                    ₹{bookingHistory.reduce((sum, b) => sum + (b.totalAmount || 0), 0)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200 sm:col-span-2 md:col-span-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Average per Booking</p>
                  <p className="text-xl sm:text-2xl font-bold text-black">
                    ₹{bookingHistory.length > 0 ? Math.round(bookingHistory.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / bookingHistory.length) : 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GuestView;
