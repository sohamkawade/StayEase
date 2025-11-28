import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { sendForgotPasswordOTP, verifyOTP } from "../../services/apiService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const onSubmitEmail = async (data) => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await sendForgotPasswordOTP(data.email);
      if (res?.status === 200 || res?.status === 201) {
        setEmail(data.email);
        setOtpSent(true);
        setSuccess("OTP sent to your email. Please check your inbox.");
        reset();
      } else {
        const errorMsg = res?.data?.message || "";
        setError(errorMsg || "Failed to send OTP. Please try again.");
      }
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || "";
      setError(errorMsg || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setValue("otp", newOtp.join(""));
    
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    const newOtp = pastedData.split("").slice(0, 4);
    while (newOtp.length < 4) newOtp.push("");
    setOtp(newOtp);
    setValue("otp", pastedData);
    if (pastedData.length === 4) {
      handleVerifyOTP(pastedData);
    } else {
      document.getElementById(`otp-${pastedData.length}`)?.focus();
    }
  };

  const handleVerifyOTP = async (otpValue) => {
    if (!otpValue) {
      otpValue = otp.join("");
    }
    if (otpValue.length !== 4) {
      setError("Please enter 4 digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await verifyOTP(email, otpValue);
      if (res?.status === 200 || res?.status === 201) {
        setSuccess("OTP verified successfully!");
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${otpValue}`);
        }, 500);
      } else {
        const errorMsg = res?.data?.message || "";
        setError(errorMsg || "Invalid OTP. Please try again.");
      }
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || "";
      setError(errorMsg || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitOTP = async (data) => {
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      setError("Please enter 4 digit OTP");
      return;
    }
    handleVerifyOTP(otpValue);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 text-black px-4 sm:px-6 py-8 sm:py-12">
      <div className="bg-white text-gray-500 px-4 sm:px-6 md:px-6 py-6 sm:py-8 rounded-xl shadow text-sm w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
          {otpSent ? "Enter OTP" : "Forgot Password?"}
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

        {!otpSent ? (
          <form onSubmit={handleSubmit(onSubmitEmail)} noValidate className="flex flex-col items-center">
            <input
              id="email"
              className={`w-full bg-transparent border my-3 outline-none rounded-xl py-2.5 sm:py-3 lg:py-2.5 px-4 lg:px-3 text-sm sm:text-base lg:text-sm text-black focus:ring-1 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-400/50 focus:ring-gray-700"
              }`}
              type="email"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs -mt-2 mb-3">
                {errors.email.message}
              </p>
            )}

            <button
              type="submit"
              className="w-full mb-3 bg-black hover:bg-gray-900 hover:scale-95 transition-all py-2.5 sm:py-3 lg:py-2.5 rounded-xl text-white text-sm sm:text-base lg:text-sm font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onSubmitOTP)} noValidate className="flex flex-col items-center">
            <div className="w-full mb-4">
              <label className="block text-xs sm:text-sm text-gray-600 mb-2 text-center">Enter OTP</label>
              <div className="flex justify-center gap-2 sm:gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-12 lg:h-12 text-center text-lg sm:text-xl lg:text-lg font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.otp
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-gray-700 focus:ring-gray-200"
                    }`}
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="text-red-500 text-xs mt-2 text-center">
                  {errors.otp.message}
                </p>
              )}
              <input
                type="hidden"
                {...register("otp", {
                  required: "OTP is required",
                  validate: () => {
                    const otpValue = otp.join("");
                    if (otpValue.length !== 4) return "OTP must be 4 digits";
                    if (!/^\d+$/.test(otpValue)) return "OTP should contain only numbers";
                    return true;
                  },
                })}
              />
            </div>

            <button
              type="submit"
              className="w-full mb-3 bg-black hover:bg-gray-900 hover:scale-95 transition-all py-2.5 sm:py-3 lg:py-2.5 rounded-xl text-white text-sm sm:text-base lg:text-sm font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setEmail("");
                setError("");
                setSuccess("");
                setOtp(["", "", "", ""]);
                reset();
              }}
              className="w-full mb-3 bg-gray-200 hover:bg-gray-300 hover:scale-95 transition-all py-2.5 sm:py-3 lg:py-2.5 rounded-xl text-black text-sm sm:text-base lg:text-sm font-medium"
            >
              Back to Email
            </button>
          </form>
        )}

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

export default ForgotPassword;

