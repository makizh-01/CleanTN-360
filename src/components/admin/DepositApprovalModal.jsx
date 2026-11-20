import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  Camera,
  User,
  MapPin,
  Gift,
  Coins
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { POINTS_TO_RUPEE_RATIO } from '../../lib/constants';

export default function DepositApprovalModal({ isOpen, onClose, deposit, onActionSuccess }) {
  const { categories, approveDeposit, rejectDeposit } = useData();

  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !deposit) return null;

  const cat = categories.find((c) => c.name === deposit.category_name) || categories[0];
  const rate = cat?.pointsPerKg || deposit.reward_rate || 50;
  const verifiedWeight = deposit.actual_weight_kg || deposit.weight_kg || 0;
  const finalRewardPoints = Math.round(verifiedWeight * rate);
  const rupeeValue = (finalRewardPoints / POINTS_TO_RUPEE_RATIO).toFixed(2);

  async function handleApprove() {
    setError('');
    setProcessing(true);
    try {
      const res = await approveDeposit(deposit.id);
      onActionSuccess(`Deposit ${deposit.deposit_code} approved! ${res.points_credited || finalRewardPoints} Green Points credited to ${deposit.citizen_name || 'Citizen'}.`);
      onClose();
    } catch (err) {
      setError(err.message || 'Error executing atomic approval.');
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    setError('');
    if (!rejectReason.trim()) {
      setError('Please provide a valid administrative rejection reason.');
      return;
    }

    setProcessing(true);
    try {
      await rejectDeposit(deposit.id, rejectReason.trim());
      onActionSuccess(`Deposit ${deposit.deposit_code} rejected. Reason logged in audit records.`);
      onClose();
    } catch (err) {
      setError(err.message || 'Error rejecting deposit.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <b>
            <ShieldCheck size={20} />
            Administrative Deposit Review & Ledger Approval
          </b>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Header Banner */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b style={{ fontSize: '15px', color: '#0f172a' }}>{deposit.deposit_code}</b>
                <small style={{ display: 'block', color: '#64748b', marginTop: '2px' }}>
                  Hub: <b>{deposit.point_code}</b> ({deposit.point_name || 'Hub'})
                </small>
              </div>
              <span className="status verified">Collector Verified</span>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '16px', fontSize: '11px', color: '#475569' }}>
              <span>Citizen: <b>{deposit.citizen_name}</b> ({deposit.citizen_email || 'Verified'})</span>
              <span>Category: <b>{deposit.category_name}</b></span>
            </div>
          </div>

          {error && (
            <div className="note" style={{ color: '#b91c1c', borderColor: '#fca5a5', background: '#fef2f2', marginBottom: '12px' }}>
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          {/* Side-by-Side Comparison: Citizen Declaration vs Collector Actual Measurement */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px' }}>
              <small style={{ color: '#6b7280', fontWeight: 800, fontSize: '9px', display: 'block', marginBottom: '6px' }}>
                CITIZEN DECLARATION
              </small>
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                Declared Weight: <b>{deposit.weight_kg?.toFixed(2)} kg</b>
              </div>
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                Est. Points: <b>{deposit.estimated_points} pts</b>
              </div>
              {deposit.citizen_remarks && (
                <small style={{ color: '#64748b', display: 'block', fontStyle: 'italic', fontSize: '9px', marginTop: '6px' }}>
                  "{deposit.citizen_remarks}"
                </small>
              )}
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px' }}>
              <small style={{ color: '#166534', fontWeight: 800, fontSize: '9px', display: 'block', marginBottom: '6px' }}>
                COLLECTOR SCALE VERIFICATION
              </small>
              <div style={{ fontSize: '13px', color: '#15803d', marginBottom: '4px' }}>
                Actual Scale Weight: <b>{verifiedWeight.toFixed(2)} kg</b>
              </div>
              <div style={{ fontSize: '12px', marginBottom: '4px', color: '#166534' }}>
                Approved Points: <b>{finalRewardPoints} Green Points</b>
              </div>
              <small style={{ color: '#15803d', display: 'block', fontStyle: 'italic', fontSize: '9px', marginTop: '6px' }}>
                "{deposit.collector_remarks || 'Scale calibrated and verified'}"
              </small>
            </div>
          </div>

          {/* Scale Photograph Evidence */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '10px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Verified Weighing Scale LCD Photograph:
            </label>
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', maxHeight: '180px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={deposit.scale_photo_url || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500&auto=format&fit=crop&q=60'}
                alt="Scale LCD Reading"
                style={{ width: '100%', maxHeight: '180px', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Calculated Reward Summary */}
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <small style={{ color: '#065f46', fontWeight: 800, fontSize: '10px', letterSpacing: '0.5px' }}>
                  ATOMIC REWARD TRANSACTION
                </small>
                <div style={{ fontSize: '15px', color: '#047857', fontWeight: 800 }}>
                  +{finalRewardPoints} Green Points (₹{rupeeValue} INR)
                </div>
              </div>
              <Coins size={28} style={{ color: '#10b981' }} />
            </div>
            <small style={{ fontSize: '9px', color: '#065f46', display: 'block', marginTop: '4px' }}>
              Formula: {verifiedWeight.toFixed(2)} kg × {rate} pts/kg ({deposit.category_name}) · Idempotent execution
            </small>
          </div>

          {/* Rejection input toggle */}
          {showRejectInput && (
            <div style={{ marginBottom: '14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px' }}>
              <label style={{ color: '#991b1b', fontWeight: 800, fontSize: '10px', display: 'block', marginBottom: '4px' }}>
                Rejection Reason (Audit Required) *
              </label>
              <textarea
                className="input"
                rows="2"
                placeholder="e.g. Unsegregated medical/toxic waste detected, or scale LCD mismatch."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <button
                type="button"
                className="primary"
                style={{ background: '#dc2626', borderColor: '#dc2626', width: '100%', marginTop: '6px' }}
                disabled={processing || !rejectReason.trim()}
                onClick={handleReject}
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection (Zero Points Credited)'}
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {!showRejectInput && (
              <button
                type="button"
                className="outline"
                style={{ flex: 1, borderColor: '#fca5a5', color: '#dc2626' }}
                onClick={() => setShowRejectInput(true)}
              >
                <XCircle size={15} /> Reject Deposit
              </button>
            )}

            <button
              type="button"
              className="primary"
              style={{ flex: 2 }}
              disabled={processing}
              onClick={handleApprove}
            >
              {processing ? 'Executing Ledger Credit...' : 'Approve & Credit Citizen Wallet'} <CheckCircle2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

