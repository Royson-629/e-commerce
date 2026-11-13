
import React from 'react';
import {
  Menu,
  Bell,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';

export const Header = ({ setMobileOpen }) => {
  const location = useLocation();

  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  const pageNames = {
    '/': 'Dashboard',
    '/products': 'Products',
    '/categories': 'Categories',
    '/inventory': 'Inventory',
    '/settings': 'Settings'
  };

  const pageName =
    pageNames[location.pathname] ||
    (location.pathname.endsWith('/edit')
      ? 'Edit Product'
      : location.pathname.endsWith('/new')
      ? 'Add Product'
      : 'Product Details');

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={21} />
        </button>

        <div className="header-brand">
          <div className="header-brand-icon">
            <Sparkles size={17} />
          </div>

          <div className="header-page-info">
            <div className="header-page-title">{pageName}</div>
            <div className="header-breadcrumb">
              Workspace / {pageName}
            </div>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-date">
          <CalendarDays size={15} />
          <span>{today}</span>
        </div>

        <div
          className="header-api-status"
          title={`Configured API: ${API_BASE_URL}`}
        >
          <span className="header-api-dot" />
          API
        </div>

        <button
          type="button"
          className="header-notification"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={17} />
        </button>

        <div className="header-profile" title="Administrator">
          AD
        </div>
      </div>
    </header>
  );
};

export default Header;
