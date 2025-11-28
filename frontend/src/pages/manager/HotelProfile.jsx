import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MoveRight,
  Hotel,
  Mail,
  Phone,
  UploadIcon,
  FileText,
  Power,
  MapPin,
  Star,
} from "lucide-react";
import {
  getHotelProfile,
  updateHotelProfile,
} from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";

const HotelProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isActive, setIsActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hotelId, setHotelId] = useState(null);
  const [hotelImage, setHotelImage] = useState(null);
  const [originalData, setOriginalData] = useState({});

  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      hotelName: "",
      email: "",
      contactNumber: "",
      description: "",
      starRating: "",
      streetAddress: "",
      city: "",
      state: "",
      pincode: "",
    }
  });

  const fetchHotelData = useCallback(async () => {
    let currentHotelId = hotelId || user?.hotelId || user?.hotel?.id;

    if (!currentHotelId) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        currentHotelId = parsed?.hotelId || parsed?.hotel?.id;
      }
    }

    if (!currentHotelId) {
      const { getAllHotels } = await import("../../services/apiService");
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
      
      if (match?.id) currentHotelId = match.id;
    }

    if (!currentHotelId) {
      setLoading(false);
      return;
    }

    setHotelId(currentHotelId);
    setLoading(true);
    const response = await getHotelProfile(currentHotelId);
    const hotelInfo = response?.data?.data || response?.data;

    if (hotelInfo) {
      reset({
        hotelName: hotelInfo.hotelName || "",
        email: hotelInfo.email || "",
        contactNumber: hotelInfo.contactNumber || "",
        description: hotelInfo.description || "",
        starRating: hotelInfo.starRating ?? "",
        streetAddress: hotelInfo.address?.streetAddress || hotelInfo.streetAddress || "",
        city: hotelInfo.address?.city || hotelInfo.city || "",
        state: hotelInfo.address?.state || hotelInfo.state || "",
        pincode: hotelInfo.address?.pincode || hotelInfo.pincode || "",
      });
      setHotelImage(hotelInfo.hotelImage || null);
      setOriginalData({
        hotelName: hotelInfo.hotelName || "",
        email: hotelInfo.email || "",
        contactNumber: hotelInfo.contactNumber || "",
        description: hotelInfo.description || "",
        starRating: hotelInfo.starRating ?? "",
        streetAddress: hotelInfo.address?.streetAddress || hotelInfo.streetAddress || "",
        city: hotelInfo.address?.city || hotelInfo.city || "",
        state: hotelInfo.address?.state || hotelInfo.state || "",
        pincode: hotelInfo.address?.pincode || hotelInfo.pincode || "",
        hotelImage: hotelInfo.hotelImage || null,
      });
      setIsActive(hotelInfo.isActive ?? (hotelInfo.status === "ACTIVE"));
    }
    setLoading(false);
  }, [user, reset]);

  useEffect(() => {
    if (user) {
      fetchHotelData();
    } else {
      setLoading(false);
    }
  }, [user, reset]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'refreshHotelData' || e.key === 'user') {
        if (user) {
          fetchHotelData();
        }
      }
    };

    const handleRefreshEvent = () => {
      if (user) {
        fetchHotelData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('refreshHotelData', handleRefreshEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('refreshHotelData', handleRefreshEvent);
    };
  }, [user, fetchHotelData]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setHotelImage(file);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    reset({
      hotelName: originalData.hotelName || "",
      email: originalData.email || "",
      contactNumber: originalData.contactNumber || "",
      description: originalData.description || "",
      starRating: originalData.starRating ?? "",
      streetAddress: originalData.streetAddress || "",
      city: originalData.city || "",
      state: originalData.state || "",
      pincode: originalData.pincode || "",
    });
    setHotelImage(originalData.hotelImage || null);
    setIsEditing(false);
  };

  const onSubmit = async (data) => {
    const currentHotelId = hotelId || user?.hotelId || user?.hotel?.id;
    setLoading(true);

    try {
      const payload = {
        hotelName: data.hotelName,
        email: data.email,
        contactNumber: data.contactNumber,
        description: data.description,
        starRating: data.starRating === "" ? null : Number(data.starRating),
        status: isActive === null ? null : isActive ? "ACTIVE" : "INACTIVE",
        address: {
          streetAddress: data.streetAddress,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        },
      };

      const imageFile = (hotelImage && typeof hotelImage === "object" && "name" in hotelImage)
        ? hotelImage
        : null;

      const response = await updateHotelProfile(currentHotelId, payload, imageFile);
      
      const hotelInfo = response?.data?.data || response?.data;

      if (hotelInfo) {
        reset({
          hotelName: hotelInfo.hotelName || "",
          email: hotelInfo.email || "",
          contactNumber: hotelInfo.contactNumber || "",
          description: hotelInfo.description || "",
          starRating: hotelInfo.starRating ?? "",
          streetAddress: hotelInfo.address?.streetAddress || hotelInfo.streetAddress || "",
          city: hotelInfo.address?.city || hotelInfo.city || "",
          state: hotelInfo.address?.state || hotelInfo.state || "",
          pincode: hotelInfo.address?.pincode || hotelInfo.pincode || "",
        });
        setHotelImage(hotelInfo.hotelImage || null);
        setOriginalData({
          hotelName: hotelInfo.hotelName || "",
          email: hotelInfo.email || "",
          contactNumber: hotelInfo.contactNumber || "",
          description: hotelInfo.description || "",
          starRating: hotelInfo.starRating ?? "",
          streetAddress: hotelInfo.address?.streetAddress || hotelInfo.streetAddress || "",
          city: hotelInfo.address?.city || hotelInfo.city || "",
          state: hotelInfo.address?.state || hotelInfo.state || "",
          pincode: hotelInfo.address?.pincode || hotelInfo.pincode || "",
          hotelImage: hotelInfo.hotelImage || null,
        });
      }
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || "Failed to update hotel. Please try again.";
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const displayValue = (value) => {
    if (!value || value.trim() === "") {
      return "N/A";
    }
    return value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading hotel information...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center mb-3 sm:mb-4 gap-2 flex-wrap">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>{" "}
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Hotel Profile</span>
      </div>
      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row align-middle gap-2 sm:gap-3 mb-6 sm:mb-8 items-start sm:items-center">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3">
              <Hotel size={20} className="text-black" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">
                Hotel Profile
              </h2>
            </div>
            <span className="px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-gray-800 bg-white shadow-sm flex items-center gap-1.5 w-fit">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              {originalData.starRating === "" ||
              originalData.starRating === null ||
              originalData.starRating === undefined
                ? "0.0/5"
                : `${Number(originalData.starRating).toFixed(1)}/5`}
            </span>
          </div>
          <button
            onClick={() => navigate("/manager/manager-info")}
            className="text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-xl font-semibold bg-black text-white shadow hover:bg-gray-900 hover:scale-95 transition-transform duration-300 flex items-center justify-center gap-2 sm:ml-auto w-full sm:w-1/2 lg:w-auto"
          >
            Manage Manager
          </button>
        </div>

        <div className="py-4 sm:py-6 border-t border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <Hotel size={18} />
              <p className="text-base sm:text-lg font-semibold">Hotel Details</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Update your hotel information here
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:mr-5 w-full sm:w-auto">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-xl font-semibold bg-black text-white shadow hover:bg-gray-900 hover:scale-95 transition-transform duration-300 flex items-center justify-center gap-2"
              >
                Update Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-xl shadow bg-white text-gray-700 hover:scale-95 transition-transform duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-xl font-semibold bg-black text-white shadow hover:bg-gray-900 hover:scale-95 transition-transform duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <UploadIcon size={18} />
              <p className="text-base sm:text-lg font-semibold">Hotel Image</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Upload or update hotel image
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 sm:mr-5 items-center w-full sm:w-auto">
            {!isEditing ? (
              <>
                <div className="w-full sm:w-72 h-48 sm:h-42 bg-gray-300 rounded-xl flex items-center justify-center text-gray-600 overflow-hidden">
                  {hotelImage ? (
                    <img
                      src={
                        typeof hotelImage === "string"
                          ? hotelImage.startsWith("http")
                            ? hotelImage
                            : `http://localhost:8081/${hotelImage}`
                          : hotelImage
                          ? URL.createObjectURL(hotelImage)
                          : ""
                      }
                      alt="Hotel"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <UploadIcon size={20} />
                      <span className="text-xs sm:text-sm">N/A</span>
                    </div>
                  )}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm">
                  {hotelImage
                    ? "Image uploaded"
                    : "No image uploaded"}
                </div>
              </>
            ) : (
              <>
                <div className="w-full sm:w-72 h-48 sm:h-42 bg-gray-300 rounded-xl flex items-center justify-center text-gray-600 overflow-hidden">
                  {hotelImage ? (
                    <img
                      src={
                        typeof hotelImage === "string"
                          ? hotelImage.startsWith("http")
                            ? hotelImage
                            : `http://localhost:8081/${hotelImage}`
                          : hotelImage
                          ? URL.createObjectURL(hotelImage)
                          : ""
                      }
                      alt="Hotel"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <UploadIcon size={20} />
                  )}
                </div>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="border bg-white w-full sm:w-60 border-gray-400 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm cursor-pointer hover:border-black transition"
                />
              </>
            )}
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-center gap-2">
            <Hotel size={18} />
            <p className="text-base sm:text-lg font-semibold">Hotel Name</p>
          </div>
          <div className="flex gap-4 sm:gap-8 sm:mr-5 w-full sm:w-auto">
            {!isEditing ? (
              <div className="bg-white w-full sm:pr-64 px-3 sm:px-4 py-2 rounded-xl border border-gray-400 text-gray-700 text-sm">
                {displayValue(originalData.hotelName)}
              </div>
            ) : (
              <div className="flex flex-col w-full sm:w-auto">
                <input
                  type="text"
                  disabled={!isEditing}
                  className={`bg-white w-full sm:pr-64 px-3 sm:px-4 py-2 text-sm rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
                    !isEditing && "opacity-70 cursor-not-allowed"
                  } ${formState.errors.hotelName ? "border-red-500" : ""}`}
                  placeholder="Hotel Name"
                  {...register("hotelName", {
                    required: "Hotel name is required",
                    minLength: {
                      value: 2,
                      message: "Hotel name must be at least 2 characters"
                    },
                    pattern: {
                      value: /^[A-Za-z\s]+$/,
                      message: "Hotel name should only contain letters"
                    }
                  })}
                />
                {formState.errors.hotelName && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formState.errors.hotelName.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-center gap-2">
            <Mail size={18} />
            <p className="text-base sm:text-lg font-semibold">Hotel Email</p>
          </div>
          <div className="flex gap-4 sm:gap-8 sm:mr-5 w-full sm:w-auto">
            {!isEditing ? (
              <div className="bg-white w-full sm:min-w-[400px] px-3 sm:px-4 py-2 rounded-xl border border-gray-400 text-gray-700 text-sm">
                {displayValue(originalData.email)}
              </div>
            ) : (
              <div className="flex flex-col w-full sm:min-w-[400px] sm:max-w-[500px]">
                <input
                  type="email"
                  disabled={!isEditing}
                  className={`bg-white w-full px-3 sm:px-4 py-2 text-sm rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
                    !isEditing && "opacity-70 cursor-not-allowed"
                  } ${formState.errors.email ? "border-red-500" : ""}`}
                  placeholder="Hotel Email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address"
                    }
                  })}
                />
                {formState.errors.email && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formState.errors.email.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-center gap-2">
            <Phone size={18} />
            <p className="text-base sm:text-lg font-semibold">Hotel Contact</p>
          </div>
          <div className="flex gap-4 sm:gap-8 sm:mr-5 w-full sm:w-auto">
            {!isEditing ? (
              <div className="bg-white w-full sm:pr-64 px-3 sm:px-4 py-2 rounded-xl border border-gray-400 text-gray-700 text-sm">
                {displayValue(originalData.contactNumber)}
              </div>
            ) : (
              <div className="flex flex-col w-full sm:w-auto">
                <input
                  type="tel"
                  maxLength={10}
                  disabled={!isEditing}
                  className={`bg-white w-full sm:pr-64 px-3 sm:px-4 py-2 text-sm rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
                    !isEditing && "opacity-70 cursor-not-allowed"
                  } ${formState.errors.contactNumber ? "border-red-500" : ""}`}
                  placeholder="Contact Number"
                  {...register("contactNumber", {
                    required: "Contact number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Contact number must be exactly 10 digits"
                    },
                    minLength: {
                      value: 10,
                      message: "Contact number must be 10 digits"
                    },
                    maxLength: {
                      value: 10,
                      message: "Contact number must be 10 digits"
                    }
                  })}
                />
                {formState.errors.contactNumber && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formState.errors.contactNumber.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-5">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <FileText size={18} />
              <p className="text-base sm:text-lg font-semibold">Description</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Describe your hotel and facilities
            </p>
          </div>
          <div className="flex gap-4 sm:gap-8 sm:mr-5 w-full sm:w-auto">
            {!isEditing ? (
              <div className="bg-white w-full sm:w-96 px-3 sm:px-4 py-2 rounded-xl border border-gray-400 text-gray-700 min-h-[100px] flex items-center text-sm">
                {displayValue(originalData.description)}
              </div>
            ) : (
              <textarea
                disabled={!isEditing}
                className={`bg-white w-full sm:w-96 px-3 sm:px-4 py-2 text-sm rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black resize-none ${
                  !isEditing && "opacity-70 cursor-not-allowed"
                }`}
                placeholder="Write about your hotel..."
                rows={4}
                {...register("description")}
              />
            )}
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <p className="text-base sm:text-lg font-semibold">Street Address</p>
          </div>
          <div className="flex gap-4 sm:gap-8 sm:mr-5 w-full sm:w-auto">
            {!isEditing ? (
              <div className="bg-white w-full sm:pr-64 px-3 sm:px-4 py-2 rounded-xl border border-gray-400 text-gray-700 text-sm">
                {displayValue(originalData.streetAddress)}
              </div>
            ) : (
              <input
                type="text"
                disabled={!isEditing}
                className={`bg-white w-full sm:pr-64 px-3 sm:px-4 py-2 text-sm rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
                  !isEditing && "opacity-70 cursor-not-allowed"
                }`}
                placeholder="Street Address"
                {...register("streetAddress")}
              />
            )}
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <p className="text-base sm:text-lg font-semibold">City</p>
          </div>
          <div className="flex gap-4 sm:gap-8 sm:mr-5 w-full sm:w-auto">
            {!isEditing ? (
              <div className="bg-white w-full sm:pr-64 px-3 sm:px-4 py-2 rounded-xl border border-gray-400 text-gray-700 text-sm">
                {displayValue(originalData.city)}
              </div>
            ) : (
              <input
                type="text"
                disabled={!isEditing}
                className={`bg-white w-full sm:pr-64 px-3 sm:px-4 py-2 text-sm rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
                  !isEditing && "opacity-70 cursor-not-allowed"
                }`}
                placeholder="City"
                {...register("city")}
              />
            )}
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <p className="text-base sm:text-lg font-semibold">State</p>
          </div>
          <div className="flex gap-4 sm:gap-8 sm:mr-5 w-full sm:w-auto">
            {!isEditing ? (
              <div className="bg-white w-full sm:pr-64 px-3 sm:px-4 py-2 rounded-xl border border-gray-400 text-gray-700 text-sm">
                {displayValue(originalData.state)}
              </div>
            ) : (
              <input
                type="text"
                disabled={!isEditing}
                className={`bg-white w-full sm:pr-64 px-3 sm:px-4 py-2 text-sm rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
                  !isEditing && "opacity-70 cursor-not-allowed"
                }`}
                placeholder="State"
                {...register("state")}
              />
            )}
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <p className="text-base sm:text-lg font-semibold">Pincode</p>
          </div>
          <div className="flex gap-4 sm:gap-8 sm:mr-5 w-full sm:w-auto">
            {!isEditing ? (
              <div className="bg-white w-full sm:pr-64 px-3 sm:px-4 py-2 rounded-xl border border-gray-400 text-gray-700 text-sm">
                {displayValue(originalData.pincode)}
              </div>
            ) : (
              <input
                type="text"
                maxLength={6}
                disabled={!isEditing}
                className={`bg-white w-full sm:pr-64 px-3 sm:px-4 py-2 text-sm rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
                  !isEditing && "opacity-70 cursor-not-allowed"
                }`}
                placeholder="Pincode"
                {...register("pincode")}
              />
            )}
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <Power size={18} />
              <p className="text-base sm:text-lg font-semibold">Hotel Status</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Manage hotel's Active/Inactive status
            </p>
          </div>
          <div className="flex gap-4 sm:gap-8 sm:mr-5 items-center w-full sm:w-auto">
            {!isEditing ? (
              <div className="bg-black px-4 sm:px-6 py-2 rounded-xl shadow text-white text-xs sm:text-sm font-semibold">
                {isActive !== undefined && isActive !== null
                  ? isActive
                    ? "Active"
                    : "Inactive"
                  : "N/A"}
              </div>
            ) : (
              <button
                onClick={() =>
                  setIsActive(isActive === null ? true : !isActive)
                }
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow transition-all bg-black text-white hover:bg-gray-900 w-full sm:w-auto"
              >
                {isActive === null
                  ? "Active"
                  : isActive
                  ? "Inactive"
                  : "Active"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HotelProfile;
