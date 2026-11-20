import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Recycle,
  Clock3,
  CheckCircle2,
  XCircle,
  MapPin,
  Wallet,
  Scale,
  QrCode,
  Search,
  Plus,
  CircleHelp,
  MessageCircle,
  Send,
  Eye,
  AlertCircle,
  Coins,
  Gift,
  Settings,
  RefreshCw,
  AlertTriangle,
  FileText,
  X,
  History,
  CheckCheck,
  ShieldAlert,
  Zap,
  Brain
} from 'lucide-react';
import Banner from '../common/Banner';
import Stat from '../common/Stat';
import Panel from '../common/Panel';
import Status from '../common/Status';
import DepositApprovalModal from './DepositApprovalModal';
import FraudDetectionQueue from './FraudDetectionQueue';
import AutomationRulesPage from './AutomationRulesPage';
import AIDecisionSupportPage from './AIDecisionSupportPage';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { DISTRICTS, POINTS_TO_RUPEE_RATIO } from '../../lib/constants';

export default function AdminDashboard({ notify }) {
  const {
    deposits,
    collectionPoints,
    tickets,
    categories,
    redemptions,
    rewardSettings,
    transactions,
    auditLogs,
    wallet,
    fraudAlerts = [],
    aiRecommendations = [],
    updateTicketStatus,
    addCollectionPoint,
    processRedemption,
    updateCategoryRate,
    updateRewardSettingsConfig
  } = useData();

  const { profile, demoUsers } = useAuth();

  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'green_money' | 'users' | 'points' | 'tickets'
  const [selectedDepositForApproval, setSelectedDepositForApproval] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState({});

  // Green Money Sub-navigation
  const [greenMoneySubTab, setGreenMoneySubTab] = useState('queue'); // 'queue' | 'rates' | 'settings' | 'wallets' | 'audit'

  // Redemption Action Modal State
  const [selectedRedemptionForAction, setSelectedRedemptionForAction] = useState(null);
  const [redemptionActionType, setRedemptionActionType] = useState('approve'); // 'approve' | 'reject'
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [processingRedemption, setProcessingRedemption] = useState(false);

  // Category Rates Editing State
  const [editingRates, setEditingRates] = useState({});

  // System Settings Editing State
  const [settingsForm, setSettingsForm] = useState({
    points_per_rupee: rewardSettings?.points_per_rupee || 100,
    min_redemption_points: rewardSettings?.min_redemption_points || 5000,
    monthly_limit_rupees: rewardSettings?.monthly_limit_rupees || 100
  });

  // Citizen search state in Wallets
  const [citizenQuery, setCitizenQuery] = useState('');
  const [inspectedCitizen, setInspectedCitizen] = useState(null);

  // New Collection Point Form
  const [newPointCode, setNewPointCode] = useState('');
  const [newPointName, setNewPointName] = useState('');
  const [newDistrict, setNewDistrict] = useState('Coimbatore');
  const [newAddress, setNewAddress] = useState('');

  // QR Modal preview
  const [previewQRPoint, setPreviewQRPoint] = useState(null);

  // Filter calculations
  const pendingApprovals = deposits.filter((d) => d.status === 'collector_verified');
  const approvedDeposits = deposits.filter((d) => d.status === 'admin_approved');
  const rejectedDeposits = deposits.filter((d) => d.status === 'rejected');

  const pendingRedemptions = redemptions.filter((r) => r.status === 'pending');
  const completedRedemptions = redemptions.filter((r) => r.status === 'completed');

  const approvedWeightKg = approvedDeposits.reduce(
    (sum, d) => sum + (d.actual_weight_kg || d.weight_kg || 0),
    0
  );

  const totalPointsIssued = approvedDeposits.reduce(
    (sum, d) => sum + (d.approved_points || 0),
    0
  );

  const totalPointsRedeemed = completedRedemptions.reduce(
    (sum, r) => sum + (r.points || 0),
    0
  );

  const ptsRatio = rewardSettings?.points_per_rupee || 100;
  const totalLiabilityPoints = Math.max(0, totalPointsIssued - totalPointsRedeemed);
  const totalLiabilityRupees = (totalLiabilityPoints / ptsRatio).toFixed(2);

  // Handle New Collection Point
  async function handleCreatePoint(e) {
    e.preventDefault();
    if (!newPointCode.trim() || !newPointName.trim()) {
      notify('Point Code and Name are required.');
      return;
    }

    await addCollectionPoint({
      point_code: newPointCode.trim().toUpperCase(),
      point_name: newPointName.trim(),
      district: newDistrict,
      address: newAddress.trim() || `${newDistrict}, Tamil Nadu`
    });

    notify(`Collection Point ${newPointCode.toUpperCase()} created successfully with unique QR identifier.`);
    setNewPointCode('');
    setNewPointName('');
    setNewAddress('');
  }

  // Handle Ticket Reply
  async function handleSendTicketReply(ticketId) {
    const reply = ticketReplyText[ticketId];
    if (!reply || !reply.trim()) {
      notify('Enter a response before submitting.');
      return;
    }

    await updateTicketStatus(ticketId, 'Resolved', reply.trim());
    notify(`Ticket resolved and response published to citizen.`);
    setTicketReplyText({ ...ticketReplyText, [ticketId]: '' });
  }

  // Handle Redemption Payout Decision (Approve / Reject with Reversal)
  async function handleExecuteRedemptionDecision() {
    if (!selectedRedemptionForAction) return;

    if (redemptionActionType === 'reject' && !rejectionReasonInput.trim()) {
      notify('Please enter a rejection reason to restore citizen points.');
      return;
    }

    setProcessingRedemption(true);
    try {
      const res = await processRedemption({
        redemptionId: selectedRedemptionForAction.id,
        action: redemptionActionType,
        rejectionReason: rejectionReasonInput.trim()
      });

      if (redemptionActionType === 'approve') {
        notify(`Redemption ${res.request_code} approved! Simulated payout completed.`);
      } else {
        notify(`Redemption ${res.request_code} rejected. ${res.points_restored} points restored to citizen.`);
      }
      setSelectedRedemptionForAction(null);
      setRejectionReasonInput('');
    } catch (err) {
      notify(err.message || 'Error processing redemption.');
    } finally {
      setProcessingRedemption(false);
    }
  }

  // Handle Category Rate Save
  async function handleSaveCategoryRate(catId) {
    const rate = editingRates[catId];
    if (!rate || isNaN(rate) || rate <= 0) {
      notify('Enter a valid points per kg rate.');
      return;
    }

    try {
      await updateCategoryRate(catId, rate);
      notify(`Category reward rate updated to ${rate} pts/kg successfully.`);
      const updated = { ...editingRates };
      delete updated[catId];
      setEditingRates(updated);
    } catch (err) {
      notify(err.message || 'Error updating rate.');
    }
  }

  // Handle System Settings Save
  async function handleSaveSettings(e) {
    e.preventDefault();
    try {
      await updateRewardSettingsConfig(settingsForm);
      notify('Reward system settings and limits updated successfully.');
    } catch (err) {
      notify(err.message || 'Error saving reward settings.');
    }
  }

  // Citizens list for wallet inspection
  const uniqueCitizens = demoUsers ? demoUsers.filter(u => u.role === 'citizen') : [];

  return (
    <>
      <Banner
        kicker="TAMIL NADU MUNICIPAL ADMINISTRATION · GREEN MONEY GOVERNANCE"
        title={`Zonal Administrator Console · ${profile?.full_name || 'Admin Officer'}`}
        desc="Audit field scale verifications, govern Green Money rewards & payout queues, configure waste category reward rates, and inspect the state financial ledger."
      />

      <div className="stats four" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '18px' }}>
        <Stat
          Icon={Clock3}
          label="Pending Deposits"
          value={pendingApprovals.length}
          tone="amber"
        />
        <Stat
          Icon={Coins}
          label="Pending Redemptions"
          value={pendingRedemptions.length}
          sub={`₹${pendingRedemptions.reduce((s, r) => s + r.rupee_value, 0).toFixed(2)} requested`}
          tone="purple"
        />
        <Stat
          Icon={Wallet}
          label="Reward Liability"
          value={`₹${totalLiabilityRupees}`}
          sub={`${totalLiabilityPoints.toLocaleString()} unclaimed pts`}
          tone="blue"
        />
        <Stat
          Icon={Scale}
          label="Waste Weighed"
          value={`${approvedWeightKg.toFixed(2)} kg`}
        />
      </div>

      {/* Main Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #e2ece5', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {[
          ['approvals', `Deposit Approvals (${pendingApprovals.length})`, CheckCircle2],
          ['fraud', `Fraud Queue (${fraudAlerts.filter(a => a.investigation_status === 'pending_review').length})`, ShieldAlert],
          ['green_money', `Green Money Management (${pendingRedemptions.length})`, Coins],
          ['ai_advisory', `AI Policy Advisories (${aiRecommendations.filter(r => r.status === 'pending').length})`, Brain],
          ['automation', 'Smart Automations', Zap],
          ['users', 'Citizen & Staff Profiles', Users],
          ['points', 'Collection Hubs & QRs', MapPin],
          ['tickets', `Support Desk (${tickets.filter(t => t.status !== 'Resolved').length})`, MessageCircle]
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            className={activeTab === key ? 'primary' : 'outline'}
            style={{ fontSize: '11px', padding: '8px 14px', fontWeight: 800 }}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ====================================================================
          TAB 1: DEPOSIT APPROVAL QUEUE (PHASE 2 WORKFLOW)
          ==================================================================== */}
      {activeTab === 'approvals' && (
        <Panel
          title={`Collector-Verified Deposits Pending Approval (${pendingApprovals.length})`}
          Icon={CheckCircle2}
          action={
            <small style={{ color: '#087a3c', fontWeight: 800 }}>
              Atomic Wallet Credit on Approval · Double-credit immune
            </small>
          }
        >
          <div className="tablewrap" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Deposit Code</th>
                  <th>Citizen</th>
                  <th>Hub</th>
                  <th>Waste Category</th>
                  <th>Citizen Est.</th>
                  <th>Collector Actual Scale</th>
                  <th>Projected Points</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.length ? (
                  pendingApprovals.map((d) => (
                    <tr key={d.id}>
                      <td><b>{d.deposit_code}</b></td>
                      <td>
                        <span style={{ fontWeight: 800 }}>{d.citizen_name}</span>
                        <small style={{ display: 'block', color: '#64748b' }}>{d.citizen_email || 'Citizen'}</small>
                      </td>
                      <td>{d.point_code}</td>
                      <td>
                        <span className="tag">{d.category_name}</span>
                      </td>
                      <td>{d.weight_kg.toFixed(2)} kg</td>
                      <td style={{ color: '#087a3c', fontWeight: 800 }}>
                        {d.actual_weight_kg ? `${d.actual_weight_kg.toFixed(2)} kg` : 'Scale unverified'}
                      </td>
                      <td style={{ color: '#16a34a', fontWeight: 900 }}>
                        +{Math.round((d.actual_weight_kg || d.weight_kg) * (d.reward_rate || 50))} pts
                      </td>
                      <td>
                        <Status type="verified" />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="primary"
                          style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 800 }}
                          onClick={() => setSelectedDepositForApproval(d)}
                        >
                          Review & Credit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      <CheckCircle2 size={36} style={{ color: '#16a34a', margin: '0 auto 8px', display: 'block' }} />
                      <b>All verified deposits have been approved and credited!</b>
                      <small style={{ display: 'block', marginTop: '4px' }}>
                        When field collectors submit scale measurements, deposits will queue here for atomic approval.
                      </small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* ====================================================================
          TAB 2: GREEN MONEY MANAGEMENT (PHASE 3 WORKFLOW)
          ==================================================================== */}
      {activeTab === 'green_money' && (
        <>
          {/* Sub-navigation Pills */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              ['queue', `Redemption Approvals (${pendingRedemptions.length})`, Gift],
              ['rates', 'Category Reward Rates', Recycle],
              ['settings', 'Policy & Conversion Settings', Settings],
              ['wallets', 'Citizen Wallets & Audit Trail', Wallet]
            ].map(([subKey, subLabel, SubIcon]) => (
              <button
                key={subKey}
                type="button"
                onClick={() => setGreenMoneySubTab(subKey)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '20px',
                  border: greenMoneySubTab === subKey ? '1.5px solid #16a34a' : '1px solid #cde5d3',
                  background: greenMoneySubTab === subKey ? '#e8f9ed' : '#ffffff',
                  color: greenMoneySubTab === subKey ? '#064e2b' : '#374151',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <SubIcon size={13} />
                {subLabel}
              </button>
            ))}
          </div>

          {/* SUB-SECTION 1: REDEMPTION PAYOUT QUEUE */}
          {greenMoneySubTab === 'queue' && (
            <Panel
              title={`Simulated Redemption Requests (${redemptions.length})`}
              Icon={Gift}
              action={
                <small style={{ color: '#16a34a', fontWeight: 800 }}>
                  Prototype UPI Payouts · Ledger Reversal Guaranteed
                </small>
              }
            >
              <div className="tablewrap" style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Request Ref</th>
                      <th>Citizen</th>
                      <th>Date</th>
                      <th>Points</th>
                      <th>Rupee Value</th>
                      <th>Payout Mode</th>
                      <th>Destination</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redemptions.length ? (
                      redemptions.map((r) => (
                        <tr key={r.id}>
                          <td><b>{r.request_code}</b></td>
                          <td>
                            <span style={{ fontWeight: 800 }}>{r.citizen_name}</span>
                            <small style={{ display: 'block', color: '#64748b' }}>{r.citizen_email || 'Citizen'}</small>
                          </td>
                          <td style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                            {new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ color: '#dc2626', fontWeight: 900 }}>
                            -{r.points.toLocaleString()} pts
                          </td>
                          <td style={{ fontWeight: 800, color: '#093a20' }}>
                            ₹{r.rupee_value.toFixed(2)}
                          </td>
                          <td><span className="tag">{r.payment_method}</span></td>
                          <td>
                            <code style={{ background: '#f1f5f9', padding: '2px 5px', borderRadius: '4px', fontSize: '10px' }}>
                              {r.upi_id || 'N/A'}
                            </code>
                          </td>
                          <td>
                            <Status
                              type={
                                r.status === 'completed'
                                  ? 'approved'
                                  : r.status === 'rejected'
                                  ? 'rejected'
                                  : 'pending'
                              }
                            />
                          </td>
                          <td>
                            {r.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  className="primary"
                                  style={{ padding: '5px 10px', fontSize: '10px', fontWeight: 800 }}
                                  onClick={() => {
                                    setSelectedRedemptionForAction(r);
                                    setRedemptionActionType('approve');
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="outline"
                                  style={{ padding: '5px 8px', fontSize: '10px', fontWeight: 800, color: '#dc2626', borderColor: '#fca5a5' }}
                                  onClick={() => {
                                    setSelectedRedemptionForAction(r);
                                    setRedemptionActionType('reject');
                                    setRejectionReasonInput('');
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <small style={{ color: '#64748b', fontWeight: 700, fontSize: '10px' }}>
                                {r.status === 'completed' ? 'Simulated Paid' : `Rejected: ${r.rejection_reason || ''}`}
                              </small>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                          <Gift size={36} style={{ color: '#16a34a', opacity: 0.35, margin: '0 auto 8px', display: 'block' }} />
                          <b>No Pending Redemption Requests</b>
                          <small style={{ display: 'block', marginTop: '4px' }}>
                            When citizens submit reward cashout requests, they will queue here for administrative sign-off.
                          </small>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {/* SUB-SECTION 2: CATEGORY REWARD RATES */}
          {greenMoneySubTab === 'rates' && (
            <Panel title="Waste Category Reward Rates Configuration" Icon={Recycle}>
              <div style={{ marginBottom: '14px', fontSize: '11px', color: '#4b6353', fontWeight: 600 }}>
                Adjust points awarded per kilogram for each segregated waste category. When an administrator approves a deposit, points are locked at the rate active during approval.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {categories.map((cat) => {
                  const isEditing = editingRates[cat.id] !== undefined;
                  const currentRate = isEditing ? editingRates[cat.id] : cat.pointsPerKg;
                  const rupeeRate = (currentRate / ptsRatio).toFixed(2);

                  return (
                    <div
                      key={cat.id || cat.name}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1.5px solid #d8efdf',
                        boxShadow: '0 4px 12px rgba(8, 122, 60, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <b style={{ fontSize: '15px', color: '#093a20', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>{cat.icon || '♻'}</span> {cat.name}
                          </b>
                          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 900 }}>
                            1 kg = ₹{rupeeRate}
                          </span>
                        </div>
                        <p style={{ fontSize: '10.5px', color: '#64748b', margin: '0 0 14px', lineHeight: 1.4, fontWeight: 600 }}>
                          {cat.desc}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '9.5px', margin: '0 0 3px', color: '#374151' }}>Points per KG:</label>
                          <input
                            type="number"
                            min="1"
                            max="500"
                            className="input"
                            style={{ margin: 0, padding: '7px 10px', fontSize: '12px' }}
                            value={currentRate}
                            onChange={(e) => setEditingRates({ ...editingRates, [cat.id]: e.target.value })}
                          />
                        </div>
                        <button
                          type="button"
                          className="primary"
                          style={{ marginTop: '16px', padding: '8px 14px', fontSize: '11px', fontWeight: 800 }}
                          onClick={() => handleSaveCategoryRate(cat.id)}
                        >
                          Update Rate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {/* SUB-SECTION 3: SYSTEM CONVERSION & POLICY SETTINGS */}
          {greenMoneySubTab === 'settings' && (
            <Panel title="Green Money Financial Policy & Limits" Icon={Settings}>
              <form onSubmit={handleSaveSettings} style={{ maxWidth: '600px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label>Point-to-Rupee Conversion Standard (Points per ₹1.00)</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    className="input"
                    value={settingsForm.points_per_rupee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, points_per_rupee: parseInt(e.target.value, 10) || 100 })}
                  />
                  <small style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '3px', fontWeight: 600 }}>
                    Pilot baseline: 100 points = ₹1.00 INR (1 point = 1 Paisa).
                  </small>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label>Minimum Redemption Threshold (Points)</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    className="input"
                    value={settingsForm.min_redemption_points}
                    onChange={(e) => setSettingsForm({ ...settingsForm, min_redemption_points: parseInt(e.target.value, 10) || 5000 })}
                  />
                  <small style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '3px', fontWeight: 600 }}>
                    Citizens must accumulate at least this amount to initiate a payout request (Currently {settingsForm.min_redemption_points.toLocaleString()} pts = ₹{(settingsForm.min_redemption_points / settingsForm.points_per_rupee).toFixed(2)}).
                  </small>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label>Monthly Citizen Reward Cap (Maximum Rupees per Month)</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    className="input"
                    value={settingsForm.monthly_limit_rupees}
                    onChange={(e) => setSettingsForm({ ...settingsForm, monthly_limit_rupees: parseInt(e.target.value, 10) || 100 })}
                  />
                  <small style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '3px', fontWeight: 600 }}>
                    Prevents rogue accumulation. Caps the simulated payout allowed per citizen per calendar month (Currently ₹{settingsForm.monthly_limit_rupees}/month).
                  </small>
                </div>

                <button
                  type="submit"
                  className="primary"
                  style={{ padding: '10px 22px', fontSize: '12px', fontWeight: 800 }}
                >
                  Save Reward System Policy
                </button>
              </form>
            </Panel>
          )}

          {/* SUB-SECTION 4: CITIZEN WALLETS & AUDIT TRAIL */}
          {greenMoneySubTab === 'wallets' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <Panel title="Citizen Wallet Balances & Ledger Inspection" Icon={Wallet}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="text"
                      className="input"
                      placeholder="Search citizen name or email..."
                      value={citizenQuery}
                      onChange={(e) => setCitizenQuery(e.target.value)}
                      style={{ paddingLeft: '32px', margin: 0 }}
                    />
                  </div>
                </div>

                <div className="tablewrap" style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Citizen Name</th>
                        <th>District</th>
                        <th>Available Points</th>
                        <th>Reserved (Pending)</th>
                        <th>Lifetime Earned</th>
                        <th>Lifetime Redeemed</th>
                        <th>Audit Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Active citizen row */}
                      <tr>
                        <td>
                          <b>{profile?.full_name || 'Active Citizen'}</b>
                          <small style={{ display: 'block', color: '#64748b' }}>{profile?.email || 'citizen@cleantn360.org'}</small>
                        </td>
                        <td>{profile?.district || 'Coimbatore'}</td>
                        <td><b style={{ color: '#16a34a', fontSize: '13px' }}>{wallet.available_points.toLocaleString()} pts (₹{(wallet.available_points / ptsRatio).toFixed(2)})</b></td>
                        <td style={{ color: '#d97706', fontWeight: 800 }}>{(wallet.reserved_points || 0).toLocaleString()} pts</td>
                        <td>{wallet.lifetime_earned_points.toLocaleString()} pts</td>
                        <td>{wallet.lifetime_redeemed_points.toLocaleString()} pts</td>
                        <td>
                          <button
                            type="button"
                            className="outline"
                            style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 800 }}
                            onClick={() => setInspectedCitizen({ name: profile?.full_name || 'Active Citizen', email: profile?.email || 'citizen@cleantn360.org' })}
                          >
                            <FileText size={12} /> Inspect Ledger
                          </button>
                        </td>
                      </tr>
                      {uniqueCitizens
                        .filter(u => u.full_name !== (profile?.full_name || 'Active Citizen') && (u.full_name.toLowerCase().includes(citizenQuery.toLowerCase()) || u.email.toLowerCase().includes(citizenQuery.toLowerCase())))
                        .map(c => (
                          <tr key={c.id}>
                            <td>
                              <b>{c.full_name}</b>
                              <small style={{ display: 'block', color: '#64748b' }}>{c.email}</small>
                            </td>
                            <td>{c.district}</td>
                            <td>0 pts</td>
                            <td>0 pts</td>
                            <td>0 pts</td>
                            <td>0 pts</td>
                            <td>
                              <button
                                type="button"
                                className="outline"
                                style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 800 }}
                                onClick={() => setInspectedCitizen(c)}
                              >
                                <FileText size={12} /> Inspect Ledger
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              {/* Administrative Audit Log Table */}
              <Panel title="System Governance Audit Log" Icon={History}>
                <div className="tablewrap" style={{ overflowX: 'auto' }}>
                  {auditLogs.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Action</th>
                          <th>Administrator</th>
                          <th>Operation Audit Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id}>
                            <td style={{ fontSize: '10.5px', whiteSpace: 'nowrap' }}>
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td><span className="tag">{log.action}</span></td>
                            <td><b>{log.performed_by}</b></td>
                            <td style={{ fontSize: '11px', fontWeight: 600 }}>{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '11px' }}>
                      No administrative audit records logged yet in this session. All rate changes, approvals, and reversals are immutably logged here.
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          )}
        </>
      )}

      {/* ====================================================================
          TAB 3: USERS & STAFF MANAGEMENT
          ==================================================================== */}
      {activeTab === 'users' && (
        <Panel title="Registered State Municipal Accounts & Assigned Roles" Icon={Users}>
          <div className="tablewrap" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>User / Official Name</th>
                  <th>Email Address</th>
                  <th>Designated Role</th>
                  <th>Assigned District</th>
                  <th>Hub Assignment</th>
                  <th>Verification Status</th>
                </tr>
              </thead>
              <tbody>
                {demoUsers.map((u) => (
                  <tr key={u.id}>
                    <td><b>{u.full_name}</b></td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className="tag"
                        style={{
                          background: u.role === 'admin' ? '#fef3c7' : u.role === 'collector' ? '#e0f2fe' : '#dcfce7',
                          color: u.role === 'admin' ? '#b45309' : u.role === 'collector' ? '#0369a1' : '#15803d',
                          fontWeight: 800
                        }}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{u.district}</td>
                    <td>{u.assigned_point_code || 'Statewide'}</td>
                    <td><span className="status verified">Active Credential</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* ====================================================================
          TAB 4: COLLECTION HUBS & QR CODES
          ==================================================================== */}
      {activeTab === 'points' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
          <Panel title="Authorized Collection Hubs & Station QRs" Icon={MapPin}>
            <div className="tablewrap" style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Hub Code</th>
                    <th>Station Name</th>
                    <th>District</th>
                    <th>Accepted Waste</th>
                    <th>QR Action</th>
                  </tr>
                </thead>
                <tbody>
                  {collectionPoints.map((cp) => (
                    <tr key={cp.id}>
                      <td><b>{cp.point_code}</b></td>
                      <td>{cp.point_name}</td>
                      <td>{cp.district}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {cp.accepted_waste_types.map((w) => (
                            <span key={w} className="tag" style={{ fontSize: '8.5px', padding: '2px 5px' }}>{w}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="outline"
                          style={{ padding: '4px 8px', fontSize: '9px', fontWeight: 800 }}
                          onClick={() => setPreviewQRPoint(cp)}
                        >
                          <QrCode size={12} /> Inspect QR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Add New Collection Hub" Icon={Plus}>
            <form onSubmit={handleCreatePoint}>
              <label>Station Code (Unique ID)</label>
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. CTN-MDU-001"
                value={newPointCode}
                onChange={(e) => setNewPointCode(e.target.value.toUpperCase())}
              />

              <label>Station / Hub Name</label>
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. Meenakshi Civic Sorting Hub"
                value={newPointName}
                onChange={(e) => setNewPointName(e.target.value)}
              />

              <label>District Jurisdiction</label>
              <select
                className="input"
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <label>Physical Address</label>
              <input
                type="text"
                className="input"
                placeholder="Street address, Madurai · 625001"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />

              <button type="submit" className="primary full" style={{ marginTop: '12px', fontWeight: 800 }}>
                Provision Hub & Generate QR
              </button>
            </form>
          </Panel>
        </div>
      )}

      {/* ====================================================================
          TAB 5: SUPPORT TICKETS
          ==================================================================== */}
      {activeTab === 'tickets' && (
        <Panel title={`Citizen Grievances & Support Desk (${tickets.length})`} Icon={MessageCircle}>
          <div className="tablewrap" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Ticket Ref</th>
                  <th>Category</th>
                  <th>Citizen Subject & Query</th>
                  <th>Status</th>
                  <th>Administrative Resolution</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length ? (
                  tickets.map((t) => (
                    <tr key={t.id}>
                      <td><b>{t.ticket_code}</b></td>
                      <td><span className="tag">{t.category}</span></td>
                      <td>
                        <b>{t.subject}</b>
                        <small style={{ display: 'block', color: '#64748b', marginTop: '2px' }}>{t.description}</small>
                      </td>
                      <td><Status type={t.status === 'Resolved' ? 'approved' : 'pending'} /></td>
                      <td>
                        {t.status === 'Resolved' ? (
                          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                            Response: "{t.admin_response}"
                          </span>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                              type="text"
                              placeholder="Type resolution reply..."
                              className="input"
                              style={{ margin: 0, padding: '6px', fontSize: '9px' }}
                              value={ticketReplyText[t.id] || ''}
                              onChange={(e) => setTicketReplyText({ ...ticketReplyText, [t.id]: e.target.value })}
                            />
                            <button
                              type="button"
                              className="primary"
                              style={{ padding: '6px 10px', fontSize: '9px' }}
                              onClick={() => handleSendTicketReply(t.id)}
                            >
                              <Send size={11} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      No support tickets or citizen grievances currently open. All inquiries are resolved!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* ====================================================================
          MODALS
          ==================================================================== */}

      {/* Redemption Payout Decision Modal */}
      {selectedRedemptionForAction && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coins size={18} style={{ color: redemptionActionType === 'approve' ? '#16a34a' : '#dc2626' }} />
                <b>
                  {redemptionActionType === 'approve' ? 'Authorize Simulated Payout' : 'Reject Redemption & Restore Points'}
                </b>
              </div>
              <button className="icon-btn" onClick={() => setSelectedRedemptionForAction(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: '#f8faf9', border: '1px solid #d8efdf', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Request Code:</span>
                  <b style={{ color: '#093a20' }}>{selectedRedemptionForAction.request_code}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Citizen Beneficiary:</span>
                  <b>{selectedRedemptionForAction.citizen_name}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Requested Debit:</span>
                  <b style={{ color: '#dc2626' }}>{selectedRedemptionForAction.points.toLocaleString()} points</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Simulated Payout:</span>
                  <b style={{ color: '#16a34a', fontSize: '14px' }}>₹{selectedRedemptionForAction.rupee_value.toFixed(2)} INR</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Destination UPI:</span>
                  <code>{selectedRedemptionForAction.upi_id}</code>
                </div>
              </div>

              {redemptionActionType === 'reject' ? (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#b91c1c' }}>Rejection Reason (Mandatory Audit Requirement) *</label>
                  <textarea
                    className="input"
                    rows="3"
                    required
                    placeholder="e.g. Invalid UPI handle, failed verification, or user cancellation."
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                  />
                  <small style={{ fontSize: '10px', color: '#7f1d1d', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                    Rejection will atomically restore {selectedRedemptionForAction.points.toLocaleString()} points to the citizen's available balance and log a reversal transaction.
                  </small>
                </div>
              ) : (
                <div className="note" style={{ marginBottom: '16px', fontSize: '10.5px' }}>
                  <ShieldCheck size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                  Approving will mark this request as completed, release the {selectedRedemptionForAction.points.toLocaleString()} reserved points, and notify the citizen.
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className={redemptionActionType === 'approve' ? 'primary full' : 'outline full'}
                  style={redemptionActionType === 'reject' ? { color: '#dc2626', borderColor: '#fca5a5' } : {}}
                  disabled={processingRedemption}
                  onClick={handleExecuteRedemptionDecision}
                >
                  {processingRedemption
                    ? 'Processing...'
                    : redemptionActionType === 'approve'
                    ? 'Confirm & Authorize Payout'
                    : 'Confirm Rejection & Restore Points'}
                </button>
                <button
                  type="button"
                  className="outline"
                  onClick={() => setSelectedRedemptionForAction(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Citizen Ledger Inspection Modal */}
      {inspectedCitizen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ReceiptText size={18} style={{ color: '#16a34a' }} />
                <b>Ledger Records for {inspectedCitizen.name}</b>
              </div>
              <button className="icon-btn" onClick={() => setInspectedCitizen(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px', marginBottom: '12px' }}>
                <div>
                  <small style={{ fontSize: '9px', color: '#166534', fontWeight: 800 }}>CITIZEN BENEFICIARY</small>
                  <b style={{ display: 'block', fontSize: '14px', color: '#064e2b' }}>{inspectedCitizen.name}</b>
                  <small style={{ color: '#4b5563' }}>{inspectedCitizen.email}</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <small style={{ fontSize: '9px', color: '#166534', fontWeight: 800 }}>AVAILABLE GREEN MONEY</small>
                  <b style={{ display: 'block', fontSize: '16px', color: '#16a34a' }}>{wallet.available_points.toLocaleString()} pts</b>
                  <small style={{ color: '#064e2b' }}>≈ ₹{(wallet.available_points / ptsRatio).toFixed(2)}</small>
                </div>
              </div>

              <div className="tablewrap" style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Points</th>
                      <th>Prev</th>
                      <th>New</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length ? (
                      transactions.map((t) => (
                        <tr key={t.id}>
                          <td><b>{t.code}</b></td>
                          <td style={{ fontSize: '10px' }}>{t.date}</td>
                          <td><span className="tag" style={{ fontSize: '9px' }}>{t.typeLabel || t.type}</span></td>
                          <td style={{ color: t.points > 0 ? '#16a34a' : '#dc2626', fontWeight: 800 }}>
                            {t.points > 0 ? `+${t.points}` : t.points}
                          </td>
                          <td style={{ fontSize: '10px' }}>{t.previous_balance !== undefined ? t.previous_balance : '—'}</td>
                          <td style={{ fontSize: '10px', fontWeight: 700 }}>{t.new_balance !== undefined ? t.new_balance : '—'}</td>
                          <td><span style={{ fontSize: '9px', fontWeight: 800, color: '#16a34a' }}>{t.status}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                          No transactions recorded for this citizen.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Inspection Modal */}
      {previewQRPoint && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '380px', textAlign: 'center' }}>
            <div className="modal-header">
              <b>Hub QR Code · {previewQRPoint.point_code}</b>
              <button className="icon-btn" onClick={() => setPreviewQRPoint(null)}>
                <XCircle size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '24px', background: '#fff', border: '2px solid #087a3c', borderRadius: '12px', display: 'inline-block', margin: '10px 0' }}>
                <QrCode size={160} style={{ color: '#087a3c' }} />
                <b style={{ display: 'block', fontSize: '16px', marginTop: '10px', color: '#0f172a' }}>
                  {previewQRPoint.point_code}
                </b>
                <small style={{ color: '#64748b' }}>{previewQRPoint.point_name}</small>
              </div>
              <p style={{ fontSize: '10px', color: '#64748b' }}>
                Print and laminate this QR sticker at the physical bin / scale station. Citizens scan this to initiate waste deposits.
              </p>
              <button
                type="button"
                className="outline full"
                onClick={() => {
                  notify(`QR template for ${previewQRPoint.point_code} sent to printer.`);
                  setPreviewQRPoint(null);
                }}
              >
                Print Official Station Placard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 5 TABS: FRAUD REVIEW QUEUE, AUTOMATIONS & AI ADVISORY */}
      {activeTab === 'fraud' && (
        <FraudDetectionQueue notify={notify} />
      )}

      {activeTab === 'automation' && (
        <AutomationRulesPage notify={notify} />
      )}

      {activeTab === 'ai_advisory' && (
        <AIDecisionSupportPage notify={notify} />
      )}

      {/* Review & Approval Modal */}
      <DepositApprovalModal
        isOpen={Boolean(selectedDepositForApproval)}
        onClose={() => setSelectedDepositForApproval(null)}
        deposit={selectedDepositForApproval}
        onActionSuccess={(msg) => notify(msg)}
      />
    </>
  );
}
