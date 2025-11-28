import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Star, Search, MoveRight, ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL, getAllHotels } from "../services/apiService";

const Hotels = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const toAbsoluteUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    const origin = new URL(API_URL).origin;
    return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    setSearchParams(params, { replace: true });
  }, [searchTerm, setSearchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(hotels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHotels = hotels.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const filters = {};
        if (searchTerm && searchTerm.trim()) filters.search = searchTerm.trim();
        
        const res = await getAllHotels(filters);
        const hotelsData = res?.data?.data || res?.data || [];
        const mappedHotels = (hotelsData || []).map((hotel) => ({
          id: hotel.id,
          hotelName: hotel.hotelName || "",
          email: hotel.email || "",
          contactNumber: hotel.contactNumber || "",
          description: hotel.description || "",
          starRating: hotel.starRating || 0,
          hotelImage: toAbsoluteUrl(hotel.hotelImage) || "",
          city: hotel.address?.city || "",
          state: hotel.address?.state || "",
          streetAddress: hotel.address?.streetAddress || "",
          pincode: hotel.address?.pincode || "",
          status: hotel.status || "",
        }));
        setHotels(mappedHotels);
      } catch (error) {
        console.error("Failed to fetch hotels", error);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [searchTerm]);

  const handleHotelClick = (hotel) => {
    navigate(`/hotel-rooms/${hotel.id}`);
  };

  return (
    <>
      <div className="mt-20 sm:mt-24 flex items-center justify-center mb-3 sm:mb-4 gap-2 px-4">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180 w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-sm sm:text-base font-semibold">Hotels</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-6 sm:py-8">
        <div className="mb-8 sm:mb-10">
          <p className="uppercase tracking-widest text-xs text-gray-500 mb-2">
            all hotels
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Discover Amazing Hotels
          </h1>
          
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search hotels by name, city, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 lg:pl-9 pr-3 sm:pr-4 lg:pr-3 py-2 sm:py-3 lg:py-2.5 rounded-lg sm:rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm lg:text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm sm:text-base text-gray-500">Loading hotels...</div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-12 text-sm sm:text-base text-gray-500">
            {searchTerm ? "No hotels found matching your search." : "No hotels available."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {paginatedHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow hover:shadow-xl transition cursor-pointer aspect-square"
                  onClick={() => handleHotelClick(hotel)}
                >
                  <div className="w-full h-full bg-gray-200">
                    {hotel.hotelImage ? (
                      <img
                        src={hotel.hotelImage}
                        alt={hotel.hotelName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-500">
                        <MapPin className="w-8 h-8 sm:w-10 sm:h-10" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 text-white">
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                      {hotel.starRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs sm:text-sm font-semibold">{hotel.starRating.toFixed(1)}</span>
                        </div>
                      )}
                      {hotel.city && (
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-white/80">
                          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>{hotel.city}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1">{hotel.hotelName}</h3>
                    {hotel.description && (
                      <p className="text-xs text-white/80 mt-1 sm:mt-2 line-clamp-2">{hotel.description}</p>
                    )}
                  </div>
                </div>
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

export default Hotels;

