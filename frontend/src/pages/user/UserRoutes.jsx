import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Profile from "./UserProfile";
import Sidebar from "../../components/Sidebar";
import MyBookings from "./MyBookings";
import Dashboard from "./Dashboard";
import WishList from "./WishList";
import Payment from "./Payment";
import { LayoutDashboard, CalendarCheck2, Heart, CreditCard, User2 } from "lucide-react";

const UserRoutes = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "My Profile", icon: <User2 size={20} />, path: "/user/profile" },
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/user/dashboard" },
    { name: "My Bookings", icon: <CalendarCheck2 size={20} />, path: "/user/my-bookings" },
    { name: "Wishlist", icon: <Heart size={20} />, path: "/user/wish-list" },
    { name: "Payments", icon: <CreditCard size={20} />, path: "/user/payments" }
  ];

  return (
    <div className="flex bg-gray-50">
      <Sidebar menuItems={menuItems} collapsed={collapsed} setCollapsed={setCollapsed} />

      <main
        className={`
          flex-1 p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto
          ${collapsed ? "lg:ml-20" : "lg:ml-72"}
          mt-16 lg:mt-0
        `}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/user/profile" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/wish-list" element={<WishList />} />
          <Route path="/payments" element={<Payment />} />
        </Routes>
      </main>
    </div>
  );
};

export default UserRoutes;
