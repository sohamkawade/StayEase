import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Profile from "./Profile";
import Sidebar from "../../components/Sidebar";
import Dashboard from "./Dashboard";
import Hotels from "./Hotels";
import AddHotel from "./AddHotel";
import HotelView from "./HotelView";
import Bookings from "./Bookings";
import Feedback from "./Feedback";
import Reports from "./Reports";
import Messages from "./Messages";
import Users from "./Users";

import {
  LayoutDashboard,
  Hotel,
  CalendarCheck2,
  MessageSquare,
  FileText,
  User2,
  Mail,
  Users as UsersIcon,
} from "lucide-react";

const AdminRoutes = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "My Profile", icon: <User2 size={20} />, path: "/admin/profile" },
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin/dashboard" },
    { name: "Hotels", icon: <Hotel size={20} />, path: "/admin/hotels" },
    { name: "Bookings", icon: <CalendarCheck2 size={20} />, path: "/admin/bookings" },
    { name: "Users", icon: <UsersIcon size={20} />, path: "/admin/users" },
    { name: "Feedback", icon: <MessageSquare size={20} />, path: "/admin/feedback" },
    { name: "Messages", icon: <Mail size={20} />, path: "/admin/messages" },
    { name: "Reports", icon: <FileText size={20} />, path: "/admin/reports" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        menuItems={menuItems}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`flex-1 p-4 sm:p-6 lg:p-6 mt-16 lg:mt-0 overflow-y-auto
        ${collapsed ? "lg:ml-20" : "lg:ml-72"}`}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/admin/profile" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotels/add" element={<AddHotel />} />
          <Route path="/hotels/view/:id" element={<HotelView />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/users" element={<Users />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminRoutes;
