import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  Boxes,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  Eye,
  Edit2,
  PackageOpen
} from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StockUpdateModal from '../components/StockUpdateModal';
import productService from '../services/productService';
import categoryService from '../services/categoryService';

export const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Parallel fetch from Spring Boot backend endpoints
      const [productsData, categoriesData] = await Promise.all([
        productService.getAllProducts({ size: 100 }).catch((e) => {
          throw new Error(`Products API error: ${e.message}`);
        }),
        categoryService.getAllCategories().catch((e) => {
          console.warn('[Dashboard] Categories API error:', e.message);
          return [];
        })
      ]);

      const productList = Array.isArray(productsData)
        ? productsData
        : Array.isArray(productsData?.content)
        ? productsData.content
        : [];

      const categoryList = Array.isArray(categoriesData)
        ? categoriesData
        : Array.isArray(categoriesData?.content)
        ? categoriesData.content
        : [];

      setProducts(productList);
      setCategories(categoryList);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data from Spring Boot.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate live statistics based on backend response
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalStockAvailable = products.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  const lowStockProducts = products.filter(
    (p) => Number(p.stock) <= Number(p.lowStockThreshold || 10) && Number(p.stock) > 0
  );
  const outOfStockProducts = products.filter((p) => Number(p.stock) === 0);

  const totalInventoryValuation = products.reduce(
    (acc, curr) => acc + (Number(curr.sellingPrice) || 0) * (Number(curr.stock) || 0),
    0
  );

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Dashboard Overview</h1>
          <p className="page-subtitle">
            Catalog metrics and inventory statistics connected directly to Spring Boot backend APIs.
          </p>
        </div>

        <div className="page-actions">
          <Link to="/inventory" className="btn btn-outline">
            <Boxes size={16} />
            <span>Inventory</span>
          </Link>
          <Link to="/products/new" className="btn btn-primary">
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner message="Querying Spring Boot dashboard APIs..." />}

      {/* Error State */}
      {!loading && error && (
        <ErrorMessage message={error} onRetry={fetchDashboardData} />
      )}

      {/* Live Content */}
      {!loading && !error && (
        <>
          {/* 1. Statistics Cards (Connected to real backend count) */}
          <div className="stat-card-grid">
            <StatCard
              title="Total Products"
              value={totalProducts}
              subtext="Active in backend database"
              icon={Package}
              variant="blue"
            />
            <StatCard
              title="Total Categories"
              value={totalCategories}
              subtext="Registered categories"
              icon={Layers}
              variant="purple"
            />
            <StatCard
              title="Stock Available"
              value={totalStockAvailable.toLocaleString('en-IN')}
              subtext="Aggregated physical units"
              icon={Boxes}
              variant="emerald"
            />
            <StatCard
              title="Low Stock Alerts"
              value={lowStockProducts.length}
              subtext={lowStockProducts.length > 0 ? "Requires replenishment" : "Inventory healthy"}
              icon={AlertTriangle}
              variant="amber"
              badgeText={lowStockProducts.length > 0 ? 'Action Needed' : 'Normal'}
            />
            <StatCard
              title="Out of Stock"
              value={outOfStockProducts.length}
              subtext="Zero inventory items"
              icon={XCircle}
              variant="rose"
              badgeText={outOfStockProducts.length > 0 ? 'Critical' : 'None'}
            />
            <StatCard
              title="Catalog Valuation"
              value={formatINR(totalInventoryValuation)}
              subtext="Calculated from selling prices"
              icon={TrendingUp}
              variant="slate"
            />
          </div>

          {/* 2. Empty State if database is empty */}
          {products.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title="No Products in Backend Database"
              description="Your database currently has no products recorded. Create products using the Add Product form or seed your Spring Boot database."
              actionText="Add First Product"
              onAction={() => window.location.assign('/products/new')}
            />
          ) : (
            /* 3. Recently Added Products Table */
            <div className="card" style={{ marginTop: '24px' }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 className="card-title">Backend Product Records</h3>
                  <span className="badge badge-neutral">{products.length} Products</span>
                </div>
                <Link to="/products" className="btn btn-outline btn-sm">
                  <span>View All Products</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Selling Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 5).map((p) => (
                      <tr key={p.id}>
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
                              <div style={{ width: 40, height: 40, borderRadius: 6, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                <PackageOpen size={18} />
                              </div>
                            )}
                            <div className="product-row-meta">
                              <Link to={`/products/${p.id}`} className="product-row-name">
                                {p.name}
                              </Link>
                              <span className="product-row-sub">{p.brand || '—'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code style={{ fontSize: '12px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                            {p.sku || p.id}
                          </code>
                        </td>
                        <td>{p.category || '—'}</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{formatINR(p.sellingPrice)}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{p.stock ?? 0} units</span>
                        </td>
                        <td>
                          {p.stock === 0 ? (
                            <span className="badge badge-out-of-stock">Out of Stock</span>
                          ) : p.stock <= (p.lowStockThreshold || 10) ? (
                            <span className="badge badge-low-stock">Low Stock</span>
                          ) : (
                            <span className="badge badge-in-stock">In Stock</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                            <Link to={`/products/${p.id}`} className="btn btn-outline btn-icon btn-sm" title="View details">
                              <Eye size={13} />
                            </Link>
                            <button
                              type="button"
                              className="btn btn-outline btn-icon btn-sm"
                              title="Update Stock"
                              onClick={() => setSelectedStockProduct(p)}
                            >
                              <Boxes size={13} color="#d97706" />
                            </button>
                            <Link to={`/products/${p.id}/edit`} className="btn btn-outline btn-icon btn-sm" title="Edit">
                              <Edit2 size={13} color="#2563eb" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Stock Update Modal */}
      <StockUpdateModal
        isOpen={!!selectedStockProduct}
        product={selectedStockProduct}
        onClose={() => setSelectedStockProduct(null)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;
