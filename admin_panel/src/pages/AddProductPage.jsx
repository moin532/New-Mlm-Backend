import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';

function AddProductPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(0);
  const [images, setImages] = useState([]); // State to hold selected image files
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    // Handle multiple files
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Create FormData object to send multipart/form-data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('Stock', stock); // Ensure key matches backend ('Stock')

    // Append each image file
    images.forEach((image) => {
      formData.append('images', image); // Key 'images' matches upload.array('images') in backend route
    });

    try {
      await productService.addProduct(formData);
      alert('Product added successfully!');
      navigate('/products'); // Redirect to products list after successful addition
    } catch (err) {
      console.error("Error adding product:", err);
      setError(err.message || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Add New Product</h1>
      </div>

      {error && <p className="error-message">Error: {error}</p>}

      <form onSubmit={handleSubmit} className="simple-form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock</label>
          <input
            id="stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            required
            min="0"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="images">Images</label>
          <input
            id="images"
            type="file"
            multiple // Allow multiple file selection
            onChange={handleImageChange}
            accept="image/*" // Accept only image files
            disabled={loading}
          />
          {/* Optional: Preview selected images */} 
          {images.length > 0 && (
            <div className="image-preview-container">
              <p>Selected files:</p>
              <ul>
                {images.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button type="submit" className="button primary" disabled={loading}>
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}

export default AddProductPage;

