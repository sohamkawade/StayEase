import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { verifyOTPAndResetPassword } from "../../services/apiService";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const otp = searchParams.get("otp");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!email || !otp) {
      navigate("/forgot-password");
    }
  }, [email, otp, navigate]);

  const onSubmit = async (data) => {
    if (!email || !otp) {
      setError("Email or OTP not found. Please go back and try again.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await verifyOTPAndResetPassword(email, otp, data.newPassword);
      if (res?.status === 200 || res?.status === 201) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorMsg = res?.data?.message || "";
        setError(errorMsg || "Failed to reset password. Please try again.");
      }
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || "";
      setError(errorMsg || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 text-black px-4 sm:px-6 py-8 sm:py-12">
      <div className="bg-white text-gray-500 px-4 sm:px-6 md:px-6 py-6 sm:py-8 rounded-xl shadow text-sm w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
          Reset Password
        </h2>

        {error && (
          <div className="mb-3 p-2 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 p-2 text-green-600 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col items-center">

          <div className="w-full mb-4">
            <label htmlFor="newPassword" className="block text-xs sm:text-sm text-gray-600 mb-2">
              New Password
            </label>
            <input
              id="newPassword"
              className={`w-full bg-white border-2 rounded-lg py-2.5 sm:py-3 lg:py-2.5 px-4 lg:px-3 text-sm sm:text-base lg:text-sm text-black focus:outline-none focus:ring-2 transition-all ${
                errors.newPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-gray-700 focus:ring-gray-200"
              }`}
              type="password"
              placeholder="Enter new password"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="w-full mb-4">
            <label htmlFor="confirmPassword" className="block text-xs sm:text-sm text-gray-600 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              className={`w-full bg-white border-2 rounded-lg py-2.5 sm:py-3 lg:py-2.5 px-4 lg:px-3 text-sm sm:text-base lg:text-sm text-black focus:outline-none focus:ring-2 transition-all ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-gray-700 focus:ring-gray-200"
              }`}
              type="password"
              placeholder="Confirm new password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => {
                  const newPassword = document.getElementById("newPassword").value;
                  return value === newPassword || "Passwords do not match";
                },
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full mb-3 bg-black hover:bg-gray-900 hover:scale-95 transition-all py-2.5 sm:py-3 lg:py-2.5 rounded-xl text-white text-sm sm:text-base lg:text-sm font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </button>

          <Link
            to="/forgot-password"
            className="w-full mb-3 bg-gray-200 hover:bg-gray-300 hover:scale-95 transition-all py-2.5 sm:py-3 lg:py-2.5 rounded-xl text-black text-center block text-sm sm:text-base lg:text-sm font-medium"
          >
            Back to OTP
          </Link>
        </form>

        <p className="text-center mt-4 text-sm">
          Remember your password?{" "}
          <Link to="/login" className="text-black underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;

