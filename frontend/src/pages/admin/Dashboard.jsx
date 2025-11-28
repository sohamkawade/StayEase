import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MoveRight,
  LayoutDashboard,
  Hotel,
  Users,
  Star,
  MapPin,
} from "lucide-react";
import { getAllHotels, getAllStayEaseFeedbacks, getHotelBookings, getAllUsers } from "../../services/apiService";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    hotels: [],
    totalHotels: 0,
    totalActiveUsers: 0,
    avgRating: 0,
    totalReviews: 0,
    topHotels: [],
    totalBookingsSum: 0,
    monthlyBookings: [],
    userGrowth: [],
    ratingDistribution: [0, 0, 0, 0, 0],
    topRatedHotels: [],
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [hotelsRes, fbRes, usersRes] = await Promise.all([
          getAllHotels(), 
          getAllStayEaseFeedbacks(),
          getAllUsers()
        ]);

      const hotelsData = hotelsRes?.data?.data ?? hotelsRes?.data ?? [];
      const hotelsArr = Array.isArray(hotelsData) ? hotelsData : [];
      
      const fbData = fbRes?.data?.data ?? fbRes?.data ?? [];
      const fbs = Array.isArray(fbData) ? fbData : [];

      const usersData = usersRes?.data?.data ?? usersRes?.data ?? [];
      const allUsers = Array.isArray(usersData) 
        ? usersData.filter(u => u && u.id && u.email && u.role === "USER")
        : [];

      const counts = await Promise.all(
        hotelsArr.map(async (h) => {
          try {
            const res = await getHotelBookings(h.id);
            const data = res?.data?.data ?? res?.data ?? [];
            const list = Array.isArray(data) ? data : [];
            const dates = list
              .map((b) => b?.checkInDate || b?.createdAt || null)
              .filter(Boolean);
            return { id: h.id, name: h.hotelName || `Hotel ${h.id}`, count: list.length, dates };
          } catch {
            return { id: h.id, name: h.hotelName || `Hotel ${h.id}`, count: 0, dates: [] };
          }
        })
      );

      const now = new Date();
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
        months.push({ key, label: dt.toLocaleString("en-US", { month: "short" }), value: 0 });
      }
      counts.forEach((item) => {
        item.dates.forEach((ds) => {
          const d = new Date(ds);
          if (isNaN(d)) return;
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const idx = months.findIndex((m) => m.key === key);
          if (idx >= 0) months[idx].value += 1;
        });
      });

      const ugMonths = months.map((m) => ({ label: m.label, value: 0 }));
      const usersByMonth = new Map();
      fbs.forEach((f) => {
        const d = f?.date ? new Date(f.date) : null;
        const userId = f?.user?.id || f?.userId;
        if (!d || !userId || isNaN(d)) return;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!usersByMonth.has(key)) usersByMonth.set(key, new Set());
        usersByMonth.get(key).add(userId);
      });
      ugMonths.forEach((m, i) => {
        const base = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const key = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}`;
        m.value = (usersByMonth.get(key)?.size || 0);
      });

      const totalActiveUsers = allUsers.length;

      const ratings = fbs.map((f) => Number(f?.rating) || 0);
      const avgRating = fbs.length > 0 ? ratings.reduce((a, b) => a + b, 0) / fbs.length : 0;

      const topRated = hotelsArr
        .filter((h) => typeof h?.starRating === "number")
        .sort((a, b) => (b.starRating || 0) - (a.starRating || 0))
        .slice(0, 5);

      const result = {
        hotels: hotelsArr,
        totalHotels: hotelsArr.length,
        totalActiveUsers: totalActiveUsers,
        avgRating,
        totalReviews: fbs.length,
        topHotels: counts.slice().sort((a, b) => b.count - a.count).slice(0, 6),
        totalBookingsSum: counts.reduce((a, b) => a + b.count, 0),
        monthlyBookings: months,
        userGrowth: ugMonths,
        ratingDistribution: hotelsArr.reduce((dist, h) => {
          const r = Math.round(Number(h?.starRating) || 0);
          if (r >= 1 && r <= 5) dist[r - 1] += 1;
          return dist;
        }, [0, 0, 0, 0, 0]),
        topRatedHotels: topRated,
        recentActivity: [
          ...topRated.slice(0, 2).map((h) => ({ date: new Date().toLocaleDateString(), type: "Hotel Added", name: h.hotelName, action: "Review" })),
          ...fbs.slice(0, 3).map((f) => ({
            date: f?.date || "",
            type: "Feedback",
            name: (f?.message || "").slice(0, 24) + (f?.message?.length > 24 ? "…" : ""),
            action: "Read",
          })),
        ].slice(0, 5),
      };
      setDashboardData(result);
      setIsLoading(false);
      } catch (error) {
        setDashboardData({
          hotels: [],
          totalHotels: 0,
          totalActiveUsers: 0,
          avgRating: 0,
          totalReviews: 0,
          topHotels: [],
          totalBookingsSum: 0,
          monthlyBookings: [],
          userGrowth: [],
          ratingDistribution: [0, 0, 0, 0, 0],
          topRatedHotels: [],
          recentActivity: [],
        });
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const {
    hotels = [],
    totalHotels = 0,
    totalActiveUsers = 0,
    topRatedHotels = [],
  } = dashboardData || {};

  const recentHotels = useMemo(() => hotels.slice(0, 5), [hotels]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Loading dashboard...</div>
        </div>
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
        <span className="text-xs sm:text-sm font-semibold">Admin Dashboard</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-14 rounded-2xl">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">
            Platform Overview
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Key metrics across StayEase</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-black text-white p-4 sm:p-6 rounded-2xl shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-800 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center">
                <Hotel className="text-white" size={24} />
              </div>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{totalHotels}</span>
            </div>
            <h3 className="text-gray-300 text-xs sm:text-sm font-medium mb-1">Total Hotels</h3>
            <p className="text-[10px] sm:text-xs text-gray-500">Across the platform</p>
          </div>

          <div className="bg-black text-white p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-800 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{totalActiveUsers}</span>
            </div>
            <h3 className="text-gray-300 text-xs sm:text-sm font-medium mb-1">Active Users</h3>
            <p className="text-[10px] sm:text-xs text-gray-500">Based on recent feedback</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-2xl transition-shadow mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-black p-1.5 sm:p-2 rounded-lg">
                <Star className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-black mb-1">Top Rated Hotels</h3>
                <p className="text-[10px] sm:text-xs text-gray-500">Highest star ratings</p>
              </div>
            </div>
            <NavLink to="/admin/hotels" className="text-xs sm:text-sm text-black">View All</NavLink>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {topRatedHotels.length === 0 ? (
              <div className="text-xs sm:text-sm text-gray-500">No hotels found</div>
            ) : (
              topRatedHotels.map((h) => (
                <div 
                  key={h.id} 
                  onClick={() => navigate(`/admin/hotels/view/${h.id}`)}
                  className="flex items-center justify-between border border-gray-200 rounded-xl p-2.5 sm:p-3 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <div className="text-xs sm:text-sm text-gray-800">{h.hotelName || "Unnamed Hotel"}</div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    {typeof h.starRating === "number" ? h.starRating.toFixed(1) : "0.0"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-black p-1.5 sm:p-2 rounded-lg">
                <LayoutDashboard className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-black mb-1">Recent Hotels</h3>
                <p className="text-[10px] sm:text-xs text-gray-500">Latest added to StayEase</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {recentHotels.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">No hotels found</div>
            ) : (
              recentHotels.map((h) => (
                <div
                  key={h.id}
                  onClick={() => navigate(`/admin/hotels/view/${h.id}`)}
                  className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                    <div className="flex-1">
                      <h4 className="font-semibold text-black text-sm sm:text-base">
                        {h.hotelName || "Unnamed Hotel"}
                      </h4>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 mt-1">
                        {h?.address?.city && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-gray-500" />
                            {h.address.city}
                          </span>
                        )}
                        {typeof h?.starRating === "number" && (
                          <span className="flex items-center gap-1.5">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            {h.starRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    {h?.manager?.firstname && (
                      <div className="text-left sm:text-right text-[10px] sm:text-xs text-gray-500">
                        Manager:{" "}
                        <span className="font-medium text-gray-800">
                          {[h.manager.firstname, h.manager.lastname].filter(Boolean).join(" ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
