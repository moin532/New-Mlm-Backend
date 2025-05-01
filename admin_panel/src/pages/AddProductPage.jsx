import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import '../styles/ProductStyles.css'; 

function AddProductPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(0);
  const [images, setImages] = useState([]); 
  const [previewUrls, setPreviewUrls] = useState([]); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  };

  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('Stock', stock); 

    images.forEach((image) => {
      formData.append('images', image); 
    });

    try {
      await productService.addProduct(formData);
      alert('Product added successfully!');
      navigate('/products'); 
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
            multiple 
            onChange={handleImageChange}
            accept="image/*" 
            disabled={loading}
          />
          
          
          {previewUrls.length > 0 && (
            <div className="image-preview-container">
              <p>Selected images:</p>
              <div className="preview-thumbnails">
                {previewUrls.map((url, index) => (
                  <div key={index} className="preview-thumbnail-container">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="preview-thumbnail" 
                    />
                  </div>
                ))}
              </div>
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