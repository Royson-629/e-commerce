
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

import ProductForm from '../components/ProductForm';
import { useApp } from '../context/AppContext';
import productService from '../services/productService';

// The backend returns the Cloudinary secure URL as a plain String.
const extractImageUrl = (uploadResult) => {
  if (typeof uploadResult === 'string') {
    return uploadResult.trim();
  }

  return (
    uploadResult?.imageUrl ||
    uploadResult?.url ||
    ''
  ).trim();
};

const isPermanentImageUrl = (url) => {
  return (
    typeof url === 'string' &&
    (url.startsWith('https://') || url.startsWith('http://')) &&
    !url.startsWith('blob:')
  );
};

export const AddProduct = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleCreate = async (cleanedPayload, { mainImageFile }) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Make a separate payload so the original form data is not mutated.
      const productPayload = { ...cleanedPayload };

      // 1. Upload the actual selected file to Cloudinary.
      if (mainImageFile) {
        const uploadResult =
          await productService.uploadProductImage(mainImageFile);

        const cloudinaryUrl = extractImageUrl(uploadResult);

        if (
          !cloudinaryUrl ||
          !cloudinaryUrl.startsWith('https://res.cloudinary.com/')
        ) {
          throw new Error(
            'Image upload did not return a valid Cloudinary URL.'
          );
        }

        // Save the permanent URL, never the browser preview URL.
        productPayload.imageUrl = cloudinaryUrl;
      } else {
        // A manually entered permanent URL is allowed.
        // A temporary blob URL must never reach PostgreSQL.
        if (
          productPayload.imageUrl &&
          !isPermanentImageUrl(productPayload.imageUrl)
        ) {
          throw new Error(
            'Invalid image URL. Please select the image again or enter a permanent image URL.'
          );
        }
      }

      // 2. Create product in PostgreSQL through Spring Boot.
      const response =
        await productService.createProduct(productPayload);

      // 3. Confirm successful creation.
      showToast('Product successfully created!', 'success');

      const newId = response?.id;

      if (newId) {
        navigate(`/products/${newId}`);
      } else {
        showToast(
          'Product created, but the backend did not return its ID.',
          'warning'
        );
        navigate('/products');
      }
    } catch (err) {
      console.error('Product creation error:', err);

      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string'
          ? err.response.data
          : null) ||
        err.message ||
        'Failed to create product.';

      setErrorMessage(message);
      showToast(message, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#64748b',
          marginBottom: '16px'
        }}
      >
        <Link
          to="/products"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#64748b'
          }}
        >
          <ArrowLeft size={14} />
          <span>Products</span>
        </Link>

        <ChevronRight size={14} />

        <span
          style={{
            color: '#0f172a',
            fontWeight: 600
          }}
        >
          Add New Product
        </span>
      </div>

      {/* Page Header */}
      <div
        className="page-header"
        style={{ marginBottom: '24px' }}
      >
        <div className="page-title-group">
          <h1>Add New Product</h1>
          <p className="page-subtitle">
            Add product information and upload product images
            to Cloudinary.
          </p>
        </div>
      </div>

      {/* Submission Error */}
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
            <div
              style={{
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              Product Submission Failed
            </div>

            <div style={{ fontSize: '13px' }}>
              {errorMessage}
            </div>
          </div>
        </div>
      )}

      {/* Product Form */}
      <ProductForm
        onSubmit={handleCreate}
        isEdit={false}
        submitting={submitting}
      />
    </div>
  );
};

export default AddProduct;
