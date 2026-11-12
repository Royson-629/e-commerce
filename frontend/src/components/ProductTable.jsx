import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  Edit2,
  Trash2,
  Boxes,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  PackageOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import productService from '../services/productService';
import ConfirmDialog from './ConfirmDialog';
import StockUpdateModal from './StockUpdateModal';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

export const ProductTable = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useApp();

  // Component State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'All');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');

  // Modal Candidates
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [stockCandidate, setStockCandidate] = useState(null);

  // Pagination UI State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch products from Spring Boot Backend API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const queryParams = {
      page: page - 1, // Spring Boot Pageable is 0-indexed
      size: 10
    };

    if (searchInput.trim()) queryParams.search = searchInput.trim();
    if (categoryFilter !== 'All') queryParams.category = categoryFilter;
    if (statusFilter !== 'All') queryParams.status = statusFilter;

    try {
      const data = await productService.getAllProducts(queryParams);

      // Handle both raw Array or Spring Data Page object { content: [...], totalPages, totalElements }
      if (Array.isArray(data)) {
        setProducts(data);
        setTotalCount(data.length);
        setTotalPages(Math.ceil(data.length / 10) || 1);
      } else if (data?.content && Array.isArray(data.content)) {
        setProducts(data.content);
        setTotalCount(data.totalElements || data.content.length);
        setTotalPages(data.totalPages || 1);
      } else {
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch products from backend.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter, statusFilter]);

  // Handle Search Submission (ready for Spring Boot search endpoint)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  // Handle Delete Confirmation & API Call
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);

    try {
      // Send DELETE request to Spring Boot backend
      await productService.deleteProduct(deleteCandidate.id);
      showToast(`Product "${deleteCandidate.name}" deleted from backend!`, 'success');
      setDeleteCandidate(null);
      fetchProducts();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'danger');
    } finally {
      setDeleting(false);
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getStatusBadge = (status, stock) => {
    if (status === 'Out of Stock' || stock === 0) {
      return <span className="badge badge-out-of-stock">Out of Stock</span>;
    }
    if (status === 'Low Stock' || (stock !== undefined && stock <= 10)) {
      return <span className="badge badge-low-stock">Low Stock</span>;
    }
    if (status === 'Draft') {
      return <span className="badge badge-draft">Draft</span>;
    }
    return <span className="badge badge-in-stock">In Stock</span>;
  };

  return (
    <div>
      {/* Search and Filters Toolbar */}
      <div className="filter-toolbar">
        {/* Search UI & Search Button */}
        <form onSubmit={handleSearchSubmit} className="search-input-box">
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search products (queries Spring Boot API)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        <div className="filter-left-controls">
          <select
            className="select-dropdown"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <Link to="/products/new" className="btn btn-primary">
          <Plus size={16} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner message="Fetching products from Spring Boot backend..." />}

      {/* Error State */}
      {!loading && error && (
        <ErrorMessage message={error} onRetry={fetchProducts} />
      )}

      {/* Empty State when no products returned from backend */}
      {!loading && !error && products.length === 0 && (
        <EmptyState
          icon={PackageOpen}
          title="No Products Found in Database"
          description="Your Spring Boot backend returned 0 product records. Click below to add your first product."
          actionText="Add First Product"
          onAction={() => navigate('/products/new')}
        />
      )}

      {/* Product Table */}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU / ID</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Selling Price</th>
                  <th>MRP</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Date Added</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const addedDate = p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A';

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="product-row-info">
                          {p.mainImage ? (
                            <img
                              src={p.mainImage}
                              alt={p.name}
                              className="product-row-thumb"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: '8px',
                                backgroundColor: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94a3b8'
                              }}
                            >
                              <PackageOpen size={20} />
                            </div>
                          )}
                          <div className="product-row-meta">
                            <Link to={`/products/${p.id}`} className="product-row-name">
                              {p.name}
                            </Link>
                            <span className="product-row-sub">{p.subcategory || p.category}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code style={{ fontSize: '12px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                          {p.sku || p.id}
                        </code>
                      </td>
                      <td>{p.category || '—'}</td>
                      <td>{p.brand || '—'}</td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{formatINR(p.sellingPrice)}</span>
                      </td>
                      <td>
                        <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>
                          {formatINR(p.originalPrice)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{p.stock ?? 0}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 4 }}>units</span>
                      </td>
                      <td>{getStatusBadge(p.status, p.stock)}</td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{addedDate}</span>
                      </td>
                      <td>
                        <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-icon btn-sm"
                            title="View Product Details"
                            onClick={() => navigate(`/products/${p.id}`)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-icon btn-sm"
                            title="Update Stock via Backend"
                            onClick={() => setStockCandidate(p)}
                          >
                            <Boxes size={14} color="#d97706" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-icon btn-sm"
                            title="Edit Product"
                            onClick={() => navigate(`/products/${p.id}/edit`)}
                          >
                            <Edit2 size={14} color="#2563eb" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger-outline btn-icon btn-sm"
                            title="Delete Product"
                            onClick={() => setDeleteCandidate(p)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination UI */}
          <div className="pagination-wrapper">
            <span>
              Showing {products.length} of {totalCount} total products
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '12.5px', padding: '0 8px', fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        title="Delete Product from Backend"
        message={`Are you sure you want to delete "${deleteCandidate?.name}" (${deleteCandidate?.sku || deleteCandidate?.id})? A DELETE request will be sent to your Spring Boot API.`}
        confirmText={deleting ? 'Deleting on Backend...' : 'Confirm Delete'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteCandidate(null)}
      />

      {/* Stock Update Modal */}
      <StockUpdateModal
        isOpen={!!stockCandidate}
        product={stockCandidate}
        onClose={() => setStockCandidate(null)}
        onSuccess={fetchProducts}
      />
    </div>
  );
};

export default ProductTable;
