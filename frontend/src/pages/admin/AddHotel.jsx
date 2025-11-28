import React, { useState } from "react";
import { MoveRight, Hotel, Mail, Lock, Phone, User2, User, Eye, EyeOff } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { addHotel } from "../../services/apiService";
import { useForm } from "react-hook-form";

const AddHotel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      hotelName: "",
      email: "",
      contactNumber: "",
      manager: {
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        contactNumber: "",
      },
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        hotelName: data.hotelName,
        email: data.email,
        contactNumber: data.contactNumber,
        manager: {
          firstname: data.manager?.firstname,
          lastname: data.manager?.lastname,
          email: data.manager?.email,
          password: data.manager?.password,
          contactNumber: data.manager?.contactNumber,
        },
      };

      const response = await addHotel(payload, null);

      if (response?.status >= 200 && response.status < 300) {
        setSuccessMessage(response?.data?.message || "Hotel added successfully");
        reset();
        setTimeout(() => navigate("/admin/hotels"), 1200);
        return;
      }

      const errorMessage = response?.data?.message || "Failed to add hotel. Please try again.";
      if (errorMessage.toLowerCase().includes("email")) {
        setError("email", { type: "server", message: errorMessage });
      } else {
        setError("root", { type: "server", message: errorMessage });
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to add hotel. Please try again.";

      if (message.toLowerCase().includes("email")) {
        setError("email", { type: "server", message });
      } else {
        setError("root", { type: "server", message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mb-4 gap-2">
        <NavLink to="/">
          <span className="text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={15} />
        <NavLink to="/admin/hotels">
          <span className="text-gray-500 hover:text-gray-800 transition-all duration-300">
            Hotels
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={15} />
        <span className="font-semibold">Add Hotel</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-10 rounded-2xl">
        <div className="mb-4">
          <h2 className="text-3xl font-bold mb-1 text-gray-900 tracking-wide">Add New Hotel</h2>
          <p className="text-gray-600 text-sm">Create a new hotel with all necessary details</p>
        </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.root.message}
              </div>
            )}
            <div className="border-b border-gray-300 pb-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Hotel size={20} />
                Hotel Information
              </h3>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div>
                  <label className="font-medium text-black mb-1 flex items-center gap-1.5">
                    <Hotel size={22} className="text-gray-600" />
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    {...register("hotelName", {
                      required: "Hotel name is required",
                      maxLength: { value: 100, message: "Max 100 characters" },
                    })}
                    className={`w-full bg-white px-3 py-1.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                      errors.hotelName ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder="Hotel name"
                  />
                  {errors.hotelName && (
                    <p className="mt-1 text-xs text-red-500">{errors.hotelName.message}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-black mb-1 flex items-center gap-1.5">
                    <Phone size={22} className="text-gray-600" />
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    {...register("contactNumber", {
                      required: "Contact number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Contact number must be exactly 10 digits",
                      },
                    })}
                    className={`w-full bg-white px-3 py-1.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                      errors.contactNumber ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder="Contact number"
                    maxLength="10"
                  />
                  {errors.contactNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.contactNumber.message}</p>
                  )}
                </div>
              </div>
              <div className="py-2 flex flex-col gap-4">
                <label className="font-medium text-black mb-1 flex items-center gap-1.5">
                  <Mail size={22} className="text-gray-600" />
                  Email
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    maxLength: { value: 100, message: "Max 100 characters" },
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Enter a valid email",
                    },
                  })}
                  className={`w-1/2 bg-white px-3 py-1.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.email ? "border-red-500" : "border-gray-400"
                  }`}
                  placeholder="Email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="border-b border-gray-300 pb-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User2 size={20} />
                Manager Information
              </h3>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div>
                  <label className="font-medium text-black mb-1 flex items-center gap-1.5">
                    <User size={22} className="text-gray-600" />
                    First Name
                  </label>
                  <input
                    type="text"
                    {...register("manager.firstname", {
                      required: "First name is required",
                      minLength: { value: 2, message: "At least 2 characters" },
                      maxLength: { value: 50, message: "Max 50 characters" },
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "Only letters and spaces allowed",
                      },
                    })}
                    className={`w-full bg-white px-3 py-1.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                      errors.manager?.firstname ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder="Manager first name"
                  />
                  {errors.manager?.firstname && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.manager.firstname.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-black mb-1 flex items-center gap-1.5">
                    <User size={22} className="text-gray-600" />
                    Last Name
                  </label>
                  <input
                    type="text"
                    {...register("manager.lastname", {
                      required: "Last name is required",
                      minLength: { value: 2, message: "At least 2 characters" },
                      maxLength: { value: 50, message: "Max 50 characters" },
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "Only letters and spaces allowed",
                      },
                    })}
                    className={`w-full bg-white px-3 py-1.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                      errors.manager?.lastname ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder="Manager last name"
                  />
                  {errors.manager?.lastname && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.manager.lastname.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div>
                  <label className="font-medium text-black mb-1 flex items-center gap-1.5">
                    <Mail size={22} className="text-gray-600" />
                    Manager Email
                  </label>
                  <input
                    type="email"
                    {...register("manager.email", {
                      required: "Manager email is required",
                      maxLength: { value: 100, message: "Max 100 characters" },
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Enter a valid email",
                      },
                    })}
                    className={`w-full bg-white px-3 py-1.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                      errors.manager?.email ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder="Manager email"
                  />
                  {errors.manager?.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.manager.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-black mb-1 flex items-center gap-1.5">
                    <Phone size={22} className="text-gray-600" />
                    Manager Contact
                  </label>
                  <input
                    type="tel"
                    {...register("manager.contactNumber", {
                      required: "Manager contact is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Contact number must be exactly 10 digits",
                      },
                    })}
                    className={`w-full bg-white px-3 py-1.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                      errors.manager?.contactNumber ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder="Manager contact number"
                    maxLength="10"
                  />
                  {errors.manager?.contactNumber && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.manager.contactNumber.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="py-2">
                <label className="font-medium text-black mb-1 flex items-center gap-1.5">
                  <Lock size={22} className="text-gray-600" />
                  Manager Password
                </label>
                <div className="relative w-1/2">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("manager.password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "At least 6 characters" },
                    })}
                    className={`w-full bg-white px-3 py-1.5 pr-10 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                      errors.manager?.password ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder="Manager password"
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.manager?.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.manager.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3  py-2">
              <NavLink
                to="/admin/hotels"
                className="flex-1 text-sm px-4 py-2 rounded-xl shadow bg-white text-gray-700 hover:scale-95 transition-transform duration-300 flex items-center justify-center gap-2"
              >
                Cancel
              </NavLink>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 text-sm px-4 py-2 rounded-xl font-semibold shadow hover:scale-95 transition-transform duration-300 ${
                  loading
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
              >
                {loading ? "Adding..." : "Add Hotel"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

};

export default AddHotel;
