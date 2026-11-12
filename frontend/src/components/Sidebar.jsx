import React from 'react';
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

export const Sidebar = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
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

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <NavLink to="/" className="brand-wrapper" onClick={handleLinkClick}>
            <div className="brand-logo-icon">
              <Store size={20} />
            </div>
            {!isCollapsed && (
              <div className="brand-text-block">
                <span className="brand-title">E-Commerce Admin</span>
                <span className="brand-badge">Control Center</span>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          {!isCollapsed && <div className="sidebar-section-title">Navigation</div>}

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
                  <span style={{ flex: 1 }}>{item.label}</span>
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
                <span className="admin-name">Administrator</span>
                <span className="admin-role">Spring Boot Connected</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
