import React, { useState, useEffect } from 'react';
import { X, Boxes, Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import inventoryService from '../services/inventoryService';

export const StockUpdateModal = ({ isOpen, onClose, product, onSuccess }) => {
  const { showToast } = useApp();
  const [mode, setMode] = useState('set'); // 'set', 'add', 'deduct'
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (product) {
      setAmount(product.stock !== undefined ? product.stock.toString() : '0');
      setMode('set');
      setReason('');
      setErrorMessage(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const currentStock = Number(product.stock) || 0;
  const numInput = Number(amount) || 0;

  let calculatedStock = currentStock;
  if (mode === 'set') calculatedStock = Math.max(0, numInput);
  else if (mode === 'add') calculatedStock = currentStock + Math.max(0, numInput);
  else if (mode === 'deduct') calculatedStock = Math.max(0, currentStock - Math.max(0, numInput));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const payload = {
      stock: calculatedStock,
      adjustmentMode: mode,
      quantityDelta: mode === 'set' ? calculatedStock - currentStock : mode === 'add' ? numInput : -numInput,
      reason: reason.trim() || 'Manual inventory update'
    };

    try {
      // Direct call to Spring Boot backend API
      await inventoryService.updateStock(product.id, payload);
      showToast(`Stock updated on backend for "${product.name}"!`, 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update stock on backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Boxes size={18} />
            </div>
            <div>
              <h3 className="modal-title">Update Stock via Backend</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                {product.name} ({product.sku || product.id})
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Backend Error Banner */}
            {errorMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  color: '#991b1b',
                  fontSize: '12.5px'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Current Stock Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Current Recorded Stock</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                  {currentStock} units
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Threshold</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                  {product.lowStockThreshold ?? 'N/A'} units
                </div>
              </div>
            </div>

            {/* Adjustment Type Selector */}
            <div className="form-group">
              <label className="form-label">Adjustment Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${mode === 'set' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setMode('set');
                    setAmount(currentStock.toString());
                  }}
                  disabled={loading}
                >
                  Set Exact
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${mode === 'add' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setMode('add');
                    setAmount('10');
                  }}
                  disabled={loading}
                >
                  <Plus size={13} /> Add
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${mode === 'deduct' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setMode('deduct');
                    setAmount('1');
                  }}
                  disabled={loading}
                >
                  <Minus size={13} /> Deduct
                </button>
              </div>
            </div>

            {/* Input Amount */}
            <div className="form-group">
              <label className="form-label">
                {mode === 'set' && 'New Total Quantity'}
                {mode === 'add' && 'Units to Add'}
                {mode === 'deduct' && 'Units to Deduct'}
              </label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Target Value Preview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Target Stock on Backend:</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                {calculatedStock} units
              </span>
            </div>

            {/* Audit Reason */}
            <div className="form-group">
              <label className="form-label">Audit Reason / Note (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Shipment received, Inventory cycle count, Damaged"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={14} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Sending to API...</span>
                </>
              ) : (
                'Send Stock Update to Backend'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockUpdateModal;
