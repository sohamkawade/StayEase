import React, { useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { MoveRight, Image as ImageIcon, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { API_URL, updateRoomById } from "../../services/apiService";

const EditRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const initialRoom = location.state?.room || null;

  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      roomNumber: initialRoom?.roomNumber || "",
      roomType: initialRoom?.roomType || "",
      price: initialRoom?.price ?? "",
      status: initialRoom?.status || "Available",
      amenities: initialRoom?.amenities || [],
      capacity: initialRoom?.capacity ?? "",
      bedType: initialRoom?.bedType || "",
      viewType: initialRoom?.viewType || "",
      description: initialRoom?.description || "",
    },
  });

  const [newFiles, setNewFiles] = useState([]);
  const [removedExistingImages, setRemovedExistingImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const MAX_IMAGES = 6;

  const getImageUrl = (img) => {
    if (!img) return "";
    if (typeof img === "string") return img;
    return img.url || img.imageUrl || "";
  };

  const existingImages = useMemo(() => {
    if (!initialRoom?.images) return [];
    const origin = new URL(API_URL).origin;
    const toAbsolute = (p) => {
      if (!p) return "";
      if (/^https?:\/\//i.test(p)) return p;
      return `${origin}${p.startsWith("/") ? p : "/" + p}`;
    };
    let imagesArray = [];
    if (Array.isArray(initialRoom.images)) {
      imagesArray = initialRoom.images;
    } else if (typeof initialRoom.images === 'string') {
      imagesArray = [{ imageUrl: initialRoom.images }];
    } else if (initialRoom.images.imageUrl || initialRoom.images.url) {
      imagesArray = [initialRoom.images];
    }
    return imagesArray
      .map((img, index) => {
        const originalUrl = getImageUrl(img);
        const absoluteUrl = toAbsolute(originalUrl);
        return {
          id: `existing-${index}`,
          url: absoluteUrl,
          originalUrl: originalUrl,
          isExisting: true,
        };
      })
      .filter((img) => img.url);
  }, [initialRoom]);

  const currentExistingImages = existingImages.filter(
    (img) => !removedExistingImages.includes(img.id)
  );

  const newImagePreviews = newFiles.map((file) => ({ 
    id: `new-${file.name}-${file.size}`,
    name: file.name, 
    url: URL.createObjectURL(file),
    isExisting: false,
    file: file
  }));

  const allImages = [...currentExistingImages, ...newImagePreviews];

  const handleImagesChange = (e) => {
    const incomingFiles = Array.from(e.target.files || []);
    const uniqueFiles = incomingFiles.filter(
      incomingFile => !newFiles.some(existing => 
        existing.name === incomingFile.name && existing.size === incomingFile.size
      )
    );
    const availableSlots = MAX_IMAGES - currentExistingImages.length - newFiles.length;
    const filesToAdd = uniqueFiles.slice(0, Math.max(0, availableSlots));
    setNewFiles([...newFiles, ...filesToAdd]);
    e.target.value = "";
  };

  const removeImage = (imageId, isExisting) => {
    if (isExisting) {
      setRemovedExistingImages([...removedExistingImages, imageId]);
    } else {
      setNewFiles(newFiles.filter((file) => `new-${file.name}-${file.size}` !== imageId));
    }
  };

  const statusMap = {
    "available": "AVAILABLE",
    "maintenance": "MAINTENANCE"
  };

  const onSubmit = async (data) => {
    if (currentExistingImages.length === 0 && newFiles.length === 0) {
      setImageError("At least 1 image is required");
      return;
    }

    setImageError("");
    const statusEnum = statusMap[data.status?.toLowerCase()] || "AVAILABLE";
    
    const roomData = {
      roomNumber: data.roomNumber,
      roomType: data.roomType,
      price: Number(data.price),
      status: statusEnum,
      capacity: data.capacity !== "" && data.capacity !== null ? Number(data.capacity) : null,
      bedType: data.bedType || null,
      viewType: data.viewType || null,
      description: data.description || null,
      amenities: data.amenities || []
    };

    const formData = new FormData();
    // Create a Blob with JSON content type for the room data
    const roomBlob = new Blob([JSON.stringify(roomData)], { type: "application/json" });
    formData.append("room", roomBlob);
    
    if (newFiles.length > 0) {
      newFiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      const response = await updateRoomById(id, formData);
      if (response?.status === 200 || response?.status === 201) {
        navigate("/manager/rooms-management");
      } else {
        const errorMsg = response?.data?.message || "Failed to update room";
        alert(errorMsg);
        if (errorMsg.includes("already exists")) {
          setError("roomNumber", { type: "manual", message: errorMsg });
        }
      }
    } catch (error) {
      console.error("Error updating room:", error);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      alert("Error updating room: " + errorMsg);
      if (errorMsg.includes("already exists")) {
        setError("roomNumber", { type: "manual", message: errorMsg });
      }
    }
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
        <span className="text-xs sm:text-sm font-semibold">Edit Room</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-6 rounded-2xl">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">Edit Room</h1>
          <p className="text-sm sm:text-base text-gray-600">Update room details and images</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
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
                    required: "Capacity is required",
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
                  className={`w-full bg-white px-3 py-2 rounded-xl border focus:ring-2 focus:ring-black focus:outline-none text-sm ${
                    formState.errors.bedType ? "border-red-500" : "border-gray-400"
                  }`}
                  placeholder="e.g. King, Queen, Twin"
                  {...register("bedType", {
                    required: "Bed type is required",
                    minLength: {
                      value: 2,
                      message: "Bed type must be at least 2 characters"
                    }
                  })}
                />
                {formState.errors.bedType && (
                  <p className="text-[10px] sm:text-xs text-red-600 mt-1">{formState.errors.bedType.message}</p>
                )}
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <label className="font-medium text-black mb-1 block text-sm sm:text-base">View Type</label>
                <input
                  type="text"
                  className={`w-full bg-white px-3 py-2 rounded-xl border focus:ring-2 focus:ring-black focus:outline-none text-sm ${
                    formState.errors.viewType ? "border-red-500" : "border-gray-400"
                  }`}
                  placeholder="e.g. City View, Ocean View"
                  {...register("viewType", {
                    required: "View type is required",
                    minLength: {
                      value: 2,
                      message: "View type must be at least 2 characters"
                    }
                  })}
                />
                {formState.errors.viewType && (
                  <p className="text-[10px] sm:text-xs text-red-600 mt-1">{formState.errors.viewType.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="font-medium text-black mb-1 block text-sm sm:text-base">Short Description</label>
              <textarea rows={3} className="w-full bg-white px-3 py-2 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none text-sm" {...register("description")} />
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
                    disabled={allImages.length >= MAX_IMAGES}
                  />
                </label>
                <span className="text-xs text-gray-500">
                  {allImages.length}/{MAX_IMAGES} images
                </span>
              </div>
              {imageError && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-2">{imageError}</p>
              )}
              {allImages.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <div className="flex gap-2 sm:gap-3 whitespace-nowrap">
                    {allImages.map((img) => (
                      <div key={img.id} className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex-none">
                        <img 
                          src={img.url} 
                          alt={img.name || "Room image"} 
                          className="w-full h-full object-cover" 
                        />  
                        <button 
                          type="button" 
                          onClick={() => removeImage(img.id, img.isExisting)} 
                          className="absolute top-1 right-1 bg-black/60 text-white text-[10px] sm:text-[11px] leading-none px-1 sm:px-1.5 py-0.5 rounded hover:bg-black/80" 
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
              <button type="submit" className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-xl font-semibold bg-black text-white shadow hover:bg-gray-900 hover:scale-95 transition-transform duration-300 text-xs sm:text-sm w-full sm:w-auto">
                <Save size={16} className="sm:w-4 sm:h-4" /> <span>Save Changes</span>
              </button>
              <button type="button" onClick={() => navigate("/manager/rooms-management") } className="px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm bg-white text-gray-700 border border-gray-300 hover:scale-95 transition w-full sm:w-auto">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditRoom;


