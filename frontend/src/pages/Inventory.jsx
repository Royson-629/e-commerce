
import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  AlertTriangle,
  XCircle,
  CheckCircle2
} from 'lucide-react';

import productService from '../services/productService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export const Inventory = () => {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch products from Spring Boot
  const fetchInventory = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await productService.getAllProducts({ size: 100 });

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : [];

      setItems(list);

    } catch (err) {
      setError(
        err.message || 'Failed to fetch inventory from Spring Boot backend.'
      );

      setItems([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Calculate inventory metrics from product data
  const totalUnits = items.reduce(
    (acc, product) => acc + (Number(product.stockQuantity) || 0),
    0
  );

  const lowStockCount = items.filter((product) => {
    const stock = Number(product.stockQuantity) || 0;
    const threshold = Number(product.lowStockThreshold) || 10;

    return stock > 0 && stock <= threshold;
  }).length;

  const outOfStockCount = items.filter(
    (product) => (Number(product.stockQuantity) || 0) === 0
  ).length;

  const inStockCount =
    items.length - lowStockCount - outOfStockCount;

  // Filter inventory
  const filteredItems = items.filter((product) => {

    const term = searchTerm.toLowerCase();

    const stock = Number(product.stockQuantity) || 0;
    const threshold = Number(product.lowStockThreshold) || 10;

    const matchSearch =
      !term ||
      product.name?.toLowerCase().includes(term) ||
      product.sku?.toLowerCase().includes(term) ||
      product.categoryName?.toLowerCase().includes(term);

    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'In Stock' && stock > threshold) ||
      (statusFilter === 'Low Stock' && stock > 0 && stock <= threshold) ||
      (statusFilter === 'Out of Stock' && stock === 0);

    return matchSearch && matchStatus;
  });

  // Stock status badge
  const getStockStatusPill = (stock, threshold = 10) => {

    if (stock === 0) {
      return (
        <span
          className="badge badge-out-of-stock"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <XCircle size={12} />
          Out of Stock
        </span>
      );
    }

    if (stock <= threshold) {
      return (
        <span
          className="badge badge-low-stock"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <AlertTriangle size={12} />
          Low Stock
        </span>
      );
    }

    return (
      <span
        className="badge badge-in-stock"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <CheckCircle2 size={12} />
        In Stock
      </span>
    );
  };

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Inventory Management</h1>

          <p className="page-subtitle">
            View and monitor product stock levels from your Spring Boot backend.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >

        {/* Total Physical Units */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            Total Physical Units
          </span>

          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#0f172a',
              marginTop: '2px'
            }}
          >
            {totalUnits.toLocaleString('en-IN')}
          </div>

          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
            Across {items.length} SKUs in database
          </span>
        </div>

        {/* Normal In Stock */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            Normal In-Stock
          </span>

          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#059669',
              marginTop: '2px'
            }}
          >
            {inStockCount}
          </div>

          <span style={{ fontSize: '11.5px', color: '#059669' }}>
            Healthy inventory buffer
          </span>
        </div>

        {/* Low Stock */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            Low Stock Warning
          </span>

          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#d97706',
              marginTop: '2px'
            }}
          >
            {lowStockCount}
          </div>

          <span style={{ fontSize: '11.5px', color: '#d97706' }}>
            Below minimum threshold
          </span>
        </div>

        {/* Out of Stock */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            Out of Stock
          </span>

          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#dc2626',
              marginTop: '2px'
            }}
          >
            {outOfStockCount}
          </div>

          <span style={{ fontSize: '11.5px', color: '#dc2626' }}>
            Zero units available
          </span>
        </div>

      </div>

      {/* Search and Filter */}
      <div className="filter-toolbar">

        <div
          className="search-input-box"
          style={{ maxWidth: '340px' }}
        >
          <Search size={16} color="#94a3b8" />

          <input
            type="text"
            placeholder="Search SKU or item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-left-controls">
          <select
            className="select-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">
              All Statuses ({items.length})
            </option>

            <option value="In Stock">
              In Stock ({inStockCount})
            </option>

            <option value="Low Stock">
              Low Stock Alert ({lowStockCount})
            </option>

            <option value="Out of Stock">
              Out of Stock ({outOfStockCount})
            </option>
          </select>
        </div>

      </div>

      {/* Loading */}
      {loading && (
        <LoadingSpinner message="Fetching product stock data..." />
      )}

      {/* Error */}
      {!loading && error && (
        <ErrorMessage
          message={error}
          onRetry={fetchInventory}
        />
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={Boxes}
          title="No Inventory Records"
          description="Add products to populate your inventory."
          actionText="Add Product"
          onAction={() => window.location.assign('/products/new')}
        />
      )}

      {/* Inventory Table */}
      {!loading && !error && items.length > 0 && (
        <div className="table-responsive">

          <table className="admin-table">

            <thead>
              <tr>
                <th>Product Details</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Storage Warehouse</th>
                <th>Available Stock</th>
                <th>Threshold</th>
                <th>Stock Status</th>
              </tr>
            </thead>

            <tbody>

              {filteredItems.map((product) => {

                const stock = Number(product.stockQuantity) || 0;

                const threshold =
                  Number(product.lowStockThreshold) || 10;

                const isLow = stock > 0 && stock <= threshold;
                const isOut = stock === 0;

                return (
                  <tr
                    key={product.id}
                    style={{
                      backgroundColor: isOut
                        ? '#fffcfc'
                        : isLow
                          ? '#fffdf7'
                          : 'inherit'
                    }}
                  >

                    {/* Product Details */}
                    <td>
                      <div className="product-row-info">

                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
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
                              borderRadius: 8,
                              backgroundColor: '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#94a3b8'
                            }}
                          >
                            <Boxes size={20} />
                          </div>
                        )}

                        <div className="product-row-meta">
                          <span
                            style={{
                              fontWeight: 600,
                              color: '#0f172a'
                            }}
                          >
                            {product.name}
                          </span>

                          <span className="product-row-sub">
                            {product.brand || '—'}
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
                        {product.sku || product.id}
                      </code>
                    </td>

                    {/* Category */}
                    <td>
                      <span
                        style={{
                          fontSize: '13px',
                          color: '#475569'
                        }}
                      >
                        {product.categoryName || '—'}
                      </span>
                    </td>

                    {/* Warehouse */}
                    <td>
                      <span
                        style={{
                          fontSize: '12.5px',
                          color: '#64748b'
                        }}
                      >
                        {product.warehouse || 'Central Facility'}
                      </span>
                    </td>

                    {/* Available Stock */}
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: isOut
                              ? '#dc2626'
                              : isLow
                                ? '#d97706'
                                : '#0f172a'
                          }}
                        >
                          {stock}
                        </span>

                        <span
                          style={{
                            fontSize: '12px',
                            color: '#94a3b8'
                          }}
                        >
                          units
                        </span>
                      </div>
                    </td>

                    {/* Threshold */}
                    <td>
                      <span
                        style={{
                          fontSize: '13px',
                          color: '#64748b',
                          fontWeight: 500
                        }}
                      >
                        {threshold} units
                      </span>
                    </td>

                    {/* Stock Status */}
                    <td>
                      {getStockStatusPill(stock, threshold)}
                    </td>

                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                    No products match your search or selected filter.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default Inventory;
