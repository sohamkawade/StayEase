import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, NavLink, useSearchParams } from "react-router-dom";
import { MapPin, Star, MoveRight, Phone, Mail, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL, getAllRoomsByHotelId, getAllHotels, getFeedbackByHotelId, addToWishlist, getUserWishlist, removeFromWishlist } from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import RoomCard from "../components/cards/RoomCard";

const HotelRooms = () => {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const hotelIdNum = Number(hotelId);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [wishlistData, setWishlistData] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "none");
  const [sortDirection, setSortDirection] = useState(searchParams.get("sortDirection") || "asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const toAbsoluteUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    const origin = new URL(API_URL).origin;
    return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const formatDate = (value) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (sortBy !== "none") {
      params.set("sortBy", sortBy);
      params.set("sortDirection", sortDirection);
    }
    setSearchParams(params, { replace: true });
  }, [statusFilter, sortBy, sortDirection]);

  useEffect(() => {
    if (!hotelIdNum) return;

    const fetchData = async () => {
      try {
        const filters = {};
        if (statusFilter !== "all") filters.status = statusFilter.toUpperCase();
        if (sortBy === "price") {
          filters.sortBy = "price";
          filters.sortDirection = sortDirection;
        }

        const [roomsRes, hotelsRes, feedbackRes] = await Promise.all([
          getAllRoomsByHotelId(hotelIdNum, filters),
          getAllHotels(),
          getFeedbackByHotelId(hotelIdNum).catch(() => ({ data: { data: [] } }))
        ]);

        const hotelsData = hotelsRes?.data?.data || hotelsRes?.data || [];
        const foundHotel = hotelsData.find((h) => h.id === hotelIdNum);
        setHotel(foundHotel || null);

        const feedbackData = feedbackRes?.data?.data || feedbackRes?.data || [];
        const formattedFeedbacks = (feedbackData || []).map((item) => ({
          id: item.id,
          name: `${item.user?.firstname || "Guest"} ${item.user?.lastname || ""}`.trim() || item.user?.email || "Guest",
          comment: item.comment || "",
          rating: item.rating || 0,
          date: item.date || ""
        }));
        setFeedbacks(formattedFeedbacks);

        const roomsData = roomsRes?.data?.data || roomsRes?.data || [];
        const normalized = (roomsData || []).map((room) => {
          const imgs = Array.isArray(room.images) ? room.images : [];
          const allImages = imgs
            .map((img) => toAbsoluteUrl(img?.imageUrl || img?.url || ""))
            .filter((u) => u);
          const firstImage = allImages[0] || "";
          
          return {
            id: room.id,
            roomNumber: room.roomNumber || "",
            roomType: room.roomType || "",
            price: room.price || 0,
            image: firstImage,
            images: allImages,
            status: room.status || "Available",
            capacity: room.capacity || "",
            bedType: room.bedType || "",
            viewType: room.viewType || "",
            description: room.description || "",
            amenities: room.amenities || [],
          };
        });
        setRooms(normalized);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setRooms([]);
        setHotel(null);
        setFeedbacks([]);
      }
    };

    fetchData();
  }, [hotelIdNum, statusFilter, sortBy, sortDirection]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setWishlistData([]);
      return;
    }

    const userId = user?.id || user?.userId;
    if (!userId) return;

    const fetchWishlist = async () => {
      try {
        const response = await getUserWishlist(userId);
        const data = response?.data?.data ?? response?.data ?? [];
        setWishlistData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch wishlist", error);
        setWishlistData([]);
      }
    };
    fetchWishlist();
  }, [isAuthenticated, user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sortBy, sortDirection]);

  const wishlistRoomIds = useMemo(() => {
    if (!Array.isArray(wishlistData)) return new Set();
    return new Set(wishlistData.map((item) => item?.room?.id || item?.roomId).filter(Boolean));
  }, [wishlistData]);

  const totalPages = Math.ceil(rooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = rooms.slice(startIndex, startIndex + itemsPerPage);

  const handleToggleFavorite = async (roomId) => {
    if (!isAuthenticated || !user) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    const userId = user?.id || user?.userId;
    if (!userId) {
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      const currentWishlistItem = wishlistData.find((item) => {
        const itemRoomId = item?.room?.id || item?.roomId;
        return itemRoomId === roomId;
      });

      if (currentWishlistItem?.id) {
        await removeFromWishlist(currentWishlistItem.id);
      } else {
        await addToWishlist(userId, roomId);
      }

      const response = await getUserWishlist(userId);
      const data = response?.data?.data ?? response?.data ?? [];
      setWishlistData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <>
      <div className="mt-20 sm:mt-24 flex items-center justify-center mb-3 sm:mb-4 gap-1.5 sm:gap-2 px-4 flex-wrap">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180 w-3 h-3 sm:w-4 sm:h-4" />
        <NavLink to="/hotels">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            Back to Hotels
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180 w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-sm sm:text-base font-semibold">Rooms</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-6 sm:py-8">
        {hotel && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-gray-200">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                {hotel.hotelName}
              </h1>
              {hotel.description && (
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">{hotel.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4">
                {hotel.address?.city && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    <span>
                      {hotel.address.streetAddress && `${hotel.address.streetAddress}, `}
                      {hotel.address.city}
                      {hotel.address.state && `, ${hotel.address.state}`}
                      {hotel.address.pincode && ` ${hotel.address.pincode}`}
                    </span>
                  </div>
                )}
                {hotel.starRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs sm:text-sm font-semibold">{hotel.starRating.toFixed(1)}</span>
                  </div>
                )}
                {hotel.contactNumber && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Phone className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    <span className="break-all">{hotel.contactNumber}</span>
                  </div>
                )}
                {hotel.email && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    <span className="break-all">{hotel.email}</span>
                  </div>
                )}
                {(hotel.checkInTime || hotel.checkOutTime) && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    <span>
                      {hotel.checkInTime && `Check-in: ${hotel.checkInTime}`}
                      {hotel.checkInTime && hotel.checkOutTime && " • "}
                      {hotel.checkOutTime && `Check-out: ${hotel.checkOutTime}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-row gap-3 sm:gap-4 items-center justify-between">
            <div className="flex flex-row flex-1 gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    e.preventDefault();
                    setStatusFilter(e.target.value);
                  }}
                  className="flex-1 sm:w-auto bg-white px-4 sm:px-6 lg:px-3 py-2 sm:py-2 lg:py-2.5 rounded-lg sm:rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm lg:text-sm appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="relative">
                <select
                  value={sortBy === "none" ? "none" : `${sortBy}-${sortDirection}`}
                  onChange={(e) => {
                    e.preventDefault();
                    const value = e.target.value;
                    if (value === "none") {
                      setSortBy("none");
                      setSortDirection("asc");
                    } else {
                      const [by, dir] = value.split("-");
                      setSortBy(by);
                      setSortDirection(dir);
                    }
                  }}
                  className="flex-1 sm:w-auto bg-white px-4 sm:px-6 lg:px-3 py-2 sm:py-2 lg:py-2.5 rounded-lg sm:rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm lg:text-sm appearance-none"
                >
                  <option value="none">Sort By</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12 text-sm sm:text-base text-gray-500">No rooms available for this hotel.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {paginatedRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  id={room.id}
                  hotelId={hotelIdNum}
                  image={room.image}
                  status={room.status}
                  name={room.roomType || "Room"}
                  description={room.description}
                  price={room.price}
                  capacity={room.capacity}
                  bedType={room.bedType}
                  link={`/room-details/${room.id}`}
                  linkState={{ room, hotelId: hotelIdNum }}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={wishlistRoomIds.has(room.id)}
                  wishlistLoading={wishlistLoading}
                  highlight
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 sm:mt-10">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-400 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-1 sm:gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                        currentPage === page
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-400 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-10 sm:mt-14">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">Guest Voices</p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent feedback</h2>
              </div>
              <span className="text-xs font-semibold text-gray-500">{feedbacks.length} reviews</span>
            </div>
            {feedbacks.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-10">
                No reviews yet. Be the first to share your experience.
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                {feedbacks.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-2xl p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        {item.date && (
                          <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={star <= item.rating ? "fill-yellow-500" : "text-gray-300"}
                          />
                        ))}
                        <span className="text-xs text-gray-600">{item.rating}/5</span>
                      </div>
                    </div>
                    {item.comment && (
                      <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">{item.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HotelRooms;

