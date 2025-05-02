import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

// Removed shadcn/ui imports

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div className="card"> {/* Replaced Card */} 
        <div className="card-header"> {/* Replaced CardHeader */} 
          <h1 className="card-title">Admin Dashboard</h1> {/* Replaced CardTitle */} 
          <p className="card-description"> {/* Replaced CardDescription */} 
            Welcome, {user?.name || 'Admin'}! Manage your application from here.
          </p>
        </div>
        <div className="card-content"> {/* Replaced CardContent */} 
          <p>This is the main dashboard area. You can add summary statistics or quick links here.</p>
          <div className="flex gap-4 mt-4">
            <Link to="/products">
              <button className="primary">Manage Products</button> {/* Replaced Button */} 
            </Link>
            {/* Add more links as needed */}
          </div>
          <div className="mt-4">
             <button className="danger" onClick={logout}>Logout</button> {/* Replaced Button */} 
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

