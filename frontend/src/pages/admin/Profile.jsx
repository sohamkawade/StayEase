import React, { useState, useEffect, useContext } from "react";
import {
  IdCardIcon,
  Mail,
  MoveRight,
  Phone,
  ShieldCheck,
  User2,
  Eye,
  EyeOff,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from "../../services/apiService";
import { useForm } from "react-hook-form";

const Profile = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const adminId = user?.id;

  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      contactNumber: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: passwordFormState,
    reset: resetPassword,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contactNumber: "",
  });

  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const fetchProfile = async () => {
      try {
        if (!adminId) {
          return;
        }

        if (user?.role !== "ADMIN") {
          alert(
            "You are not authorized to access admin profile. Please login as admin."
          );
          return;
        }

        setLoading(true);
        const res = await getAdminProfile(adminId);
        const userData = res.data.data;
        if (userData) {
          reset({
            firstname: userData.firstname || "",
            lastname: userData.lastname || "",
            email: userData.email || "",
            contactNumber: userData.contactNumber || "",
          });
          setFormData({
            firstname: userData.firstname || "",
            lastname: userData.lastname || "",
            email: userData.email || "",
            contactNumber: userData.contactNumber || "",
          });
          setOriginalData(userData);
        }
      } catch (err) {
        if (err.response?.data?.data) {
          const userData = err.response.data.data;
          reset({
            firstname: userData.firstname || "",
            lastname: userData.lastname || "",
            email: userData.email || "",
            contactNumber: userData.contactNumber || "",
          });
          setFormData({
            firstname: userData.firstname || "",
            lastname: userData.lastname || "",
            email: userData.email || "",
            contactNumber: userData.contactNumber || "",
          });
          setOriginalData(userData);
        } else if (err.response?.status === 302) {
          if (user && user.role === "ADMIN") {
            reset({
              firstname: user.firstname || "",
              lastname: user.lastname || "",
              email: user.email || "",
              contactNumber: user.contactNumber || "",
            });
            setFormData({
              firstname: user.firstname || "",
              lastname: user.lastname || "",
              email: user.email || "",
              contactNumber: user.contactNumber || "",
            });
            setOriginalData(user);
          } else {
            alert(
              "Failed to fetch admin profile. The backend endpoint might be incorrect or you need to check backend routes."
            );
          }
        } else if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          alert(
            "You are not authorized to access admin profile. Please login as admin."
          );
        } else {
          if (user && user.role === "ADMIN") {
            reset({
              firstname: user.firstname || "",
              lastname: user.lastname || "",
              email: user.email || "",
              contactNumber: user.contactNumber || "",
            });
            setFormData({
              firstname: user.firstname || "",
              lastname: user.lastname || "",
              email: user.email || "",
              contactNumber: user.contactNumber || "",
            });
            setOriginalData(user);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [adminId, authLoading, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsChanged(true);
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    reset({
      firstname: originalData.firstname || "",
      lastname: originalData.lastname || "",
      email: originalData.email || "",
      contactNumber: originalData.contactNumber || "",
    });
    setFormData({
      ...originalData,
    });
    setIsEditing(false);
    setIsChanged(false);
  };

  const handleSave = async (data) => {
    try {
      if (!adminId) {
        return;
      }
      setLoading(true);
      const updatedData = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        contactNumber: data.contactNumber,
      };
      const res = await updateAdminProfile(updatedData, adminId);
      const userInfo = res?.data?.data || res?.data;
      setOriginalData(userInfo);
      reset({
        firstname: userInfo.firstname || "",
        lastname: userInfo.lastname || "",
        email: userInfo.email || "",
        contactNumber: userInfo.contactNumber || "",
      });
      setFormData({
        ...userInfo,
      });
      setIsEditing(false);
      setIsChanged(false);
    } catch (err) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      if (!adminId) {
        return;
      }
      const response = await changeAdminPassword(data, adminId);
      if (response?.status === 200 || response?.status === 201) {
        setPasswordSuccess("Password changed successfully!");
        resetPassword();
      } else {
        const errorMsg = response?.data?.message || "";
        setPasswordError(
          errorMsg || "Failed to change password. Please try again."
        );
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "";
      setPasswordError(
        errorMsg ||
          "Failed to change password. Please check your current password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mb-3 sm:mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>{" "}
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">My Profile</span>
      </div>
      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-14 rounded-2xl">
        <div className="flex flex-col sm:flex-row align-middle gap-2 sm:gap-3 mb-6 sm:mb-8 items-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">
            My Profile
          </h2>
          <span className="text-xs sm:text-sm text-gray-200 bg-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow">
            {user?.role}
          </span>
        </div>

        <div className="py-4 sm:py-6 border-t border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <IdCardIcon size={18} />
              <p className="text-base sm:text-lg font-semibold">
                Personal Info
              </p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Update your personal details here
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:mr-5 w-full sm:w-auto">
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
                  onClick={handleSubmit(handleSave)}
                  disabled={loading}
                  className="text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-xl font-semibold shadow transform transition-all duration-300 bg-black text-white hover:bg-gray-900 hover:scale-95"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row justify-between gap-4 sm:gap-5">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <User2 size={18} />
              <p className="text-base sm:text-lg font-semibold">Name</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:mr-5 w-full sm:w-auto">
            <div className="flex flex-col w-full">
              <input
                type="text"
                disabled={!isEditing}
                className={`bg-white px-3 sm:px-4 py-2 text-sm text-black rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
                  !isEditing && "opacity-70 cursor-not-allowed"
                } ${formState.errors.firstname ? "border-red-500" : ""}`}
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
              {formState.errors.firstname && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">
                  {formState.errors.firstname.message}
                </p>
              )}
            </div>
            <div className="flex flex-col w-full">
              <input
                type="text"
                disabled={!isEditing}
                className={`bg-white px-3 sm:px-4 py-2 text-sm text-black rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
                  !isEditing && "opacity-70 cursor-not-allowed"
                } ${formState.errors.lastname ? "border-red-500" : ""}`}
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
              {formState.errors.lastname && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">
                  {formState.errors.lastname.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <Mail size={18} />
              <p className="text-base sm:text-lg font-semibold">Email</p>
            </div>
          </div>

          <div className="flex justify-end w-full mr-4">
            <div className="flex flex-col w-full sm:w-1/2">
              <input
                type="email"
                disabled={!isEditing}
                className={`bg-white w-full px-3 sm:px-4 py-2 text-sm text-black rounded-xl 
        outline-none border border-gray-400 focus:ring-2 focus:ring-black
        ${!isEditing && "opacity-70 cursor-not-allowed"}
        ${formState.errors.email ? "border-red-500" : ""}`}
                placeholder="Email Address"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
              />

              {formState.errors.email && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">
                  {formState.errors.email.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <Phone size={18} />
              <p className="text-base sm:text-lg font-semibold">Contact</p>
            </div>
          </div>

          <div className="flex gap-4 sm:gap-8 sm:mr-5 w-full sm:w-auto">
            <div className="flex flex-col w-full sm:max-w-xs">
              <input
                type="tel"
                maxLength={10}
                disabled={!isEditing}
                className={`bg-white w-full px-3 sm:px-4 py-2 text-sm text-black rounded-xl outline-none border border-gray-400 focus:ring-2 focus:ring-black ${
                  !isEditing && "opacity-70 cursor-not-allowed"
                } ${formState.errors.contactNumber ? "border-red-500" : ""}`}
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
              {formState.errors.contactNumber && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">
                  {formState.errors.contactNumber.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="py-5 sm:py-7 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} />
              <p className="text-base sm:text-lg font-semibold">
                Change Password
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmitPassword(onPasswordSubmit)}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:mr-5 w-full sm:w-auto"
          >
            <div className="flex flex-col w-full sm:w-auto relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                className={`bg-white px-3 sm:px-5 py-2 pr-10 rounded-xl outline-none border focus:ring-2 focus:ring-black text-sm ${
                  passwordFormState.errors.currentPassword
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                placeholder="Current Password"
                {...registerPassword("currentPassword", {
                  required: "Current password is required",
                })}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {passwordFormState.errors.currentPassword && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">
                  {passwordFormState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="flex flex-col w-full sm:w-auto relative">
              <input
                type={showNewPassword ? "text" : "password"}
                className={`bg-white px-3 sm:px-5 py-2 pr-10 rounded-xl outline-none border focus:ring-2 focus:ring-black text-sm ${
                  passwordFormState.errors.newPassword
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                placeholder="New Password"
                {...registerPassword("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {passwordFormState.errors.newPassword && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">
                  {passwordFormState.errors.newPassword.message}
                </p>
              )}
            </div>
            {passwordError && (
              <div className="text-red-500 text-xs sm:text-sm self-center">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="text-green-600 text-xs sm:text-sm self-center">
                {passwordSuccess}
              </div>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className={`px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 shadow flex items-center gap-2 text-xs sm:text-sm ${
                passwordLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:scale-95"
              }`}
            >
              <ShieldCheck size={16} />
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Profile;
