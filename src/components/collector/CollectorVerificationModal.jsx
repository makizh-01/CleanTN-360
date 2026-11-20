import React, { useState } from 'react';
import {
  X,
  Scale,
  Camera,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Recycle,
  User,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function CollectorVerificationModal({ isOpen, onClose, deposit, onVerificationComplete }) {
  const { categories, verifyDeposit } = useData();

  const [actualWeight, setActualWeight] = useState(deposit ? String(deposit.weight_kg) : '2.0');
  const [selectedCategory, setSelectedCategory] = useState(deposit ? deposit.category_name : 'Plastic');
  const [remarks, setRemarks] = useState('');
  const [scaleFile, setScaleFile] = useState(null);
  const [wasteFile, setWasteFile] = useState(null);
  const [scalePreview, setScalePreview] = useState(null);
  const [wastePreview, setWastePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !deposit) return null;

  const numWeight = parseFloat(actualWeight) || 0;
  const activeCat = categories.find((c) => c.name === selectedCategory) || categories[0];
  const estApprovedPoints = Math.round(numWeight * (activeCat?.pointsPerKg || 50));

  function handleScalePhoto(e) {
    const file = e.target.files[0];
    if (file) {
      setScaleFile(file);
      setScalePreview(URL.createObjectURL(file));
    }
  }

  function handleWastePhoto(e) {
    const file = e.target.files[0];
    if (file) {
      setWasteFile(file);
      setWastePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (numWeight <= 0) {
      setError('Please enter a valid weight (> 0 kg) measured from your digital weighing scale.');
      return;
    }

    setSubmitting(true);
    try {
      await verifyDeposit({
        depositId: deposit.id,
        actualWeightKg: numWeight,
        verifiedCategoryName: selectedCategory,
        remarks: remarks.trim() || 'Physical digital scale reading verified by on-duty collector.',
        scaleFile,
        wasteFile
      });

      onVerificationComplete(`Deposit ${deposit.deposit_code} verified at ${numWeight.toFixed(2)} kg! Forwarded to Zonal Admin for approval.`);
      onClose();
    } catch (err) {
      setError(err.message || 'Error submitting verification.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <b>
            <Scale size={20} />
            Collector Digital Scale Verification
          </b>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Citizen Deposit Reference Banner */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b style={{ color: '#166534', fontSize: '13px' }}>{deposit.deposit_code}</b>
                <small style={{ display: 'block', color: '#4b5563', marginTop: '2px' }}>
                  Citizen: <b>{deposit.citizen_name || 'Citizen'}</b> ({deposit.citizen_email || 'Verified Citizen'})
                </small>
              </div>
              <span className="status pending">Awaiting Verification</span>
            </div>

            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#374151' }}>
              <span>Hub: <b>{deposit.point_code}</b> ({deposit.point_name || 'Hub'})</span>
              <span>Citizen Est: <b>{deposit.weight_kg} kg ({deposit.category_name})</b></span>
            </div>
            {deposit.citizen_remarks && (
              <small style={{ display: 'block', marginTop: '4px', color: '#64748b', fontStyle: 'italic', fontSize: '9px' }}>
                Note: "{deposit.citizen_remarks}"
              </small>
            )}
          </div>

          {error && (
            <div className="note" style={{ color: '#b91c1c', borderColor: '#fca5a5', background: '#fef2f2', marginBottom: '12px' }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label>Verified Waste Category *</label>
                <select
                  className="input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.icon || '♻'} {c.name} ({c.pointsPerKg} pts/kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Physical Digital Scale Weight (kg) *</label>
                <input
                  type="number"
                  min="0.05"
                  step="0.05"
                  required
                  className="input"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                />
              </div>
            </div>

            {/* Photo Uploads: Digital Scale LCD Display & Waste Material */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label>1. Digital Scale LCD Photo *</label>
                <label className="upload" style={{ cursor: 'pointer', minHeight: '100px' }}>
                  <Camera size={20} />
                  <span>{scaleFile ? scaleFile.name : 'Upload Scale Reading Photo'}</span>
                  <small>Displays scale reading</small>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleScalePhoto}
                    style={{ display: 'none' }}
                  />
                </label>
                {scalePreview && (
                  <div style={{ marginTop: '6px' }}>
                    <img
                      src={scalePreview}
                      alt="Scale LCD"
                      style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label>2. Segregated Waste Photo</label>
                <label className="upload" style={{ cursor: 'pointer', minHeight: '100px' }}>
                  <Camera size={20} />
                  <span>{wasteFile ? wasteFile.name : 'Upload Waste Material Photo'}</span>
                  <small>Verifies segregation purity</small>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleWastePhoto}
                    style={{ display: 'none' }}
                  />
                </label>
                {wastePreview && (
                  <div style={{ marginTop: '6px' }}>
                    <img
                      src={wastePreview}
                      alt="Waste Evidence"
                      style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                  </div>
                )}
              </div>
            </div>

            <label>Collector Remarks & Quality Check</label>
            <textarea
              className="input"
              rows="2"
              placeholder="e.g. Clean dry plastic, no organic contamination. Digital scale tare zeroed."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', margin: '12px 0', fontSize: '10px', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Actual Calibrated Weight:</span>
                <b>{numWeight.toFixed(2)} kg</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Projected Citizen Reward (Upon Admin Approval):</span>
                <b style={{ color: '#16a34a' }}>~{estApprovedPoints} Green Points (₹{(estApprovedPoints / 100).toFixed(2)})</b>
              </div>
            </div>

            <div className="note" style={{ fontSize: '9px', marginBottom: '14px' }}>
              <AlertCircle size={14} />
              <b>Collector Protocol:</b> Submitting verification updates status to <code>collector_verified</code>. Collectors cannot approve points or alter citizen wallets directly.
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="outline"
                style={{ flex: 1 }}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || numWeight <= 0}
                className="primary"
                style={{ flex: 2 }}
              >
                {submitting ? 'Verifying...' : 'Submit Scale Verification'} <CheckCircle2 size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

