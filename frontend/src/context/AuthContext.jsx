import React, { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("user");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const isAuthenticated = !!user;

  const getUserRole = () => {
    if (!user) return null;
    return (user.role || user.roleName)?.toUpperCase();
  };

  const hasRole = (roles) => {
    const userRole = getUserRole();
    if (!userRole) return false;
    return roles.some((role) => role.toUpperCase() === userRole);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      loading,
      getUserRole,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
