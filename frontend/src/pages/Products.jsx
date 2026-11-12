import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductTable from '../components/ProductTable';

export const Products = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Product Management</h1>
          <p className="page-subtitle">
            Manage your catalog through Spring Boot REST APIs.
          </p>
        </div>

        <div className="page-actions">
          <Link to="/products/new" className="btn btn-primary">
            <Plus size={16} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Main Product Table Component */}
      <ProductTable />
    </div>
  );
};

export default Products;
