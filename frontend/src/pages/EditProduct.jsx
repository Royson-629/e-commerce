import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, AlertCircle } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useApp } from '../context/AppContext';
import productService from '../services/productService';

export const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // 1. Fetch existing product information from Spring Boot backend
  const fetchProductData = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const data = await productService.getProductById(id);
      setProduct(data);
    } catch (err) {
      setFetchError(err.message || `Failed to fetch product #${id} from backend.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  // 2. Submit updated product payload to Spring Boot backend
  const handleUpdate = async (cleanedPayload, { mainImageFile }) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // If a new image was selected locally, upload to image storage if available
      if (mainImageFile) {
        try {
          const imgUploadRes = await productService.uploadProductImage(mainImageFile);
          if (imgUploadRes?.imageUrl || imgUploadRes?.url) {
            cleanedPayload.mainImage = imgUploadRes.imageUrl || imgUploadRes.url;
          }
        } catch (imgErr) {
          console.warn('[EditProduct] Image upload endpoint skipped.');
        }
      }

      // Send PUT /api/products/{id} to backend
      await productService.updateProduct(id, cleanedPayload);
      showToast('Product successfully updated on Spring Boot backend!', 'success');
      navigate(`/products/${id}`);
    } catch (err) {
      setSubmitError(err.message || 'Failed to update product on backend.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner message={`Loading product #${id} from backend...`} />
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
          <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
            <ArrowLeft size={14} />
            <span>Products</span>
          </Link>
          <ChevronRight size={14} />
          <span>Edit Product</span>
        </div>
        <ErrorMessage message={fetchError || 'Unable to load product for editing.'} onRetry={fetchProductData} />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
        <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
          <ArrowLeft size={14} />
          <span>Products</span>
        </Link>
        <ChevronRight size={14} />
        <Link to={`/products/${id}`} style={{ color: '#64748b' }}>
          {product.name}
        </Link>
        <ChevronRight size={14} />
        <span style={{ color: '#0f172a', fontWeight: 600 }}>Edit Product</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title-group">
          <h1>Edit Product Details</h1>
          <p className="page-subtitle">
            Updates will be transmitted to <code>PUT /api/products/{id}</code> on your Spring Boot server.
          </p>
        </div>
      </div>

      {/* Submission Error Banner */}
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
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Update Submission Failed</div>
            <div style={{ fontSize: '13px' }}>{submitError}</div>
          </div>
        </div>
      )}

      {/* Complete Product Form populated with existing data */}
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
