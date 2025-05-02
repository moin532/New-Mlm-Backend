import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from './authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Check if user is already logged in (e.g., from localStorage)
    const currentUser = authService.getCurrentUser();
    // Check if the stored user object indicates an admin
    if (currentUser && currentUser.role === 'admin') {
      setUser(currentUser);
    }
    setLoading(false); // Set loading to false after checking
  }, []);

  // Update login function signature to accept username
  const login = async (username, password) => {
    try {
      // Call the updated authService login
      const data = await authService.login(username, password);
      // The service now returns { token, user: { username, role: 'admin' } }
      if (data && data.user && data.user.role === 'admin') {
        setUser(data.user);
        return true; // Indicate successful login
      } else {
        // This case should ideally not be reached if authService handles errors
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("AuthContext Login error:", error.message);
      setUser(null);
      throw error; // Re-throw the error to be caught by the component
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Provide the auth state and functions to children components
  // Also provide loading state so App can wait before rendering routes
  const value = { user, login, logout, loading, isAdmin: user?.role === 'admin' };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

