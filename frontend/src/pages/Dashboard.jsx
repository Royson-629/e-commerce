
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

import productService from '../services/productService';
import categoryService from '../services/categoryService';

export const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products and categories from Spring Boot APIs
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
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
      setError(
        err.message || 'Failed to fetch dashboard data from Spring Boot.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =====================================
  // DASHBOARD STATISTICS
  // =====================================

  const totalProducts = products.length;

  const totalCategories = categories.length;

  // Total physical units available
  const totalStockAvailable = products.reduce(
    (acc, product) =>
      acc + (Number(product.stockQuantity) || 0),
    0
  );

  // Products with stock between 1 and 10
  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.stockQuantity) || 0;
    const threshold = Number(product.lowStockThreshold) || 10;

    return stock > 0 && stock <= threshold;
  });

  // Products with zero stock
  const outOfStockProducts = products.filter(
    (product) => (Number(product.stockQuantity) || 0) === 0
  );

  // Total inventory value = Selling Price × Stock Quantity
  const totalInventoryValuation = products.reduce(
    (acc, product) =>
      acc +
      (Number(product.sellingPrice) || 0) *
      (Number(product.stockQuantity) || 0),
    0
  );

  // Format values in Indian Rupees
  const formatINR = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  // =====================================
  // DASHBOARD UI
  // =====================================

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Dashboard Overview</h1>
          <p className="page-subtitle">
            Catalog metrics and inventory statistics connected directly
            to Spring Boot backend APIs.
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
      {loading && (
        <LoadingSpinner message="Loading dashboard data..." />
      )}

      {/* Error State */}
      {!loading && error && (
        <ErrorMessage
          message={error}
          onRetry={fetchDashboardData}
        />
      )}

      {/* Dashboard Content */}
      {!loading && !error && (
        <>

          {/* Statistics Cards */}
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
              subtext={
                lowStockProducts.length > 0
                  ? 'Requires replenishment'
                  : 'Inventory healthy'
              }
              icon={AlertTriangle}
              variant="amber"
              badgeText={
                lowStockProducts.length > 0
                  ? 'Action Needed'
                  : 'Normal'
              }
            />

            <StatCard
              title="Out of Stock"
              value={outOfStockProducts.length}
              subtext="Zero inventory items"
              icon={XCircle}
              variant="rose"
              badgeText={
                outOfStockProducts.length > 0
                  ? 'Critical'
                  : 'None'
              }
            />

            <StatCard
              title="Catalog Valuation"
              value={formatINR(totalInventoryValuation)}
              subtext="Calculated from selling prices"
              icon={TrendingUp}
              variant="slate"
            />

          </div>

          {/* Empty State */}
          {products.length === 0 ? (

            <EmptyState
              icon={PackageOpen}
              title="No Products in Backend Database"
              description="Your database currently has no products recorded. Create products using the Add Product form."
              actionText="Add First Product"
              onAction={() => window.location.assign('/products/new')}
            />

          ) : (

            /* Recently Added Products Table */
            <div className="card" style={{ marginTop: '24px' }}>

              <div className="card-header">

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <h3 className="card-title">
                    Backend Product Records
                  </h3>

                  <span className="badge badge-neutral">
                    {products.length} Products
                  </span>
                </div>

                <Link
                  to="/products"
                  className="btn btn-outline btn-sm"
                >
                  <span>View All Products</span>
                  <ArrowRight size={14} />
                </Link>

              </div>

              <div
                className="table-responsive"
                style={{
                  border: 'none',
                  borderRadius: 0
                }}
              >

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Selling Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {products.slice(0, 5).map((product) => {

                      const stock =
                        Number(product.stockQuantity) || 0;

                      const threshold =
                        Number(product.lowStockThreshold) || 10;

                      return (
                        <tr key={product.id}>

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
                                    width: 40,
                                    height: 40,
                                    borderRadius: 6,
                                    backgroundColor: '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#94a3b8'
                                  }}
                                >
                                  <PackageOpen size={18} />
                                </div>
                              )}

                              <div className="product-row-meta">

                                <Link
                                  to={`/products/${product.id}`}
                                  className="product-row-name"
                                >
                                  {product.name}
                                </Link>

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
                            {product.categoryName || '—'}
                          </td>

                          {/* Selling Price */}
                          <td>
                            <span style={{ fontWeight: 600 }}>
                              {formatINR(product.sellingPrice)}
                            </span>
                          </td>

                          {/* Stock Quantity */}
                          <td>
                            <span style={{ fontWeight: 600 }}>
                              {stock} units
                            </span>
                          </td>

                          {/* Stock Status */}
                          <td>
                            {stock === 0 ? (

                              <span className="badge badge-out-of-stock">
                                Out of Stock
                              </span>

                            ) : stock <= threshold ? (

                              <span className="badge badge-low-stock">
                                Low Stock
                              </span>

                            ) : (

                              <span className="badge badge-in-stock">
                                In Stock
                              </span>

                            )}
                          </td>

                          {/* Actions */}
                          <td>
                            <div
                              className="action-buttons-group"
                              style={{ justifyContent: 'flex-end' }}
                            >

                              <Link
                                to={`/products/${product.id}`}
                                className="btn btn-outline btn-icon btn-sm"
                                title="View details"
                              >
                                <Eye size={13} />
                              </Link>

                              <Link
                                to={`/products/${product.id}/edit`}
                                className="btn btn-outline btn-icon btn-sm"
                                title="Edit product"
                              >
                                <Edit2
                                  size={13}
                                  color="#2563eb"
                                />
                              </Link>

                            </div>
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>
                </table>

              </div>
            </div>

          )}

        </>
      )}

    </div>
  );
};

export default Dashboard;
