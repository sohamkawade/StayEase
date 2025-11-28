import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { MoveRight, Star, MessageSquare } from "lucide-react";
import { getAllStayEaseFeedbacks } from "../../services/apiService";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllStayEaseFeedbacks();
        const data = res?.data?.data ?? res?.data ?? [];
        const normalized = Array.isArray(data)
          ? data.map((f) => ({
              id: f?.id,
              name: f?.user
                ? [f.user.firstname, f.user.lastname].filter(Boolean).join(" ")
                : "Guest",
              rating: Number(f?.rating) || 0,
              comment: f?.message || "",
              date: f?.date || "",
            }))
          : [];
        setFeedbacks(normalized);
        if (normalized.length > 0) {
          const sum = normalized.reduce((acc, it) => acc + (it.rating || 0), 0);
          setAverageRating(sum / normalized.length);
        } else {
          setAverageRating(0);
        }
      } catch {
        setFeedbacks([]);
        setAverageRating(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-gray-500">Loading feedback...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center mb-3 sm:mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Feedback & Ratings</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-14 rounded-2xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">
            Feedback & Ratings
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Customer reviews and ratings across StayEase</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Average Rating</p>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={
                        star <= Math.round(averageRating)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                </span>
                <span className="text-sm sm:text-base text-gray-600">/ 5.0</span>
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
            <div className="bg-white rounded-2xl shadow p-4 sm:p-6 text-center text-gray-500 text-sm">
              No feedback found.
            </div>
          ) : (
            feedbacks.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl shadow p-4 sm:p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="bg-black text-white p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <MessageSquare size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-black text-sm sm:text-base truncate">{f.name}</h4>
                      {f.date ? (
                        <p className="text-[10px] sm:text-xs text-gray-500">on {f.date}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= Math.round(f.rating)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>
                {f.comment ? (
                  <p className="text-xs sm:text-sm text-gray-700">{f.comment}</p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Feedback;
