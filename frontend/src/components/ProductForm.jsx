
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Package,
  Loader2
} from 'lucide-react';

import ImageUploader from './ImageUploader';
import categoryService from '../services/categoryService';

export const ProductForm = ({
  initialData,
  onSubmit,
  isEdit = false,
  submitting = false
}) => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

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
    stock: '0',
    mainImage: '',
    additionalImages: []
  });

  const [mainImageFile, setMainImageFile] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch categories
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
        console.info('[ProductForm] Could not fetch categories.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Populate form when editing an existing product
  useEffect(() => {
    if (!initialData) return;

    setFormData({
      name: initialData.name || '',
      sku: initialData.sku || '',
      brand: initialData.brand || '',

      category:
        initialData.categoryName ||
        initialData.category ||
        '',

      categoryId:
        initialData.categoryId != null
          ? String(initialData.categoryId)
          : '',

      subcategory: initialData.subcategory || '',
      description: initialData.description || '',

      sellingPrice:
        initialData.sellingPrice != null
          ? String(initialData.sellingPrice)
          : '',

      originalPrice:
        initialData.originalPrice != null
          ? String(initialData.originalPrice)
          : '',

      discount:
        initialData.discount != null
          ? String(initialData.discount)
          : '',

      taxRate:
        initialData.taxRate != null
          ? String(initialData.taxRate)
          : '18',

      // Load existing stock from PostgreSQL
      stock:
        initialData.stockQuantity != null
          ? String(initialData.stockQuantity)
          : '0',

      mainImage: initialData.imageUrl || '',
      additionalImages: initialData.additionalImages || []
    });
  }, [initialData]);

  // Handle category selection
  const handleCategoryChange = (e) => {
    const selected = e.target.value;

    const catObj = categories.find(
      (c) => String(c.id) === selected
    );

    setFormData((prev) => ({
      ...prev,
      category: catObj ? catObj.name : selected,
      categoryId: catObj ? String(catObj.id) : ''
    }));

    if (errors.category) {
      setErrors((prev) => ({
        ...prev,
        category: null
      }));
    }
  };

  // Handle normal inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value
      };

      // Automatically calculate discount
      if (name === 'sellingPrice' || name === 'originalPrice') {
        const sell = Number(
          name === 'sellingPrice' ? value : prev.sellingPrice
        );

        const orig = Number(
          name === 'originalPrice' ? value : prev.originalPrice
        );

        if (orig > 0 && sell > 0 && orig >= sell) {
          updated.discount = Math.round(
            ((orig - sell) / orig) * 100
          ).toString();
        }
      }

      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form
  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      errs.sku = 'SKU / ID is required';
    }

    if (!formData.brand.trim()) {
      errs.brand = 'Brand is required';
    }

    if (!formData.category.trim()) {
      errs.category = 'Category is required';
    }

    if (!formData.categoryId) {
      errs.category = 'Please select a valid category';
    }

    if (
      !formData.sellingPrice ||
      Number(formData.sellingPrice) <= 0
    ) {
      errs.sellingPrice = 'Enter a valid selling price';
    }

    if (
      formData.stock === '' ||
      !Number.isInteger(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      errs.stock = 'Enter a valid non-negative stock quantity';
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  // Submit product to Spring Boot
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      return;
    }

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      brand: formData.brand.trim(),
      description: formData.description,

      sellingPrice: Number(formData.sellingPrice),

      originalPrice: formData.originalPrice
        ? Number(formData.originalPrice)
        : Number(formData.sellingPrice),

      // Stock is part of the product itself.
      // Editable during both creation and editing.
      stockQuantity: Number(formData.stock),

      imageUrl: formData.mainImage || '',
      categoryId: Number(formData.categoryId)
    };

    onSubmit(payload, {
      mainImageFile,
      additionalImageFiles
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: '1080px',
        margin: '0 auto'
      }}
    >
      {/* 1. Basic Information */}
      <div className="form-section">
        <div className="form-section-title">
          <FileText size={18} color="#2563eb" />
          <span>Basic Information</span>
        </div>

        <p className="form-section-desc">
          Enter the basic product details.
        </p>

        <div
          className="form-grid-2"
          style={{ marginBottom: '16px' }}
        >
          <div className="form-group">
            <label className="form-label">
              Product Name <span className="required">*</span>
            </label>

            <input
              type="text"
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. Wireless Headphones"
              value={formData.name}
              onChange={handleChange}
              disabled={submitting}
            />

            {errors.name && (
              <span className="form-error-msg">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Product SKU / ID <span className="required">*</span>
            </label>

            <input
              type="text"
              name="sku"
              className={`form-input ${errors.sku ? 'error' : ''}`}
              placeholder="e.g. PRD-001"
              value={formData.sku}
              onChange={handleChange}
              disabled={submitting}
            />

            {errors.sku && (
              <span className="form-error-msg">{errors.sku}</span>
            )}
          </div>
        </div>

        <div
          className="form-grid-3"
          style={{ marginBottom: '16px' }}
        >
          <div className="form-group">
            <label className="form-label">
              Brand <span className="required">*</span>
            </label>

            <input
              type="text"
              name="brand"
              className={`form-input ${errors.brand ? 'error' : ''}`}
              placeholder="e.g. Apple, Samsung"
              value={formData.brand}
              onChange={handleChange}
              disabled={submitting}
            />

            {errors.brand && (
              <span className="form-error-msg">{errors.brand}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Category <span className="required">*</span>
            </label>

            <select
              name="category"
              className={`form-select ${errors.category ? 'error' : ''}`}
              value={formData.categoryId}
              onChange={handleCategoryChange}
              disabled={submitting || loadingCategories}
            >
              <option value="">
                {loadingCategories
                  ? 'Loading categories...'
                  : 'Select Category'}
              </option>

              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>

            {errors.category && (
              <span className="form-error-msg">
                {errors.category}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Subcategory</label>

            <input
              type="text"
              name="subcategory"
              className="form-input"
              placeholder="e.g. Smartphones"
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
            placeholder="Product description..."
            value={formData.description}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        {/* Stock quantity belongs directly to the product */}
        <div className="form-group" style={{ marginTop: '16px', maxWidth: '320px' }}>
          <label className="form-label">
            <Package size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Stock Quantity <span className="required">*</span>
          </label>

          <input
            type="number"
            name="stock"
            min="0"
            step="1"
            className={`form-input ${errors.stock ? 'error' : ''}`}
            placeholder="Enter available stock"
            value={formData.stock}
            onChange={handleChange}
            disabled={submitting}
          />

          {errors.stock && (
            <span className="form-error-msg">{errors.stock}</span>
          )}

          <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px', display: 'block' }}>
            Available quantity for this product.
          </span>
        </div>
      </div>

      {/* 2. Pricing Information */}
      <div className="form-section">
        <div className="form-section-title">
          <DollarSign size={18} color="#059669" />
          <span>Pricing Information</span>
        </div>

        <p className="form-section-desc">
          Specify selling price, MRP and discounts.
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
                className={`form-input input-with-prefix ${
                  errors.sellingPrice ? 'error' : ''
                }`}
                placeholder="2499"
                value={formData.sellingPrice}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            {errors.sellingPrice && (
              <span className="form-error-msg">
                {errors.sellingPrice}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Original Price / MRP (₹)
            </label>

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
              <option value="18">18% GST</option>
              <option value="28">28% GST</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Product Media */}
      <div className="form-section">
        <div className="form-section-title">
          <ImageIcon size={18} color="#7c3aed" />
          <span>Product Media</span>
        </div>

        <p className="form-section-desc">
          Select product images for preview and upload.
        </p>

        <ImageUploader
          mainImage={formData.mainImage}
          setMainImage={(url) =>
            setFormData((prev) => ({
              ...prev,
              mainImage: url
            }))
          }
          additionalImages={formData.additionalImages}
          setAdditionalImages={(imgs) => {
            if (typeof imgs === 'function') {
              setFormData((prev) => ({
                ...prev,
                additionalImages: imgs(prev.additionalImages)
              }));
            } else {
              setFormData((prev) => ({
                ...prev,
                additionalImages: imgs
              }));
            }
          }}
          onMainFileSelect={(file) => setMainImageFile(file)}
          onAdditionalFilesSelect={(files) =>
            setAdditionalImageFiles(files)
          }
        />
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

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2
                size={16}
                className="spin-animation"
                style={{
                  animation: 'spin 1s linear infinite'
                }}
              />
              <span>Sending to Backend...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>
                {isEdit
                  ? 'Submit Update to Backend'
                  : 'Save Product to Backend'}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
