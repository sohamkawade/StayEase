import React, { useMemo, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { API_URL, addToWishlist, getUserWishlist, removeFromWishlist } from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import RoomCard from "../components/cards/RoomCard";

const FeaturedRoomsSection = ({ hotels = [], roomsData = [] }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [wishlistData, setWishlistData] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const toAbsoluteUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    const origin = new URL(API_URL).origin;
    return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const rooms = useMemo(() => {
    if (!Array.isArray(roomsData) || roomsData.length === 0) {
      return [];
    }

    const cards = [];
    const usedRoomIds = new Set();

    for (const { hotel, rooms: hotelRooms } of roomsData) {
      if (!hotel || !hotel.id || !Array.isArray(hotelRooms) || hotelRooms.length === 0) {
        continue;
      }

      const roomsWithImages = hotelRooms.filter((r) => {
        const imgs = Array.isArray(r.images) ? r.images : [];
        return imgs.length > 0 && (imgs[0]?.imageUrl || imgs[0]?.url);
      });

      const availableRooms = roomsWithImages.length > 0 ? roomsWithImages : hotelRooms;
      const shuffledRooms = [...availableRooms].sort(() => Math.random() - 0.5);

      for (const selectedRoom of shuffledRooms) {
        const roomId = selectedRoom.id;
        if (roomId && usedRoomIds.has(roomId)) continue;
        usedRoomIds.add(roomId);

        const imgs = Array.isArray(selectedRoom.images) ? selectedRoom.images : [];
        let imageUrl = "";
        if (imgs.length > 0) {
          const validImg = imgs.find((img) => {
            const url = img?.imageUrl || img?.url || "";
            return url && url.trim() !== "";
          });
          if (validImg) {
            imageUrl = toAbsoluteUrl(validImg.imageUrl || validImg.url);
          } else if (imgs[0]) {
            imageUrl = toAbsoluteUrl(imgs[0].imageUrl || imgs[0].url || "");
          }
        }

        if (!imageUrl && hotel.hotelImage) {
          imageUrl = toAbsoluteUrl(hotel.hotelImage);
        }

        cards.push({
          uid: `${selectedRoom.id ?? "room"}-${hotel.id}-${cards.length}`,
          id: selectedRoom.id ?? null,
          hotelId: hotel.id,
          name: selectedRoom.viewType || selectedRoom.bedType || selectedRoom.roomType || "Premium Stay",
          type: selectedRoom.roomType || "Room",
          price: selectedRoom.price || 0,
          image: imageUrl,
          hotelName: hotel.hotelName || "",
        });

        if (cards.length >= 4) break;
      }
      if (cards.length >= 4) break;
    }

    return cards.slice(0, 4);
  }, [roomsData]);

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

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
          <div className="text-center sm:text-left">
            <p className="uppercase tracking-widest text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">
              featured rooms
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              Premium stays picked for you
            </h2>
          </div>
          <NavLink
            to="/rooms"
            className="inline-flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-gray-600 hover:text-black font-semibold transition-colors"
          >
            View All Rooms <ArrowRight size={14} />
          </NavLink>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8 sm:py-12">
            No rooms to show right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-5" style={{ opacity: 1 }}>
            {rooms.map((room) => (
              <RoomCard
                key={room.uid}
                id={room.id}
                hotelId={room.hotelId}
                image={room.image}
                name={room.name}
                description={room.type && room.type !== room.name ? room.type : ""}
                price={room.price}
                link={`/room-details/${room.id}`}
                linkState={{ roomId: room.id }}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={wishlistRoomIds.has(room.id)}
                wishlistLoading={wishlistLoading}
                highlight
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedRoomsSection;
