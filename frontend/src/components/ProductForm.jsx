import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  Plus,
  Trash2,
  DollarSign,
  Boxes,
  Image as ImageIcon,
  ShieldCheck,
  FileText,
  Loader2
} from 'lucide-react';
import ImageUploader from './ImageUploader';
import categoryService from '../services/categoryService';

export const ProductForm = ({ initialData, onSubmit, isEdit = false, submitting = false }) => {
  const navigate = useNavigate();

  // Categories fetched from Spring Boot API for dropdown
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: '',
    category: '',
    categoryId: '',
    subcategory: '',
    description: '',
    sellingPrice: '',
    originalPrice: '',
    discount: '',
    taxRate: '18',
    stock: '',
    lowStockThreshold: '10',
    status: 'In Stock',
    warehouse: '',
    mainImage: '',
    additionalImages: [],
    weight: '',
    dimensions: '',
    manufacturer: '',
    warranty: '',
    specifications: [
      { key: '', value: '' }
    ]
  });

  // Track raw files for backend multipart upload
  const [mainImageFile, setMainImageFile] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);

  const [errors, setErrors] = useState({});

  // Fetch categories from backend for category select dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await categoryService.getAllCategories();
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data?.content && Array.isArray(data.content)) {
          setCategories(data.content);
        }
      } catch (err) {
        // Backend categories not seeded yet, fallback to manual input or empty list
        console.info('[ProductForm] Category API not reachable or empty. Category can be entered manually.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Populate data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        brand: initialData.brand || '',
        category: initialData.category || '',
        categoryId: initialData.categoryId || '',
        subcategory: initialData.subcategory || '',
        description: initialData.description || '',
        sellingPrice: initialData.sellingPrice !== undefined ? initialData.sellingPrice.toString() : '',
        originalPrice: initialData.originalPrice !== undefined ? initialData.originalPrice.toString() : '',
        discount: initialData.discount !== undefined ? initialData.discount.toString() : '',
        taxRate: initialData.taxRate !== undefined ? initialData.taxRate.toString() : '18',
        stock: initialData.stock !== undefined ? initialData.stock.toString() : '',
        lowStockThreshold: initialData.lowStockThreshold !== undefined ? initialData.lowStockThreshold.toString() : '10',
        status: initialData.status || 'In Stock',
        warehouse: initialData.warehouse || '',
        mainImage: initialData.mainImage || '',
        additionalImages: initialData.additionalImages || [],
        weight: initialData.weight || '',
        dimensions: initialData.dimensions || '',
        manufacturer: initialData.manufacturer || '',
        warranty: initialData.warranty || '',
        specifications: initialData.specifications?.length
          ? initialData.specifications
          : [{ key: '', value: '' }]
      });
    }
  }, [initialData]);

  // Handle category selection
  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    const catObj = categories.find((c) => c.name === selected || c.id === selected);
    setFormData((prev) => ({
      ...prev,
      category: catObj ? catObj.name : selected,
      categoryId: catObj ? catObj.id : ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-compute discount % if originalPrice & sellingPrice exist
      if (name === 'sellingPrice' || name === 'originalPrice') {
        const sell = Number(name === 'sellingPrice' ? value : prev.sellingPrice);
        const orig = Number(name === 'originalPrice' ? value : prev.originalPrice);
        if (orig > 0 && sell > 0 && orig >= sell) {
          updated.discount = Math.round(((orig - sell) / orig) * 100).toString();
        }
      }

      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Specification Key-Value handlers
  const handleSpecChange = (index, field, value) => {
    const updated = [...formData.specifications];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, specifications: updated }));
  };

  const handleAddSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
  };

  const handleRemoveSpec = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = 'Product name is required';
    if (!formData.sku?.trim()) errs.sku = 'SKU / ID is required';
    if (!formData.brand?.trim()) errs.brand = 'Brand is required';
    if (!formData.category?.trim()) errs.category = 'Category is required';
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) {
      errs.sellingPrice = 'Enter a valid selling price';
    }
    if (formData.stock === '' || Number(formData.stock) < 0) {
      errs.stock = 'Stock cannot be empty or negative';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Format clean payload for Spring Boot backend
    const payload = {
      ...formData,
      sellingPrice: Number(formData.sellingPrice),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.sellingPrice),
      discount: formData.discount ? Number(formData.discount) : 0,
      taxRate: Number(formData.taxRate) || 18,
      stock: Number(formData.stock),
      lowStockThreshold: Number(formData.lowStockThreshold) || 10,
      specifications: formData.specifications.filter((s) => s.key?.trim() && s.value?.trim())
    };

    onSubmit(payload, { mainImageFile, additionalImageFiles });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* 1. Basic Information */}
      <div className="form-section">
        <div className="form-section-title">
          <FileText size={18} color="#2563eb" />
          <span>Basic Information</span>
        </div>
        <p className="form-section-desc">
          Core product details sent to Spring Boot <code>/api/products</code>.
        </p>

        <div className="form-grid-2" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">
              Product Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              value={formData.name}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.name && <span className="form-error-msg">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Product SKU / ID <span className="required">*</span>
            </label>
            <input
              type="text"
              name="sku"
              className={`form-input ${errors.sku ? 'error' : ''}`}
              placeholder="e.g. PRD-HEADPHONE-001"
              value={formData.sku}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.sku && <span className="form-error-msg">{errors.sku}</span>}
          </div>
        </div>

        <div className="form-grid-3" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">
              Brand <span className="required">*</span>
            </label>
            <input
              type="text"
              name="brand"
              className={`form-input ${errors.brand ? 'error' : ''}`}
              placeholder="e.g. Sony, Apple, Samsung"
              value={formData.brand}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.brand && <span className="form-error-msg">{errors.brand}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Category <span className="required">*</span>
            </label>
            {categories.length > 0 ? (
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleCategoryChange}
                disabled={submitting}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="category"
                className={`form-input ${errors.category ? 'error' : ''}`}
                placeholder="Enter Category (e.g. Electronics)"
                value={formData.category}
                onChange={handleChange}
                disabled={submitting}
              />
            )}
            {errors.category && <span className="form-error-msg">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Subcategory</label>
            <input
              type="text"
              name="subcategory"
              className="form-input"
              placeholder="e.g. Over-Ear Headphones"
              value={formData.subcategory}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Product Description</label>
          <textarea
            name="description"
            className="form-textarea"
            rows="4"
            placeholder="Comprehensive description of materials, capabilities, features..."
            value={formData.description}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>
      </div>

      {/* 2. Pricing Information */}
      <div className="form-section">
        <div className="form-section-title">
          <DollarSign size={18} color="#059669" />
          <span>Pricing Information</span>
        </div>
        <p className="form-section-desc">
          Specify selling price, MRP, discounts, and applicable GST rate.
        </p>

        <div className="form-grid-4">
          <div className="form-group">
            <label className="form-label">
              Selling Price (₹) <span className="required">*</span>
            </label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix">₹</span>
              <input
                type="number"
                name="sellingPrice"
                min="0"
                step="any"
                className={`form-input input-with-prefix ${errors.sellingPrice ? 'error' : ''}`}
                placeholder="2499"
                value={formData.sellingPrice}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
            {errors.sellingPrice && <span className="form-error-msg">{errors.sellingPrice}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Original Price / MRP (₹)</label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix">₹</span>
              <input
                type="number"
                name="originalPrice"
                min="0"
                step="any"
                className="form-input input-with-prefix"
                placeholder="2999"
                value={formData.originalPrice}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Discount (%)</label>
            <input
              type="number"
              name="discount"
              min="0"
              max="100"
              className="form-input"
              placeholder="e.g. 15"
              value={formData.discount}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tax / GST Slab</label>
            <select
              name="taxRate"
              className="form-select"
              value={formData.taxRate}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="0">0% (Nil / Exempt)</option>
              <option value="5">5% GST</option>
              <option value="12">12% GST</option>
              <option value="18">18% GST (Standard)</option>
              <option value="28">28% GST</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Inventory Information */}
      <div className="form-section">
        <div className="form-section-title">
          <Boxes size={18} color="#d97706" />
          <span>Inventory & Storage</span>
        </div>
        <p className="form-section-desc">
          Initial stock level, threshold, and warehouse location identifier.
        </p>

        <div className="form-grid-4">
          <div className="form-group">
            <label className="form-label">
              Initial Stock Quantity <span className="required">*</span>
            </label>
            <input
              type="number"
              name="stock"
              min="0"
              className={`form-input ${errors.stock ? 'error' : ''}`}
              placeholder="0"
              value={formData.stock}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.stock && <span className="form-error-msg">{errors.stock}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Low Stock Threshold</label>
            <input
              type="number"
              name="lowStockThreshold"
              min="1"
              className="form-input"
              placeholder="10"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Availability Status</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Warehouse / Location</label>
            <input
              type="text"
              name="warehouse"
              className="form-input"
              placeholder="e.g. Warehouse 1 - Shelf 3A"
              value={formData.warehouse}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
        </div>
      </div>

      {/* 4. Product Media */}
      <div className="form-section">
        <div className="form-section-title">
          <ImageIcon size={18} color="#7c3aed" />
          <span>Product Media</span>
        </div>
        <p className="form-section-desc">
          Select images locally for preview; file objects will be sent to your Spring Boot storage endpoint.
        </p>

        <ImageUploader
          mainImage={formData.mainImage}
          setMainImage={(url) => setFormData((prev) => ({ ...prev, mainImage: url }))}
          additionalImages={formData.additionalImages}
          setAdditionalImages={(imgs) => {
            if (typeof imgs === 'function') {
              setFormData((prev) => ({ ...prev, additionalImages: imgs(prev.additionalImages) }));
            } else {
              setFormData((prev) => ({ ...prev, additionalImages: imgs }));
            }
          }}
          onMainFileSelect={(file) => setMainImageFile(file)}
          onAdditionalFilesSelect={(files) => setAdditionalImageFiles(files)}
        />
      </div>

      {/* 5. Additional Information & Specifications */}
      <div className="form-section">
        <div className="form-section-title">
          <ShieldCheck size={18} color="#0f172a" />
          <span>Physical Specs & Manufacturer Details</span>
        </div>
        <p className="form-section-desc">
          Weight, dimensions, warranty, and technical key-value specifications.
        </p>

        <div className="form-grid-4" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Product Weight</label>
            <input
              type="text"
              name="weight"
              className="form-input"
              placeholder="e.g. 500 g"
              value={formData.weight}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dimensions (L x W x H)</label>
            <input
              type="text"
              name="dimensions"
              className="form-input"
              placeholder="e.g. 20 x 15 x 8 cm"
              value={formData.dimensions}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              className="form-input"
              placeholder="e.g. Sony Corp"
              value={formData.manufacturer}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Warranty Information</label>
            <input
              type="text"
              name="warranty"
              className="form-input"
              placeholder="e.g. 1 Year Warranty"
              value={formData.warranty}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Dynamic Specifications Editor */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <label className="form-label" style={{ margin: 0 }}>
              Technical Specifications ({formData.specifications.length})
            </label>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleAddSpec}
              disabled={submitting}
            >
              <Plus size={13} />
              <span>Add Attribute</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {formData.specifications.map((spec, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr auto',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <input
                  type="text"
                  className="form-input"
                  placeholder="Key (e.g. Material, Battery, Capacity)"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                  disabled={submitting}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Value (e.g. Aluminum, 4000mAh, 128GB)"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="btn btn-danger-outline btn-icon"
                  onClick={() => handleRemoveSpec(index)}
                  title="Remove"
                  disabled={submitting}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '14px',
          padding: '16px 0 40px 0'
        }}
      >
        <button
          type="button"
          className="btn btn-outline btn-lg"
          onClick={() => navigate('/products')}
          disabled={submitting}
        >
          <X size={16} />
          <span>Cancel</span>
        </button>
        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={16} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Sending to Backend...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>{isEdit ? 'Submit Update to Backend' : 'Save Product to Backend'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
