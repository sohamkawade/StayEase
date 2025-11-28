import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { MoveRight, Image as ImageIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { addRoom, getAllHotels } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";

const AddRoom = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const urlHotelId = searchParams.get("hotelId");
  const [hotelId, setHotelId] = useState(null);

  useEffect(() => {
    const fetchHotelId = async () => {
      let resolvedHotelId = urlHotelId || user?.hotelId || user?.hotel?.id;

      if (!resolvedHotelId) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          resolvedHotelId = parsed?.hotelId || parsed?.hotel?.id;
        }
      }

      if (!resolvedHotelId && user) {
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
      }

      setHotelId(resolvedHotelId);
    };

    fetchHotelId();
  }, [urlHotelId, user]);

  const { register, handleSubmit, setValue, formState, watch, reset, setError, clearErrors } = useForm({
    defaultValues: {
      roomNumber: "",
      roomType: "",
      price: "",
      status: "Available",
      amenities: [],
      capacity: "",
      bedType: "",
      viewType: "",
      description: "",
      roomImages: [],
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState("");
  const MAX_IMAGES = 6;
  const imagesWatch = watch("roomImages");

  const [localFiles, setLocalFiles] = useState([]);

  useEffect(() => {
    const arr = imagesWatch instanceof FileList ? Array.from(imagesWatch) : imagesWatch || [];
    setLocalFiles(arr);
  }, [imagesWatch]);

  const imagePreviews = useMemo(() => {
    return localFiles.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
  }, [localFiles]);

  const onSubmit = async (data) => {
    if (!hotelId) {
      setError("root", { type: "manual", message: "Hotel ID not found. Please ensure you are logged in as a manager." });
      return;
    }
    
    setSubmitting(true);
    const statusEnum = (data.status || "").toString().toLowerCase() === "available"
      ? "AVAILABLE"
      : (data.status || "").toString().toLowerCase() === "maintenance"
      ? "MAINTENANCE"
      : "AVAILABLE";
    
    const roomData = {
      roomNumber: data.roomNumber,
      roomType: data.roomType,
      price: Number(data.price),
      status: statusEnum,
      capacity: data.capacity !== "" ? Number(data.capacity) : null,
      bedType: data.bedType || null,
      viewType: data.viewType || null,
      description: data.description || null,
      amenities: data.amenities || []
    };

    const files = data.roomImages instanceof FileList ? Array.from(data.roomImages) : data.roomImages || [];
    if (files.length < 1) {
      setImageError("Please upload at least 1 image.");
      setError("roomImages", { type: "manual", message: "At least 1 image is required" });
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("room", JSON.stringify(roomData));
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await addRoom(hotelId, formData);
      if (response?.status === 200 || response?.status === 201) {
        reset();
        navigate("/manager/rooms-management");
      } else {
        const errorMsg = response?.data?.message || "Failed to add room";
        if (errorMsg.includes("already exists")) {
          setError("roomNumber", { type: "manual", message: errorMsg });
        }
      }
    } catch (error) {
      console.error("Error adding room:", error);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      alert("Error adding room: " + errorMsg);
      if (errorMsg.includes("already exists")) {
        setError("roomNumber", { type: "manual", message: errorMsg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleImagesChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    const existing = imagesWatch instanceof FileList ? Array.from(imagesWatch) : imagesWatch || [];
    let merged = [...existing];
    for (const f of incoming) {
      if (merged.length >= MAX_IMAGES) break;
      if (!merged.some(m => m.name === f.name && m.size === f.size)) {
        merged.push(f);
      }
    }
    let files = merged.slice(0, MAX_IMAGES);
    if (incoming.length > MAX_IMAGES || merged.length > MAX_IMAGES) {
      setImageError(`Maximum ${MAX_IMAGES} images allowed. Extra files ignored.`);
      setError("roomImages", { type: "max", message: `Max ${MAX_IMAGES} images` });
    } else if (files.length === 0) {
      setImageError("Please upload at least 1 image.");
      setError("roomImages", { type: "min", message: "Min 1 image" });
    } else {
      setImageError("");
      clearErrors("roomImages");
    }
    const dt = new DataTransfer();
    files.forEach(f => dt.items.add(f));
    setValue("roomImages", dt.files, { shouldValidate: true, shouldDirty: true });
    e.target.value = "";
  };

  const removeAt = (idx) => {
    const next = localFiles.filter((_, i) => i !== idx);
    const dt = new DataTransfer();
    next.forEach(f => dt.items.add(f));
    setValue("roomImages", dt.files, { shouldValidate: true, shouldDirty: true });
    setLocalFiles(next);
  };

  const move = (idx, dir) => {
    const next = [...localFiles];
    const swapWith = dir === "left" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= next.length) return;
    const t = next[idx];
    next[idx] = next[swapWith];
    next[swapWith] = t;
    const dt = new DataTransfer();
    next.forEach(f => dt.items.add(f));
    setValue("roomImages", dt.files, { shouldValidate: true, shouldDirty: true });
    setLocalFiles(next);
  };

  return (
    <>
      <div className="flex items-center justify-center mb-4 gap-2 flex-wrap">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">back to home</span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <NavLink to="/manager/rooms-management">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">Rooms Management</span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Add Room</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-6 rounded-2xl">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">Add Room</h1>
          <p className="text-sm sm:text-base text-gray-600">Create a new room for this hotel</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {formState.errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm">
                {formState.errors.root.message}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="font-medium text-black mb-1 block text-sm sm:text-base">Room Number</label>
                <input
                  type="text"
                  className={`w-full bg-white px-3 py-2 rounded-xl border focus:ring-2 focus:ring-black focus:outline-none text-sm ${
                    formState.errors.roomNumber ? "border-red-500" : "border-gray-400"
                  }`}
                  placeholder="e.g. 101"
                  {...register("roomNumber", {
                    required: "Room number is required",
                    minLength: {
                      value: 1,
                      message: "Room number must be at least 1 character"
                    },
                    maxLength: {
                      value: 10,
                      message: "Room number cannot exceed 10 characters"
                    }
                  })}
                />
                {formState.errors.roomNumber && (
                  <p className="text-[10px] sm:text-xs text-red-600 mt-1">{formState.errors.roomNumber.message}</p>
                )}
              </div>
              <div>
                <label className="font-medium text-black mb-1 block text-sm sm:text-base">Room Type</label>
                <select
                  className={`w-full bg-white px-3 py-2 rounded-xl border focus:ring-2 focus:ring-black focus:outline-none text-sm ${
                    formState.errors.roomType ? "border-red-500" : "border-gray-400"
                  }`}
                  {...register("roomType", {
                    required: "Please select a room type",
                    validate: v => v !== "" || "Please select a room type"
                  })}
                >
                  <option value="" disabled>All Room Types</option>
                  <option>Deluxe Room</option>
                  <option>Family Suite</option>
                  <option>Standard Room</option>
                  <option>Executive Suite</option>
                </select>
                {formState.errors.roomType && (
                  <p className="text-[10px] sm:text-xs text-red-600 mt-1">{formState.errors.roomType.message}</p>
                )}
              </div>
              <div>
                <label className="font-medium text-black mb-1 block text-sm sm:text-base">Price / Night (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className={`w-full bg-white px-3 py-2 rounded-xl border focus:ring-2 focus:ring-black focus:outline-none text-sm ${
                    formState.errors.price ? "border-red-500" : "border-gray-400"
                  }`}
                  placeholder="e.g. 5000"
                  {...register("price", {
                    required: "Price is required",
                    min: {
                      value: 0,
                      message: "Price must be greater than or equal to 0"
                    }
                  })}
                />
                {formState.errors.price && (
                  <p className="text-[10px] sm:text-xs text-red-600 mt-1">{formState.errors.price.message}</p>
                )}
              </div>
              <div>
                <label className="font-medium text-black mb-1 block text-sm sm:text-base">Status</label>
                <select
                  className={`w-full bg-white px-3 py-2 rounded-xl border focus:ring-2 focus:ring-black focus:outline-none text-sm ${
                    formState.errors.status ? "border-red-500" : "border-gray-400"
                  }`}
                  {...register("status", {
                    required: "Status is required"
                  })}
                >
                  <option>Available</option>
                  <option>Maintenance</option>
                </select>
                {formState.errors.status && (
                  <p className="text-[10px] sm:text-xs text-red-600 mt-1">{formState.errors.status.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="font-medium text-black mb-1 block text-sm sm:text-base">Capacity (Guests)</label>
                <input
                  type="number"
                  className={`w-full bg-white px-3 py-2 rounded-xl border focus:ring-2 focus:ring-black focus:outline-none text-sm ${
                    formState.errors.capacity ? "border-red-500" : "border-gray-400"
                  }`}
                  placeholder="e.g. 2"
                  {...register("capacity", {
                    min: {
                      value: 1,
                      message: "Capacity must be at least 1"
                    }
                  })}
                />
                {formState.errors.capacity && (
                  <p className="text-[10px] sm:text-xs text-red-600 mt-1">{formState.errors.capacity.message}</p>
                )}
              </div>
              <div>
                <label className="font-medium text-black mb-1 block text-sm sm:text-base">Bed Type</label>
                <input
                  type="text"
                  className="w-full bg-white px-3 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                  placeholder="e.g. King"
                  {...register("bedType")}
                />
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <label className="font-medium text-black mb-1 block text-sm sm:text-base">View Type</label>
                <input
                  type="text"
                  className="w-full bg-white px-3 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                  placeholder="e.g. City View"
                  {...register("viewType")}
                />
              </div>
            </div>
            <div>
              <label className="font-medium text-black mb-1 block text-sm sm:text-base">Short Description</label>
              <textarea
                rows={3}
                className="w-full bg-white px-3 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm"
                placeholder="Brief room summary"
                {...register("description")}
              />
            </div>

            <div>
              <label className="font-medium text-black mb-2 block text-sm sm:text-base">Amenities</label>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {["Wi-Fi", "AC", "TV", "Parking", "Pool", "Security"].map((a) => (
                  <label key={a} className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-xl border border-gray-300 cursor-pointer select-none">
                    <input type="checkbox" value={a} className="accent-black" {...register("amenities")} />
                    <span className="text-xs sm:text-sm text-black">{a}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="font-medium text-black mb-2 block text-sm sm:text-base">Room Images</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-gray-400 bg-white text-gray-700 text-xs sm:text-sm cursor-pointer hover:border-black w-full sm:w-auto">
                  <ImageIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  <span>Select Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImagesChange}
                  />
                </label>
                <span className="text-xs text-gray-500">{(imagesWatch && imagesWatch.length) || 0}/{MAX_IMAGES} selected</span>
              </div>
              {imageError && <p className="text-[10px] sm:text-xs text-red-600 mt-2">{imageError}</p>}
              {imagePreviews.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <div className="flex gap-2 sm:gap-3 whitespace-nowrap">
                    {imagePreviews.map((img, idx) => (
                      <div key={`${img.name}-${idx}`} className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex-none">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeAt(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white text-[10px] sm:text-[11px] leading-none px-1 sm:px-1.5 py-0.5 rounded"
                          title="Remove image"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-xl font-semibold bg-black text-white shadow hover:bg-gray-900 hover:scale-95 transition-transform duration-300 text-xs sm:text-sm w-full sm:w-auto">
                 {submitting ? "Adding..." : "Add Room"}
              </button>
              <button type="button" onClick={() => reset()} className="px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm bg-white text-gray-700 border border-gray-300 hover:scale-95 transition w-full sm:w-auto">Reset</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddRoom;


