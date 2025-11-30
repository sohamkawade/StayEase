import React from "react";
import { Headset, BadgeCheck, Building2 } from "lucide-react";

const reasons = [
  {
    icon: Building2,
    title: "100+ Hotels Across India",
    description: "Curated stays in popular Indian cities and hidden gems.",
  },
  {
    icon: BadgeCheck,
    title: "Best Price Guarantee",
    description: "Transparent pricing with exclusive StayEase member offers.",
  },
  {
    icon: Headset,
    title: "24/7 Customer Support",
    description: "Dedicated travel experts, always one call or message away.",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <p className="uppercase tracking-widest text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">
            why choose us
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 px-4">
            StayEase makes travel simple and stress-free
          </h2>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
          style={{ opacity: 1 }}
        >
          <>
            {reasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.title}
                  className="border bg-white/50 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-lg transition hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-black text-white mb-3 sm:mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-[15px] sm:text-[15px] md:text-[18px] font-semibold text-gray-900 mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-[13px] sm:text-[13px] md:text-[13px] text-gray-600 leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              );
            })}
          </>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
