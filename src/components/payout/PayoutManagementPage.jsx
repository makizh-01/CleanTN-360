import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Send,
  Lock,
  RotateCcw
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { PAYOUT_PROVIDERS } from '../../lib/payoutInfrastructure';

export default function PayoutManagementPage({ notify }) {
  const { payoutTransactions, executeSandboxPayout, reconcileFailedPayout } = useData();
  const [form, setForm] = useState({
    citizenName: 'Citizen Member',
    upiId: 'citizen@okicici',
    points: 5000,
    provider: 'Razorpay_Sandbox',
    simulateFailure: false
  });

  const handleTriggerPayout = (e) => {
    e.preventDefault();
    const res = executeSandboxPayout(form);
    if (!res.success) {
      if (notify) notify(res.error);
      return;
    }
    if (notify) {
      notify(
        form.simulateFailure
          ? `Simulated gateway failure logged for ${res.payout.redemption_code}. Ready for point reversal reconciliation.`
          : `Sandbox UPI payout ₹${res.payout.amount_rupees} settled via ${form.provider}!`
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(30, 58, 138, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <CreditCard size={28} style={{ color: '#5eead4' }} />
              <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
                Green Money Payout Infrastructure (Sandbox Ready)
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                Idempotent UPI Engine
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#ccfbf1', maxWidth: '780px', lineHeight: 1.6 }}>
              Production-ready payout orchestration with UPI VPA validation, idempotency keys, HMAC-SHA256 webhook verification, and automatic failed-payout point reversal reconciliation.
            </p>
          </div>
        </div>
      </div>

      {/* RBI / Legal Compliance Disclaimer */}
      <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#92400e' }}>
        <Lock size={20} style={{ flexShrink: 0, color: '#d97706' }} />
        <div>
          <b>RBI & Payment Compliance Notice:</b> Live monetary transfers require RBI-licensed payment aggregator approval, merchant KYC, and server-side secret provisioning. Until approved, all payouts execute strictly in <b>Sandbox / Simulated Prototype Mode</b> with zero real money moved.
        </div>
      </div>

      {/* Provider Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {PAYOUT_PROVIDERS.map(p => (
          <div key={p.id} className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <b style={{ font: '800 14px Manrope', color: '#0f172a' }}>{p.name}</b>
              <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '8px', background: p.status === 'active' || p.status === 'connected' ? '#dcfce7' : '#f1f5f9', color: p.status === 'active' || p.status === 'connected' ? '#15803d' : '#64748b' }}>
                {p.status.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>Mode: <b>{p.mode}</b></div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Webhook: <code>{p.webhookEndpoint}</code></div>
            <div style={{ fontSize: '10px', color: '#b45309', marginTop: '6px', fontWeight: 700 }}>{p.complianceStatus}</div>
          </div>
        ))}
      </div>

      {/* Sandbox Execution Form */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ margin: '0 0 14px', font: '800 18px Manrope', color: '#1e293b' }}>
          Execute Sandbox Payout & Reconciliation Test
        </h2>
        <form onSubmit={handleTriggerPayout} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>CITIZEN NAME</label>
            <input className="input" value={form.citizenName} onChange={e => setForm({ ...form, citizenName: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>BENEFICIARY UPI VPA</label>
            <input className="input" value={form.upiId} onChange={e => setForm({ ...form, upiId: e.target.value })} placeholder="name@okbank" style={{ width: '100%', padding: '8px 12px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>POINTS (100 PTS = ₹1)</label>
            <input type="number" step="500" min="5000" className="input" value={form.points} onChange={e => setForm({ ...form, points: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>GATEWAY SANDBOX</label>
            <select className="select" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} style={{ width: '100%', padding: '8px 12px' }}>
              {PAYOUT_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#be123c', fontWeight: 700, paddingBottom: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.simulateFailure} onChange={e => setForm({ ...form, simulateFailure: e.target.checked })} />
            Simulate Bank Failure
          </label>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Send size={14} /> Run Sandbox Payout
          </button>
        </form>
      </div>

      {/* Immutable Payout Ledger & Reconciliation */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ margin: '0 0 14px', font: '800 18px Manrope', color: '#1e293b' }}>
          Payout Settlement & Failure Reconciliation Ledger
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {payoutTransactions.map(p => {
            const isFailed = p.payout_status === 'failed';
            const isReversed = p.payout_status === 'reversed';
            const isSuccess = p.payout_status === 'success';

            return (
              <div
                key={p.id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: isFailed ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                  background: isFailed ? '#fef2f2' : '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <b style={{ color: '#0f172a' }}>{p.redemption_code}</b>
                    <span style={{ fontWeight: 800, color: '#047857' }}>₹{p.amount_rupees.toFixed(2)}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>({p.points_redeemed.toLocaleString()} pts)</span>
                    <span style={{ fontSize: '10px', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>{p.provider}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px' }}>
                    Citizen: <b>{p.citizen_name}</b> • UPI: <code>{p.upi_id}</code>
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', marginTop: '3px' }}>
                    Idempotency: {p.idempotency_key} • Ref: {p.provider_payout_id} • Webhook HMAC: {p.webhook_verified ? 'VERIFIED' : 'PENDING'}
                  </div>
                  {p.failure_reason && (
                    <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '6px', fontWeight: 600 }}>
                      Note: {p.failure_reason}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: isSuccess ? '#dcfce7' : isReversed ? '#dbeafe' : '#fee2e2',
                      color: isSuccess ? '#15803d' : isReversed ? '#1d4ed8' : '#dc2626'
                    }}
                  >
                    {p.payout_status.toUpperCase()}
                  </span>
                  {isFailed && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        reconcileFailedPayout(p.id);
                        if (notify) notify(`Reconciled ${p.redemption_code}: ${p.points_redeemed} pts restored to citizen wallet.`);
                      }}
                      style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RotateCcw size={12} /> Restore Points & Reconcile
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
