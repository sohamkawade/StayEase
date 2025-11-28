import React, { useState, useEffect } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ menuItems, collapsed, setCollapsed }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) setMobileOpen(!mobileOpen);
    else setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-lg"
        >
          <Menu size={24} />
        </button>
      )}

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 bg-black rounded-r-4xl text-gray-300 h-screen z-50
          transition-all duration-300 flex flex-col
          ${isMobile ? (mobileOpen ? "w-72" : "-translate-x-full") : collapsed ? "w-20" : "w-72"}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          {(!collapsed || isMobile) && <h1 className="text-xl font-semibold">StayEase</h1>}
          <button onClick={toggleSidebar} className="p-2 rounded hover:bg-white/10">
            {isMobile && mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <div className="mt-2 flex-1 px-2 space-y-2.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 rounded-lg transition-all 
                ${isActive ? "bg-gray-300 text-black" : "hover:bg-white/10"}`
              }
            >
              {item.icon}
              {(!collapsed || isMobile) && <span className="text-sm">{item.name}</span>}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-gray-600">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-white/10 rounded"
          >
            <LogOut size={20} />
            {(!collapsed || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
