import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

// Removed shadcn/ui imports

function LoginPage() {
  const [username, setUsername] = useState(''); // Changed from phone to username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  // Redirect path after login, default to /dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Pass username to auth.login
      const loggedIn = await auth.login(username, password);
      if (loggedIn) {
        console.log("Navigating to:", from);
        navigate(from, { replace: true });
      } else {
        // This path might not be reached if auth.login throws error on failure
        setError('Login failed. Please check credentials or ensure you are an admin.');
      }
    } catch (err) {
      console.error("Login page error:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="card w-full max-w-sm"> {/* Replaced Card */} 
        <div className="card-header"> {/* Replaced CardHeader */} 
          <h1 className="card-title">Admin Login</h1> {/* Replaced CardTitle */} 
          <p className="card-description"> {/* Replaced CardDescription */} 
            Enter your username and password to access the admin panel.
          </p>
        </div>
        <div className="card-content"> {/* Replaced CardContent */} 
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="username">Username</label> {/* Changed label */} 
              <input
                id="username"
                type="text" // Changed type to text
                placeholder="e.g., admin"
                required
                value={username} // Use username state
                onChange={(e) => setUsername(e.target.value)} // Update username state
                disabled={loading}
              /> {/* Replaced Input */} 
            </div>
            <div className="grid gap-2">
              <label htmlFor="password">Password</label> {/* Replaced Label */} 
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              /> {/* Replaced Input */} 
            </div>
            <button type="submit" className="primary w-full" disabled={loading}> {/* Replaced Button */} 
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
        {/* Optional Footer can be added here */}
        {/* <div className="card-footer">
          <p className="text-xs text-center text-gray-500">Some footer text</p>
        </div> */}
      </div>
    </div>
  );
}

export default LoginPage;

