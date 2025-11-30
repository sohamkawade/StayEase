import React, { useMemo, useState, useEffect } from "react";
import { Star } from "lucide-react";

const TestimonialsSection = ({ feedbacks = [] }) => {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mappedFeedbacks = useMemo(() => {
    if (!Array.isArray(feedbacks)) return [];
    return feedbacks
      .map((f) => {
        let name = "StayEase User";
        if (f?.user) {
          const first = f.user.firstname?.trim() || "";
          const last = f.user.lastname?.trim() || "";
          const full = [first, last].filter(Boolean).join(" ");
          name = full || "StayEase User";
        }
        return {
          id: f?.id || `${Math.random()}`,
          name,
          comment: f?.message || "",
          rating: Number(f?.rating) || 0,
          date: f?.date || "",
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [feedbacks]);

  const visibleFeedbacks = isDesktop
    ? mappedFeedbacks.slice(0, 6)
    : mappedFeedbacks.slice(0, 4);

  return (
    <section className="py-10 sm:py-14 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-10">
          <p className="uppercase tracking-widest text-xs text-gray-500">
            user feedback
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            What our users say about StayEase
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {visibleFeedbacks.length === 0 ? (
            <div className="text-center text-sm text-gray-500 col-span-3 py-10">
              No feedback yet.
            </div>
          ) : (
            visibleFeedbacks.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4 
                hover:shadow-xl transition hover:-translate-y-1 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-1 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={
                        star <= item.rating
                          ? "fill-yellow-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>

                {item.comment && (
                  <p className="text-[13px] md:text-[13px] text-gray-700 leading-relaxed">
                    "{item.comment}"
                  </p>
                )}

                <div>
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">StayEase Guest</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
