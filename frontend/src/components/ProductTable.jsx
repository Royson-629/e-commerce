
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import categoryService from '../services/categoryService';

import ConfirmDialog from './ConfirmDialog';
import StockUpdateModal from './StockUpdateModal';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

export const ProductTable = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [stockCandidate, setStockCandidate] = useState(null);

  // Validate product ID before navigation
  const openProduct = (product, action = 'view') => {
    const id = product?.id;

    if (id === undefined || id === null || String(id).trim() === '') {
      showToast(
        'Cannot open product: backend did not provide a valid product ID.',
        'danger'
      );
      return;
    }

    if (action === 'edit') {
      navigate(`/products/${id}/edit`);
    } else {
      navigate(`/products/${id}`);
    }
  };

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let data;

      if (appliedSearch.trim()) {
        data = await productService.searchProducts(appliedSearch.trim());
      } else {
        data = await productService.getAllProducts();
      }

      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : [];

      setProducts(productList);

    } catch (err) {
      setError(err.message || 'Failed to fetch products.');
      setProducts([]);

    } finally {
      setLoading(false);
    }
  }, [appliedSearch]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();

      const categoryList = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : [];

      setCategories(categoryList);

    } catch (err) {
      console.error('Category fetching error:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput.trim());
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
  };

  // Stock status
  const getStockStatus = (product) => {
    const stock = Number(product.stockQuantity) || 0;
    const threshold = Number(product.lowStockThreshold) || 10;

    if (stock === 0) return 'OUT_OF_STOCK';
    if (stock <= threshold) return 'LOW_STOCK';

    return 'IN_STOCK';
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      categoryFilter === 'All' ||
      String(product.categoryId) === categoryFilter;

    let matchesStatus = true;

    if (statusFilter === 'ACTIVE' || statusFilter === 'INACTIVE') {
      matchesStatus =
        String(product.status || '').toUpperCase() === statusFilter;
    } else if (statusFilter === 'IN_STOCK') {
      matchesStatus = getStockStatus(product) === 'IN_STOCK';
    } else if (statusFilter === 'LOW_STOCK') {
      matchesStatus = getStockStatus(product) === 'LOW_STOCK';
    } else if (statusFilter === 'OUT_OF_STOCK') {
      matchesStatus = getStockStatus(product) === 'OUT_OF_STOCK';
    }

    return matchesCategory && matchesStatus;
  });

  // Pagination
  const totalCount = filteredProducts.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Currency formatting
  const formatINR = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  };

  // Status badge
  const getStatusBadge = (product) => {
    const status = String(product.status || '').toUpperCase();
    const stockStatus = getStockStatus(product);

    if (stockStatus === 'OUT_OF_STOCK') {
      return <span className="badge badge-out-of-stock">Out of Stock</span>;
    }

    if (stockStatus === 'LOW_STOCK') {
      return <span className="badge badge-low-stock">Low Stock</span>;
    }

    if (status === 'INACTIVE') {
      return <span className="badge badge-draft">Inactive</span>;
    }

    return <span className="badge badge-in-stock">Active</span>;
  };

  // Delete product
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;

    if (
      deleteCandidate.id === undefined ||
      deleteCandidate.id === null ||
      String(deleteCandidate.id).trim() === ''
    ) {
      showToast('Invalid product ID. Cannot delete product.', 'danger');
      return;
    }

    setDeleting(true);

    try {
      await productService.deleteProduct(deleteCandidate.id);

      showToast(
        `Product "${deleteCandidate.name}" deleted successfully!`,
        'success'
      );

      setDeleteCandidate(null);
      await fetchProducts();

    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'danger');

    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>

      {/* Search and Filters */}
      <div className="filter-toolbar">

        <form
          onSubmit={handleSearchSubmit}
          className="search-input-box"
        >
          <Search size={16} color="#94a3b8" />

          <input
            type="text"
            placeholder="Search by product name, SKU or brand..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          {searchInput && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleClearSearch}
            >
              Clear
            </button>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-sm"
          >
            Search
          </button>
        </form>

        <div className="filter-left-controls">

          <select
            className="select-dropdown"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Categories</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={String(category.id)}
              >
                {category.name}
              </option>
            ))}
          </select>

          <select
            className="select-dropdown"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>

        </div>

        <Link
          to="/products/new"
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </Link>

      </div>

      {/* Loading */}
      {loading && (
        <LoadingSpinner message="Fetching products..." />
      )}

      {/* Error */}
      {!loading && error && (
        <ErrorMessage
          message={error}
          onRetry={fetchProducts}
        />
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <EmptyState
          icon={PackageOpen}
          title={
            products.length === 0
              ? 'No Products Found'
              : 'No Matching Products'
          }
          description={
            products.length === 0
              ? 'Your database currently has no products.'
              : 'Try changing your search or filter selections.'
          }
          actionText={
            products.length === 0
              ? 'Add First Product'
              : 'Clear Filters'
          }
          onAction={() => {
            if (products.length === 0) {
              navigate('/products/new');
            } else {
              handleClearSearch();
              setCategoryFilter('All');
              setStatusFilter('All');
            }
          }}
        />
      )}

      {/* Product Table */}
      {!loading && !error && paginatedProducts.length > 0 && (
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
                {paginatedProducts.map((product, index) => {
                  const addedDate = product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString(
                        'en-IN',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }
                      )
                    : 'N/A';

                  const hasValidId =
                    product.id !== undefined &&
                    product.id !== null &&
                    String(product.id).trim() !== '';

                  return (
                    <tr key={hasValidId ? product.id : `invalid-${index}`}>

                      {/* Product */}
                      <td>
                        <div className="product-row-info">

                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="product-row-thumb"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
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
                            {hasValidId ? (
                              <Link
                                to={`/products/${product.id}`}
                                className="product-row-name"
                              >
                                {product.name}
                              </Link>
                            ) : (
                              <span className="product-row-name">
                                {product.name}
                              </span>
                            )}

                            <span className="product-row-sub">
                              {product.categoryName || '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td>
                        <code
                          style={{
                            fontSize: '12px',
                            background: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {product.sku || product.id || 'Missing ID'}
                        </code>
                      </td>

                      <td>{product.categoryName || '—'}</td>
                      <td>{product.brand || '—'}</td>

                      <td>
                        <span style={{ fontWeight: 700 }}>
                          {formatINR(product.sellingPrice)}
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            textDecoration: 'line-through',
                            color: '#94a3b8',
                            fontSize: '12px'
                          }}
                        >
                          {formatINR(product.originalPrice)}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {Number(product.stockQuantity) || 0}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#94a3b8',
                            marginLeft: 4
                          }}
                        >
                          units
                        </span>
                      </td>

                      <td>{getStatusBadge(product)}</td>

                      <td>
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#64748b'
                          }}
                        >
                          {addedDate}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div
                          className="action-buttons-group"
                          style={{ justifyContent: 'flex-end' }}
                        >

                          <button
                            type="button"
                            className="btn btn-outline btn-icon btn-sm"
                            title="View Product Details"
                            disabled={!hasValidId}
                            onClick={() => openProduct(product, 'view')}
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline btn-icon btn-sm"
                            title="Update Stock"
                            onClick={() => setStockCandidate(product)}
                          >
                            <Boxes size={14} color="#d97706" />
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline btn-icon btn-sm"
                            title="Edit Product"
                            disabled={!hasValidId}
                            onClick={() => openProduct(product, 'edit')}
                          >
                            <Edit2 size={14} color="#2563eb" />
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger-outline btn-icon btn-sm"
                            title="Delete Product"
                            disabled={!hasValidId}
                            onClick={() => setDeleteCandidate(product)}
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

          {/* Pagination */}
          <div className="pagination-wrapper">
            <span>
              Showing {paginatedProducts.length} of {totalCount} products
            </span>

            <div className="pagination-controls">

              <button
                type="button"
                className="page-btn"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft size={16} />
              </button>

              <span
                style={{
                  fontSize: '12.5px',
                  padding: '0 8px',
                  fontWeight: 600
                }}
              >
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                className="page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                <ChevronRight size={16} />
              </button>

            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteCandidate?.name}" (${deleteCandidate?.sku || deleteCandidate?.id})?`}
        confirmText={deleting ? 'Deleting...' : 'Confirm Delete'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteCandidate(null)}
      />

      {/* Stock Update */}
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
