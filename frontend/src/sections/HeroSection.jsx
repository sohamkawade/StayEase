import { CheckIcon } from "lucide-react";
import { CircleArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import React, { useMemo } from "react";

export default function HeroSection({ feedbacks = [] }) {
  const highlights = [
    "No hidden charges",
    "24/7 Customer Support",
    "Real guest reviews",
    "Instant booking confirmation",
  ];

  const avgRating = useMemo(() => {
    if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
      return 0;
    }
    const ratings = feedbacks.map((f) => Number(f?.rating) || 0);
    const sum = ratings.reduce((a, b) => a + b, 0);
    const avg = sum / ratings.length;
    return Number.isFinite(avg) ? avg : 0;
  }, [feedbacks]);

  return (
    <div className="overflow-hidden">
      <div className="relative z-10 py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16">
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-white text-black font-semibold px-4 sm:px-5 py-2 sm:py-2.5 mb-4 sm:mb-5 rounded-full shadow text-xs sm:text-sm">
              <Star className="fill-black" size={16} />

              <div className="flex flex-col leading-tight">
                <span>{(avgRating > 0 ? avgRating : 0).toFixed(1)} Rating</span>
                <span className="font-normal text-gray-400 text-[10px] sm:text-xs">
                  by Guests Across India 🇮🇳
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight mb-3 sm:mb-4">
              Find Your Perfect Stay Anytime, Anywhere
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-800 max-w-lg mt-3 sm:mt-4 leading-relaxed">
              Book luxury hotels, cozy stays, or budget rooms at the best
              prices. Enjoy smooth booking and instant confirmation with
              StayEase.
            </p>
            <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-1.5">
              {highlights.map((item, index) => (
                <p
                  key={index}
                  className="flex items-center gap-2 text-xs sm:text-sm text-gray-700"
                >
                  <CheckIcon className="size-3 sm:size-4 text-gray-800 flex-shrink-0" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 sm:mt-5">
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-black hover:bg-gray-900 text-white rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors"
              >
                <CircleArrowRight className="fill-white text-black" size={14} />{" "}
                Get Started
              </Link>
            </div>
          </div>
          <div className="relative order-1 md:order-2 hidden md:block">
            <img
              src="/assets/pexels-jimbear-1458457.jpg"
              alt="hotel img"
              className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-64 sm:h-80 md:h-96 lg:h-[25rem] object-cover rounded-xl sm:rounded-2xl shadow-md"
            />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
