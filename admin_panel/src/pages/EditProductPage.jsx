import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../services/productService';

function EditProductPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const product = await productService.getProductById(id);
        if (product) {
          setName(product.name);
          setDescription(product.description);
          setCategory(product.category);
          setStock(product.Stock);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error(`Error fetching product ${id}:`, err);
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const updatedProductData = {
      name,
      description,
      category,
      Stock: stock,
    
    };

    try {
      await productService.updateProduct(id, updatedProductData);
      alert('Product updated successfully!');
      navigate('/products'); 
    } catch (err) {
      console.error(`Error updating product ${id}:`, err);
      setError(err.message || 'Failed to update product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading product details...</p></div>;
  }

  if (error) {
    return <div className="container error-message"><p>Error: {error}</p></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="simple-form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={submitting}
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
            disabled={submitting}
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
            disabled={submitting}
          />
        </div>



        <button type="submit" className="button primary" disabled={submitting}>
          {submitting ? 'Updating Product...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
}

export default EditProductPage;

