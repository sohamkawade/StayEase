import React, { useState, useEffect, useContext } from "react";
import { IdCardIcon, Mail, MoveRight, Phone, UploadIcon, User2, UserCircle, X } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../../services/apiService";
import { useForm } from "react-hook-form";
import { getImageUrl } from "../../utils/imageUtils";

const UserProfile = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const userId = user?.id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      contactNumber: "",
    },
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [originalProfilePicture, setOriginalProfilePicture] = useState(null);
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (authLoading || !userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      const res = await getUserProfile(userId);
      const userData = res?.data?.data || res?.data;
      if (userData) {
        reset({
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          email: userData.email || "",
          contactNumber: userData.contactNumber || "",
        });
        setProfilePicture(userData.profilePicture || null);
        setOriginalProfilePicture(userData.profilePicture || null);
        setOriginalData(userData);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId, authLoading]);

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleDeletePicture = () => setProfilePicture(null);
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    reset({
      firstname: originalData.firstname || "",
      lastname: originalData.lastname || "",
      email: originalData.email || "",
      contactNumber: originalData.contactNumber || "",
    });
    setProfilePicture(originalProfilePicture);
    setIsEditing(false);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    let imageFile = null;
    const shouldDeletePhoto = profilePicture === null && originalProfilePicture;

    if (shouldDeletePhoto) {
      data.profilePicture = "";
    } else if (profilePicture && typeof profilePicture === "object" && "name" in profilePicture) {
      imageFile = profilePicture;
    }

    const payload = {
      firstname: data.firstname,
      lastname: data.lastname,
      contactNumber: data.contactNumber,
      profilePicture: data.profilePicture,
      user: { email: data.email?.trim() || "" }
    };

    try {
      const res = await updateUserProfile(payload, userId, imageFile);
      const userInfo = res?.data?.data || res?.data;
      if (userInfo) {
        const updatedEmail = userInfo.email || userInfo.user?.email || "";
        reset({
          firstname: userInfo.firstname || "",
          lastname: userInfo.lastname || "",
          email: updatedEmail,
          contactNumber: userInfo.contactNumber || "",
        });
        setProfilePicture(userInfo.profilePicture || null);
        setOriginalProfilePicture(userInfo.profilePicture || null);
        setOriginalData({
          ...userInfo,
          email: updatedEmail,
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error?.response || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mb-3 sm:mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">back to home</span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">My Profile</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-14 rounded-2xl">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 tracking-wide">
          My Profile
        </h2>

        <div className="py-4 sm:py-6 border-t border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <IdCardIcon size={18} />
              <p className="text-base sm:text-lg font-semibold">Personal Info</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Update your photo and personal details here</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-xl font-semibold bg-black text-white shadow hover:bg-gray-900 hover:scale-95 transition-transform duration-300"
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
                  className="text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-xl font-semibold shadow bg-black text-white hover:bg-gray-900 hover:scale-95 transition-transform duration-300"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="py-6 sm:py-8 border-b border-gray-300 flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">

          <div>
            <div className="flex items-center gap-2">
              <UserCircle size={18} />
              <p className="text-base sm:text-lg font-semibold">Your Photo</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">This photo will appear on your profile</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">

            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 overflow-hidden">
                {profilePicture ? (
                  <img
                    src={
                      typeof profilePicture === "string"
                        ? profilePicture.startsWith("http")
                          ? profilePicture
                          : getImageUrl(profilePicture)
                        : URL.createObjectURL(profilePicture)
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UploadIcon size={20} />
                )}
              </div>

              {isEditing && profilePicture && (
                <button
                  onClick={handleDeletePicture}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 sm:p-1.5 shadow-lg transition-all"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="border bg-white border-gray-400 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm cursor-pointer hover:border-black transition w-full sm:w-auto"
              />
            )}
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row justify-between gap-4 sm:gap-5">

          <div className="flex items-center gap-2">
            <User2 size={18} />
            <p className="text-base sm:text-lg font-semibold">Name</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex flex-col w-full">
              <input
                type="text"
                disabled={!isEditing}
                className={`bg-white w-full px-3 sm:px-4 py-2 text-sm text-black rounded-xl border ${
                  errors.firstname ? "border-red-500" : "border-gray-400"
                } focus:outline-none focus:border-black ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
                placeholder="First Name"
                {...register("firstname", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters",
                  },
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "First name should only contain letters",
                  },
                })}
              />
              {errors.firstname && (
                <p className="mt-1 text-xs text-red-500">{errors.firstname.message}</p>
              )}
            </div>

            <div className="flex flex-col w-full">
              <input
                type="text"
                disabled={!isEditing}
                className={`bg-white w-full px-3 sm:px-4 py-2 text-sm text-black rounded-xl border ${
                  errors.lastname ? "border-red-500" : "border-gray-400"
                } focus:outline-none focus:border-black ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
                placeholder="Last Name"
                {...register("lastname", {
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Last name must be at least 2 characters",
                  },
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Last name should only contain letters",
                  },
                })}
              />
              {errors.lastname && (
                <p className="mt-1 text-xs text-red-500">{errors.lastname.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row justify-between gap-4 sm:gap-5">

          <div className="flex items-center gap-2">
            <Mail size={18} />
            <p className="text-base sm:text-lg font-semibold">Email</p>
          </div>

          <div className="flex flex-col w-full sm:w-1/2">
            <input
              type="email"
              disabled={!isEditing}
              className={`bg-white w-full px-3 sm:px-4 py-2 text-sm text-black rounded-xl border ${
                errors.email ? "border-red-500" : "border-gray-400"
              } focus:outline-none focus:border-black ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
              placeholder="Email Address"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address",
                },
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row justify-between gap-4 sm:gap-5">

          <div className="flex items-center gap-2">
            <Phone size={18} />
            <p className="text-base sm:text-lg font-semibold">Contact</p>
          </div>

          <div className="flex flex-col w-full sm:w-1/2">
            <input
              type="tel"
              maxLength={10}
              disabled={!isEditing}
              className={`bg-white w-full px-3 sm:px-4 py-2 text-sm text-black rounded-xl border ${
                errors.contactNumber ? "border-red-500" : "border-gray-400"
              } focus:outline-none focus:border-black ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
              placeholder="Contact Number"
              {...register("contactNumber", {
                required: "Contact number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Contact number must be exactly 10 digits",
                },
                minLength: {
                  value: 10,
                  message: "Contact number must be 10 digits",
                },
                maxLength: {
                  value: 10,
                  message: "Contact number must be 10 digits",
                },
              })}
            />
            {errors.contactNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.contactNumber.message}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
