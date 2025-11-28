import React, { useState, useEffect } from "react";
import { Heart, Shield, Award, Users, Target, Hotel } from "lucide-react";
import { getStats } from "../services/apiService";

const About = () => {
  const [stats, setStats] = useState([
    { number: "0", label: "Happy Guests" },
    { number: "0", label: "Hotels" },
    { number: "0", label: "Rooms" },
    { number: "0", label: "Cities" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getStats();
        const statsData = res?.data?.data ?? res?.data ?? {};

        setStats([
          {
            number: (statsData.happyGuests || 0).toString(),
            label: "Happy Guests",
          },
          { number: (statsData.totalHotels || 0).toString(), label: "Hotels" },
          { number: (statsData.totalRooms || 0).toString(), label: "Rooms" },
          { number: (statsData.totalCities || 0).toString(), label: "Cities" },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const values = [
    {
      icon: <Heart size={32} />,
      title: "Hospitality",
      description:
        "We treat every guest like family, ensuring comfort and care in every interaction.",
    },
    {
      icon: <Shield size={32} />,
      title: "Trust",
      description:
        "Building lasting relationships through transparency, reliability, and integrity.",
    },
    {
      icon: <Award size={32} />,
      title: "Excellence",
      description:
        "Committed to delivering exceptional service and maintaining the highest standards.",
    },
    {
      icon: <Users size={32} />,
      title: "Community",
      description:
        "Supporting local communities and creating positive impacts wherever we operate.",
    },
  ];

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16">
      <section className="px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            About StayEase
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed px-4">
            We're on a mission to make travel accessible, comfortable, and
            memorable for everyone. Since our founding, we've been dedicated to
            providing exceptional hospitality experiences that create lasting
            memories.
          </p>
        </div>
      </section>

      <section className="bg-black text-white py-12 sm:py-16 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
                  {loading
                    ? 0
                    : stat.number > 100
                    ? stat.number + "+"
                    : stat.number}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div>
              <div className="bg-black text-white p-3 sm:p-4 rounded-lg sm:rounded-xl w-fit mb-3 sm:mb-4">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Our Mission
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-3 sm:mb-4">
                To provide seamless, comfortable, and affordable accommodation
                experiences that connect travelers with the perfect stay,
                wherever their journey takes them.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                We believe that every traveler deserves a home away from home,
                and we're committed to making that a reality through innovative
                technology and exceptional service.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12">
              <Hotel className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400 mb-3 sm:mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Our Vision
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                To become the most trusted and innovative hospitality platform,
                setting new standards for guest satisfaction and hotel
                partnerships worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Our Values
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl hover:shadow-lg transition-shadow"
              >
                <div className="bg-black text-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl w-fit mb-3 sm:mb-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">{value.icon}</div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
