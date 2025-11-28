import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { signupUser, googleOAuth } from "../../services/apiService";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { acceptTerms: false },
  });
  
  const handleGoogleSuccess = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        setError("");
        
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const googleUser = await userInfoResponse.json();
        
        const response = await googleOAuth({
          email: googleUser.email,
          name: googleUser.name,
          providerId: googleUser.sub,
          picture: googleUser.picture || ""
        });
        
        const status = response?.status;
        const serverMessage = response?.data?.message || "";
        const responseData = response?.data?.data ?? response?.data;
        
        if (status === 200 || status === 201) {
          const userPayload = responseData?.user ?? responseData;
          const token = responseData?.token;
          
          if (token) {
            localStorage.setItem("token", token);
          }
          
          const user = {
            ...userPayload,
            hotelId: userPayload.hotelId ?? userPayload.hotel?.id,
          };
          
          login(user);
          
          if (user.role === "USER" || user.roleName === "USER") {
            navigate("/user/profile");
          } else {
            setError("Google signup is only available for regular users.");
            setIsLoading(false);
          }
        } else {
          setError(serverMessage || "Google signup failed. Please try again.");
          setIsLoading(false);
        }
      } catch (error) {
        const errMsg = error?.response?.data?.message || error?.message || "Google signup failed. Please try again.";
        if (errMsg.includes("already registered")) {
          setError("This email is already registered. Please use email/password login.");
        } else {
          setError(errMsg);
        }
        setIsLoading(false);
      }
    },
    onError: () => {
      setError("Google signup was cancelled or failed.");
      setIsLoading(false);
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await signupUser(data);
      if (res?.status === 200 || res?.status === 201) {
        navigate("/login");
      } else {
        const errorMsg = res?.data?.message || "";
        if (errorMsg.includes("Duplicate entry") || errorMsg.includes("UK1j9d9a06i600gd43uu3km82jw")) {
          setError("This email is already registered.");
        } else {
          setError(errorMsg || "Sign up failed. Please try again.");
        }
      }
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || "";
      if (errorMsg.includes("Duplicate entry") || errorMsg.includes("UK1j9d9a06i600gd43uu3km82jw")) {
        setError("This email is already registered.");
      } else {
        setError(errorMsg || "Sign up failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-black overflow-hidden px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="bg-white text-gray-500 px-4 sm:px-6 md:px-6 py-6 sm:py-8 text-left text-sm rounded-xl shadow">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
            Create your <br />
            StayEase account
          </h2>

          {error && (
            <div className="mb-3 p-2 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="w-full">
                <input
                  id="firstname"
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
                  className={`w-full bg-transparent border outline-none rounded-xl py-2.5 sm:py-3 lg:py-2.5 px-4 lg:px-3 text-sm sm:text-base lg:text-sm text-black focus:ring-1 ${
                    errors.firstname ? "border-red-500 focus:ring-red-500" : "border-gray-500/30 focus:ring-gray-700"
                  }`}
                  type="text"
                  placeholder="First Name"
                />
                {errors.firstname && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstname.message}</p>
                )}
              </div>
              <div className="w-full">
                <input
                  id="lastname"
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
                  className={`w-full bg-transparent border outline-none rounded-xl py-2.5 sm:py-3 lg:py-2.5 px-4 lg:px-3 text-sm sm:text-base lg:text-sm text-black focus:ring-1 ${
                    errors.lastname ? "border-red-500 focus:ring-red-500" : "border-gray-500/30 focus:ring-gray-700"
                  }`}
                  type="text"
                  placeholder="Last Name"
                />
                {errors.lastname && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastname.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="w-full">
                <input
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address"
                    }
                  })}
                  className={`w-full bg-transparent border my-3 outline-none rounded-xl py-2.5 sm:py-3 lg:py-2.5 px-4 lg:px-3 text-sm sm:text-base lg:text-sm text-black focus:ring-1 ${
                    errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-500/30 focus:ring-gray-700"
                  }`}
                  type="email"
                  placeholder="Email Address"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs -mt-2 mb-3">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="w-full">
              <div className={`flex items-center w-full border my-3 rounded-xl overflow-hidden ${
                errors.contactNumber ? "border-red-500" : "border-gray-500/30"
              }`}>
                <span className="px-3 sm:px-4 bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium">
                  +91
                </span>
                <input
                  id="contact"
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
                  className="w-full bg-transparent outline-none py-2.5 sm:py-3 lg:py-2.5 px-3 sm:px-4 lg:px-3 text-sm sm:text-base lg:text-sm text-black"
                  type="tel"
                  maxLength={10}
                  placeholder="Contact Number"
                />
              </div>
              {errors.contactNumber && (
                <p className="text-red-500 text-xs -mt-2 mb-3">{errors.contactNumber.message}</p>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="w-full">
                <input
                  id="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  className={`w-full bg-transparent border mt-3 outline-none rounded-xl py-2.5 sm:py-3 lg:py-2.5 px-4 lg:px-3 text-sm sm:text-base lg:text-sm text-black focus:ring-1 ${
                    errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-500/30 focus:ring-gray-700"
                  }`}
                  type="password"
                  placeholder="Password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 mb-4">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 border-gray-400 rounded"
                {...register("acceptTerms", {
                  required: "Please accept the Terms & Conditions to continue.",
                })}
              />
              <span>
                I agree to StayEase{" "}
                <Link to="/terms" className="text-black  underline font-semibold">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-black underline font-semibold">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-red-500 text-xs -mt-3 mb-3">{errors.acceptTerms.message}</p>
            )}

            <button
              type="submit"
              className="w-full mt-5 mb-3 bg-black hover:bg-gray-900 hover:scale-95 transition-all py-2.5 sm:py-3 lg:py-2.5 rounded-xl text-white text-sm sm:text-base lg:text-sm font-medium duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 md:h-6 md:w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing up...
                </div>
              ) : (
                "Sign up"
              )}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleGoogleSuccess}
            disabled={isLoading}
            className="w-full mb-3 bg-white hover:bg-gray-50 border border-gray-300 hover:scale-95 transition-all py-2.5 sm:py-3 lg:py-2.5 rounded-xl text-gray-700 text-sm sm:text-base lg:text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-black underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
