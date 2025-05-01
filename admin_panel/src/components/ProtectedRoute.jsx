import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (user && isAdmin) {
    return children;
  }

 
  console.log('ProtectedRoute: User not admin or not logged in. Redirecting to login.');
  return <Navigate to="/login" state={{ from: location }} replace />;
}

export default ProtectedRoute;

