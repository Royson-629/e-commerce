import React, { useState } from 'react';
import {
  Store,
  Mail,
  IndianRupee,
  Save,
  Radio,
  RotateCcw
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../services/api';

const SETTINGS_STORAGE_KEY = 'ecommerce_store_settings';

const DEFAULT_SETTINGS = {
  storeName: 'E-Commerce Store',
  storeTagline: 'Administration Portal',
  storeDescription:
    'Centralized administration dashboard communicating with Spring Boot REST APIs.',

  contactEmail: 'admin@store.com',
  contactPhone: '+91 98765 43210',

  addressLine1: 'Main Business Boulevard',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560001',
  country: 'India',

  currency: 'INR',
  currencySymbol: '₹',

  defaultTaxRate: '18',
  gstin: '29AAAAA0000A1Z5',
  panNumber: 'AAAAA0000A',

  backendApiUrl: API_BASE_URL
};

const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);

      return {
        ...DEFAULT_SETTINGS,
        ...parsedSettings,
        backendApiUrl: API_BASE_URL
      };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  return DEFAULT_SETTINGS;
};

export const Settings = () => {
  const { showToast } = useApp();

  const [formState, setFormState] = useState(loadSettings);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      const settingsToSave = {
        ...formState
      };

      delete settingsToSave.backendApiUrl;

      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(settingsToSave)
      );

      // Notify the Sidebar that store settings have changed
      window.dispatchEvent(new Event('storeSettingsUpdated'));

      showToast('Store settings saved successfully!', 'success');
    } catch (error) {
      console.error('Settings save error:', error);

      showToast(
        'Unable to save settings. Please check browser storage.',
        'danger'
      );
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all settings to their default values?'
    );

    if (!confirmed) return;

    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);

      setFormState({ ...DEFAULT_SETTINGS });

      // Notify the Sidebar that settings have been reset
      window.dispatchEvent(new Event('storeSettingsUpdated'));

      showToast('Settings restored to default values!', 'success');
    } catch (error) {
      console.error('Settings reset error:', error);

      showToast('Unable to reset settings.', 'danger');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Store Settings</h1>
          <p className="page-subtitle">
            Configure store metadata, currency standards, and backend
            integration settings.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '960px' }}>
        {/* Backend Connection */}
        <div className="form-section">
          <div className="form-section-title">
            <Radio size={18} color="#2563eb" />
            <span>Backend API Connection</span>
          </div>

          <p className="form-section-desc">
            Configured through your frontend environment variables.
          </p>

          <div className="form-group">
            <label className="form-label">
              Spring Boot API Base URL
            </label>

            <input
              type="text"
              className="form-input"
              value={formState.backendApiUrl}
              disabled
              style={{
                backgroundColor: '#f8fafc',
                color: '#334155',
                fontWeight: 600
              }}
            />

            <span
              style={{
                fontSize: '12px',
                color: '#64748b',
                marginTop: '4px'
              }}
            >
              To modify this URL, edit VITE_API_BASE_URL in your .env file.
            </span>
          </div>
        </div>

        {/* Store Profile */}
        <div className="form-section">
          <div className="form-section-title">
            <Store size={18} color="#2563eb" />
            <span>Store Profile</span>
          </div>

          <p className="form-section-desc">
            Store identity information.
          </p>

          <div
            className="form-grid-2"
            style={{ marginBottom: '16px' }}
          >
            <div className="form-group">
              <label className="form-label">
                Store Legal Name
              </label>

              <input
                type="text"
                name="storeName"
                className="form-input"
                value={formState.storeName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Store Tagline
              </label>

              <input
                type="text"
                name="storeTagline"
                className="form-input"
                value={formState.storeTagline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Store Description
            </label>

            <textarea
              name="storeDescription"
              className="form-textarea"
              rows="3"
              value={formState.storeDescription}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <div className="form-section-title">
            <Mail size={18} color="#059669" />
            <span>Contact & Address</span>
          </div>

          <div
            className="form-grid-2"
            style={{ marginBottom: '16px' }}
          >
            <div className="form-group">
              <label className="form-label">
                Contact Email
              </label>

              <input
                type="email"
                name="contactEmail"
                className="form-input"
                value={formState.contactEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Contact Phone
              </label>

              <input
                type="text"
                name="contactPhone"
                className="form-input"
                value={formState.contactPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Address
            </label>

            <input
              type="text"
              name="addressLine1"
              className="form-input"
              value={formState.addressLine1}
              onChange={handleChange}
            />
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">
                City
              </label>

              <input
                type="text"
                name="city"
                className="form-input"
                value={formState.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                State
              </label>

              <input
                type="text"
                name="state"
                className="form-input"
                value={formState.state}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Postal Code
              </label>

              <input
                type="text"
                name="postalCode"
                className="form-input"
                value={formState.postalCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Country
            </label>

            <input
              type="text"
              name="country"
              className="form-input"
              value={formState.country}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Currency and GST */}
        <div className="form-section">
          <div className="form-section-title">
            <IndianRupee size={18} color="#d97706" />
            <span>Currency & GST Settings</span>
          </div>

          <div
            className="form-grid-3"
            style={{ marginBottom: '16px' }}
          >
            <div className="form-group">
              <label className="form-label">
                Currency
              </label>

              <input
                type="text"
                className="form-input"
                value="INR (₹)"
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Default GST Slab (%)
              </label>

              <select
                name="defaultTaxRate"
                className="form-select"
                value={formState.defaultTaxRate}
                onChange={handleChange}
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                GSTIN
              </label>

              <input
                type="text"
                name="gstin"
                className="form-input"
                value={formState.gstin}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              PAN Number
            </label>

            <input
              type="text"
              name="panNumber"
              className="form-input"
              value={formState.panNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Save and Reset Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginBottom: '40px'
          }}
        >
          <button
            type="button"
            className="btn btn-outline btn-lg"
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
          >
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;