import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { MoveRight, Calendar, User, CreditCard, Phone, Mail} from "lucide-react";
import { getRoomByRoomId, getHotelBookings, getAllHotels } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";

const BookingView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuth();
  const bookingFromState = location.state?.booking || null;
  const [booking, setBooking] = useState(bookingFromState);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookingAndRoomData = async () => {
      if (!bookingFromState && id) {
        setLoading(true);
        try {
          let hotelId = user?.hotelId || user?.hotel?.id;
          if (!hotelId) {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const parsed = JSON.parse(storedUser);
              hotelId = parsed?.hotelId || parsed?.hotel?.id;
            }
          }
          
          if (!hotelId && user) {
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
                hotelId = match.id;
              }
            } catch (error) {}
          }
          
          if (hotelId) {
            const res = await getHotelBookings(hotelId);
            const bookings = res?.data?.data || res?.data || [];
            const foundBooking = Array.isArray(bookings) ? bookings.find(b => b.id === Number(id)) : null;
            if (foundBooking) {
              setBooking(foundBooking);
            }
          }
        } catch (e) {
          console.error("Failed to fetch booking:", e);
        } finally {
          setLoading(false);
        }
      }
      
      const currentBooking = booking || bookingFromState;
      if (!currentBooking) return;
      
      const room = currentBooking.room || {};
      const roomId = room?.id || room?.roomId || currentBooking?.roomId || currentBooking?.room?.id;
      
      const hasNumber = room?.roomNumber || room?.number || currentBooking?.roomNumber;
      const hasType = room?.roomType || room?.type || currentBooking?.roomType;
      
      if (roomId && (!hasNumber || !hasType)) {
        setLoading(true);
        try {
          const res = await getRoomByRoomId(roomId);
          const data = res?.data?.data || res?.data;
          if (data) {
            setRoomData(data);
          }
        } catch (e) {
          console.error("Failed to fetch room data:", e);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchBookingAndRoomData();
  }, [id, bookingFromState, user]);

  const currentBooking = booking || bookingFromState;
  
  if (!currentBooking) {
    if (!loading) {
      navigate("/manager/bookings");
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg font-medium">Loading booking details...</div>
        </div>
      </div>
    );
  }

  const room = currentBooking.room || {};
  const appUser = currentBooking.appUser || {};
  
  const roomNumber = room?.roomNumber || room?.number || currentBooking?.roomNumber || roomData?.roomNumber || roomData?.number || "";
  const roomType = room?.roomType || room?.type || currentBooking?.roomType || roomData?.roomType || roomData?.type || "";
  
  const guestName = currentBooking.guestName || `${appUser?.firstname || ''} ${appUser?.lastname || ''}`.trim() || 'Guest';
  const guestEmail = currentBooking.guestEmail || appUser?.user?.email || appUser?.email || "";
  const guestPhone = currentBooking.guestPhone || appUser?.contactNumber || appUser?.phone || "";
  const guests = currentBooking.guests || currentBooking.totalGuests || 1;
  
  const checkIn = currentBooking.checkIn || currentBooking.checkInDate || "";
  const checkOut = currentBooking.checkOut || currentBooking.checkOutDate || "";
  
  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "";
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || "";
    } catch {
      return "";
    }
  };
  const duration = currentBooking.duration || calculateDuration(checkIn, checkOut);
  
  const paymentMethod = currentBooking.paymentMethod || "N/A";
  const paymentStatus = currentBooking.paymentStatus || (currentBooking.paymentStatus === undefined ? "PENDING" : "");
  const amount = currentBooking.amount || currentBooking.totalAmount || 0;
  
  const status = currentBooking.status || currentBooking.bookingStatus || "";
  
  const bookingDate = currentBooking.bookingDate || currentBooking.createdAt || "";

  return (
    <>
      <div className="flex items-center justify-center mb-4 gap-2 flex-wrap">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">back to home</span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <NavLink to="/manager/bookings">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">Bookings</span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Booking View</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-6 rounded-2xl">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">Booking Details</h1>
            <p className="text-sm sm:text-base text-gray-600">Booking ID: {currentBooking.transactionId || currentBooking.bookingId || `BK${currentBooking.id}` || "-"}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-black mb-3 sm:mb-4">Guest Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Guest Name</p>
                  <p className="text-xs sm:text-sm font-medium text-black">{guestName || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-xs sm:text-sm font-medium text-black break-words">{guestEmail || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Phone</p>
                  <p className="text-xs sm:text-sm font-medium text-black">{guestPhone || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Guests</p>
                  <p className="text-xs sm:text-sm font-medium text-black">{guests || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h4 className="text-base sm:text-lg font-bold text-black mb-3 sm:mb-4">Booking Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Check-in Date</p>
                  <p className="text-xs sm:text-sm font-medium text-black">{checkIn || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Check-out Date</p>
                  <p className="text-xs sm:text-sm font-medium text-black">{checkOut || "-"}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Duration</p>
                <p className="text-xs sm:text-sm font-medium text-black">{duration ? `${duration} night(s)` : "-"}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Booking Date</p>
                <p className="text-xs sm:text-sm font-medium text-black">{bookingDate || "-"}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h4 className="text-base sm:text-lg font-bold text-black mb-3 sm:mb-4">Room Details</h4>
            {loading ? (
              <div className="text-center py-4 text-xs sm:text-sm text-gray-500">Loading room details...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Room Number</p>
                  <p className="text-xs sm:text-sm font-medium text-black">{roomNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Room Type</p>
                  <p className="text-xs sm:text-sm font-medium text-black">{roomType || "-"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h4 className="text-base sm:text-lg font-bold text-black mb-3 sm:mb-4">Payment Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="text-xs sm:text-sm font-medium text-black">{paymentMethod || "-"}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Payment Status</p>
                <p className="text-xs sm:text-sm font-medium text-black">{paymentStatus || "PENDING"}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="text-base sm:text-lg font-bold text-black">₹{amount || 0}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Booking Status</p>
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-semibold border shadow bg-gray-100 text-gray-700 border-gray-200">
                  {status ? status.toString().replace("_", " ") : "-"}
                </span>
              </div>
            </div>
            <p className="mt-3 text-[10px] sm:text-xs text-gray-500">
              Reminder: guests can cancel free of charge up to 24h before check-in (48h where enabled). For escalations, refer to the{" "}
              <Link to="/terms" className="text-black underline font-semibold">policy guide</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingView;


