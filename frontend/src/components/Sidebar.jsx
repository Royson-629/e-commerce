
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Store
} from 'lucide-react';

const SETTINGS_STORAGE_KEY = 'ecommerce_store_settings';

const getStoreSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Failed to load store settings:', error);
    return {};
  }
};

export const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const [storeSettings, setStoreSettings] = useState(getStoreSettings);

  useEffect(() => {
    const updateStoreSettings = () => {
      setStoreSettings(getStoreSettings());
    };

    window.addEventListener('storeSettingsUpdated', updateStoreSettings);

    // Also handle changes from another browser tab
    window.addEventListener('storage', updateStoreSettings);

    return () => {
      window.removeEventListener('storeSettingsUpdated', updateStoreSettings);
      window.removeEventListener('storage', updateStoreSettings);
    };
  }, []);

  const storeName = storeSettings.storeName?.trim() || 'E-Commerce Store';
  const storeTagline =
    storeSettings.storeTagline?.trim() || 'Control Center';

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      end: true
    },
    {
      to: '/products',
      label: 'Products',
      icon: Package
    },
    {
      to: '/categories',
      label: 'Categories',
      icon: Layers
    },
    {
      to: '/inventory',
      label: 'Inventory',
      icon: Boxes
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: SettingsIcon
    }
  ];

  const handleLinkClick = () => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 39 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <NavLink
            to="/"
            className="brand-wrapper"
            onClick={handleLinkClick}
          >
            <div className="brand-logo-icon">
              <Store size={20} />
            </div>

            {!isCollapsed && (
              <div className="brand-text-block">
                <span className="brand-title" title={storeName}>
                  {storeName}
                </span>

                <span className="brand-badge">
                  {storeTagline}
                </span>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          {!isCollapsed && (
            <div className="sidebar-section-title">
              Navigation
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={19} className="sidebar-link-icon" />

                {!isCollapsed && (
                  <span style={{ flex: 1 }}>
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="admin-profile-card">
            <div className="admin-avatar">AD</div>

            {!isCollapsed && (
              <div className="admin-details">
                <span className="admin-name">
                  Administrator
                </span>

                <span className="admin-role">
                  Spring Boot Connected
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
