import React from "react";
import { MapPin, ArrowRight, Star } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { API_URL } from "../services/apiService";

const DestinationsSection = ({ hotels = [] }) => {
  const navigate = useNavigate();

  const toAbsoluteUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    const origin = new URL(API_URL).origin;
    return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const destinations = hotels.length === 0 ? [] : hotels
    .filter((hotel) => hotel && hotel.id)
    .map((hotel) => {
      const city = hotel?.address?.city;
      const name = hotel?.hotelName || "Destination";
      const description = hotel?.description || "";
      const image = toAbsoluteUrl(hotel?.hotelImage) || "";
      const starRating = hotel?.starRating || 0;
      return {
        id: hotel.id,
        hotelId: hotel.id,
        name,
        description,
        image,
        city,
        starRating,
      };
    })
    .slice(0, 4);

  const handleHotelClick = (hotel) => {
    navigate(`/hotel-rooms/${hotel.hotelId}`);
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
          <div className="text-center sm:text-left">
            <p className="uppercase tracking-widest text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">
              explore destinations
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              Discover cities loved by StayEase travelers
            </h2>
          </div>
          <NavLink
            to="/hotels"
            className="inline-flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-gray-600 hover:text-black font-semibold transition-colors"
          >
            View All <ArrowRight size={14} />
          </NavLink>
        </div>
        {destinations.length === 0 ? (
          <div className="text-center text-gray-500 text-xs sm:text-sm py-8 sm:py-12">No destinations to show right now.</div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
            style={{ opacity: 1 }}
          >
            <>
              {destinations.map((destination) => (
                <div
                  key={destination.id}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow hover:shadow-xl transition cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  onClick={() => handleHotelClick(destination)}
                >
                    <div className="aspect-square w-full bg-gray-200">
                      {destination.image ? (
                        <img
                          src={destination.image}
                          alt={destination.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="eager"
                          decoding="async"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-500">
                          <MapPin size={32} />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 lg:p-5 text-white">
                      <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                        {destination.starRating > 0 && (
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-[10px] sm:text-xs font-semibold">{destination.starRating.toFixed(1)}</span>
                          </div>
                        )}
                        {destination.city && (
                          <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] md:text-xs text-white/80">
                            <MapPin size={10} />
                            <span className="truncate">{destination.city}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold mb-0.5 line-clamp-1">{destination.name}</h3>
                      {destination.description && (
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-white/80 mt-0.5 sm:mt-1 line-clamp-2">{destination.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </>
            </div>
            )}
      </div>
    </section>
  );
};

export default DestinationsSection;
