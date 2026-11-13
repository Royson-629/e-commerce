
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

import ProductForm from '../components/ProductForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useApp } from '../context/AppContext';
import productService from '../services/productService';

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

export const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // 1. Fetch existing product information.
  const fetchProductData = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const data = await productService.getProductById(id);
      setProduct(data);
    } catch (err) {
      setFetchError(
        err.response?.data?.message ||
        err.message ||
        `Failed to fetch product #${id}.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  // 2. Update product.
  const handleUpdate = async (
    cleanedPayload,
    { mainImageFile }
  ) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const productPayload = { ...cleanedPayload };

      // Upload a new image only when the user selects one.
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

        productPayload.imageUrl = cloudinaryUrl;
      } else {
        // Keep the existing permanent URL if no new image was selected.
        // Never allow a temporary blob URL to be saved.
        if (
          productPayload.imageUrl &&
          !isPermanentImageUrl(productPayload.imageUrl)
        ) {
          throw new Error(
            'Invalid image URL. Please select the image again.'
          );
        }
      }

      // Send PUT /api/products/{id}.
      await productService.updateProduct(id, productPayload);

      showToast('Product successfully updated!', 'success');
      navigate(`/products/${id}`);
    } catch (err) {
      console.error('Product update error:', err);

      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string'
          ? err.response.data
          : null) ||
        err.message ||
        'Failed to update product.';

      setSubmitError(message);
      showToast(message, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner
          message={`Loading product #${id}...`}
        />
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="page-container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '18px'
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
          <span>Edit Product</span>
        </div>

        <ErrorMessage
          message={
            fetchError ||
            'Unable to load product for editing.'
          }
          onRetry={fetchProductData}
        />
      </div>
    );
  }

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

        <Link
          to={`/products/${id}`}
          style={{ color: '#64748b' }}
        >
          {product.name}
        </Link>

        <ChevronRight size={14} />

        <span style={{ color: '#0f172a', fontWeight: 600 }}>
          Edit Product
        </span>
      </div>

      {/* Page Header */}
      <div
        className="page-header"
        style={{ marginBottom: '24px' }}
      >
        <div className="page-title-group">
          <h1>Edit Product Details</h1>

          <p className="page-subtitle">
            Update product information and image.
          </p>
        </div>
      </div>

      {/* Submission Error */}
      {submitError && (
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
              Update Submission Failed
            </div>

            <div style={{ fontSize: '13px' }}>
              {submitError}
            </div>
          </div>
        </div>
      )}

      {/* Product Form */}
      <ProductForm
        initialData={product}
        onSubmit={handleUpdate}
        isEdit={true}
        submitting={submitting}
      />
    </div>
  );
};

export default EditProduct;
