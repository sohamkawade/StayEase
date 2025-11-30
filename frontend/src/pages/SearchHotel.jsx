import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { API_URL, getAllHotels } from "../services/apiService";
import HotelCard from "../components/cards/HotelCard";

const SearchHotel = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [hotels, setHotels] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const toAbsoluteUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    const origin = new URL(API_URL).origin;
    return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const normalizeHotels = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    if (payload?.content && Array.isArray(payload.content)) return payload.content;
    if (payload?.results && Array.isArray(payload.results)) return payload.results;
    return [];
  };

  useEffect(() => {
    const fetchAllHotels = async () => {
      try {
        const res = await getAllHotels();
        const hotelsData = normalizeHotels(res?.data?.data ?? res?.data);
        const mappedHotels = hotelsData.map((hotel) => ({
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

        const uniqueLocations = [
          ...new Set(
            mappedHotels
              .map((hotel) => hotel.city)
              .filter((city) => city && city.trim() !== "")
          ),
        ].sort();
        setLocations(uniqueLocations);
      } catch (error) {
        console.error("Failed to fetch locations", error);
      }
    };
    fetchAllHotels();
  }, []);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const filters = {};
        if (searchTerm && searchTerm.trim()) {
          filters.search = searchTerm.trim();
        }
        if (selectedLocation && selectedLocation.trim()) {
          filters.location = selectedLocation.trim();
        }

        const res = await getAllHotels(filters);
        const hotelsData = normalizeHotels(res?.data?.data ?? res?.data);
        const mappedHotels = hotelsData.map((hotel) => ({
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
  }, [searchTerm, selectedLocation]);

  const handleHotelClick = (hotel) => {
    navigate(`/hotel-rooms/${hotel.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3 sm:py-4">
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
        <div className="mb-4">
          <p className="uppercase tracking-widest text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">
            find your perfect stay
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Search Hotels
          </h2>
        </div>

        <div className="mb-4">
          <div className="relative max-w-xl">
            <Search
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search hotels by name, city, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLocation("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedLocation === ""
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Locations
            </button>
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedLocation === location
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <MapPin size={12} />
                {location}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-sm text-gray-500">Loading hotels...</div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            {searchTerm || selectedLocation
              ? "No hotels found matching your criteria."
              : "No hotels available."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {hotels.slice(0, 6).map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  id={hotel.id}
                  hotelName={hotel.hotelName}
                  description={hotel.description}
                  hotelImage={hotel.hotelImage}
                  starRating={hotel.starRating}
                  city={hotel.city}
                  onClick={() => handleHotelClick(hotel)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchHotel;

