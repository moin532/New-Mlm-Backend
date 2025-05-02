import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:4000/api/v1';

const getAllProducts = async () => {
  try {
   
    const response = await axios.get(`${API_URL}/product/all`);
    console.log("Fetched products (public):", response.data);
   
    if (response.data && response.data.success) {
      return response.data.products;
    } else {
     
      throw new Error(response.data.message || 'Failed to fetch products.');
    }
  } catch (error) {
    console.error('Get All Products (Public) API error:', error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred while fetching products.';
    throw new Error(errorMessage);
  }
};


const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/product/${id}`); 
    console.log(`Fetched product ${id}:`, response.data);
    
    if (response.data && response.data.success) {
      return response.data.product;
    } else {
      throw new Error(response.data.message || `Failed to fetch product ${id}.`);
    }
  } catch (error) {
    console.error(`Get Product ${id} API error:`, error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.message || error.message || `An error occurred while fetching product ${id}.`;
    throw new Error(errorMessage);
  }
};

const addProduct = async (formData) => {
  try {
    const headers = { ...authService.getAuthHeader() }; 
    console.log("Sending add product request to backend...");
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
    const headers = { ...authService.getAuthHeader(), 'Content-Type': 'application/json' }; 
    console.log(`Sending update product request for ${id} to backend...`);
    const response = await axios.put(`${API_URL}/admin/products/${id}`, productData, { headers });
    console.log(`Update product ${id} response:`, response.data);
    if (response.data && response.data.success) {
      return response.data.product; 
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
    const response = await axios.delete(`${API_URL}/admin/products/${id}`, { headers });
    console.log(`Delete product ${id} response:`, response.data);
    if (response.data && response.data.success) {
      return response.data; 
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

