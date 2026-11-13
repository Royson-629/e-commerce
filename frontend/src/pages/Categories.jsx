import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  X,
  Loader2,
  PackageOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import categoryService from '../services/categoryService';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export const Categories = () => {
  const { showToast } = useApp();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    id: '',
    description: '',
    image: '',
    status: 'Active',
    subcategoriesInput: ''
  });

  // Fetch categories from Spring Boot API
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoryService.getAllCategories();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : [];
      setCategories(list);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories from Spring Boot backend.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Modal open for adding
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      id: '',
      description: '',
      image: '',
      status: 'Active',
      subcategoriesInput: ''
    });
    setModalError(null);
    setModalOpen(true);
  };

  // Modal open for editing
  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || '',
      id: category.id || '',
      description: category.description || '',
      image: category.image || '',
      status: category.status || 'Active',
      subcategoriesInput: Array.isArray(category.subcategories)
        ? category.subcategories.join(', ')
        : category.subcategories || ''
    });
    setModalError(null);
    setModalOpen(true);
  };

  // Submit Category to Backend API
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    setSubmitting(true);
    setModalError(null);

    const subcats = categoryForm.subcategoriesInput
      ? categoryForm.subcategoriesInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
      image: categoryForm.image.trim(),
      status: categoryForm.status,
      subcategories: subcats
    };

    if (categoryForm.id.trim()) {
      payload.id = categoryForm.id.trim();
    }

    try {
      if (editingCategory) {
        // Send PUT request to Spring Boot
        await categoryService.updateCategory(editingCategory.id, payload);
        showToast(`Category "${payload.name}" updated on backend!`, 'success');
      } else {
        // Send POST request to Spring Boot
        await categoryService.createCategory(payload);
        showToast(`Category "${payload.name}" created on backend!`, 'success');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setModalError(err.message || 'Failed to save category to backend.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category from Backend API
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);

    try {
      await categoryService.deleteCategory(deleteCandidate.id);
      showToast(`Category "${deleteCandidate.name}" deleted from backend!`, 'success');
      setDeleteCandidate(null);
      fetchCategories();
    } catch (err) {
      showToast(`Failed to delete category: ${err.message}`, 'danger');
    } finally {
      setDeleting(false);
    }
  };

  // Filter categories by client search term
  const filteredCategories = categories.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.description?.toLowerCase().includes(term) ||
      c.id?.toString().toLowerCase().includes(term)
    );
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Category Management</h1>
          <p className="page-subtitle">
            Manage your store's taxonomy and categories via Spring Boot <code>/api/categories</code>.
          </p>
        </div>

        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="filter-toolbar">
        <div className="search-input-box" style={{ maxWidth: '360px', width: '100%' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Loaded <strong>{categories.length}</strong> categories from backend
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner message="Fetching categories from Spring Boot API..." />}

      {/* Error State */}
      {!loading && error && (
        <ErrorMessage message={error} onRetry={fetchCategories} />
      )}

      {/* Empty State */}
      {!loading && !error && categories.length === 0 && (
        <EmptyState
          icon={Layers}
          title="No Categories Found in Database"
          description="Your Spring Boot backend returned no categories. You can create categories here or seed your backend database."
          actionText="Add First Category"
          onAction={handleOpenAdd}
        />
      )}

      {/* Table */}
      {!loading && !error && categories.length > 0 && (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Category ID</th>
                <th>Description</th>
                <th>Subcategories</th>
                <th>Linked Products</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id || category.name}>
                  <td>
                    <div className="product-row-info">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="product-row-thumb"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          <Layers size={20} />
                        </div>
                      )}
                      <div className="product-row-meta">
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                          {category.name}
                        </span>
                        <span className="product-row-sub">
                          {category.slug ? `/${category.slug}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '12px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                      {category.id || 'N/A'}
                    </code>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <p style={{ fontSize: '12.5px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {category.description || '—'}
                    </p>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                      {Array.isArray(category.subcategories) && category.subcategories.length > 0 ? (
                        category.subcategories.slice(0, 3).map((sub, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '11px',
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>None</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
                      <Package size={14} color="#64748b" />
                      {category.linkedProducts ?? 0}
                    </span>
                  </td>
                  <td>
                    <span className={category.status === 'Active' ? 'badge badge-in-stock' : 'badge badge-neutral'}>
                      {category.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-icon btn-sm"
                        title="Edit Category"
                        onClick={() => handleOpenEdit(category)}
                      >
                        <Edit2 size={13} color="#2563eb" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger-outline btn-icon btn-sm"
                        title="Delete Category"
                        onClick={() => setDeleteCandidate(category)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => !submitting && setModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Layers size={18} />
                </div>
                <h3 className="modal-title">
                  {editingCategory ? 'Edit Category on Backend' : 'Add Category to Backend'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitCategory}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {modalError && (
                  <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', fontSize: '13px' }}>
                    {modalError}
                  </div>
                )}

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Category Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Laptops"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      required
                      disabled={submitting}
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category ID (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. CAT-001 (auto if blank)"
                      value={categoryForm.id}
                      onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })}
                      disabled={submitting || !!editingCategory}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Category Description</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Short description of products categorized under this group..."
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/..."
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subcategories (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Gaming, Business, Convertibles"
                    value={categoryForm.subcategoriesInput}
                    onChange={(e) => setCategoryForm({ ...categoryForm, subcategoriesInput: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={categoryForm.status}
                    onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                    disabled={submitting}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Sending to API...</span>
                    </>
                  ) : (
                    editingCategory ? 'Update Category' : 'Save to Backend'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        title="Delete Category on Backend"
        message={`Are you sure you want to delete category "${deleteCandidate?.name}" (${deleteCandidate?.id})? A DELETE request will be sent to your Spring Boot API.`}
        confirmText={deleting ? 'Deleting...' : 'Delete Category'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};

export default Categories;
