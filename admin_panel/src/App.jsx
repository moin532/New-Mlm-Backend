import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import ProtectedRoute from './components/ProtectedRoute.jsx'; 
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; 
import ProductsPage from './pages/ProductsPage';
import AddProductPage from './pages/AddProductPage'; 
import EditProductPage from './pages/EditProductPage'; 



function AppContent() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading Application...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
      />
      <Route
        path="/products"
        element={<ProtectedRoute><ProductsPage /></ProtectedRoute>}
      />
       <Route
        path="/products/add"
        element={<ProtectedRoute><AddProductPage /></ProtectedRoute>}
      />
       <Route
        path="/products/edit/:id"
        element={<ProtectedRoute><EditProductPage /></ProtectedRoute>}
      />

     
      <Route
        path="*"
        element={
          user && isAdmin ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

