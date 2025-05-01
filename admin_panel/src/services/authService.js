import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/admin/login`, {
      username: username.toLowerCase(), // Send username
      password,
    });

    if (response.data && response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
     
      localStorage.setItem('user', JSON.stringify({ username: username, role: 'admin' })); 
      console.log('Admin login successful for:', username);
      return { token: response.data.token, user: { username: username, role: 'admin' } }; 
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
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Admin logged out.');
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.role === 'admin') {
          return user;
      }
      logout(); 
      return null;
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
      logout(); 
      return null;
    }
  }
  return null;
};

const getToken = () => {
  return localStorage.getItem('token');
};

const getAuthHeader = () => {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    console.error("No auth token found for header.");

    return {};
  }
};


const authService = {
  login,
  logout,
  getCurrentUser,
  getToken,
  getAuthHeader 
};

export default authService;

