import React, { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  MoveRight,
  Plus,
  Edit,
  Trash2,
  Search,
  Image as ImageIcon,
  Eye,
  CheckCircle,
} from "lucide-react";
import { API_URL, getAllRoomsByHotelId, getAllHotels, deleteRoomById } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";

const RoomsManagement = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const urlHotelId = searchParams.get("hotelId");

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [sortKey, setSortKey] = useState(searchParams.get("sort") || "priceAsc");

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (sortKey !== "priceAsc") params.set("sort", sortKey);
    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter, sortKey, setSearchParams]);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let resolvedHotelId = urlHotelId || user?.hotelId || user?.hotel?.id;

      if (!resolvedHotelId) {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            resolvedHotelId = parsed?.hotelId || parsed?.hotel?.id;
          }
        } catch (e) {}
      }

      if (!resolvedHotelId && user) {
        try {
          const hotelsRes = await getAllHotels();
          const hotels = hotelsRes?.data?.data || hotelsRes?.data || [];
          const email = user?.email || JSON.parse(localStorage.getItem("user") || "{}")?.email;
          const phone = user?.contactNumber || JSON.parse(localStorage.getItem("user") || "{}")?.contactNumber;
          
          const match = hotels.find((h) => {
            const m = h?.manager;
            if (!m) return false;
            const matchByEmail = email && m.email && m.email.toLowerCase() === email.toLowerCase();
            const matchByPhone = phone && m.contactNumber && String(m.contactNumber) === String(phone);
            return matchByEmail || matchByPhone;
          });
          
          if (match?.id) {
            resolvedHotelId = match.id;
          }
        } catch (error) {}
      }

      if (!resolvedHotelId) {
        setRooms([]);
        setLoading(false);
        return;
      }

      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== "all") filters.status = statusFilter.toUpperCase();
      if (sortKey === "priceAsc") {
        filters.sortBy = "price";
        filters.sortDirection = "asc";
      } else if (sortKey === "priceDesc") {
        filters.sortBy = "price";
        filters.sortDirection = "desc";
      }

      const res = await getAllRoomsByHotelId(resolvedHotelId, filters);
      const payload = res?.data?.data ?? res?.data ?? [];

      const origin = new URL(API_URL).origin;
      const toAbsolute = (p) => {
        if (!p) return "";
        if (/^https?:\/\//i.test(p)) return p;
        return `${origin}${p.startsWith("/") ? p : "/" + p}`;
      };

      const normalized = (payload || []).map((r) => {
        const imgs = Array.isArray(r.images) ? r.images : [];
        const allImages = imgs
          .map((img) => {
            const rawUrl = img.imageUrl || img.url || "";
            return toAbsolute(rawUrl);
          })
          .filter((url) => url);
        const statusRaw = (r.status || "").toString().toUpperCase();
        const statusDisplay =
          statusRaw === "AVAILABLE" ? "Available" :
          statusRaw === "BOOKED" ? "Booked" :
          statusRaw === "MAINTENANCE" ? "Maintenance" : (r.status || "Available");
        return {
          id: r.id,
          roomNumber: r.roomNumber,
          roomType: r.roomType,
          price: r.price,
          status: statusDisplay,
          amenities: r.amenities || [],
          images: allImages,
          occupied: statusRaw === "BOOKED",
          capacity: r.capacity,
          bedType: r.bedType,
          viewType: r.viewType,
          description: r.description,
        };
      });
      setRooms(normalized);
    } catch (e) {
      if (e?.response?.status === 404) {
        setRooms([]);
        setError(e?.response?.data?.message || "Hotel not found or no rooms available");
      } else {
        setError("Failed to load rooms.");
        setRooms([]);
      }
    } finally {
      setLoading(false);
    }
  }, [urlHotelId, user, searchTerm, statusFilter, sortKey]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleViewNavigate = (room) => {
    navigate(`/manager/rooms-management/view/${room.id}`, { state: { room } });
  };

  const handleEditNavigate = (room) => {
    navigate(`/manager/rooms-management/edit/${room.id}`, { state: { room } });
  };

  const handleDelete = async (id) => {
    const room = rooms.find((r) => r.id === id);
    if (!window.confirm(`Delete Room ${room?.roomNumber || id}?`)) {
      return;
    }

    const response = await deleteRoomById(id);
    if (response?.status === 200 || response?.status === 204) {
      await fetchRooms();
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>{" "}
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Rooms Management</span>
      </div>
      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-6 rounded-2xl">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">
              Rooms Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage rooms and availability
            </p>
          </div>
          <button
            onClick={() => navigate("/manager/rooms-management/add")}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 rounded-xl font-semibold bg-black text-white shadow hover:bg-gray-900 hover:scale-95 transition-transform duration-300 text-xs sm:text-sm w-full sm:w-auto"
          >
            <Plus size={16} className="sm:w-4.5 sm:h-4.5" /> <span>Add Room</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between mb-4">
            <div className="flex flex-col md:flex-row flex-1 gap-3 md:gap-4 w-full md:w-auto">
              <div className="relative w-full md:flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by room number or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white pl-10 pr-4 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                />
              </div>
              <div className="flex flex-row gap-2 md:gap-4 md:relative">
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white w-full md:w-auto md:px-6 px-3 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-xs md:text-sm appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    className="bg-white w-full md:w-auto md:px-6 px-3 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-xs md:text-sm appearance-none"
                  >
                    <option value="priceAsc">Sort: Price Low to High</option>
                    <option value="priceDesc">Sort: Price High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-gray-500">
              Loading rooms...
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-gray-500">
              No rooms found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Room
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Type
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Price / Night
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Status
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black hidden sm:table-cell">
                      Amenities
                    </th>
                    <th className="text-center py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr
                      key={room.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 relative">
                            {room.images && room.images.length > 0 ? (
                              <img
                                src={room.images[0]}
                                alt={room.roomNumber}
                                className="w-full h-full object-cover object-center"
                                style={{
                                  objectFit: "cover",
                                  objectPosition: "center",
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <ImageIcon size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-black text-base">
                              Room {room.roomNumber}
                            </h4>
                            <p className="text-xs text-gray-500">{room.occupied ? "Occupied" : "Vacant"}</p>
                            {(room.capacity || room.bedType) && (
                              <p className="text-xs text-gray-500">
                                {room.capacity ? `${room.capacity} guests` : null}
                                {room.capacity && room.bedType ? " • " : null}
                                {room.bedType || null}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">{room.roomType || "N/A"}</td>
                      <td className="py-4 px-4">{room.price === null || room.price === undefined ? "N/A" : `₹ ${room.price}`}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border shadow ${
                            room.status === "Available"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : room.status === "Booked"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }`}
                        >
                          {room.status === "Available" && (
                            <CheckCircle size={14} />
                          )}
                          {room.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {Array.isArray(room.amenities) && room.amenities.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {room.amenities.map((a) => (
                              <span key={a} className="px-2 py-1 text-xs bg-gray-100 rounded-lg border border-gray-200 text-gray-700">
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewNavigate(room)}
                            className="p-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all hover:scale-95"
                            title="View Room"
                          >
                            <Eye size={16} />
                          </button>
                          {room.status !== "Booked" && (
                            <button
                              onClick={() => handleEditNavigate(room)}
                              className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all hover:scale-95"
                              title="Edit Room"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {room.status !== "Booked" && (
                            <button
                              onClick={() => handleDelete(room.id)}
                              className="p-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-all hover:scale-95"
                              title="Delete Room"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RoomsManagement;
