import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';


function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div className="card"> 
        <div className="card-header"> 
          <h1 className="card-title">Admin Dashboard</h1>
          <p className="card-description">
            Welcome, {user?.name || 'Admin'}! Manage your application from here.
          </p>
        </div>
        <div className="card-content"> 
          <p>This is the main dashboard area. You can add summary statistics or quick links here.</p>
          <div className="flex gap-4 mt-4">
            <Link to="/products">
              <button className="primary">Manage Products</button> 
            </Link>
          </div>
          <div className="mt-4">
             <button className="danger" onClick={logout}>Logout</button>  
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

