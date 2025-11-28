import React, { useState, useEffect } from 'react'
import { NavLink } from "react-router-dom";
import { MoveRight, User2, Mail, Phone, IdCardIcon, ShieldCheck } from "lucide-react";
import { getManagerProfile, updateManagerProfile, changeManagerPassword } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";

const ManagerInfo = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [originalData, setOriginalData] = useState({});

  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      contactNumber: "",
    }
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: passwordFormState, reset: resetPassword } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    }
  });

  useEffect(() => {
    const fetchManagerData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await getManagerProfile(user.id);
      const managerInfo = response?.data?.data || response?.data;

      if (managerInfo) {
        reset({
          firstname: managerInfo.firstname || "",
          lastname: managerInfo.lastname || "",
          email: managerInfo.email || "",
          contactNumber: managerInfo.contactNumber || "",
        });
        setOriginalData({
          firstname: managerInfo.firstname || "",
          lastname: managerInfo.lastname || "",
          email: managerInfo.email || "",
          contactNumber: managerInfo.contactNumber || "",
        });
      }
      setLoading(false);
    };

    fetchManagerData();
  }, [user, reset]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    reset({
      firstname: originalData.firstname || "",
      lastname: originalData.lastname || "",
      email: originalData.email || "",
      contactNumber: originalData.contactNumber || "",
    });
    setIsEditing(false);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const response = await updateManagerProfile(data, user.id);
    const managerInfo = response?.data?.data || response?.data;
    if (managerInfo) {
      reset({
        firstname: managerInfo.firstname || "",
        lastname: managerInfo.lastname || "",
        email: managerInfo.email || "",
        contactNumber: managerInfo.contactNumber || "",
      });
      setOriginalData({
        firstname: managerInfo.firstname || "",
        lastname: managerInfo.lastname || "",
        email: managerInfo.email || "",
        contactNumber: managerInfo.contactNumber || "",
      });
    }
    setIsEditing(false);
    setLoading(false);
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    const response = await changeManagerPassword(data, user.id);
    if (response?.status === 200 || response?.status === 201) {
      setPasswordSuccess("Password changed successfully!");
      resetPassword();
      
      const managerResponse = await getManagerProfile(user.id);
      const managerInfo = managerResponse?.data?.data || managerResponse?.data;
      if (managerInfo) {
        reset({
          firstname: managerInfo.firstname || "",
          lastname: managerInfo.lastname || "",
          email: managerInfo.email || "",
          contactNumber: managerInfo.contactNumber || "",
        });
        setOriginalData({
          firstname: managerInfo.firstname || "",
          lastname: managerInfo.lastname || "",
          email: managerInfo.email || "",
          contactNumber: managerInfo.contactNumber || "",
        });
      }
      
      window.dispatchEvent(new Event('refreshHotelData'));
      const currentUser = localStorage.getItem("user");
      if (currentUser) {
        localStorage.setItem("refreshHotelData", Date.now().toString());
        localStorage.removeItem("refreshHotelData");
      }
    } else {
      const errorMsg = response?.data?.message || "";
      setPasswordError(errorMsg || "Failed to change password. Please try again.");
    }
    setPasswordLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading manager information...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">back to home</span>{" "}
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Manager Information</span>
      </div>
      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-6 rounded-2xl">
        <div className="flex align-middle gap-2 sm:gap-3 mb-6 sm:mb-8 items-center">
          <User2 size={18} className="sm:w-6 sm:h-6 text-black" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">
            Manager Information
          </h2>
        </div>

        <div className="py-4 sm:py-6 border-t border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <IdCardIcon size={18} className="sm:w-5 sm:h-5" />
              <p className="text-base sm:text-lg font-semibold">Personal Info</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Manager personal details
            </p>
          </div>

          <div className="flex gap-2 sm:gap-4 sm:mr-5 w-full sm:w-auto">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-xl font-semibold bg-black text-white shadow hover:bg-gray-900 hover:scale-95 transition-transform duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Update Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-xl shadow bg-white text-gray-700 hover:scale-95 transition-transform duration-300 flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-xl font-semibold bg-black text-white shadow hover:bg-gray-900 hover:scale-95 transition-transform duration-300 flex items-center justify-center gap-2 flex-1 sm:flex-none"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="py-4 sm:py-6 border-b border-gray-300 flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <User2 size={18} className="sm:w-5 sm:h-5" />
              <p className="text-base sm:text-lg font-semibold">Name</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:mr-5 w-full sm:w-auto">
            <div className="flex flex-col flex-1 sm:flex-none">
              <input
                type="text"
                disabled={!isEditing}
                className={`bg-white px-3 sm:px-4 py-2 text-sm rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
                  !isEditing && "opacity-70 cursor-not-allowed"
                } ${formState.errors.firstname ? "border-red-500" : ""}`}
                placeholder="First Name"
                {...register("firstname", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters"
                  },
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "First name should only contain letters"
                  }
                })}
              />
              {formState.errors.firstname && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formState.errors.firstname.message}</p>
              )}
            </div>
            <div className="flex flex-col flex-1 sm:flex-none">
              <input
                type="text"
                disabled={!isEditing}
                className={`bg-white px-3 sm:px-4 py-2 text-sm rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
                  !isEditing && "opacity-70 cursor-not-allowed"
                } ${formState.errors.lastname ? "border-red-500" : ""}`}
                placeholder="Last Name"
                {...register("lastname", {
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Last name must be at least 2 characters"
                  },
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Last name should only contain letters"
                  }
                })}
              />
              {formState.errors.lastname && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">{formState.errors.lastname.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="py-4 sm:py-6 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <Mail size={18} className="sm:w-5 sm:h-5" />
              <p className="text-base sm:text-lg font-semibold">Email</p>
            </div>
          </div>

          <div className="flex gap-4 sm:gap-8 sm:mr-5 w-full sm:w-auto">
            {!isEditing ? (
              <div className="bg-white w-full sm:max-w-md lg:max-w-xl px-3 sm:px-4 py-2 rounded-xl border border-gray-400 text-gray-700 text-sm">
                {originalData.email || ""}
              </div>
            ) : (
              <div className="flex flex-col w-full sm:max-w-md lg:max-w-xl">
                <input
                  type="email"
                  disabled={!isEditing}
                  className={`bg-white w-full px-3 sm:px-4 py-2 text-sm rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
                    !isEditing && "opacity-70 cursor-not-allowed"
                  } ${formState.errors.email ? "border-red-500" : ""}`}
                  placeholder="Email Address"
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

        <div className="py-4 sm:py-6 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <Phone size={18} className="sm:w-5 sm:h-5" />
              <p className="text-base sm:text-lg font-semibold">Contact</p>
            </div>
          </div>

          <div className="flex gap-4 sm:gap-8 sm:mr-5 w-full sm:w-auto">
            {!isEditing ? (
              <div className="bg-white w-full sm:max-w-md lg:max-w-xl px-3 sm:px-4 py-2 rounded-xl border border-gray-400 text-gray-700 text-sm">
                {originalData.contactNumber || ""}
              </div>
            ) : (
              <div className="flex flex-col w-full sm:max-w-md lg:max-w-xl">
                <input
                  type="tel"
                  maxLength={10}
                  disabled={!isEditing}
                  className={`bg-white w-full px-3 sm:px-4 py-2 text-sm rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
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

        <div className="py-4 sm:py-6 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex gap-2 flex-col">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="sm:w-5 sm:h-5" />
              <p className="text-base sm:text-lg font-semibold">Change Password</p>
            </div>
              <p className="text-xs sm:text-sm text-gray-500">
              Change or reset manager login credentials
            </p>
            </div>
          </div>
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:mr-5 w-full sm:w-auto">
            <div className="flex flex-col flex-1 sm:flex-none">
              <input
                type="password"
                className={`bg-white px-3 sm:px-4 md:px-5 py-2 text-sm rounded-xl outline-none border focus:ring-2 focus:ring-black ${
                  passwordFormState.errors.currentPassword ? "border-red-500" : "border-gray-400"
                }`}
                placeholder="Current Password"
                {...registerPassword("currentPassword", {
                  required: "Current password is required"
                })}
              />
              {passwordFormState.errors.currentPassword && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">{passwordFormState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="flex flex-col flex-1 sm:flex-none">
              <input
                type="password"
                className={`bg-white px-3 sm:px-4 md:px-5 py-2 text-sm rounded-xl outline-none border focus:ring-2 focus:ring-black ${
                  passwordFormState.errors.newPassword ? "border-red-500" : "border-gray-400"
                }`}
                placeholder="New Password"
                {...registerPassword("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
              />
              {passwordFormState.errors.newPassword && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">{passwordFormState.errors.newPassword.message}</p>
              )}
            </div>
            {passwordError && (
              <div className="text-red-500 text-xs sm:text-sm self-center">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="text-green-600 text-xs sm:text-sm self-center">{passwordSuccess}</div>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl transition-all duration-300 shadow flex items-center justify-center gap-2 ${
                passwordLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:scale-95"
              }`}
            >
              <ShieldCheck size={16} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{passwordLoading ? "Changing..." : "Change Password"}</span>
              <span className="sm:hidden">{passwordLoading ? "Changing..." : "Change"}</span>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default ManagerInfo

