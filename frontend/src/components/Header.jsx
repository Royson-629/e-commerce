import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Plus, Radio } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export const Header = ({ setMobileOpen }) => {
  const navigate = useNavigate();
  const [headerSearch, setHeaderSearch] = useState('');

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(headerSearch.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        {/* Global Search Bar (ready for backend) */}
        <form onSubmit={handleHeaderSearch} className="header-search-bar">
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search products by name or SKU..."
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
          />
          <button type="submit" style={{ display: 'none' }}>Search</button>
          <span className="search-shortcut">↵</span>
        </form>
      </div>

      <div className="header-right">
        {/* Backend Target Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#64748b',
            padding: '4px 10px',
            backgroundColor: '#f1f5f9',
            borderRadius: '9999px'
          }}
          title={`Configured Backend: ${API_BASE_URL}`}
        >
          <Radio size={12} color="#059669" />
          <span>API: <code>{API_BASE_URL}</code></span>
        </div>

        {/* Quick Add Product Button */}
        <Link to="/products/new" className="btn btn-primary btn-sm">
          <Plus size={15} />
          <span>Add Product</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
