import {
  MoveRight,
  Calendar,
  CheckCircle,
  Clock,
  Hotel,
  DoorOpen,
  Users,
  DollarSign,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  getAllRoomsByHotelId,
  getHotelBookings,
  getAllHotels,
  getAllBookings,
} from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [managerData, setManagerData] = useState({ rooms: [], bookings: [], guests: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const paramHotelId = null;
        const stateHotelId = null;
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

        if (user) {
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
          const storedHotelId = localStorage.getItem("managerHotelId");
          if (storedHotelId) {
            resolvedHotelId = Number(storedHotelId);
          }
        }

        const hotelIdNum = resolvedHotelId != null ? Number(resolvedHotelId) : null;
        if (!hotelIdNum || Number.isNaN(hotelIdNum)) {
          setIsLoading(false);
          return;
        }

        const filters = { hotelId: hotelIdNum };
        filters.sortBy = "checkindate";
        filters.sortDirection = "desc";

        const [roomsRes, bookingsRes] = await Promise.allSettled([
          getAllRoomsByHotelId(hotelIdNum),
          getAllBookings(filters),
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
        
        let bookingsData = [];
        if (bookingsRes?.status === "fulfilled") {
          const res = bookingsRes.value;
          if (Array.isArray(res?.data?.data)) {
            bookingsData = res.data.data;
          } else if (Array.isArray(res?.data)) {
            bookingsData = res.data;
          }
        }
        
        const guestMap = new Map();
        if (Array.isArray(bookingsData) && bookingsData.length > 0) {
          bookingsData.forEach((booking) => {
            const guest = booking?.appUser;
            if (!guest?.id) return;
            const id = guest.id;
            if (!guestMap.has(id)) {
              guestMap.set(id, {
                id,
                firstname: guest.firstname || "",
                lastname: guest.lastname || "",
                email: guest.user?.email || guest.email || "",
              });
            }
          });
        }
        const guestsData = Array.from(guestMap.values());

        localStorage.setItem("managerHotelId", hotelIdNum.toString());

        setManagerData({ rooms: roomsData, bookings: bookingsData, guests: guestsData });
      } catch (error) {
        setManagerData({ rooms: [], bookings: [], guests: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
      ? rooms.filter((r) => {
          const status = String(r?.status || "").toUpperCase();
          return status === "AVAILABLE";
        }).length 
      : 0;
    const bookedRooms = Array.isArray(rooms)
      ? rooms.filter((r) => {
          const status = String(r?.status || "").toUpperCase();
          return status === "BOOKED";
        }).length
      : 0;
    const totalBookings = bookingsArray.length;
    const pendingBookings = formattedBookings.filter((b) => b.status === "pending").length;
    const totalGuests = Array.isArray(guests) ? guests.length : 0;

    const paidBookings = bookingsArray.filter(
      (b) => b?.paymentStatus === "PAID" || b?.paymentStatus === "paid"
    );
    
    const totalRevenueFromBookings = paidBookings.reduce((sum, b) => sum + (b?.totalAmount || 0), 0);
    const hotelRevenue = totalRevenueFromBookings * 0.90;

    return {
      formattedBookings,
      totalRooms,
      availableRooms,
      bookedRooms,
      totalBookings,
      pendingBookings,
      totalGuests,
      totalRevenue: hotelRevenue,
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
    totalRevenue,
  } = dashboardData;

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

        <div className="mt-6 sm:mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center">
                  <DollarSign className="text-green-600 w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <h3 className="text-gray-700 text-sm sm:text-base font-medium mb-1">
                    Total Payment Revenue
                  </h3>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;
