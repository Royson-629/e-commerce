import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Edit2,
  Boxes,
  Trash2,
  MapPin,
  PackageOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import productService from '../services/productService';
import ConfirmDialog from '../components/ConfirmDialog';
import StockUpdateModal from '../components/StockUpdateModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImage, setActiveImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  // Fetch product directly from Spring Boot backend using product ID
  const fetchProduct = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await productService.getProductById(id);
      setProduct(data);
      if (data?.mainImage) setActiveImage(data.mainImage);
    } catch (err) {
      setError(err.message || `Failed to fetch product #${id} from backend.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Handle Delete through backend API
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.deleteProduct(id);
      showToast('Product successfully deleted from backend!', 'success');
      navigate('/products');
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'danger');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getStockStatusBadge = () => {
    if (!product) return null;
    if (product.stock === 0) {
      return <span className="badge badge-out-of-stock">Out of Stock</span>;
    }
    if (product.stock <= (product.lowStockThreshold || 10)) {
      return <span className="badge badge-low-stock">Low Stock Warning</span>;
    }
    return <span className="badge badge-in-stock">In Stock</span>;
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner message={`Fetching product #${id} from Spring Boot backend...`} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
          <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
            <ArrowLeft size={14} />
            <span>Products</span>
          </Link>
          <ChevronRight size={14} />
          <span>Product #{id}</span>
        </div>
        <ErrorMessage message={error || 'Product record not found in database.'} onRetry={fetchProduct} />
      </div>
    );
  }

  const currentCover = activeImage || product.mainImage;
  const allImages = [product.mainImage, ...(product.additionalImages || [])].filter(Boolean);

  return (
    <div className="page-container">
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
        <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
          <ArrowLeft size={14} />
          <span>Products</span>
        </Link>
        <ChevronRight size={14} />
        <span>{product.category || 'Product'}</span>
        <ChevronRight size={14} />
        <span style={{ color: '#0f172a', fontWeight: 600 }}>{product.name}</span>
      </div>

      {/* Action Header with the 3 Important Action Buttons */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase' }}>
              {product.brand || 'Brand'}
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <code style={{ fontSize: '12px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
              SKU: {product.sku || product.id}
            </code>
            <span style={{ color: '#cbd5e1' }}>•</span>
            {getStockStatusBadge()}
          </div>
          <h1>{product.name}</h1>
        </div>

        {/* The 3 Important Action Buttons */}
        <div className="page-actions">
          {/* 1. Edit Product */}
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(`/products/${product.id}/edit`)}
          >
            <Edit2 size={15} color="#2563eb" />
            <span>Edit Product</span>
          </button>

          {/* 2. Update Stock via Backend */}
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowStockModal(true)}
          >
            <Boxes size={15} color="#d97706" />
            <span>Update Stock</span>
          </button>

          {/* 3. Delete Product via Backend */}
          <button
            type="button"
            className="btn btn-danger-outline"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={15} />
            <span>Delete Product</span>
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '28px', marginBottom: '28px' }}>
        {/* Left Column: Product Image & Gallery */}
        <div className="card">
          <div className="card-body">
            <div
              style={{
                width: '100%',
                height: '380px',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}
            >
              {currentCover ? (
                <img
                  src={currentCover}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8', gap: 8 }}>
                  <PackageOpen size={48} />
                  <span>No image uploaded</span>
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {allImages.length > 1 && (
              <div>
                <label className="form-label" style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', display: 'block' }}>
                  Image Gallery ({allImages.length} Views)
                </label>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {allImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      onClick={() => setActiveImage(img)}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: currentCover === img ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        flexShrink: 0
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Inventory, Warehouse */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pricing & GST Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Commercial Pricing</h3>
              <span className="badge badge-neutral">GST: {product.taxRate || 18}%</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
                  {formatINR(product.sellingPrice)}
                </span>
                {product.originalPrice > product.sellingPrice && (
                  <span style={{ fontSize: '18px', color: '#94a3b8', textDecoration: 'line-through' }}>
                    {formatINR(product.originalPrice)}
                  </span>
                )}
                {product.discount > 0 && (
                  <span
                    style={{
                      backgroundColor: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 700
                    }}
                  >
                    {product.discount}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stock & Warehouse Allocation Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Stock & Warehouse Allocation</h3>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowStockModal(true)}
              >
                <Boxes size={13} color="#d97706" />
                <span>Adjust Stock via API</span>
              </button>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Backend Stock</span>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
                    {product.stock ?? 0} <span style={{ fontSize: '13px', fontWeight: 500 }}>units</span>
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Low Threshold</span>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#64748b' }}>
                    {product.lowStockThreshold ?? 10} <span style={{ fontSize: '13px', fontWeight: 500 }}>units</span>
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Stock Valuation</span>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                    {formatINR((product.sellingPrice || 0) * (product.stock || 0))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                <MapPin size={16} color="#64748b" />
                <span>Warehouse Location: <strong>{product.warehouse || 'Not specified'}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Product Description */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Product Description</h3>
        </div>
        <div className="card-body">
          <p style={{ fontSize: '14.5px', lineHeight: '1.7', color: '#334155', whiteSpace: 'pre-line' }}>
            {product.description || 'No description provided in backend record.'}
          </p>
        </div>
      </div>

      {/* Specifications & Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Technical Specifications</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {product.specifications?.length > 0 ? (
              <table className="admin-table">
                <tbody>
                  {product.specifications.map((spec, index) => (
                    <tr key={index}>
                      <td style={{ width: '40%', fontWeight: 600, color: '#64748b', backgroundColor: '#fafbfc' }}>
                        {spec.key}
                      </td>
                      <td style={{ fontWeight: 500, color: '#0f172a' }}>
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                No technical specifications recorded in database.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Physical & Manufacturing Info</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13.5px', color: '#64748b' }}>Item Weight</span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{product.weight || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13.5px', color: '#64748b' }}>Dimensions</span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{product.dimensions || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13.5px', color: '#64748b' }}>Manufacturer</span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{product.manufacturer || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13.5px', color: '#64748b' }}>Warranty</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#059669' }}>{product.warranty || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Product Deletion */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete Product from Backend"
        message={`Are you sure you want to permanently delete "${product.name}"? A DELETE /api/products/${product.id} request will be sent to Spring Boot.`}
        confirmText={deleting ? 'Deleting on Backend...' : 'Confirm Delete'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Dedicated Stock Update Modal */}
      <StockUpdateModal
        isOpen={showStockModal}
        product={product}
        onClose={() => setShowStockModal(false)}
        onSuccess={fetchProduct}
      />
    </div>
  );
};

export default ProductDetails;
