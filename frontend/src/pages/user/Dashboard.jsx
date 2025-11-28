import {
  MoveRight,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Hotel,
  ArrowRight,
  Star,
} from "lucide-react";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  getUserBookings,
  getFeedbackByUserId,
  submitStayEaseFeedback,
} from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const [fbRating, setFbRating] = useState(0);
  const [fbMessage, setFbMessage] = useState("");
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbError, setFbError] = useState("");
  const [fbSuccess, setFbSuccess] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || user?.userId;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsResponse, feedbackResponse] = await Promise.allSettled([
          getUserBookings(userId),
          getFeedbackByUserId(userId),
        ]);

        const bookingsData = bookingsResponse.status === "fulfilled"
          ? bookingsResponse.value?.data?.data || bookingsResponse.value?.data || []
          : [];
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
        setBookings(bookingsArray);
      } catch (error) {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setFbError("");
    setFbSuccess("");
    setFbSubmitting(true);
    try {
      const res = await submitStayEaseFeedback(
        userId,
        fbRating,
        fbMessage.trim()
      );
      const ok = res?.status >= 200 && res?.status < 300;
      if (ok) {
        setFbSuccess("Thank you for your feedback!");
        setFbMessage("");
        setFbRating(0);
        try {
          const feedbackResponse = await getFeedbackByUserId(userId);
          const feedbackData = feedbackResponse?.data?.data ?? feedbackResponse?.data ?? [];
        } catch (err) {
          console.error("Failed to refresh feedback count", err);
        }
      } else {
        const msg =
          res?.data?.message || "Failed to submit feedback. Please try again.";
        setFbError(msg);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit feedback. Please try again.";
      setFbError(msg);
    } finally {
      setFbSubmitting(false);
    }
  };

  const formatBooking = (booking) => {
    const status = (booking.bookingStatus || "")
      .toString()
      .toLowerCase()
      .replace(/_/g, "-");
    return {
      id: booking.id,
      bookingId: booking.transactionId || `BK${booking.id}`,
      hotel: booking.hotel?.hotelName || "Unknown Hotel",
      location: booking.hotel?.address?.city || "",
      checkIn: booking.checkInDate || "",
      checkOut: booking.checkOutDate || "",
      status: status,
      amount: booking.totalAmount || 0,
      guests: booking.totalGuests || 0,
    };
  };

  const formattedBookings = bookings.map(formatBooking);

  const totalBookings = formattedBookings.length;
  const upcomingBookings = formattedBookings.filter((b) => {
    const status = b.status;
    const today = new Date();
    const checkInDate = new Date(b.checkIn);
    return (
      (status === "confirmed" || status === "checked-in") &&
      checkInDate >= today
    );
  }).length;
  const completedBookings = formattedBookings.filter(
    (b) => b.status === "completed" || b.status === "checked-out"
  ).length;

  const recentBookings = formattedBookings
    .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn))
    .slice(0, 3);

  const upcomingCheckIns = formattedBookings
    .filter((b) => {
      const status = b.status;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(b.checkIn);
      checkInDate.setHours(0, 0, 0, 0);
      return (
        (status === "confirmed" || status === "checked-in") &&
        checkInDate >= today
      );
    })
    .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))
    .slice(0, 3);

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

  const userName = user?.firstname || user?.name || "User";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center mb-3 sm:mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>{" "}
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Dashboard</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-14 rounded-2xl">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">
            Welcome Back {userName}!
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your bookings and discover amazing stays
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-black text-white p-4 sm:p-6 rounded-2xl shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-800 p-2 sm:p-3 rounded-xl">
                <Calendar className="text-white" size={20} />
              </div>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{totalBookings}</span>
            </div>
            <h3 className="text-gray-300 text-xs sm:text-sm font-medium mb-1">
              Total Bookings
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500">All time bookings</p>
          </div>

          <div className="bg-black text-white p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-800 p-2 sm:p-3 rounded-xl">
                <Clock className="text-white" size={20} />
              </div>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{upcomingBookings}</span>
            </div>
            <h3 className="text-gray-300 text-xs sm:text-sm font-medium mb-1">Upcoming</h3>
            <p className="text-[10px] sm:text-xs text-gray-500">Scheduled bookings</p>
          </div>

          <div className="bg-black text-white p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-800 p-2 sm:p-3 rounded-xl">
                <CheckCircle className="text-white" size={20} />
              </div>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{completedBookings}</span>
            </div>
            <h3 className="text-gray-300 text-xs sm:text-sm font-medium mb-1">
              Completed
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500">Past stays</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-2xl transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-black mb-1">
                    Recent Bookings
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Your latest hotel reservations
                  </p>
                </div>
                <NavLink
                  to="/user/my-bookings"
                  className="text-xs sm:text-sm text-gray-600 hover:text-black font-medium transition"
                >
                  <div className="flex items-center gap-2">
                    View All <ArrowRight size={12} />
                  </div>
                </NavLink>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {recentBookings.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
                    No bookings found
                  </div>
                ) : (
                  recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-black text-sm sm:text-base">
                              {booking.hotel}
                            </h4>
                          </div>
                          <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                            {booking.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin size={12} className="text-gray-500" />
                                {booking.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-gray-500" />
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
                              <CheckCircle size={12} />
                            ) : booking.status === "cancelled" ? (
                              <XCircle size={12} />
                            ) : (
                              <CheckCircle size={12} />
                            )}
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1).replace("-", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-black p-1.5 sm:p-2 rounded-lg">
                  <Hotel className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-black">
                    Upcoming Check-ins
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500">Your next stays</p>
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
                              {booking.hotel}
                            </h4>
                            {booking.location && (
                              <p className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1">
                                <MapPin size={10} />
                                {booking.location}
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
                            <Calendar size={12} />
                            <span>{formatDate(booking.checkIn)}</span>
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-600">
                            {booking.guests}{" "}
                            {booking.guests === 1 ? "guest" : "guests"}
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

        <div className="mt-4 sm:mt-6 bg-white rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-black">
                Share your feedback
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500">
                Help us improve your StayEase experience
              </p>
            </div>
          </div>

          {fbError && (
            <div className="mb-3 p-2 text-red-500 text-xs sm:text-sm">{fbError}</div>
          )}
          {fbSuccess && (
            <div className="mb-3 p-2 text-green-600 text-xs sm:text-sm">{fbSuccess}</div>
          )}

          <form
            onSubmit={handleFeedbackSubmit}
            className="flex flex-col sm:grid sm:grid-cols-6 gap-3"
          >
            <div className="sm:col-span-1">
              <span className="block text-[10px] sm:text-xs text-gray-600 mb-1">Rating</span>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {[1, 2, 3, 4, 5].map((val) => {
                  const filled = val <= fbRating;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFbRating(val)}
                      className="p-0.5 sm:p-1 rounded hover:scale-105 transition"
                      title={`${val} Star${val > 1 ? "s" : ""}`}
                      aria-label={`${val} Star${val > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={18}
                        className={filled ? "text-yellow-500" : "text-gray-300"}
                        fill={filled ? "currentColor" : "none"}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="sm:col-span-4">
              <label
                htmlFor="message"
                className="block text-[10px] sm:text-xs text-gray-600 mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={2}
                placeholder="Write your feedback..."
                className="w-full bg-transparent border border-gray-300 rounded-xl py-2 px-3 text-sm sm:text-base text-black focus:ring-1 focus:ring-gray-700"
                value={fbMessage}
                onChange={(e) => setFbMessage(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-1 flex items-center justify-center">
              <button
                type="submit"
                className="w-full bg-black hover:bg-gray-900 hover:scale-95 transition-all py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-white disabled:opacity-60"
                disabled={fbSubmitting || fbMessage.trim().length === 0}
              >
                {fbSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
