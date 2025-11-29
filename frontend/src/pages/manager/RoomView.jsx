import React, { useEffect, useState } from "react";
import { NavLink, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MoveRight,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { API_URL } from "../../services/apiService";

const RoomView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const display = (v) => {
    if (v === null || v === undefined) return "N/A";
    if (typeof v === "string" && v.trim() === "") return "N/A";
    return v;
  };

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      setError("");
      try {
        if (location.state?.room) {
          const roomData = location.state.room;
          const origin = new URL(API_URL).origin;
          const toAbsolute = (p) => {
            if (!p) return "";
            if (/^https?:\/\//i.test(p)) return p;
            return `${origin}${p.startsWith("/") ? p : "/" + p}`;
          };

          let imagesArray = [];
          if (roomData.images) {
            if (Array.isArray(roomData.images)) {
              imagesArray = roomData.images;
            } else if (typeof roomData.images === 'string') {
              imagesArray = [{ imageUrl: roomData.images }];
            } else if (roomData.images.imageUrl || roomData.images.url) {
              imagesArray = [roomData.images];
            }
          }
          const allImages = imagesArray
            .map((img) => {
              if (typeof img === "string") return toAbsolute(img);
              return toAbsolute(img?.url || img?.imageUrl || "");
            })
            .filter((url) => url);

          setRoom({
            ...roomData,
            images: allImages,
          });
          setLoading(false);
          return;
        }

        setError("Room data not available");
      } catch (e) {
        setError("Failed to load room details");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id, location.state]);

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center mb-4 gap-2">
          <NavLink to="/">
            <span className="text-gray-500 hover:text-gray-800 transition-all duration-300">
              back to home
            </span>
          </NavLink>
          <MoveRight className="text-gray-500 -rotate-180" size={15} />
          <NavLink to="/manager/rooms-management">
            <span className="text-gray-500 hover:text-gray-800 transition-all duration-300">
              Rooms Management
            </span>
          </NavLink>
          <MoveRight className="text-gray-500 -rotate-180" size={15} />
          <span className="font-semibold">Room View</span>
        </div>
        <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-14 rounded-2xl">
          <div className="text-center py-12 text-gray-500">
            Loading room details...
          </div>
        </div>
      </>
    );
  }

  if (error || !room) {
    return (
      <>
        <div className="flex items-center justify-center mb-4 gap-2">
          <NavLink to="/">
            <span className="text-gray-500 hover:text-gray-800 transition-all duration-300">
              back to home
            </span>
          </NavLink>
          <MoveRight className="text-gray-500 -rotate-180" size={15} />
          <NavLink to="/manager/rooms-management">
            <span className="text-gray-500 hover:text-gray-800 transition-all duration-300">
              Rooms Management
            </span>
          </NavLink>
          <MoveRight className="text-gray-500 -rotate-180" size={15} />
          <span className="font-semibold">Room View</span>
        </div>
        <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-14 rounded-2xl">
          <div className="text-center py-12 text-red-600">
            {error || "Room not found"}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center mb-4 gap-2">
        <NavLink to="/">
          <span className="text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={15} />
        <NavLink to="/manager/rooms-management">
          <span className="text-gray-500 hover:text-gray-800 transition-all duration-300">
            Rooms Management
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={15} />
        <span className="font-semibold">Room View</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-14 rounded-2xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2 text-gray-900 tracking-wide">
            Room Details
          </h2>
          <p className="text-gray-600">Complete information about the room</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-black mb-1">
                  Room {room.roomNumber}
                </h3>
                <p className="text-sm text-gray-600">Room ID: #{room.id}</p>
              </div>
              {(() => {
                const raw = (room.status || "").toString();
                const upper = raw.toUpperCase();
                const display =
                  upper === "AVAILABLE" ? "Available" :
                  upper === "BOOKED" ? "Booked" :
                  upper === "MAINTENANCE" ? "Maintenance" : raw || "Unknown";
                const cls =
                  display === "Available"
                    ? "bg-green-100 text-green-700 border-green-200"
                  : display === "Booked"
                    ? "bg-red-100 text-red-700 border-red-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200";
                return (
                  <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border shadow ${cls}`}>
                    {display === "Available" && <CheckCircle size={14} />}
                    {display}
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="border-b border-gray-300 pb-6">
            <h4 className="text-xl font-bold text-black mb-4">Room Images</h4>
            {room.images && room.images.length > 0 ? (
              <div className="space-y-4">
                <div className="w-full h-96 rounded-xl overflow-hidden bg-gray-200 relative">
                  <img
                    src={room.images[0]}
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-full object-cover object-center"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                </div>
                {room.images.length > 1 && (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {room.images.slice(1).map((img, idx) => (
                        <div
                          key={idx}
                          className="w-full h-48 rounded-lg overflow-hidden bg-gray-200 relative"
                        >
                          <img
                            src={img}
                            alt={`Room ${room.roomNumber} image ${idx + 2}`}
                            className="w-full h-full object-cover object-center hover:scale-105 transition-transform cursor-pointer"
                            style={{
                              objectFit: "cover",
                              objectPosition: "center",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-64 rounded-xl bg-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ImageIcon size={48} className="mx-auto mb-2" />
                  <p className="text-sm">No images available</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-xl font-bold text-black mb-4">
              Room Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Room Type</p>
                <p className="text-lg font-semibold text-black">{display(room.roomType)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Price per Night</p>
                <p className="text-lg font-semibold text-black">{room.price === null || room.price === undefined ? "N/A" : `₹ ${room.price}`}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Room Number</p>
                <p className="text-lg font-semibold text-black">{display(room.roomNumber)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Occupancy Status</p>
                <p className="text-lg font-semibold text-black">
                  {room.occupied ? "Occupied" : "Vacant"}
                </p>
              </div>
              {(room.capacity || room.bedType) && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Capacity / Bed</p>
                  <p className="text-lg font-semibold text-black">
                    {room.capacity ? `${room.capacity} guests` : (room.bedType ? "" : "N/A")}
                    {room.capacity && room.bedType ? " • " : ""}
                    {room.bedType || ""}
                  </p>
                </div>
              )}
              <div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">View</p>
                  <p className="text-lg font-semibold text-black">{display(room.viewType)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-xl font-bold text-black mb-2">Description</h4>
            <p className="text-gray-700 text-sm leading-relaxed">{display(room.description)}</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-xl font-bold text-black mb-4">Amenities</h4>
            {Array.isArray(room.amenities) && room.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {room.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                    <CheckCircle size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-black">{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">N/A</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomView;
