import React, { useRef, useState } from 'react';
import { UploadCloud, X, Link as LinkIcon, Plus, FileImage } from 'lucide-react';

export const ImageUploader = ({
  mainImage,
  setMainImage,
  additionalImages = [],
  setAdditionalImages,
  onMainFileSelect,
  onAdditionalFilesSelect
}) => {
  const mainInputRef = useRef(null);
  const additionalInputRef = useRef(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  // Handle local main image selection (preview in React)
  const handleMainFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setMainImage(previewUrl);
      if (onMainFileSelect) {
        onMainFileSelect(file);
      }
    }
  };

  // Handle local additional images selection
  const handleAdditionalFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newUrls = files.map((file) => URL.createObjectURL(file));
      setAdditionalImages((prev) => [...prev, ...newUrls]);
      if (onAdditionalFilesSelect) {
        onAdditionalFilesSelect(files);
      }
    }
  };

  // Handle manual URL addition
  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (!mainImage) {
      setMainImage(urlInput.trim());
    } else {
      setAdditionalImages((prev) => [...prev, urlInput.trim()]);
    }
    setUrlInput('');
    setShowUrlField(false);
  };

  const handleRemoveMain = () => {
    setMainImage('');
    if (onMainFileSelect) onMainFileSelect(null);
  };

  const handleRemoveAdditional = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={mainInputRef}
        onChange={handleMainFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={additionalInputRef}
        onChange={handleAdditionalFileChange}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />

      {/* Main Image Section */}
      <div>
        <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
          Main Product Image (Selected in React, uploaded to Spring Boot)
        </label>

        {mainImage ? (
          <div style={{ position: 'relative', width: '200px', height: '200px' }}>
            <img
              src={mainImage}
              alt="Main Product Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '2px solid #2563eb'
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 600
              }}
            >
              Main Image
            </span>
            <button
              type="button"
              className="image-remove-btn"
              onClick={handleRemoveMain}
              title="Remove main image"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div
            className="image-upload-dropzone"
            onClick={() => mainInputRef.current?.click()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UploadCloud size={24} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
                  Click to select primary product image
                </p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  Supports local file preview. File payload will be dispatched to Spring Boot API.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Gallery Images */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label className="form-label" style={{ margin: 0 }}>
            Additional Images ({additionalImages.length})
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowUrlField(!showUrlField)}
            >
              <LinkIcon size={13} />
              <span>{showUrlField ? 'Cancel URL' : 'Add via URL'}</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => additionalInputRef.current?.click()}
            >
              <Plus size={13} />
              <span>Select Files</span>
            </button>
          </div>
        </div>

        {showUrlField && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="url"
              className="form-input"
              placeholder="Paste image URL (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAddUrl}>
              Add
            </button>
          </div>
        )}

        {additionalImages.length > 0 ? (
          <div className="image-preview-grid">
            {additionalImages.map((imgUrl, index) => (
              <div key={index} className="image-preview-wrapper">
                <img
                  src={imgUrl}
                  alt={`Gallery Preview ${index + 1}`}
                  className="image-preview-thumb"
                />
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={() => handleRemoveAdditional(index)}
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <div
              onClick={() => additionalInputRef.current?.click()}
              style={{
                width: 80,
                height: 80,
                borderRadius: '8px',
                border: '2px dashed #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                fontSize: '11px',
                gap: '4px'
              }}
            >
              <Plus size={18} />
              <span>Add</span>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic' }}>
            No gallery images selected.
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
