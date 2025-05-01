import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from './authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      setUser(currentUser);
    }
    setLoading(false); 
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      if (data && data.user && data.user.role === 'admin') {
        setUser(data.user);
        return true; 
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("AuthContext Login error:", error.message);
      setUser(null);
      throw error; 
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };


  const value = { user, login, logout, loading, isAdmin: user?.role === 'admin' };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

