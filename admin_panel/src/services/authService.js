import axios from 'axios';

// Define the base URL for the backend API
const API_URL = 'http://localhost:4000/api/v1'; // Assuming backend runs on port 4000

// Admin Login using username and password
const login = async (username, password) => {
  try {
    // Use the dedicated admin login endpoint
    const response = await axios.post(`${API_URL}/admin/login`, {
      username: username.toLowerCase(), // Send username
      password,
    });

    // Check if login was successful and token exists
    if (response.data && response.data.success && response.data.token) {
      // Store token and potentially basic admin info (like username)
      localStorage.setItem('token', response.data.token);
      // Store a simple marker indicating an admin is logged in
      // The backend token already confirms admin status
      localStorage.setItem('user', JSON.stringify({ username: username, role: 'admin' })); // Simulate user object for compatibility
      console.log('Admin login successful for:', username);
      return { token: response.data.token, user: { username: username, role: 'admin' } }; // Return expected structure
    } else {
      console.error('Admin login failed: Invalid response structure.', response.data);
      throw new Error(response.data.message || 'Admin login failed. Please check credentials.');
    }
  } catch (error) {
    console.error('Admin Login API error:', error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred during admin login.';
    throw new Error(errorMessage);
  }
};

const logout = () => {
  // Remove token and user info from storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Admin logged out.');
};

// Get current 'user' (admin marker) from localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      // Ensure it looks like an admin object for consistency
      if (user && user.role === 'admin') {
          return user;
      }
      // If data is corrupted or not admin, clear it
      logout(); 
      return null;
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
      logout(); // Clear corrupted data
      return null;
    }
  }
  return null;
};

const getToken = () => {
  return localStorage.getItem('token');
};

// Function to get the auth token header correctly formatted
const getAuthHeader = () => {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    console.error("No auth token found for header.");
    // Optionally throw an error or handle appropriately
    // throw new Error("Unauthorized: No token found.");
    return {};
  }
};


const authService = {
  login,
  logout,
  getCurrentUser,
  getToken,
  getAuthHeader // Export the header function
};

export default authService;

