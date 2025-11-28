import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { sendContactMessage } from '../services/apiService';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const contactData = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        contactNumber: data.phone || '',
        message: data.message,
      };

      const res = await sendContactMessage(contactData);
      if (res?.status === 200 || res?.status === 201) {
        setSubmitStatus('success');
        reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 px-4">
            Have a question? Send us a message and we'll get back to you soon.
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 md:p-8 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div>
                <label htmlFor="firstname" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstname"
                  className={`w-full px-3 sm:px-4 lg:px-3 py-2 sm:py-2.5 lg:py-2.5 text-sm sm:text-base lg:text-sm bg-gray-50 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${
                    errors.firstname
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-black"
                  }`}
                  placeholder="First Name"
                  {...register("firstname", {
                    required: "First name is required",
                  })}
                />
                {errors.firstname && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstname.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="lastname" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastname"
                  className={`w-full px-3 sm:px-4 lg:px-3 py-2 sm:py-2.5 lg:py-2.5 text-sm sm:text-base lg:text-sm bg-gray-50 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${
                    errors.lastname
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-black"
                  }`}
                  placeholder="Last Name"
                  {...register("lastname", {
                    required: "Last name is required",
                  })}
                />
                {errors.lastname && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.lastname.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className={`w-full px-3 sm:px-4 lg:px-3 py-2 sm:py-2.5 lg:py-2.5 text-sm sm:text-base lg:text-sm bg-gray-50 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-black"
                  }`}
                  placeholder="Email Address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Enter a valid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  maxLength={10}
                  className={`w-full px-3 sm:px-4 lg:px-3 py-2 sm:py-2.5 lg:py-2.5 text-sm sm:text-base lg:text-sm bg-gray-50 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-black"
                  }`}
                  placeholder="Phone Number"
                  {...register("phone", {
                    pattern: {
                      value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                      message: "Enter a valid phone number",
                    },
                  })}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                className={`w-full px-3 sm:px-4 lg:px-3 py-2 sm:py-2.5 lg:py-2.5 text-sm sm:text-base lg:text-sm bg-gray-50 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none ${
                  errors.message
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-black"
                }`}
                placeholder="Tell us how we can help you..."
                {...register("message", {
                  required: "Message is required",
                  minLength: {
                    value: 10,
                    message: "Message must be at least 10 characters",
                  },
                })}
              />
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm">
                Thank you! Your message has been sent successfully. We'll get back to you soon.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm">
                Failed to send message. Please try again.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-2.5 sm:py-3 lg:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base lg:text-sm font-semibold hover:bg-gray-900 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
