import React from 'react'; // Import React if not already present
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import ProtectedRoute from './components/ProtectedRoute.jsx'; // Corrected import path with extension
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; // Actual component import
import ProductsPage from './pages/ProductsPage'; // Actual component import
import AddProductPage from './pages/AddProductPage'; // Actual component import
import EditProductPage from './pages/EditProductPage'; // Actual component import

// Remove the placeholder components and conditional assignments
// function PlaceholderComponent({ title }) { ... }
// if (!DashboardPage) ... etc.

function AppContent() {
  const { user, loading, isAdmin } = useAuth(); // Get user and isAdmin status

  // Wait for auth state to load before rendering routes
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading Application...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Admin Routes */}
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

      {/* Default route behavior:
          - If logged in (and is admin because only admins can log in), go to dashboard.
          - If not logged in, redirect to login.
      */}
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

