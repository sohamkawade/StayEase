import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  MapPin,
  Eye,
  CheckCircle,
  XCircle,
  MoveRight,
} from "lucide-react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  API_URL,
  getAllHotels,
  deleteHotelById,
} from "../../services/apiService";

const Hotels = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (statusFilter !== "all") params.set("status", statusFilter);
    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter, setSearchParams]);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      setError("");
      try {
        const filters = {};
        if (searchTerm && searchTerm.trim()) filters.search = searchTerm.trim();
        if (statusFilter !== "all") filters.status = statusFilter.toUpperCase();

        const res = await getAllHotels(filters);
        const payload = res?.data?.data ?? res?.data ?? [];
        const origin = new URL(API_URL).origin;
        const toAbsolute = (p) => {
          if (!p) return "";
          if (/^https?:\/\//i.test(p)) return p;
          return `${origin}${p.startsWith("/") ? p : "/" + p}`;
        };
        const normalized = (payload || []).map((h) => ({
          id: h.id,
          name: h.hotelName,
          location: h.address ? h.address.city || h.address.state || "" : "",
          description: h.description || "",
          image: toAbsolute(h.hotelImage || ""),
          status: (h.status || "").toLowerCase(),
        }));
        setHotels(normalized);
      } catch (e) {
        setError("Failed to load hotels");
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [searchTerm, statusFilter]);

  const handleDeleteHotel = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) {
      return;
    }

    try {
      const res = await deleteHotelById(id);
      if (res?.status === 200 || res?.status === 201) {
        setHotels(hotels.filter((h) => h.id !== id));
      } else {
        alert("Failed to delete hotel");
      }
    } catch (err) {
      alert("Failed to delete hotel");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mb-3 sm:mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Hotels Management</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-14 rounded-2xl">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">
            Hotels Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Manage all hotels, rooms, and their availability
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-4 items-center md:justify-between">
            <div className="relative w-full md:flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search hotels by name, city, or description...."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm"
              />
            </div>
            <div className="flex flex-row gap-2 sm:gap-3 md:gap-4 items-center w-full md:w-auto">
              <div className="relative flex-shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white px-3 sm:px-4 md:px-6 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-xs sm:text-sm appearance-none whitespace-nowrap"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button
                onClick={() => navigate("/admin/hotels/add")}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 rounded-xl font-semibold bg-black text-white shadow hover:bg-gray-900 hover:scale-95 transition-transform duration-300 text-xs sm:text-sm flex-shrink-0 whitespace-nowrap"
              >
                <Plus size={16} /> <span className="hidden sm:inline">Add Hotel</span><span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-black mb-1">All Hotels</h3>
          </div>
          {loading ? (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm">
              Loading hotels...
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12 text-red-600 text-sm">{error}</div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm">
              No hotels found.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Hotel
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black hidden sm:table-cell">
                      Location
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Status
                    </th>
                    <th className="text-center py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-black">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.map((hotel) => (
                    <tr
                      key={hotel.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                            {hotel.image ? (
                              <img
                                src={hotel.image}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <MapPin size={20} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-black text-sm sm:text-base truncate">
                              {hotel.name}
                            </h4>
                            <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">
                              {hotel.description || "No description"}
                            </p>
                            <div className="sm:hidden flex items-center gap-1 mt-1 text-[10px] text-gray-600">
                              <MapPin size={10} className="text-gray-500" />
                              {hotel.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                          <MapPin size={12} className="text-gray-500" />
                          {hotel.location}
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold border shadow ${
                            hotel.status === "active"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-200 text-red-700 border-red-200"
                          }`}
                        >
                          {hotel.status === "active" ? (
                            <>
                              <CheckCircle size={10} /> Active
                            </>
                          ) : (
                            <>
                              <XCircle size={10} /> Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/hotels/view/${hotel.id}`)
                            }
                            className="p-1.5 sm:p-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all hover:scale-95 flex-shrink-0"
                            title="View Hotel"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteHotel(hotel.id)}
                            className="p-1.5 sm:p-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-all hover:scale-95 flex-shrink-0"
                            title="Delete Hotel"
                          >
                            <Trash2 size={14} />
                          </button>
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

export default Hotels;
