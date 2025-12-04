import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useSearchParams, Link } from "react-router-dom";
import {
  MoveRight,
  Search,
  Calendar,
  X,
  Download,
  Eye,
  XCircle,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { getUserBookings, cancelBookingByUser } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import jsPDF from "jspdf";
import FeedbackForm from "../../components/FeedbackForm";

const FEEDBACK_STORAGE_PREFIX = "submittedFeedbackIds:";

const MyBookings = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("bookingStatus") || "all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submittedFeedbackIds, setSubmittedFeedbackIds] = useState([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const searchInputRef = useRef(null);
  const prevSearchRef = useRef(debouncedSearchTerm);
  const prevStatusRef = useRef(statusFilter);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const newSearch = debouncedSearchTerm && debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : "";
    const newStatus = statusFilter !== "all" ? statusFilter.toUpperCase() : "all";
    
    if (prevSearchRef.current !== newSearch || prevStatusRef.current !== statusFilter) {
      const params = new URLSearchParams();
      if (newSearch) params.set("search", newSearch);
      if (newStatus !== "all") params.set("bookingStatus", newStatus);
      setSearchParams(params, { replace: true });
      prevSearchRef.current = newSearch;
      prevStatusRef.current = statusFilter;
    }
  }, [debouncedSearchTerm, statusFilter]);

  const fetchBookings = useCallback(
    async (withLoader = true) => {
      if (!user?.id && !user?.userId) return;
      if (withLoader) setLoading(true);
      try {
        const userId = user?.id || user?.userId;
        const storageKey = `${FEEDBACK_STORAGE_PREFIX}${userId}`;
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setSubmittedFeedbackIds(parsed.map((val) => Number(val)).filter((val) => !Number.isNaN(val)));
            } else {
              setSubmittedFeedbackIds([]);
            }
          } else {
            setSubmittedFeedbackIds([]);
          }
        } catch {
          setSubmittedFeedbackIds([]);
        }

        const filters = {};
        if (debouncedSearchTerm && debouncedSearchTerm.trim()) filters.search = debouncedSearchTerm.trim();
        if (statusFilter !== "all") filters.bookingStatus = statusFilter.toUpperCase();

        const bookingsRes = await getUserBookings(userId, filters);
        const bookingsData = bookingsRes?.data?.data || bookingsRes?.data || [];
        const formattedList = Array.isArray(bookingsData)
          ? bookingsData.map((booking) => formatBooking(booking))
          : [];
        setBookings(formattedList);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookings([]);
      } finally {
        if (withLoader) setLoading(false);
      }
    },
    [user, debouncedSearchTerm, statusFilter]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const canCancelBooking = (booking) => {
    if (!booking) return false;
    
    const status = booking.status?.toLowerCase() || "";
    if (["cancelled", "completed", "checked-out", "checked-in"].includes(status)) {
      return false;
    }
    
    if (!booking.checkIn) return false;
    
    try {
      const checkInDate = new Date(booking.checkIn);
      const now = new Date();
      const diffTime = checkInDate - now;
      const diffHours = diffTime / (1000 * 60 * 60);
      
      return diffHours > 1;
    } catch (error) {
      console.error("Error calculating cancellation time:", error);
      return false;
    }
  };

  const formatBooking = (booking) => {
    let status = (booking.bookingStatus || "")
      .toString()
      .toLowerCase()
      .replace(/_/g, "-");
    
    if (!status || status === "null" || status === "undefined") {
      status = "pending";
    }
    
    return {
      id: booking.id,
      bookingId: booking.transactionId || `BK${booking.id}`,
      hotelName: booking.hotel?.hotelName || "Unknown Hotel",
      hotelId: booking.hotel?.id || booking.hotelId,
      location: booking.hotel?.address?.city || "",
      roomType: booking.room?.roomType || "Unknown Room",
      roomNumber: booking.room?.roomNumber || "",
      checkIn: booking.checkInDate || "",
      checkOut: booking.checkOutDate || "",
      status: status,
      amount: booking.totalAmount || 0,
      guests: booking.totalGuests || 0,
      userId: booking.appUser?.id || user?.id || user?.userId,
      appUser: booking.appUser,
      bookingDate: booking.createdAt || booking.bookingDate || "",
      raw: booking
    };
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "bg-blue-100 text-blue-700 border-blue-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "checked-out": "bg-gray-100 text-gray-700 border-gray-200",
      completed: "bg-gray-100 text-gray-700 border-gray-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[status] || colors.pending;
  };


  const handleFeedbackSuccess = (bookingId) => {
    if (!bookingId) return;
    setSubmittedFeedbackIds((prev) => {
      if (prev.includes(bookingId)) return prev;
      const next = [...prev, bookingId];
      const userId = user?.id || user?.userId;
      if (userId) {
        try {
          localStorage.setItem(`${FEEDBACK_STORAGE_PREFIX}${userId}`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const handleDownloadInvoice = (booking) => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(20);
    doc.text("INVOICE", 105, yPos, { align: "center" });
    yPos += 20;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text(`Booking ID: ${booking.bookingId}`, 20, yPos);
    yPos += 8;
    doc.text(`Hotel: ${booking.hotelName}`, 20, yPos);
    yPos += 8;
    if (booking.location) {
      doc.text(`Location: ${booking.location}`, 20, yPos);
      yPos += 8;
    }
    doc.text(`Room Type: ${booking.roomType}`, 20, yPos);
    yPos += 8;
    if (booking.roomNumber) {
      doc.text(`Room Number: ${booking.roomNumber}`, 20, yPos);
      yPos += 8;
    }
    doc.text(`Check-in Date: ${booking.checkIn}`, 20, yPos);
    yPos += 8;
    doc.text(`Check-out Date: ${booking.checkOut}`, 20, yPos);
    yPos += 8;
    doc.text(`Total Guests: ${booking.guests}`, 20, yPos);
    yPos += 8;
    doc.text(`Status: ${booking.status.toUpperCase()}`, 20, yPos);
    yPos += 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: Rs. ${booking.amount}`, 20, yPos);

    doc.save(`invoice-${booking.bookingId}.pdf`);
  };

  const applyCancellationLocally = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: "cancelled",
              raw: { ...(b.raw || {}), bookingStatus: "CANCELLED" },
            }
          : b
      )
    );
    setSelectedBooking((prev) =>
      prev && prev.id === bookingId ? { ...prev, status: "cancelled" } : prev
    );
  };

  const handleCancelBooking = async (booking) => {
    if (!window.confirm("Are you sure you want to cancel booking? ")) {
      return;
    }

    try {
      const userId = user?.id || user?.userId;
      if (!userId) {
        alert("User ID not found. Please try again.");
        return;
      }

      const response = await cancelBookingByUser(booking.id, userId);
      
      if (response.status === 200 || response.status === 201) {
        alert("Booking cancelled successfully!");
        applyCancellationLocally(booking.id);
        fetchBookings(false);
      } else {
        const errorMessage = response?.data?.message || response?.data?.error || "Failed to cancel booking";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "An error occurred while cancelling the booking";
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading bookings...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center mb-3 sm:mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">My Bookings</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-14 rounded-2xl">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">
            My Bookings
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            View and manage all your hotel reservations
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row flex-1 gap-3 sm:gap-4 w-full md:w-auto">
              <div className="relative flex-1 w-full">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by hotel, location, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  className="w-full bg-white pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                />
              </div>
              <div className="relative w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    e.preventDefault();
                    setStatusFilter(e.target.value);
                  }}
                  className="bg-white px-4 sm:px-6 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm appearance-none w-full sm:w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="checked-out">Checked-out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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

          {bookings.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm">
              No bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Booking ID
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Hotel
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black hidden sm:table-cell">
                      Room
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Dates
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Amount
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Status
                    </th>
                    <th className="text-center py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <span className="font-semibold text-black text-xs sm:text-sm">
                          {booking.bookingId}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <div>
                          <p className="font-medium text-black text-xs sm:text-sm">
                            {booking.hotelName}
                          </p>
                          {booking.location && (
                            <p className="text-[10px] sm:text-xs text-gray-500">
                              {booking.location}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                        <div>
                          {booking.roomNumber && (
                            <p className="font-medium text-black text-xs sm:text-sm">
                              Room {booking.roomNumber}
                            </p>
                          )}
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {booking.roomType}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <div className="text-xs sm:text-sm">
                          <p className="text-black">
                            <Calendar size={10} className="inline mr-1" />
                            {booking.checkIn}
                          </p>
                          <p className="text-gray-500">
                            <Calendar size={10} className="inline mr-1" />
                            {booking.checkOut}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <p className="font-semibold text-black text-xs sm:text-sm">
                          ₹{booking.amount}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {booking.guests} guests
                        </p>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-semibold border shadow ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {(booking.status === "confirmed" ||
                            booking.status === "checked-out" ||
                            booking.status === "completed") && (
                            <CheckCircle size={10} />
                          )}
                          {booking.status === "cancelled" && (
                            <XCircle size={10} />
                          )}
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1).replace("-", " ")}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <div className="flex items-start justify-start gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                          {(["completed", "checked-out"].includes(booking.status) && !submittedFeedbackIds.includes(booking.id)) && (
                            <button
                              onClick={() => {
                                setFeedbackBooking(booking);
                                setShowFeedbackForm(true);
                              }}
                              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all hover:scale-95 inline-flex items-center gap-1 whitespace-nowrap shadow border-none"
                            >
                              <MessageSquare size={14} />
                              <span className="text-[10px] sm:text-xs font-semibold">Feedback</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all hover:scale-95 inline-flex items-center gap-1 whitespace-nowrap shadow border-none"
                          >
                            <Eye size={14} />
                            <span className="text-[10px] sm:text-xs font-semibold">View</span>
                          </button>
                          {canCancelBooking(booking) && (
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all hover:scale-95 inline-flex items-center gap-1 whitespace-nowrap shadow border-none"
                            >
                              <XCircle size={14} />
                              <span className="text-[10px] sm:text-xs font-semibold">Cancel</span>
                            </button>
                          )}
                          {booking.status !== "completed" && (
                            <button
                              onClick={() => handleDownloadInvoice(booking)}
                              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-gray-800 text-white hover:bg-gray-900 transition-all hover:scale-95 inline-flex items-center gap-1 whitespace-nowrap shadow border-none"
                            >
                              <Download size={14} />
                              <span className="text-[10px] sm:text-xs font-semibold">
                                Invoice
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-bold text-black">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Transaction ID</p>
                  <p className="text-sm sm:text-base font-semibold text-black">
                    {selectedBooking.bookingId}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusColor(
                      selectedBooking.status
                    )}`}
                  >
                    {selectedBooking.status.charAt(0).toUpperCase() +
                      selectedBooking.status.slice(1).replace("-", " ")}
                  </span>
                  <p className="mt-2 text-[10px] sm:text-xs text-gray-500">
                    Cancellation window: free up to 24h before check-in (48h for select stays). Review the{" "}
                    <Link to="/terms" className="text-black underline font-semibold">
                      Terms
                    </Link>{" "}
                    for exceptions.
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Hotel</p>
                  <p className="text-sm sm:text-base font-semibold text-black">
                    {selectedBooking.hotelName}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-sm sm:text-base font-semibold text-black">
                    {selectedBooking.location || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Check-in</p>
                  <p className="text-sm sm:text-base font-semibold text-black">
                    {selectedBooking.checkIn}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Check-out</p>
                  <p className="text-sm sm:text-base font-semibold text-black">
                    {selectedBooking.checkOut}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Guests</p>
                  <p className="text-sm sm:text-base font-semibold text-black">
                    {selectedBooking.guests}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Room Type</p>
                  <p className="text-sm sm:text-base font-semibold text-black">
                    {selectedBooking.roomType}
                  </p>
                </div>
                <div className="col-span-1 sm:col-span-2 border-t border-gray-200 pt-4">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-black">
                    ₹{selectedBooking.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3">
              {canCancelBooking(selectedBooking) && (
                <button
                  onClick={() => {
                    const bookingToCancel = bookings.find(
                      (b) => b.id === selectedBooking.id || b.bookingId === selectedBooking.bookingId
                    );
                    if (bookingToCancel) {
                      handleCancelBooking(bookingToCancel);
                    }
                    setSelectedBooking(null);
                  }}
                  className="flex-1 bg-red-500 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <XCircle size={16} />
                  Cancel Booking
                </button>
              )}
              <button
                onClick={() => handleDownloadInvoice(selectedBooking)}
                className="flex-1 bg-black text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download Invoice
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showFeedbackForm && feedbackBooking && (
        <FeedbackForm
          booking={feedbackBooking}
          onClose={() => {
            setShowFeedbackForm(false);
            setFeedbackBooking(null);
          }}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </>
  );
};

export default MyBookings;
