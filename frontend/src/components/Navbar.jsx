import { MenuIcon, XIcon, User2, Phone, LogOut, Calendar, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/apiService";
import { getImageUrl } from "../utils/imageUtils";

const userNavItems = [
  { name: "Hotels", url: "/hotels" },
  { name: "Rooms", url: "/rooms" },
  { name: "About", url: "/about" },
];

const managerNavItems = [
  { name: "Dashboard", url: "/manager/dashboard" },
  { name: "Bookings", url: "/manager/bookings" },
  { name: "About", url: "/about" },
];

const adminNavItems = [
  { name: "Dashboard", url: "/admin/dashboard" },
  { name: "Hotels", url: "/admin/hotels" },
  { name: "About", url: "/about" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfilePicture, setUserProfilePicture] = useState(null);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && user?.id) {
        const role = user?.role || user?.roleName || "";
        const roleUpper = role?.toUpperCase();
        
        if (roleUpper === "USER" || !roleUpper || (!roleUpper.includes("MANAGER") && roleUpper !== "ADMIN")) {
          try {
            const res = await getUserProfile(user.id);
            const userData = res?.data?.data || res?.data;
            if (userData?.profilePicture) {
              setUserProfilePicture(userData.profilePicture);
            }
          } catch (err) {
            console.error("Failed to fetch user profile:", err);
          }
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, user]);

  return (
    <>
      <nav className="fixed top-0 z-50 flex items-center justify-between w-full py-3 sm:py-4 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
          <img
            src="/assets/logo.png"
            alt="logo"
            className="h-7 w-6 sm:h-8 sm:w-7 md:h-9 md:w-8"
          />
          <h1 className="text-xl sm:text-2xl font-extrabold font-sans text-gray-900">
            StayEase
          </h1>
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {(() => {
            if (!isAuthenticated) {
              return userNavItems.map((link) => (
                <li key={link.name} className="group relative pb-2 list-none">
                  <NavLink
                    to={link.url}
                    className={({ isActive }) =>
                      `relative text-sm lg:text-base font-medium transition-all duration-300 ${
                        isActive ? "text-black" : "text-gray-600 hover:text-black"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {link.name}
                        <span
                          className={`absolute left-0 -bottom-1 h-0.5 bg-black transition-all duration-300 ${
                            isActive
                              ? "w-full"
                              : "w-0 group-hover:w-full"
                          }`}
                        ></span>
                      </>
                    )}
                  </NavLink>
                </li>
              ));
            }

            const role = user?.role || user?.roleName || "";
            const roleUpper = role?.toUpperCase();
            const isManager = roleUpper && (roleUpper.includes("MANAGER") || roleUpper === "MANAGER" || roleUpper === "HOTEL_MANAGER");
            const isAdmin = roleUpper === "ADMIN";

            let itemsToShow = [];
            if (isManager) {
              itemsToShow = managerNavItems;
            } else if (isAdmin) {
              itemsToShow = adminNavItems;
            } else {
              itemsToShow = userNavItems;
            }

            return itemsToShow.map((link) => (
              <li key={link.name} className="group relative pb-2 list-none">
                <NavLink
                  to={link.url}
                  className={({ isActive }) =>
                    `relative text-[16px] transition-all duration-300 ${
                      isActive ? "text-black" : "text-gray-700 hover:text-black"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.name}
                      <span
                        className={`absolute left-0 bottom-0 h-[1px] bg-black transition-all duration-700 ${
                          isActive
                            ? "w-full origin-left"
                            : "w-0 group-hover:w-full origin-right"
                        }`}
                      ></span>
                    </>
                  )}
                </NavLink>
              </li>
            ));
          })()}
        </div>

        <div className="flex gap-2 sm:gap-3 items-center">
          {!isAuthenticated && (
            <NavLink
              to="/login"
              className="hidden md:flex items-center gap-1.5 px-4 lg:px-4 py-2 lg:py-2 bg-white hover:bg-gray-50 active:scale-95 transition-all rounded-full shadow-sm text-black text-sm lg:text-sm font-medium"
            >
              <User2 size={16} />
              Sign in
            </NavLink>
          )}

          {isAuthenticated && (() => {
            const role = user?.role || user?.roleName || "";
            const roleUpper = role?.toUpperCase();
            const isUser = roleUpper === "USER" || !roleUpper || (!roleUpper.includes("MANAGER") && roleUpper !== "ADMIN");
            
            return (
              <div className="relative group hidden md:block">
                <button className={`flex items-center gap-2 ${isUser ? 'p-1' : 'px-3 lg:px-3 py-1.5 lg:py-2'} bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition-all shadow-sm`}>
                  {isUser ? (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden ring-2 ring-white">
                      {userProfilePicture ? (
                        <img 
                          src={getImageUrl(userProfilePicture)}
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User2 size={16} className="text-gray-700" />
                      )}
                    </div>
                  ) : (
                    <>
                      <User2 size={16} className="text-gray-700" />
                      <span className="text-xs lg:text-sm font-medium text-gray-800 hidden lg:inline">
                        {user?.firstname || user?.firstName || user?.manager?.firstname || user?.name || "User"}
                      </span>
                    </>
                  )}
                </button>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2 transition-all duration-200 overflow-hidden">
                <div className="py-1.5">
                  <NavLink
                    to={(() => {
                      const role = user?.role || user?.roleName || "";
                      const roleUpper = role?.toUpperCase();
                      
                      if (roleUpper && (roleUpper.includes("MANAGER") || roleUpper === "MANAGER" || roleUpper === "HOTEL_MANAGER")) {
                        return "/manager/hotel-profile";
                      }
                      if (roleUpper === "ADMIN") {
                        return "/admin/profile";
                      }
                      return "/user/profile";
                    })()}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors group/item"
                  >
                    <User2 size={18} className="text-gray-500" />
                    <span className="text-sm font-medium">Profile</span>
                  </NavLink>
                  {isUser && (
                    <>
                      <NavLink
                        to="/user/my-bookings"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors group/item"
                      >
                        <Calendar size={18} className="text-gray-500" />
                        <span className="text-sm font-medium">My Bookings</span>
                      </NavLink>
                      <NavLink
                        to="/user/wish-list"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors group/item"
                      >
                        <Heart size={18} className="text-gray-500" />
                        <span className="text-sm font-medium">Wishlist</span>
                      </NavLink>
                    </>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-1.5">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors group/item"
                  >
                    <LogOut size={18} className="text-red-500" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
            );
          })()}

          <NavLink
            to="/contact"
            className="hidden md:flex items-center gap-1.5 px-4 lg:px-4 py-2 lg:py-2 bg-black hover:bg-gray-900 active:scale-95 transition-all rounded-full text-white text-sm lg:text-sm font-medium shadow-sm"
          >
            <Phone size={14} />
            Contact
          </NavLink>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && (() => {
            const role = user?.role || user?.roleName || "";
            const roleUpper = role?.toUpperCase();
            const isUser = roleUpper === "USER" || !roleUpper || (!roleUpper.includes("MANAGER") && roleUpper !== "ADMIN");
            
            return (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-gray-100">
                {isUser && userProfilePicture ? (
                  <img 
                    src={getImageUrl(userProfilePicture)}
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User2 size={16} className="text-gray-600" />
                )}
              </div>
            );
          })()}
          <button 
            onClick={() => setIsOpen(true)} 
            className="p-2 hover:bg-gray-100 rounded-lg active:scale-95 transition-all"
            aria-label="Open menu"
          >
            <MenuIcon size={24} />
          </button>
        </div>
      </nav>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/50 md:hidden transition-opacity duration-200" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="w-80 sm:w-96 h-full overflow-y-auto fixed right-0 top-0 z-50 md:hidden slide-in-right bg-white" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 sm:p-6 bg-white sticky top-0 z-10">
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg active:scale-95 transition-all"
                aria-label="Close menu"
              >
                <XIcon size={22} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-2">
              {(() => {
                if (!isAuthenticated) {
                  return userNavItems.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.url}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `block py-3 px-4 rounded-lg transition-all font-medium ${
                          isActive ? "bg-gray-100 text-black font-semibold" : "text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  ));
                }

                const role = user?.role || user?.roleName || "";
                const roleUpper = role?.toUpperCase();
                const isManager = roleUpper && (roleUpper.includes("MANAGER") || roleUpper === "MANAGER" || roleUpper === "HOTEL_MANAGER");
                const isAdmin = roleUpper === "ADMIN";
                const isUser = roleUpper === "USER" || !roleUpper || (!isManager && !isAdmin);

                let itemsToShow = [];
                if (isManager) {
                  itemsToShow = managerNavItems;
                } else if (isAdmin) {
                  itemsToShow = adminNavItems;
                } else {
                  itemsToShow = userNavItems;
                }

                return itemsToShow.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.url}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `block py-3 px-4 rounded-lg transition-all font-medium ${
                        isActive ? "bg-gray-100 text-black font-semibold" : "text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ));
              })()}

              {isAuthenticated && (() => {
                const role = user?.role || user?.roleName || "";
                const roleUpper = role?.toUpperCase();
                const isUser = roleUpper === "USER" || !roleUpper || (!roleUpper.includes("MANAGER") && roleUpper !== "ADMIN");
                
                return (
                  <>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">Account</p>
                      <NavLink
                        to={(() => {
                          const role = user?.role || user?.roleName || "";
                          const roleUpper = role?.toUpperCase();
                          
                          if (roleUpper && (roleUpper.includes("MANAGER") || roleUpper === "MANAGER" || roleUpper === "HOTEL_MANAGER")) {
                            return "/manager/hotel-profile";
                          }
                          if (roleUpper === "ADMIN") {
                            return "/admin/profile";
                          }
                          return "/user/profile";
                        })()}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all font-medium group/item active:scale-[0.98] ${
                            isActive ? "bg-gray-100 text-black font-semibold" : "text-gray-700 hover:bg-gray-50"
                          }`
                        }
                      >
                        <User2 size={18} className="text-gray-500" />
                        <span className="text-sm font-medium">Profile</span>
                      </NavLink>
                      {isUser && (
                        <>
                          <NavLink
                            to="/user/my-bookings"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 py-2.5 px-4 rounded-xl transition-colors group/item ${
                                isActive ? "bg-gray-100 text-black font-semibold" : "text-gray-700 hover:bg-gray-50"
                              }`
                            }
                          >
                            <Calendar size={18} className="text-gray-500" />
                            <span className="text-sm font-medium">My Bookings</span>
                          </NavLink>
                          <NavLink
                            to="/user/wish-list"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 py-2.5 px-4 rounded-xl transition-colors group/item ${
                                isActive ? "bg-gray-100 text-black font-semibold" : "text-gray-700 hover:bg-gray-50"
                              }`
                            }
                          >
                            <Heart size={18} className="text-gray-500" />
                            <span className="text-sm font-medium">Wishlist</span>
                          </NavLink>
                        </>
                      )}
                    </div>
                  </>
                );
              })()}

              {!isAuthenticated && (
                <NavLink
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block py-3 px-4 rounded-lg bg-black text-white text-center font-semibold hover:bg-gray-900 active:scale-[0.98] transition-all shadow-sm"
                >
                  Sign in
                </NavLink>
              )}

              {isAuthenticated && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 py-2.5 px-4 rounded-lg text-red-600 hover:bg-red-50 active:scale-[0.98] transition-all font-medium"
                  >
                    <LogOut size={18} className="text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              <NavLink
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 py-3 px-4 rounded-lg bg-black text-white active:scale-[0.98] transition-all font-medium"
              >
                <Phone size={18} />
                Contact
              </NavLink>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
