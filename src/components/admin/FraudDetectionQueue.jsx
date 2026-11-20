import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Scale,
  Camera,
  UserCheck
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function FraudDetectionQueue({ notify }) {
  const { fraudAlerts, reviewFraudAlert } = useData();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [filterTier, setFilterTier] = useState('ALL');

  const filteredAlerts = fraudAlerts.filter(fa => {
    if (filterTier === 'ALL') return true;
    return fa.risk_tier.toLowerCase() === filterTier.toLowerCase();
  });

  const handleResolveAlert = (alertId, newStatus) => {
    reviewFraudAlert(alertId, newStatus, adminNotesInput);
    if (notify) notify(`Deposit alert updated to: ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
    setSelectedAlert(null);
    setAdminNotesInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #881337 0%, #be123c 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(136, 19, 55, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <ShieldAlert size={28} style={{ color: '#fda4af' }} />
              <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
                Fraud Detection & Smart Verification Review
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                Human-in-the-Loop Audit
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#fecdd3', maxWidth: '750px', lineHeight: 1.6 }}>
              Automated anomaly scoring inspects weight deviations, photo perceptual hashes, and submission velocity.
              <b> Important:</b> The AI system never auto-bans accounts or auto-deducts wallet balances; all enforcement actions
              require certified municipal administrative verification.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '11px', color: '#fecdd3', fontWeight: 700 }}>FLAGGED DEPOSITS</div>
            <div style={{ font: '800 22px Manrope', color: '#ffffff', marginTop: '2px' }}>
              {fraudAlerts.filter(a => a.investigation_status === 'pending_review').length} Pending Review
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Filter Risk Level:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(tier => (
            <button
              key={tier}
              type="button"
              onClick={() => setFilterTier(tier)}
              style={{
                border: 'none',
                background: filterTier === tier ? '#be123c' : '#f1f5f9',
                color: filterTier === tier ? '#ffffff' : '#475569',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {tier}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Enforcement: <b style={{ color: '#be123c' }}>Advisory Only (Human Sign-off Required)</b>
        </div>
      </div>

      {/* Review Queue Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredAlerts.map((alert) => {
          const isPending = alert.investigation_status === 'pending_review';
          const isCritical = alert.risk_tier === 'critical';
          const isHigh = alert.risk_tier === 'high';

          return (
            <div
              key={alert.id}
              className="card"
              style={{
                padding: '20px',
                border: isPending && isCritical ? '2px solid #f43f5e' : '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                      {alert.deposit_code || alert.deposit_id}
                    </span>
                    <h3 style={{ margin: '2px 0 0', font: '800 16px Manrope', color: '#1e293b' }}>
                      {alert.citizen_name}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {alert.point_name} • <b>{alert.waste_category}</b>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        background: isCritical ? '#fee2e2' : isHigh ? '#ffedd5' : '#fef3c7',
                        color: isCritical ? '#dc2626' : isHigh ? '#c2410c' : '#b45309',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        font: '800 13px Manrope'
                      }}
                    >
                      {alert.risk_score}/100 Risk
                    </div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                      {alert.risk_tier} Tier
                    </span>
                  </div>
                </div>

                {/* Weight Comparison */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>CITIZEN ESTIMATE</div>
                    <b style={{ font: '800 15px Manrope', color: '#0f172a' }}>{alert.claimed_weight_kg} kg</b>
                  </div>
                  <div style={{ borderLeft: '1px solid #cbd5e1' }}></div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>CERTIFIED SCALE</div>
                    <b style={{ font: '800 15px Manrope', color: '#be123c' }}>{alert.actual_weight_kg} kg</b>
                  </div>
                </div>

                {/* Triggered Rules list */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                    Triggered Audit Flags:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
                    {alert.triggered_rules.map((rule, idx) => (
                      <li key={idx}>
                        <b style={{ color: '#0f172a' }}>{rule.title}:</b> {rule.description}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: alert.investigation_status === 'pending_review' ? '#ea580c' : '#15803d'
                  }}
                >
                  Status: {alert.investigation_status.replace(/_/g, ' ').toUpperCase()}
                </span>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSelectedAlert(alert)}
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  Inspect & Decide
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decision Modal */}
      {selectedAlert && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '520px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ShieldAlert size={22} color="#be123c" />
              <h3 style={{ margin: 0, font: '800 18px Manrope', color: '#1e293b' }}>
                Municipal Fraud Verification Decision
              </h3>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Deposit: <b>{selectedAlert.deposit_code}</b> • Citizen: <b>{selectedAlert.citizen_name}</b> ({selectedAlert.citizen_id})
            </p>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
                AUDIT SUMMARY & RISK REASONING:
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                {selectedAlert.triggered_rules.map(r => r.description).join(' ')}
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Administrative Decision Notes / Justification:
              </label>
              <textarea
                className="input"
                rows={3}
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                placeholder="Enter notes for municipal ledger audit record..."
                style={{ width: '100%', padding: '10px' }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedAlert(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleResolveAlert(selectedAlert.id, 'dismissed')}
                style={{ color: '#64748b' }}
              >
                Dismiss False Alarm
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleResolveAlert(selectedAlert.id, 'verified_legitimate')}
                style={{ background: '#10b981', borderColor: '#10b981' }}
              >
                Approve as Legitimate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
