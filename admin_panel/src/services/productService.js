import axios from 'axios';
import authService from './authService';

// Define the base URL for the backend API
const API_URL = 'http://localhost:4000/api/v1'; // Assuming backend runs on port 4000

// Fetch all products (Using the public endpoint)
const getAllProducts = async () => {
  try {
    // No auth header needed for the public endpoint
    // const headers = authService.getAuthHeader(); 
    // Use the public endpoint for fetching all products
    const response = await axios.get(`${API_URL}/product/all`);
    console.log("Fetched products (public):", response.data);
    // Adjust based on actual backend response structure for public product list
    // Assuming the backend sends { success: true, products: [...] }
    if (response.data && response.data.success) {
      return response.data.products; // Return the array of products
    } else {
      // Handle cases where backend might send products directly or different structure
      // return response.data;
      throw new Error(response.data.message || 'Failed to fetch products.');
    }
  } catch (error) {
    console.error('Get All Products (Public) API error:', error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred while fetching products.';
    // No need for auth error handling here as it's public
    throw new Error(errorMessage);
  }
};

// Fetch a single product by ID (Using the public endpoint)
// The edit page needs product details, but fetching doesn't require admin auth usually.
// The PUT request for saving changes requires admin auth.
const getProductById = async (id) => {
  try {
    // Use the public endpoint as defined in the original backend routes (productsRoute.js)
    const response = await axios.get(`${API_URL}/product/${id}`); 
    console.log(`Fetched product ${id}:`, response.data);
    // Adjust based on actual backend response structure for single public product
    // Assuming { success: true, product: {...} }
    if (response.data && response.data.success) {
      return response.data.product;
    } else {
      throw new Error(response.data.message || `Failed to fetch product ${id}.`);
    }
  } catch (error) {
    console.error(`Get Product ${id} API error:`, error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.message || error.message || `An error occurred while fetching product ${id}.`;
    // No need for auth error handling here as it's a public endpoint
    throw new Error(errorMessage);
  }
};

// Add Product - Handles FormData with images
const addProduct = async (formData) => {
  try {
    // Get auth header but don't set Content-Type for FormData
    const headers = { ...authService.getAuthHeader() }; 
    console.log("Sending add product request to backend...");
    // Use the correct admin endpoint for adding products
    const response = await axios.post(`${API_URL}/admin/products`, formData, { headers });
    console.log("Add product response:", response.data);
    if (response.data && response.data.success) {
      return response.data.product;
    } else {
      throw new Error(response.data.message || 'Failed to add product.');
    }
  } catch (error) {
    console.error('Add Product API error:', error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred while adding the product.';
     if (error.response?.status === 401 || error.message.includes("Unauthorized")) {
        authService.logout();
        throw new Error("Unauthorized: Please log in again.");
    }
    throw new Error(errorMessage);
  }
};

// Update Product
const updateProduct = async (id, productData) => {
  try {
    // Get auth header with default Content-Type: application/json
    const headers = { ...authService.getAuthHeader(), 'Content-Type': 'application/json' }; 
    console.log(`Sending update product request for ${id} to backend...`);
    // Use the correct admin endpoint for updating products
    const response = await axios.put(`${API_URL}/admin/products/${id}`, productData, { headers });
    console.log(`Update product ${id} response:`, response.data);
    if (response.data && response.data.success) {
      return response.data.product; // Return the updated product
    } else {
      throw new Error(response.data.message || `Failed to update product ${id}.`);
    }
  } catch (error) {
    console.error(`Update Product ${id} API error:`, error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.message || error.message || `An error occurred while updating product ${id}.`;
    if (error.response?.status === 401 || error.message.includes("Unauthorized")) {
        authService.logout();
        throw new Error("Unauthorized: Please log in again.");
    }
    throw new Error(errorMessage);
  }
};

// Delete Product
const deleteProduct = async (id) => {
  try {
    const headers = authService.getAuthHeader();
    console.log(`Sending delete product request for ${id} to backend...`);
    // Use the correct admin endpoint for deleting products
    const response = await axios.delete(`${API_URL}/admin/products/${id}`, { headers });
    console.log(`Delete product ${id} response:`, response.data);
    if (response.data && response.data.success) {
      return response.data; // Return success message or data
    } else {
      throw new Error(response.data.message || `Failed to delete product ${id}.`);
    }
  } catch (error) {
    console.error(`Delete Product ${id} API error:`, error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.message || error.message || `An error occurred while deleting product ${id}.`;
    if (error.response?.status === 401 || error.message.includes("Unauthorized")) {
        authService.logout();
        throw new Error("Unauthorized: Please log in again.");
    }
    throw new Error(errorMessage);
  }
};


const productService = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};

export default productService;

