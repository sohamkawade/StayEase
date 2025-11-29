import React, { useMemo } from "react";
import { Star } from "lucide-react";

const TestimonialsSection = ({ feedbacks = [] }) => {
  const mappedFeedbacks = useMemo(() => {
    if (!Array.isArray(feedbacks)) return [];
    return feedbacks.map((f) => {
      let name = "StayEase User";
      if (f?.user) {
        const firstName = f.user.firstname?.trim() || "";
        const lastName = f.user.lastname?.trim() || "";
        const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
        name = fullName || "StayEase User";
      }
      return {
        id: f?.id || `${name}-${f?.date || ""}-${Math.random()}`,
        name,
        comment: f?.message || "",
        rating: Number(f?.rating) || 0,
      };
    });
  }, [feedbacks]);

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <p className="uppercase tracking-widest text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">
            user feedback
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 px-4">
            What our users say about StayEase
          </h2>
        </div>

        <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
            style={{ opacity: 1 }}
          >
            {mappedFeedbacks.length === 0 ? (
              <div className="text-center text-xs sm:text-sm text-gray-500 col-span-1 sm:col-span-2 lg:col-span-3 py-8 sm:py-12">
                No feedback yet.
              </div>
            ) : (
              <>
                {mappedFeedbacks.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/50 rounded-xl sm:rounded-2xl shadow p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4 hover:shadow-lg transition backdrop-blur-sm hover:scale-[1.02] active:scale-[0.99]"
                  >
                  <div className="flex items-center gap-0.5 sm:gap-1 text-yellow-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= (item.rating || 0)
                            ? "fill-yellow-500"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  {item.comment ? (
                    <p className="text-xs sm:text-sm md:text-base text-capitalize text-gray-700 leading-relaxed">
                      "{item.comment}"
                    </p>
                  ) : null}
                  <div>
                    <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500">StayEase Guest</p>
                  </div>
                </div>
                ))}
              </>
            )}
          </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
