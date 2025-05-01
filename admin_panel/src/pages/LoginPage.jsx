import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';


function LoginPage() {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedIn = await auth.login(username, password);
      if (loggedIn) {
        console.log("Navigating to:", from);
        navigate(from, { replace: true });
      } else {
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
      <div className="card w-full max-w-sm"> 
        <div className="card-header"> 
          <h1 className="card-title">Admin Login</h1>  
          <p className="card-description"> 
            Enter your username and password to access the admin panel.
          </p>
        </div>
        <div className="card-content">
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="username">Username</label> 
              <input
                id="username"
                type="text" 
                placeholder="e.g., admin"
                required
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                disabled={loading}
              />  
            </div>
            <div className="grid gap-2">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              /> 
            </div>
            <button type="submit" className="primary w-full" disabled={loading}>  
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
       
      </div>
    </div>
  );
}

export default LoginPage;

