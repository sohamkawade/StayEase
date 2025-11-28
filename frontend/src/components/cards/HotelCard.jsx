import React from "react";
import { MapPin, Star } from "lucide-react";
import { NavLink } from "react-router-dom";

const HotelCard = ({
  id,
  hotelName,
  description,
  hotelImage,
  starRating = 0,
  city,
  link,
  onClick,
  className = "",
}) => {
  const Wrapper = link ? NavLink : "div";
  const wrapperProps = link
    ? { to: link }
    : { onClick };

  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer bg-white flex p-2 ${className}`}
    >
      <div className="relative w-20 sm:w-24 h-20 sm:h-24 bg-gray-200 flex-shrink-0 rounded-lg overflow-hidden">
        {hotelImage ? (
          <img
            src={hotelImage}
            alt={hotelName}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-500 rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex-1 p-2 relative">
        {starRating > 0 && (
          <div className="absolute top-1 right-1 flex items-center gap-0.5">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-gray-900">
              {Number(starRating).toFixed(1)}
            </span>
          </div>
        )}

        <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 pr-10 line-clamp-1">
          {hotelName}
        </h3>
        {city && <p className="text-[10px] text-gray-500 mb-1">{city}</p>}
        {description && (
          <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
        )}
      </div>
    </Wrapper>
  );
};

export default HotelCard;
