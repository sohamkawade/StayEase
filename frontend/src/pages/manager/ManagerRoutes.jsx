import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import HotelProfile from "./HotelProfile";
import Dashboard from "./Dashboard";
import RoomsManagement from "./RoomsManagement";
import RoomView from "./RoomView";
import AddRoom from "./AddRoom";
import EditRoom from "./EditRoom";
import Bookings from "./Bookings";
import BookingView from "./BookingView";
import Guests from "./Guests";
import GuestView from "./GuestView";
import FeedbackRatings from "./FeedbackRatings";
import ManagerInfo from "./ManagerInfo";
import {
  LayoutDashboard,
  DoorOpen,
  CalendarCheck2,
  Users,
  MessageSquare,
  Hotel,
} from "lucide-react";

const ManagerRoutes = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "Hotel Profile", icon: <Hotel size={20} />, path: "/manager/hotel-profile" },
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/manager/dashboard" },
    { name: "Rooms", icon: <DoorOpen size={20} />, path: "/manager/rooms-management" },
    { name: "Bookings", icon: <CalendarCheck2 size={20} />, path: "/manager/bookings" },
    { name: "Guests", icon: <Users size={20} />, path: "/manager/guests" },
    { name: "Feedback & Ratings", icon: <MessageSquare size={20} />, path: "/manager/feedback-ratings" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar menuItems={menuItems} collapsed={collapsed} setCollapsed={setCollapsed} />

      <main
        className={`
          flex-1 p-4 sm:p-6 mt-16 lg:mt-0 overflow-y-auto 
          transition-all duration-300
          ${collapsed ? "lg:ml-20" : "lg:ml-72"}
        `}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/manager/hotel-profile" replace />} />
          <Route path="/hotel-profile" element={<HotelProfile />} />
          <Route path="/manager-info" element={<ManagerInfo />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rooms-management" element={<RoomsManagement />} />
          <Route path="/rooms-management/view/:id" element={<RoomView />} />
          <Route path="/rooms-management/add" element={<AddRoom />} />
          <Route path="/rooms-management/edit/:id" element={<EditRoom />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/bookings/view/:id" element={<BookingView />} />
          <Route path="/guests" element={<Guests />} />
          <Route path="/guests/view/:id" element={<GuestView />} />
          <Route path="/feedback-ratings" element={<FeedbackRatings />} />
        </Routes>
      </main>
    </div>
  );
};

export default ManagerRoutes;
