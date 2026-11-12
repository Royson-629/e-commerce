import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, AlertCircle } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import { useApp } from '../context/AppContext';
import productService from '../services/productService';

export const AddProduct = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleCreate = async (cleanedPayload, { mainImageFile }) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. If an image file was selected and backend image upload endpoint is active, upload image first
      if (mainImageFile) {
        try {
          const uploadResult = await productService.uploadProductImage(mainImageFile);
          if (uploadResult?.imageUrl || uploadResult?.url) {
            cleanedPayload.mainImage = uploadResult.imageUrl || uploadResult.url;
          }
        } catch (imgErr) {
          console.warn('[AddProduct] Image upload endpoint not active yet. Saving product payload directly.');
        }
      }

      // 2. Submit product payload to Spring Boot POST /api/products
      const response = await productService.createProduct(cleanedPayload);
      showToast('Product successfully created on Spring Boot backend!', 'success');

      // Navigate to product details or list
      const newId = response?.id || cleanedPayload.id;
      if (newId) {
        navigate(`/products/${newId}`);
      } else {
        navigate('/products');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create product on backend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
        <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
          <ArrowLeft size={14} />
          <span>Products</span>
        </Link>
        <ChevronRight size={14} />
        <span style={{ color: '#0f172a', fontWeight: 600 }}>Add New Product</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title-group">
          <h1>Add New Product</h1>
          <p className="page-subtitle">
            Collects product information and dispatches a <code>POST /api/products</code> payload to your backend.
          </p>
        </div>
      </div>

      {/* Backend Submission Error Banner */}
      {errorMessage && (
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto 24px auto',
            padding: '14px 18px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Backend Submission Failed</div>
            <div style={{ fontSize: '13px' }}>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Product Form */}
      <ProductForm onSubmit={handleCreate} isEdit={false} submitting={submitting} />
    </div>
  );
};

export default AddProduct;
