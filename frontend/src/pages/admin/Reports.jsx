import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { MoveRight, BarChart2, Star, CreditCard } from "lucide-react";
import { getAllStayEaseFeedbacks } from "../../services/apiService";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllStayEaseFeedbacks();
        const data = res?.data?.data ?? res?.data ?? [];
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch {
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const charts = useMemo(() => {
    // Prepare monthly buckets for counts and average rating
    const byMonth = new Map();
    feedbacks.forEach((f) => {
      const d = f?.date ? new Date(f.date) : null;
      if (!d || isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const arr = byMonth.get(key) || [];
      arr.push(Number(f?.rating) || 0);
      byMonth.set(key, arr);
    });
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const ratings = byMonth.get(key) || [];
      const count = ratings.length;
      const avg = count > 0 ? ratings.reduce((a, b) => a + b, 0) / count : 0;
      months.push({
        key,
        label: dt.toLocaleString("en-US", { month: "short" }),
        count,
        avg,
      });
    }
    const maxCount = Math.max(...months.map((m) => m.count), 1);
    const maxAvg = 5;
    return { months, maxCount, maxAvg };
  }, [feedbacks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-gray-500">Loading reports...</div>
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
        <span className="text-xs sm:text-sm font-semibold">Reports</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-14 rounded-2xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">
            Platform Reports
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Trends across the StayEase platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="bg-black p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <BarChart2 className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-black mb-1">
                Feedback Volume (Last 12 months)
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Number of reviews each month</p>
            </div>
          </div>
          <div className="w-full h-32 sm:h-40 overflow-x-auto">
            <svg viewBox="0 0 800 140" className="w-full h-full min-w-[800px]">
              {(() => {
                const barW = 40;
                const spacing = 25;
                return charts.months.map((m, idx) => {
                  const h = (m.count / charts.maxCount) * 110;
                  const x = 20 + idx * (barW + spacing);
                  const y = 120 - h;
                  return (
                    <g key={`count-${m.key}`}>
                      <rect x={x} y={y} width={barW} height={h} fill="#111827" rx="4" />
                      <text x={x + barW / 2} y={135} textAnchor="middle" fontSize="10" fill="#6B7280">
                        {m.label}
                      </text>
                    </g>
                  );
                });
              })()}
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="bg-black p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <Star className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-black mb-1">
                Average Rating (Last 12 months)
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Average review score per month</p>
            </div>
          </div>
          <div className="w-full h-32 sm:h-40 overflow-x-auto">
            <svg viewBox="0 0 800 140" className="w-full h-full min-w-[800px]">
              {(() => {
                const barW = 40;
                const spacing = 25;
                return charts.months.map((m, idx) => {
                  const h = (m.avg / charts.maxAvg) * 110;
                  const x = 20 + idx * (barW + spacing);
                  const y = 120 - h;
                  return (
                    <g key={`avg-${m.key}`}>
                      <rect x={x} y={y} width={barW} height={h} fill="#F59E0B" rx="4" />
                      <text x={x + barW / 2} y={135} textAnchor="middle" fontSize="10" fill="#6B7280">
                        {m.label}
                      </text>
                    </g>
                  );
                });
              })()}
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="bg-black p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <CreditCard className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-black mb-1">Payments</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Dummy payment analytics</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-gray-600 mb-1 font-medium">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">₹12,45,600</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Last 30 days</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-gray-600 mb-1 font-medium">Successful Payments</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">1,248</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Last 30 days</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-gray-600 mb-1 font-medium">Refunds</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">34</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Last 30 days</p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 w-full h-32 sm:h-40 overflow-x-auto">
            <svg viewBox="0 0 800 140" className="w-full h-full min-w-[800px]">
              {(() => {
                const series = [40, 60, 55, 70, 65, 90, 120, 110, 130, 125, 140, 150];
                const max = Math.max(...series, 1);
                const barW = 40;
                const spacing = 25;
                return series.map((v, idx) => {
                  const h = (v / max) * 110;
                  const x = 20 + idx * (barW + spacing);
                  const y = 120 - h;
                  const month = new Date(2020, idx, 1).toLocaleString("en-US", { month: "short" });
                  return (
                    <g key={`p-${idx}`}>
                      <rect x={x} y={y} width={barW} height={h} fill="#111827" rx="4" />
                      <text x={x + barW / 2} y={135} textAnchor="middle" fontSize="10" fill="#6B7280">
                        {month}
                      </text>
                    </g>
                  );
                });
              })()}
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
