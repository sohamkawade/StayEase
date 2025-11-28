import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from "react-router-dom";
import { MoveRight, Star, User, Calendar } from "lucide-react";
import { getFeedbackByHotelId, getAllHotels } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";

const FeedbackRatings = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const fetchFeedbacks = useCallback(async () => {
      let hotelId = user?.hotelId || user?.hotel?.id;

      if (!hotelId) {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            hotelId = parsed?.hotelId || parsed?.hotel?.id;
          }
        } catch (e) {}
      }

      if (!hotelId && user) {
        try {
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
          
          if (match?.id) {
            hotelId = match.id;
          }
        } catch (error) {}
      }

      if (!hotelId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await getFeedbackByHotelId(hotelId);
        const feedbacksData = response?.data?.data || response?.data || [];
        setFeedbacks(Array.isArray(feedbacksData) ? feedbacksData : []);

        if (feedbacksData.length > 0) {
          const sum = feedbacksData.reduce((acc, f) => acc + (f.rating || 0), 0);
          setAverageRating(sum / feedbacksData.length);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }, [user]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center mb-4 gap-2">
          <NavLink to="/">
            <span className="text-gray-500 hover:text-gray-800 transition-all duration-300">back to home</span>
          </NavLink>
          <MoveRight className="text-gray-500 -rotate-180" size={15} />
          <span className="font-semibold">Feedback & Ratings</span>
        </div>
        <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-6 rounded-2xl">
          <div className="text-center text-sm sm:text-base text-gray-500">Loading feedbacks...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">back to home</span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Feedback & Ratings</span>
      </div>
      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-6 rounded-2xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">Feedback & Ratings</h1>
          <p className="text-sm sm:text-base text-gray-600">Customer reviews and ratings for your hotel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Average Rating</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={
                        star <= Math.round(averageRating)
                          ? "text-yellow-500 fill-yellow-500 w-4 h-4 sm:w-6 sm:h-6"
                          : "text-gray-300 w-4 h-4 sm:w-6 sm:h-6"
                      }
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                  </span>
                  <span className="text-sm sm:text-base text-gray-600">/ 5.0</span>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Reviews</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{feedbacks.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {feedbacks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
              <p className="text-gray-500 text-base sm:text-lg">No feedbacks yet</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">Customer feedbacks will appear here</p>
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-gray-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                      <User className="text-gray-600 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base text-gray-900">
                        {feedback.user?.firstname || ""} {feedback.user?.lastname || ""}
                      </p>
                      <div className="flex items-center gap-0.5 sm:gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={
                              star <= feedback.rating
                                ? "text-yellow-500 fill-yellow-500 w-3 h-3 sm:w-4 sm:h-4"
                                : "text-gray-300 w-3 h-3 sm:w-4 sm:h-4"
                            }
                          />
                        ))}
                        <span className="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2">{feedback.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  {feedback.date && (
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 flex-shrink-0 sm:ml-4">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>{formatDate(feedback.date)}</span>
                    </div>
                  )}
                </div>
                {feedback.comment && (
                  <p className="text-sm sm:text-base text-gray-700 mt-2 sm:mt-3 pl-0 sm:pl-11">{feedback.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default FeedbackRatings;
