import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { MoveRight, BarChart2, Star, CreditCard } from "lucide-react";
import { getAllStayEaseFeedbacks, getAllBookings } from "../../services/apiService";

const PLATFORM_COMMISSION_RATE = 0.10;

const PaymentReports = ({ bookings }) => {
  const paymentData = useMemo(() => {
    const now = new Date();
    const paidBookings = bookings.filter(
      (b) => b?.paymentStatus === "PAID" || b?.paymentStatus === "paid"
    );
    
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b?.totalAmount || 0), 0);
    const platformRevenue = totalRevenue * PLATFORM_COMMISSION_RATE;
    
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last30Days = paidBookings.filter((b) => {
      const date = b?.createdAt ? new Date(b.createdAt) : null;
      return date && date >= thirtyDaysAgo;
    });
    
    const revenue30Days = last30Days.reduce((sum, b) => sum + (b?.totalAmount || 0), 0);
    const platformRevenue30Days = revenue30Days * PLATFORM_COMMISSION_RATE;
    
    const refunded = bookings.filter(
      (b) => b?.paymentStatus === "REFUNDED" || b?.paymentStatus === "refunded"
    );
    const refunded30Days = refunded.filter((b) => {
      const date = b?.createdAt ? new Date(b.createdAt) : null;
      return date && date >= thirtyDaysAgo;
    });
    
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthBookings = paidBookings.filter((b) => {
        const date = b?.createdAt ? new Date(b.createdAt) : null;
        return date && date >= dt && date < nextMonth;
      });
      const monthRevenue = monthBookings.reduce((sum, b) => sum + (b?.totalAmount || 0), 0);
      monthlyData.push({
        month: dt.toLocaleString("en-US", { month: "short" }),
        revenue: monthRevenue * PLATFORM_COMMISSION_RATE,
      });
    }
    
    const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);
    
    return {
      totalRevenue: platformRevenue,
      revenue30Days: platformRevenue30Days,
      successfulPayments: last30Days.length,
      refunds: refunded30Days.length,
      monthlyData,
      maxRevenue,
    };
  }, [bookings]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className="bg-black p-1.5 sm:p-2 rounded-lg flex-shrink-0">
          <CreditCard className="text-white" size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-black mb-1">Platform Revenue</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-600 mb-1 font-medium">Platform Revenue</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            ₹{paymentData.revenue30Days.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-600 mb-1 font-medium">Successful Payments</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {paymentData.successfulPayments}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-600 mb-1 font-medium">Refunds</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {paymentData.refunds}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>
      </div>
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm text-gray-600 font-medium">Total Platform Revenue</span>
          <span className="text-lg sm:text-xl font-bold text-gray-900">
            ₹{paymentData.totalRevenue.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
      <div className="mt-3 sm:mt-4 w-full h-32 sm:h-40 overflow-x-auto">
        <svg viewBox="0 0 800 140" className="w-full h-full min-w-[800px]">
          {paymentData.monthlyData.map((m, idx) => {
            const h = (m.revenue / paymentData.maxRevenue) * 110;
            const barW = 40;
            const spacing = 25;
            const x = 20 + idx * (barW + spacing);
            const y = 120 - h;
            return (
              <g key={`p-${idx}`}>
                <rect x={x} y={y} width={barW} height={h} fill="#111827" rx="4" />
                <text x={x + barW / 2} y={135} textAnchor="middle" fontSize="10" fill="#6B7280">
                  {m.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [fbRes, bookingsRes] = await Promise.all([
          getAllStayEaseFeedbacks(),
          getAllBookings({})
        ]);
        const fbData = fbRes?.data?.data ?? fbRes?.data ?? [];
        setFeedbacks(Array.isArray(fbData) ? fbData : []);
        
        const bookingsData = bookingsRes?.data?.data ?? bookingsRes?.data ?? [];
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch {
        setFeedbacks([]);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const charts = useMemo(() => {
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

        <PaymentReports bookings={bookings} />
      </div>
    </>
  );
};

export default Reports;
