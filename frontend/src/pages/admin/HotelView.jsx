import React, { useEffect, useState } from "react";
import { MoveRight, Mail, MapPin, Building2, MapPinned, Phone, CheckCircle, XCircle, Wifi, Car, Waves, Wind, Utensils, Star } from "lucide-react";
import { NavLink, useParams } from "react-router-dom";
import { API_URL, getHotelById, getAllRoomsByHotelId, getFeedbackByHotelId } from "../../services/apiService";

const HotelView = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHotel = async () => {
      setLoading(true);
      setError("");
      try {
        const [hotelRes, roomsRes, feedbackRes] = await Promise.all([
          getHotelById(id),
          getAllRoomsByHotelId(id).catch(() => ({ data: { data: [] } })),
          getFeedbackByHotelId(id).catch(() => ({ data: { data: [] } }))
        ]);

        const h = hotelRes?.data?.data ?? hotelRes?.data;
        const origin = new URL(API_URL).origin;
        const toAbsolute = (p) => {
          if (!p) return "";
          if (/^https?:\/\//i.test(p)) return p;
          return `${origin}${p.startsWith('/') ? p : '/' + p}`;
        };

        const rooms = Array.isArray(roomsRes?.data?.data) ? roomsRes?.data?.data : (Array.isArray(h.rooms) ? h.rooms : []);
        const allAmenities = [...new Set(rooms.flatMap(r => Array.isArray(r.amenities) ? r.amenities : []))];

        const availableRooms = rooms.filter(r => {
          const status = (r.status || "").toString().toLowerCase();
          return status === "available";
        }).length;

        const bookedRooms = rooms.filter(r => {
          const status = (r.status || "").toString().toLowerCase();
          return status === "booked";
        }).length;

        const feedbacks = Array.isArray(feedbackRes?.data?.data) ? feedbackRes?.data?.data : [];
        const totalReviews = feedbacks.length;
        const averageRating = totalReviews > 0
          ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / totalReviews).toFixed(1)
          : (h.starRating || 0).toFixed(1);

        setHotel({
          id: h.id,
          name: h.hotelName,
          email: h.email,
          contactNumber: h.contactNumber,
          street: h.address?.streetAddress || "",
          city: h.address?.city || "",
          state: h.address?.state || "",
          pincode: h.address?.pincode || "",
          description: h.description || "",
          amenities: allAmenities,
          totalRooms: rooms.length,
          availableRooms: availableRooms,
          bookedRooms: bookedRooms,
          averageRating: parseFloat(averageRating),
          totalReviews: totalReviews,
          status: (h.status || "").toLowerCase(),
          image: toAbsolute(h.hotelImage || ""),
        });
      } catch (e) {
        setError("Failed to load hotel");
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case "wi-fi":
        return <Wifi size={16} className="text-gray-600" />;
      case "parking":
        return <Car size={16} className="text-gray-600" />;
      case "pool":
        return <Waves size={16} className="text-gray-600" />;
      case "ac":
        return <Wind size={16} className="text-gray-600" />;
      case "restaurant":
        return <Utensils size={16} className="text-gray-600" />;
      default:
        return <CheckCircle size={16} className="text-gray-600" />;
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mb-3 sm:mb-4 gap-2 flex-wrap">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <NavLink to="/admin/hotels">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            Hotels
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Hotel View</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 rounded-2xl">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-gray-900 tracking-wide">Hotel Details</h2>
          <p className="text-sm text-gray-600">Information about the hotel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
          {loading ? (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12 text-red-600 text-sm">{error}</div>
          ) : !hotel ? (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm">Hotel not found.</div>
          ) : (
          <>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="w-full md:w-96 h-48 sm:h-64 rounded-xl overflow-hidden bg-gray-200">
              <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-1 sm:mb-2">{hotel.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Hotel ID: #{hotel.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold border shadow ${
                  hotel.status === "active" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-none"
                }`}>
                  {hotel.status === "active" ? <><CheckCircle size={12} /> Active</> : <><XCircle size={12} /> Inactive</>}
                </span>
              </div>
            </div>
          </div>

          {/* Hotel Basic Info */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h4 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">Hotel Basic Info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Mail size={18} className="text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Email ID</p>
                  <p className="text-xs sm:text-sm font-medium text-black break-words">{hotel.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Phone size={18} className="text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Contact Number</p>
                  <p className="text-xs sm:text-sm font-medium text-black">{hotel.contactNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h4 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">Location Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <MapPin size={18} className="text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-xs sm:text-sm font-medium text-black break-words">{hotel.street}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Building2 size={18} className="text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">City, State</p>
                  <p className="text-xs sm:text-sm font-medium text-black">{hotel.city}, {hotel.state}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <MapPinned size={18} className="text-gray-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Pin Code</p>
                  <p className="text-xs sm:text-sm font-medium text-black">{hotel.pincode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Description */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h4 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">Hotel Description</h4>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{hotel.description || "N/A"}</p>
          </div>

          {/* Facilities / Amenities */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h4 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">Facilities / Amenities</h4>
            {hotel.amenities && hotel.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {hotel.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-xl border border-gray-200">
                    {getAmenityIcon(amenity)}
                    <span className="text-xs sm:text-sm font-medium text-black">{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-gray-600">N/A</div>
            )}
          </div>

          {/* Rooms Summary */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h4 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">Rooms Summary</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">Total Rooms</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{hotel.totalRooms}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-200">
                <p className="text-[10px] sm:text-xs text-gray-600 mb-1 sm:mb-2">Available Rooms</p>
                <p className="text-xl sm:text-2xl font-bold text-green-700">{hotel.availableRooms}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 sm:p-4 border border-red-200">
                <p className="text-[10px] sm:text-xs text-gray-600 mb-1 sm:mb-2">Booked Rooms</p>
                <p className="text-xl sm:text-2xl font-bold text-red-700">{hotel.bookedRooms}</p>
              </div>
            </div>
          </div>


          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h4 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">Ratings & Feedback Summary</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">Average Rating</p>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Star size={18} className="text-black fill-black" />
                  <p className="text-xl sm:text-2xl font-bold text-black">{hotel.averageRating}</p>
                  <span className="text-xs sm:text-sm text-gray-500">/ 5.0</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">Total Reviews</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{hotel.totalReviews}</p>
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </>
  );
};

export default HotelView;

