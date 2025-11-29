import React, { useEffect, useState } from "react";
import { MoveRight, Heart, ArrowRight, BedDouble } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  API_URL,
  getUserWishlist,
  removeFromWishlist,
} from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";

const WishList = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingWishListId, setRemovingWishListId] = useState(null);

  const convertToAbsoluteUrl = (relativePath) => {
    if (!relativePath) return "";
    if (/^https?:\/\//i.test(relativePath)) return relativePath;
    const origin = new URL(API_URL).origin;
    return `${origin}${
      relativePath.startsWith("/") ? relativePath : "/" + relativePath
    }`;
  };

  const getRoomImage = (room) => {
    if (room?.images) {
      let imagesArray = [];
      if (Array.isArray(room.images)) {
        imagesArray = room.images;
      } else if (typeof room.images === 'string') {
        imagesArray = [{ imageUrl: room.images }];
      } else if (room.images.imageUrl || room.images.url) {
        imagesArray = [room.images];
      }
      if (imagesArray.length > 0) {
        const firstImage = imagesArray[0];
        return convertToAbsoluteUrl(
          firstImage?.imageUrl || firstImage?.url || (typeof firstImage === 'string' ? firstImage : "")
        );
      }
    }
    if (room?.image) {
      return convertToAbsoluteUrl(room.image);
    }
    return "/placeholder-room.jpg";
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!isAuthenticated || !user) {
      navigate("/login", { state: { from: "/user/wish-list" } });
      return;
    }

    const loadWishlist = async () => {
      const userId = user?.id || user?.userId;
      if (!userId) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const response = await getUserWishlist(userId);
        const wishlistData = response?.data?.data ?? response?.data ?? [];
        setWishlist(wishlistData);
      } catch (error) {
        console.error("Error loading wishlist:", error);
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [isAuthenticated, user, navigate, authLoading]);

  const handleRemoveFromWishlist = async (e, wishListId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) return;

    setRemovingWishListId(wishListId);
    try {
      const response = await removeFromWishlist(wishListId);
      if (response?.status === 200 || response?.status === 204) {
        setWishlist((prev) =>
          prev.filter((item) => {
            const itemWishListId = item?.id;
            return itemWishListId !== wishListId;
          })
        );
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    } finally {
      setRemovingWishListId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Loading your wishlist...</div>
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
        <span className="text-xs sm:text-sm font-semibold">My Wishlist</span>
      </div>
      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-14 rounded-2xl">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 tracking-wide">
          My Wishlist
        </h2>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <Heart size={48} className="text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md px-4">
              Start exploring rooms and add your favorites!
            </p>
            <NavLink
              to="/rooms"
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2 text-sm sm:text-base"
            >
              Explore Rooms
              <ArrowRight size={16} />
            </NavLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map((item, idx) => {
              const room = item?.room || item;
              const roomId = room?.id || item?.id || `wishlist-${idx}`;
              const wishListId = item?.id;
              const wishlistItemId = item?.id || `item-${idx}`;
              const roomImage = getRoomImage(room);
              const roomName =
                room?.roomType ||
                room?.name ||
                `Room ${room?.roomNumber || idx + 1}`;
              const price = room?.price || 0;
              const capacity = room?.capacity;
              const bedType = room?.bedType;
              const viewType = room?.viewType;
              const hotelId = room?.hotelId || room?.hotel?.id || item?.hotelId;
              const hotelName = room?.hotel?.hotelName || item?.hotel?.hotelName || "";

              return (
                <NavLink
                  key={`${wishlistItemId}-${roomId}`}
                  to={`/room-details/${roomId}`}
                  state={{ room, hotelId }}
                  className="group relative bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer"
                >
                  <div className="relative h-[200px] sm:h-[240px] md:h-[280px] w-full bg-gray-200">
                    {roomImage && roomImage !== "/placeholder-room.jpg" ? (
                      <img
                        src={roomImage}
                        alt={roomName}
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "/placeholder-room.jpg";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 h-full w-full flex items-center justify-center text-gray-400">
                        <BedDouble size={24} />
                      </div>
                    )}
                    <button
                      onClick={(e) => handleRemoveFromWishlist(e, wishListId)}
                      disabled={removingWishListId === wishListId}
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 bg-white/90 hover:bg-white text-black rounded-full p-1.5 sm:p-2 shadow disabled:opacity-50 transition-all"
                      title="Remove from wishlist"
                    >
                      <Heart className="fill-red-600 text-red-600" size={16} />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 text-white">
                      {hotelName && (
                        <div className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest text-white/80 mb-0.5 sm:mb-1">
                          {hotelName}
                        </div>
                      )}
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-0.5 sm:mb-1">
                        {roomName}
                      </h3>
                      {(capacity || bedType || viewType) && (
                        <p className="text-[10px] sm:text-xs md:text-sm text-white/80 mb-1.5 sm:mb-2">
                          {capacity ? `${capacity} guests` : null}
                          {capacity && bedType ? " • " : null}
                          {bedType || null}
                          {(capacity || bedType) && viewType ? " • " : null}
                          {viewType || null}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm md:text-base font-bold">
                          ₹{price ? price.toLocaleString("en-IN") : "--"}
                          <span className="text-[9px] sm:text-[10px] md:text-xs text-white/80 font-normal"> / night</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default WishList;
