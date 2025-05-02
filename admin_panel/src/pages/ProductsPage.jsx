import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        // Use the updated service function that calls the admin endpoint
        const fetchedProducts = await productService.getAllProducts();
        setProducts(fetchedProducts || []); // Ensure products is always an array
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message || 'Failed to load products.');
        // If unauthorized, the service should handle logout, but we can also redirect
        if (err.message.includes("Unauthorized")) {
            // Optionally redirect to login or show specific message
            // navigate('/login'); // Requires importing useNavigate
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        // Refresh the product list after deletion
        setProducts(products.filter(product => product._id !== id));
        alert('Product deleted successfully!');
      } catch (err) {
        console.error("Error deleting product:", err);
        alert(`Failed to delete product: ${err.message}`);
      }
    }
  };

  if (loading) {
    return <div className="container"><p>Loading products...</p></div>;
  }

  if (error) {
    return <div className="container error-message"><p>Error: {error}</p></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Manage Products</h1>
        <Link to="/products/add" className="button primary">Add New Product</Link>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table className="simple-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={`http://localhost:4000${product.images[0].url}`} // Assuming backend serves uploads from root
                      alt={product.name}
                      className="product-thumbnail"
                    />
                  ) : (
                    <span>No Image</span>
                  )}
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.Stock}</td>
                <td>
                  <Link to={`/products/edit/${product._id}`} className="button secondary small">Edit</Link>
                  <button 
                    onClick={() => handleDelete(product._id)} 
                    className="button danger small"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductsPage;

