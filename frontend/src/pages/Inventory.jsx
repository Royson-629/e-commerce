import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  PackageOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import inventoryService from '../services/inventoryService';
import productService from '../services/productService';
import StockUpdateModal from '../components/StockUpdateModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export const Inventory = () => {
  const { showToast } = useApp();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);

  // Fetch Inventory from Spring Boot API
  const fetchInventory = async () => {
    setLoading(true);
    setError(null);

    try {
      // First try dedicated inventory endpoint GET /api/inventory, fallback to products
      let data;
      try {
        data = await inventoryService.getInventory();
      } catch (e) {
        // Fallback to GET /api/products if /api/inventory is not a separate controller
        data = await productService.getAllProducts({ size: 100 });
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : [];
      setItems(list);
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory from Spring Boot backend.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Quick increment / decrement calling Spring Boot API
  const handleQuickAdjust = async (product, delta) => {
    const currentStock = Number(product.stock) || 0;
    const targetStock = Math.max(0, currentStock + delta);

    try {
      await inventoryService.updateStock(product.id, {
        stock: targetStock,
        adjustmentMode: delta > 0 ? 'add' : 'deduct',
        quantityDelta: delta,
        reason: delta > 0 ? 'Quick +1 increment via Admin' : 'Quick -1 deduction via Admin'
      });
      showToast(`Updated stock on backend for "${product.name}" to ${targetStock}!`, 'success');
      fetchInventory();
    } catch (err) {
      showToast(`Stock update failed: ${err.message}`, 'danger');
    }
  };

  // Metrics from real backend data
  const totalUnits = items.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  const lowStockCount = items.filter(
    (p) => Number(p.stock) <= Number(p.lowStockThreshold || 10) && Number(p.stock) > 0
  ).length;
  const outOfStockCount = items.filter((p) => Number(p.stock) === 0).length;
  const inStockCount = items.length - lowStockCount - outOfStockCount;

  // Filter items
  const filteredItems = items.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      p.name?.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term);

    const thresh = p.lowStockThreshold || 10;
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'In Stock' && p.stock > thresh) ||
      (statusFilter === 'Low Stock' && p.stock <= thresh && p.stock > 0) ||
      (statusFilter === 'Out of Stock' && p.stock === 0);

    return matchSearch && matchStatus;
  });

  const getStockStatusPill = (stock, threshold = 10) => {
    if (stock === 0) {
      return (
        <span className="badge badge-out-of-stock" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <XCircle size={12} /> Out of Stock
        </span>
      );
    }
    if (stock <= threshold) {
      return (
        <span className="badge badge-low-stock" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={12} /> Low Stock
        </span>
      );
    }
    return (
      <span className="badge badge-in-stock" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <CheckCircle2 size={12} /> In Stock
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
            Real-time stock controls communicating with Spring Boot <code>/api/inventory</code>.
          </p>
        </div>
      </div>

      {/* Summary Stat Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div className="card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>Total Physical Units</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
            {totalUnits.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Across {items.length} SKUs in database</span>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>Normal In-Stock</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
            {inStockCount}
          </div>
          <span style={{ fontSize: '11.5px', color: '#059669' }}>Healthy inventory buffer</span>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>Low Stock Warning</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706', marginTop: '2px' }}>
            {lowStockCount}
          </div>
          <span style={{ fontSize: '11.5px', color: '#d97706' }}>Below minimum threshold</span>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>Out of Stock</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626', marginTop: '2px' }}>
            {outOfStockCount}
          </div>
          <span style={{ fontSize: '11.5px', color: '#dc2626' }}>Zero units available</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="filter-toolbar">
        {/* Search UI */}
        <div className="search-input-box" style={{ maxWidth: '340px' }}>
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
            <option value="All">All Statuses ({items.length})</option>
            <option value="In Stock">In Stock ({inStockCount})</option>
            <option value="Low Stock">Low Stock Alert ({lowStockCount})</option>
            <option value="Out of Stock">Out of Stock ({outOfStockCount})</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner message="Fetching inventory data from Spring Boot..." />}

      {/* Error State */}
      {!loading && error && (
        <ErrorMessage message={error} onRetry={fetchInventory} />
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={Boxes}
          title="No Inventory Records in Database"
          description="Your backend database has no inventory items recorded yet. Add products to populate inventory."
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
                <th style={{ textAlign: 'right' }}>Stock Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((p) => {
                const stock = Number(p.stock) || 0;
                const thresh = Number(p.lowStockThreshold || 10);
                const isLow = stock <= thresh && stock > 0;
                const isOut = stock === 0;

                return (
                  <tr
                    key={p.id}
                    style={{
                      backgroundColor: isOut ? '#fffcfc' : isLow ? '#fffdf7' : 'inherit'
                    }}
                  >
                    <td>
                      <div className="product-row-info">
                        {p.mainImage ? (
                          <img
                            src={p.mainImage}
                            alt={p.name}
                            className="product-row-thumb"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <Boxes size={20} />
                          </div>
                        )}
                        <div className="product-row-meta">
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</span>
                          <span className="product-row-sub">{p.brand || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '12px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {p.sku || p.id}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: '#475569' }}>{p.category || '—'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                        {p.warehouse || 'Central Facility'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: isOut ? '#dc2626' : isLow ? '#d97706' : '#0f172a'
                          }}
                        >
                          {stock}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>units</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                        {thresh} units
                      </span>
                    </td>
                    <td>{getStockStatusPill(stock, thresh)}</td>
                    <td>
                      <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                        {/* Quick -1 button */}
                        <button
                          type="button"
                          className="btn btn-outline btn-icon btn-sm"
                          title="Reduce stock by 1 via backend API"
                          disabled={stock === 0}
                          onClick={() => handleQuickAdjust(p, -1)}
                        >
                          <Minus size={13} />
                        </button>

                        {/* Quick +1 button */}
                        <button
                          type="button"
                          className="btn btn-outline btn-icon btn-sm"
                          title="Increase stock by 1 via backend API"
                          onClick={() => handleQuickAdjust(p, 1)}
                        >
                          <Plus size={13} />
                        </button>

                        {/* Dedicated Stock Update Modal */}
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedProductForModal(p)}
                          title="Open stock update dialog"
                        >
                          <Boxes size={14} />
                          <span>Update</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Update Modal */}
      <StockUpdateModal
        isOpen={!!selectedProductForModal}
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onSuccess={fetchInventory}
      />
    </div>
  );
};

export default Inventory;
