import {
  MoveRight,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Hotel,
  DoorOpen,
  Users,
  ArrowRight,
  DollarSign,
  Star,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  getAllRoomsByHotelId,
  getHotelBookings,
  getAllHotels,
} from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [managerData, setManagerData] = useState({ rooms: [], bookings: [], guests: [] });
  const [isLoading, setIsLoading] = useState(true);

  const getHotelId = () => {
    const storedId = localStorage.getItem("managerHotelId");
    if (storedId) return Number(storedId);
    if (user?.hotelId) {
      return Number(user.hotelId);
    }
    if (user?.hotel?.id) {
      return Number(user.hotel.id);
    }
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser?.hotelId) return Number(storedUser.hotelId);
      if (storedUser?.hotel?.id) return Number(storedUser.hotel.id);
    } catch (e) {
    }
    return null;
  };

  const hotelId = getHotelId();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let resolvedHotelId = hotelId;
        
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
              localStorage.setItem("managerHotelId", resolvedHotelId.toString());
            }
          } catch (error) {
          }
        }
        
        if (!resolvedHotelId) {
          setIsLoading(false);
          return;
        }

        const [roomsRes, bookingsRes] = await Promise.allSettled([
          getAllRoomsByHotelId(resolvedHotelId),
          getHotelBookings(resolvedHotelId),
        ]);

        const extractArray = (result) => {
          if (result.status === "rejected") {
            return [];
          }
          const res = result.value;
          if (res?.status >= 400 || res?.data?.status === 500 || res?.data?.error) {
            return [];
          }
          if (Array.isArray(res?.data?.data)) {
            return res.data.data;
          }
          if (Array.isArray(res?.data)) {
            return res.data;
          }
          return [];
        };

        const roomsData = extractArray(roomsRes);
        const bookingsData = extractArray(bookingsRes);

        const guestMap = new Map();
        if (Array.isArray(bookingsData) && bookingsData.length > 0) {
          bookingsData.forEach((booking) => {
            const appUser = booking?.appUser;
            if (appUser?.id && !guestMap.has(appUser.id)) {
              guestMap.set(appUser.id, {
                id: appUser.id,
                firstname: appUser.firstname || "",
                lastname: appUser.lastname || "",
                email: appUser.email || "",
              });
            }
          });
        }
        const guestsData = Array.from(guestMap.values());

        localStorage.setItem("managerHotelId", resolvedHotelId.toString());

        setManagerData({ rooms: roomsData, bookings: bookingsData, guests: guestsData });
      } catch (error) {
        setManagerData({ rooms: [], bookings: [], guests: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [hotelId, user]);

  const rooms = managerData?.rooms || [];
  const bookings = managerData?.bookings || [];
  const guests = managerData?.guests || [];
  const loading = isLoading;
  const dataFetched = !isLoading;

  const statusPriority = { pending: 1, confirmed: 2, "checked-in": 3, "checked-out": 4, completed: 5 };

  const dashboardData = useMemo(() => {
  const formatBooking = (booking) => {
    if (!booking) return null;
      const status = (booking.bookingStatus || "").toString().toLowerCase().replace(/_/g, "-");
      const paymentStatus = (booking.paymentStatus || "").toString().toLowerCase().replace(/_/g, "-");
    return {
      id: booking.id,
      bookingId: booking.transactionId || `BK${booking.id}`,
        guestName: `${booking.appUser?.firstname || ""} ${booking.appUser?.lastname || ""}`.trim() || "Guest",
      hotel: booking.hotel?.hotelName || "Unknown Hotel",
      roomNumber: booking.room?.roomNumber || "",
      checkIn: booking.checkInDate || "",
      checkOut: booking.checkOutDate || "",
        status,
        paymentStatus,
      amount: booking.totalAmount || 0,
    };
  };

    const bookingsArray = Array.isArray(bookings) ? bookings : [];
    const formattedBookings = bookingsArray.length > 0
      ? bookingsArray.filter(Boolean).map(formatBooking).filter(Boolean)
      : [];

    const totalRooms = Array.isArray(rooms) ? rooms.length : 0;
    const availableRooms = Array.isArray(rooms) 
      ? rooms.filter((r) => (r.status || "").toString().toLowerCase() === "available").length 
      : 0;
    const bookedRooms = Array.isArray(rooms)
      ? rooms.filter((r) => (r.status || "").toString().toLowerCase() === "booked").length
      : 0;
  const totalBookings = formattedBookings.length;
    const pendingBookings = formattedBookings.filter((b) => b.status === "pending").length;
    const totalGuests = Array.isArray(guests) ? guests.length : 0;

    const recentBookings = formattedBookings.length > 0
      ? [...formattedBookings]
          .sort((a, b) => {
            const priorityA = statusPriority[a.status] || 99;
            const priorityB = statusPriority[b.status] || 99;
            if (priorityA !== priorityB) return priorityA - priorityB;
            const dateA = a.checkIn ? new Date(a.checkIn) : new Date(0);
            const dateB = b.checkIn ? new Date(b.checkIn) : new Date(0);
            return dateB - dateA;
          })
          .slice(0, 3)
      : [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
    const upcomingCheckIns = formattedBookings.length > 0
      ? formattedBookings
          .filter((b) => {
            if (!b.checkIn) return false;
            const status = b.status;
      const checkInDate = new Date(b.checkIn);
            if (isNaN(checkInDate.getTime())) return false;
      checkInDate.setHours(0, 0, 0, 0);
            return (status === "confirmed" || status === "checked-in") && checkInDate >= today;
    })
          .sort((a, b) => {
            const dateA = a.checkIn ? new Date(a.checkIn) : new Date(0);
            const dateB = b.checkIn ? new Date(b.checkIn) : new Date(0);
            return dateA - dateB;
          })
          .slice(0, 3)
      : [];

    const paidStatuses = ["paid", "completed", "success"];
  const totalRevenue = formattedBookings
      .filter((b) => paidStatuses.includes(b.paymentStatus?.toLowerCase()))
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

  const getRevenueForPeriod = (startDate) => {
    return formattedBookings
      .filter((b) => {
        const paymentStatus = b.paymentStatus?.toLowerCase();
        const bookingDate = b.checkIn ? new Date(b.checkIn) : null;
          return paidStatuses.includes(paymentStatus) && bookingDate && bookingDate >= startDate;
      })
      .reduce((sum, b) => sum + (b.amount || 0), 0);
  };

    const hotelRatings = Array.isArray(bookings) && bookings.length > 0
      ? bookings
          .filter((b) => b?.hotel?.starRating && b.hotel.starRating > 0)
          .map((b) => b.hotel.starRating)
      : [];
    const averageRating = hotelRatings.length > 0
      ? hotelRatings.reduce((sum, rating) => sum + (Number(rating) || 0), 0) / hotelRatings.length
      : 0;

    return {
      formattedBookings,
      totalRooms,
      availableRooms,
      bookedRooms,
      totalBookings,
      pendingBookings,
      totalGuests,
      recentBookings,
      upcomingCheckIns,
      totalRevenue,
      weeklyRevenue: getRevenueForPeriod(oneWeekAgo),
      monthlyRevenue: getRevenueForPeriod(oneMonthAgo),
      sixMonthsRevenue: getRevenueForPeriod(sixMonthsAgo),
      averageRating,
      hotelRatings,
    };
  }, [rooms, bookings, guests]);

  const {
    formattedBookings,
    totalRooms,
    availableRooms,
    bookedRooms,
    totalBookings,
    pendingBookings,
    totalGuests,
    recentBookings,
    upcomingCheckIns,
    totalRevenue,
    weeklyRevenue,
    monthlyRevenue,
    sixMonthsRevenue,
    averageRating,
    hotelRatings,
  } = dashboardData;

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "confirmed" || statusLower === "checked-in") {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }
    if (statusLower === "completed" || statusLower === "checked-out") {
      return "bg-gray-100 text-gray-700 border-gray-200";
    }
    if (statusLower === "cancelled") {
      return "bg-red-100 text-red-700 border-red-200";
    }
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDaysLeft = (checkInDate) => {
    if (!checkInDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    const diffTime = checkIn - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const managerName = user?.firstname || user?.name || "Manager";

  if (loading || !dataFetched) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg font-medium">Loading dashboard...</div>
          <div className="text-gray-500 text-sm mt-2">Fetching all data...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>{" "}
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Dashboard</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-6 rounded-2xl">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">
            Welcome Back {managerName}!
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your hotel operations and bookings
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-black text-white p-4 sm:p-6 rounded-2xl shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-gray-800 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center">
                <DoorOpen className="text-white w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <span className="text-3xl sm:text-4xl font-bold">{totalRooms}</span>
            </div>
            <h3 className="text-gray-300 text-xs sm:text-sm font-medium mb-1">
              Total Rooms
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500">All rooms</p>
          </div>

          <div className="bg-black text-white p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-gray-800 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center">
                <Calendar className="text-white w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <span className="text-3xl sm:text-4xl font-bold">{totalBookings}</span>
            </div>
            <h3 className="text-gray-300 text-xs sm:text-sm font-medium mb-1">
              Total Bookings
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500">All bookings</p>
          </div>

          <div className="bg-black text-white p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-gray-800 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center">
                <Users className="text-white w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <span className="text-3xl sm:text-4xl font-bold">{totalGuests}</span>
            </div>
            <h3 className="text-gray-300 text-xs sm:text-sm font-medium mb-1">
              Total Guests
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500">Unique guests</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    className="sm:hidden text-gray-200"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    className="sm:hidden text-green-600"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${
                      totalRooms > 0 ? (availableRooms / totalRooms) * 125.6 : 0
                    } 125.6`}
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="hidden sm:block text-gray-200"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="hidden sm:block text-green-600"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${
                      totalRooms > 0 ? (availableRooms / totalRooms) * 175.9 : 0
                    } 175.9`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="text-green-600 w-4.5 h-4.5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl sm:text-4xl font-bold text-black">
                  {availableRooms}
                </span>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {totalRooms > 0
                    ? Math.round((availableRooms / totalRooms) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
            <h3 className="text-gray-700 text-xs sm:text-sm font-medium mb-1">
              Available Rooms
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500">Ready for booking</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    className="sm:hidden text-gray-200"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    className="sm:hidden text-red-600"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${
                      totalRooms > 0 ? (bookedRooms / totalRooms) * 125.6 : 0
                    } 125.6`}
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="hidden sm:block text-gray-200"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="hidden sm:block text-red-600"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${
                      totalRooms > 0 ? (bookedRooms / totalRooms) * 175.9 : 0
                    } 175.9`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Hotel className="text-red-600 w-4.5 h-4.5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl sm:text-4xl font-bold text-black">
                  {bookedRooms}
                </span>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {totalRooms > 0
                    ? Math.round((bookedRooms / totalRooms) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
            <h3 className="text-gray-700 text-xs sm:text-sm font-medium mb-1">
              Booked Rooms
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500">Currently occupied</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    className="sm:hidden text-gray-200"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    className="sm:hidden text-yellow-600"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${
                      (pendingBookings / totalBookings) * 125.6 || 0
                    } 125.6`}
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="hidden sm:block text-gray-200"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="hidden sm:block text-yellow-600"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${
                      (pendingBookings / totalBookings) * 175.9 || 0
                    } 175.9`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="text-yellow-600 w-4.5 h-4.5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl sm:text-4xl font-bold text-black">
                  {pendingBookings}
                </span>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {totalBookings > 0
                    ? Math.round((pendingBookings / totalBookings) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
            <h3 className="text-gray-700 text-xs sm:text-sm font-medium mb-1">
              Pending Bookings
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500">Awaiting confirmation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-2xl transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-black mb-1">
                    Recent Bookings
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Latest hotel reservations
                  </p>
                </div>
                <NavLink
                  to="/manager/bookings"
                  className="text-xs sm:text-sm text-gray-600 hover:text-black font-medium transition"
                >
                  <div className="flex items-center gap-2">
                    View All <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                  </div>
                </NavLink>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {recentBookings.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
                    No bookings found
                  </div>
                ) : (
                  recentBookings.map((booking) => {
                    if (!booking || !booking.id) return null;
                    return (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-gray-50 hover:border-gray-300 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-black text-sm sm:text-base">
                                {booking.guestName || "Guest"}
                              </h4>
                            </div>
                            <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                              {booking.roomNumber && (
                                <span className="flex items-center gap-1.5">
                                  <Hotel size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500" />
                                  Room {booking.roomNumber}
                                </span>
                              )}
                              <span className="flex items-center gap-1.5">
                                <Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500" />
                                {formatDate(booking.checkIn)} -{" "}
                                {formatDate(booking.checkOut)}
                              </span>
                            </div>
                            <span className="text-black font-bold text-sm sm:text-base">
                              ₹{booking.amount || 0}
                            </span>
                          </div>
                          <div className="sm:ml-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold border shadow ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status === "confirmed" ||
                              booking.status === "checked-in" ? (
                                <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                              ) : booking.status === "cancelled" ? (
                                <XCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                              ) : (
                                <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                              )}
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1).replace("-", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-black p-1.5 sm:p-2 rounded-lg">
                  <Hotel className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-black">
                    Upcoming Check-ins
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500">Next arrivals</p>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {upcomingCheckIns.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500 text-xs sm:text-sm">
                    No upcoming check-ins
                  </div>
                ) : (
                  upcomingCheckIns.map((booking) => {
                    const daysLeft = calculateDaysLeft(booking.checkIn);
                    return (
                      <div
                        key={booking.id}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-gray-100 hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-black mb-1 text-xs sm:text-sm">
                              {booking.guestName}
                            </h4>
                            {booking.roomNumber && (
                              <p className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1">
                                <Hotel size={10} className="sm:w-3 sm:h-3" />
                                Room {booking.roomNumber}
                              </p>
                            )}
                          </div>
                          {daysLeft > 0 && (
                            <div className="bg-black text-white px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold">
                              {daysLeft}d
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600">
                            <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                            <span>{formatDate(booking.checkIn)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-black p-1.5 sm:p-2 rounded-lg">
                  <Star className="text-white w-4 h-4 sm:w-5 sm:h-5" fill="white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Average Rating
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500">Hotel rating</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-2 sm:py-3">
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 mb-2 sm:mb-3">
                <svg className="w-20 h-20 sm:w-28 sm:h-28 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="sm:hidden text-gray-200"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="sm:hidden text-yellow-500"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(averageRating / 5) * 213.6} 213.6`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.5s ease" }}
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="hidden sm:block text-gray-200"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="hidden sm:block text-yellow-500"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(averageRating / 5) * 301.59} 301.59`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.5s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                    </span>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1">out of 5</p>
                  </div>
                </div>
              </div>
              <div className="text-center w-full bg-gray-50 rounded-xl p-2 sm:p-3">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={
                        star <= Math.round(averageRating)
                          ? "text-yellow-500 fill-yellow-500 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5"
                          : "text-gray-300 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5"
                      }
                    />
                  ))}
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600">
                  {hotelRatings.length === 0 ? "No ratings yet" : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl shadow-xl p-4 sm:p-5 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-black p-1.5 sm:p-2 rounded-lg">
                  <DollarSign className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Payment Profile
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500">Revenue breakdown</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-gray-600 mb-1 font-medium">Weekly</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  ₹{weeklyRevenue.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-gray-600 mb-1 font-medium">
                  Monthly
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  ₹{monthlyRevenue.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-gray-600 mb-1 font-medium">
                  6 Months
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  ₹{sixMonthsRevenue.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Last 6 months</p>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                  Total Revenue
                </span>
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
