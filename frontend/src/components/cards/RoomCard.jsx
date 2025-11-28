import React from "react";
import { Heart, BedDouble } from "lucide-react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const RoomCard = ({
  id,
  hotelId,
  image,
  status,
  price,
  capacity,
  bedType,
  highlight,
  name,
  description,
  onToggleFavorite,
  isFavorite,
  wishlistLoading,
  link,
  linkState,
  className = "",
  imageClassName = "w-full aspect-square object-cover rounded-xl sm:rounded-2xl",
}) => {
  const { user, isAuthenticated } = useAuth();
  const Wrapper = link ? NavLink : "div";
  const defaultState = { roomId: id, hotelId };
  const wrapperProps = link
    ? { to: link, state: linkState ?? defaultState }
    : {};
  const priceLabel = typeof price === "number" ? `₹${price} / night` : price;

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      toast.warning("Please login to add rooms to your wishlist", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "#000000",
          color: "#ffffff",
        },
      });
      return;
    }

    const userRole = user?.role || user?.roleName || "";
    const roleUpper = userRole?.toUpperCase();

    if (roleUpper !== "USER") {
      toast.warning("Only regular users can add rooms to wishlist", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "#000000",
          color: "#ffffff",
        },
      });
      return;
    }

    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };

  if (highlight) {
    return (
      <Wrapper
        {...wrapperProps}
        className={`group relative overflow-hidden rounded-xl sm:rounded-2xl shadow hover:shadow-xl transition cursor-pointer aspect-square ${className}`}
      >
        <div className="w-full h-full bg-gray-200">
          {image ? (
            <img
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={image}
              alt={name || "Room"}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              <BedDouble className="w-6 h-6" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        {status && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
            <span
              className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs rounded-full font-medium ${
                /available/i.test(status)
                  ? "bg-green-500 text-white"
                  : /maintenance/i.test(status)
                  ? "bg-yellow-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {status}
            </span>
          </div>
        )}

        {onToggleFavorite && (
          <button
            type="button"
            onClick={handleHeartClick}
            disabled={wishlistLoading}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-white/90 hover:bg-white text-black rounded-full p-1.5 sm:p-2 shadow disabled:opacity-50"
            title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] ${
                isFavorite ? "fill-red-600 text-red-600" : ""
              }`}
            />
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 text-white">
          <p className="text-base sm:text-lg md:text-xl font-semibold mb-1 line-clamp-1">
            {name || "Room"}
          </p>
          {description && (
            <p className="text-[11px] sm:text-xs md:text-sm text-white/80 mb-1 line-clamp-2">
              {description}
            </p>
          )}
          {priceLabel && (
            <p className="text-xs sm:text-sm font-semibold">
              {priceLabel}
            </p>
          )}
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      {...wrapperProps}
      className={`relative flex flex-col gap-y-2 cursor-pointer ${className}`}
    >
      {onToggleFavorite && (
        <button
          type="button"
          onClick={handleHeartClick}
          disabled={wishlistLoading}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-white/90 hover:bg-white text-black rounded-full p-1.5 sm:p-2 shadow disabled:opacity-50"
          title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] ${
              isFavorite ? "fill-red-600 text-red-600" : ""
            }`}
          />
        </button>
      )}

      {status && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
          <span
            className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs rounded-full font-medium ${
              /available/i.test(status)
                ? "bg-green-500 text-white"
                : /maintenance/i.test(status)
                ? "bg-yellow-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {status}
          </span>
        </div>
      )}

      {image ? (
        <img
          className={imageClassName}
          src={image}
          alt={name || "Room"}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className={`${imageClassName} bg-gray-200 flex items-center justify-center text-gray-400`}
        >
          <BedDouble className="w-6 h-6" />
        </div>
      )}

      {priceLabel && (
        <p className="text-gray-400 text-xs sm:text-sm md:text-[15px] px-1 py-1.5 sm:py-2 mt-1">
          {priceLabel}
        </p>
      )}
      {(capacity || bedType) && (
        <div className="flex flex-col gap-0.5 px-1 py-0.5 sm:py-1">
          <span className="text-[10px] sm:text-xs text-gray-400">
            {capacity ? `${capacity} guests` : null}
            {capacity && bedType ? " • " : null}
            {bedType || null}
          </span>
        </div>
      )}
    </Wrapper>
  );
};

export default RoomCard;

