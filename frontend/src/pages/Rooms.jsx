import React, { useMemo, useState, useEffect } from "react";
import { MoveRight, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink, useSearchParams, useNavigate } from "react-router-dom";
import { API_URL, getAllRoomsByHotelId, getAllHotels, addToWishlist, getUserWishlist, removeFromWishlist } from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import RoomCard from "../components/cards/RoomCard";

const getRoomStatus = (status) => {
  const statusUpper = (status || "").toString().toUpperCase();
  if (statusUpper === "AVAILABLE") return "Available";
  if (statusUpper === "BOOKED") return "Booked";
  if (statusUpper === "MAINTENANCE") return "Maintenance";
  return status || "Available";
};

const Rooms = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistData, setWishlistData] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "none");
  const [sortDirection, setSortDirection] = useState(searchParams.get("sortDirection") || "asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const urlHotelId = searchParams.get("hotelId");

  const toAbsolute = (p) => {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    const origin = new URL(API_URL).origin;
    return `${origin}${p.startsWith("/") ? p : "/" + p}`;
  };

  const normalizeRooms = (payload, hotel) => {
    const fallbackHotelId = hotel?.id ?? null;
    const fallbackHotelName = hotel?.hotelName ?? "";
    return (payload || []).map((r, idx) => {
      const imgs = Array.isArray(r.images) ? r.images : [];
      const allImages = imgs
        .map((img) => toAbsolute(img?.imageUrl || img?.url || ""))
        .filter((u) => u);
      const firstImage = allImages[0] || "";
      const normalizedHotelId = r?.hotel?.id ?? fallbackHotelId;
      const normalizedHotelName = r?.hotel?.hotelName ?? fallbackHotelName;
      return {
        id: r.id ?? `${normalizedHotelId ?? "hotel"}-${idx}`,
        roomNumber: r.roomNumber,
        roomType: r.roomType,
        price: r.price,
        status: getRoomStatus(r.status),
        rating: r.rating || 0.0,
        image: firstImage,
        images: allImages,
        capacity: r.capacity,
        bedType: r.bedType,
        sizeSqft: r.sizeSqft,
        viewType: r.viewType,
        description: r.description,
        amenities: r.amenities || [],
        hotelId: normalizedHotelId,
        hotelName: normalizedHotelName,
      };
    });
  };


  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (sortBy !== "none") {
      params.set("sortBy", sortBy);
      params.set("sortDirection", sortDirection);
    }
    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter, sortBy, sortDirection, setSearchParams]);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        let normalizedRooms = [];
        
        const filters = {};
        if (statusFilter !== "all") filters.status = statusFilter.toUpperCase();
        if (sortBy === "price") {
          filters.sortBy = "price";
          filters.sortDirection = sortDirection;
        }
        
        if (urlHotelId) {
          const hotelIdNumber = Number(urlHotelId);
          if (!isNaN(hotelIdNumber)) {
            const res = await getAllRoomsByHotelId(hotelIdNumber, filters);
            if (res?.status < 400) {
              const payload = res?.data?.data ?? res?.data ?? [];
              normalizedRooms = normalizeRooms(payload, { id: hotelIdNumber });
            }
          }
        } else {
          const hotelsRes = await getAllHotels();
          if (hotelsRes?.status >= 400) {
            setRooms([]);
            setLoading(false);
            return;
          }
          const hotels = hotelsRes?.data?.data ?? hotelsRes?.data ?? [];
          const validHotels = Array.isArray(hotels) 
            ? hotels.filter((h) => h && h.id && !isNaN(Number(h.id)))
            : [];
          if (validHotels.length === 0) {
            setRooms([]);
            setLoading(false);
            return;
          }
          const roomPromises = validHotels.map(async (hotel) => {
            try {
              const res = await getAllRoomsByHotelId(hotel.id, filters);
              if (res?.status >= 400) return [];
              const payload = res?.data?.data ?? res?.data ?? [];
              return normalizeRooms(payload, hotel);
            } catch {
              return [];
            }
          });
          const roomResults = await Promise.allSettled(roomPromises);
          normalizedRooms = roomResults
            .filter((result) => result.status === "fulfilled" && Array.isArray(result.value))
            .flatMap((result) => result.value);
        }

        setRooms(normalizedRooms);
      } catch {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [urlHotelId, statusFilter, sortBy, sortDirection]);

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

  const wishlistRoomIds = useMemo(() => {
    if (!Array.isArray(wishlistData)) return new Set();
    return new Set(wishlistData.map((item) => item?.room?.id || item?.roomId).filter(Boolean));
  }, [wishlistData]);

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

  const filteredRooms = useMemo(() => {
    if (!searchTerm.trim()) return rooms;
    
    const term = searchTerm.trim().toLowerCase();
    return rooms.filter((room) => {
      const composite = `${room.roomType || ""} ${room.description || ""} ${room.hotelName || ""}`.toLowerCase();
      return composite.includes(term);
    });
  }, [rooms, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy, sortDirection]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <div className="mt-20 sm:mt-24 flex items-center justify-center mb-3 sm:mb-4 gap-2 px-4">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180 w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-sm sm:text-base font-semibold">Rooms</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-6 sm:py-8">
        <div className="mb-8 sm:mb-10">
          <p className="uppercase tracking-widest text-xs text-gray-500 mb-2">
            all rooms
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Discover Our Rooms
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center">
            <div className="relative flex-1 lg:max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Search rooms by type, hotel, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm"
              />
            </div>

            <div className="flex flex-row gap-3 sm:gap-4">
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    e.preventDefault();
                    setStatusFilter(e.target.value);
                  }}
                  className="w-full bg-white px-4 sm:px-6 lg:px-4 py-2 sm:py-3 lg:py-2.5 rounded-lg sm:rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="relative flex-1 sm:flex-none">
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
                  className="w-full bg-white px-4 sm:px-6 lg:px-4 py-2 sm:py-3 lg:py-2.5 rounded-lg sm:rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm appearance-none"
                >
                  <option value="none">Sort By</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm sm:text-base text-gray-500">
            Loading rooms...
            </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12 text-sm sm:text-base text-gray-500">
            {searchTerm ? "No rooms found matching your search." : "No rooms available."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {paginatedRooms.map((room, idx) => (
                <RoomCard
                  key={`room-${room.id || 'no-id'}-${room.hotelId || 'no-hotel'}-${startIndex + idx}`}
                  id={room.id}
                  hotelId={room.hotelId}
                  image={room.image}
                  status={room.status}
                  name={room.roomType || "Room"}
                  description={room.description}
                  price={room.price}
                  capacity={room.capacity}
                  bedType={room.bedType}
                  link={`/room-details/${room.id}`}
                  linkState={{ room }}
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
      </div>
    </>
  );
};

export default Rooms;
