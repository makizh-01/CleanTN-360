import React, { useState } from 'react';
import {
  TrendingUp,
  Gift,
  Banknote,
  Recycle,
  Sprout,
  ReceiptText,
  ArrowRight,
  CircleAlert,
  CheckCircle2,
  X,
  CreditCard,
  Clock3,
  XCircle,
  Coins,
  History,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import Banner from '../common/Banner';
import Stat from '../common/Stat';
import Panel from '../common/Panel';
import Status from '../common/Status';
import { useData } from '../../context/DataContext';

export default function WalletPage({ notify }) {
  const {
    wallet,
    transactions,
    redemptions,
    categories,
    rewardSettings,
    deposits,
    requestRedemption
  } = useData();

  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'VOUCHER' | 'DONATE'
  const [pointsToRedeem, setPointsToRedeem] = useState((rewardSettings?.min_redemption_points || 5000).toString());
  const [upiId, setUpiId] = useState('citizen@okaxis');
  const [redeeming, setRedeeming] = useState(false);
  const [formError, setFormError] = useState('');

  const ptsRatio = rewardSettings?.points_per_rupee || 100;
  const minPts = rewardSettings?.min_redemption_points || 5000;
  const monthlyCapRupees = rewardSettings?.monthly_limit_rupees || 100;

  // Real-time calculations
  const availableRupeeValue = (wallet.available_points / ptsRatio).toFixed(2);
  const reservedRupeeValue = ((wallet.reserved_points || 0) / ptsRatio).toFixed(2);
  const earnedRupeeValue = (wallet.lifetime_earned_points / ptsRatio).toFixed(2);
  const redeemedRupeeValue = (wallet.lifetime_redeemed_points / ptsRatio).toFixed(2);

  // Pending reward points from unapproved deposits
  const pendingDeposits = deposits.filter(
    (d) => d.status === 'submitted' || d.status === 'collector_verified'
  );
  const pendingPoints = pendingDeposits.reduce((acc, d) => {
    const rate = d.reward_rate || 50;
    const wt = d.actual_weight_kg || d.weight_kg || 0;
    return acc + Math.round(wt * rate);
  }, 0);
  const pendingRupeeValue = (pendingPoints / ptsRatio).toFixed(2);

  // Current month redemptions (for limit check)
  const currentMonthRedeemedRupees = redemptions
    .filter(r => r.status === 'pending' || r.status === 'completed')
    .reduce((sum, r) => sum + r.rupee_value, 0);

  const inputPointsNum = parseInt(pointsToRedeem, 10) || 0;
  const redeemRupeeVal = (inputPointsNum / ptsRatio).toFixed(2);

  // Recharts: Monthly Earnings & Cumulative Ledger Trend
  const chartData = [
    { name: 'Jun', earned: 0, balance: 0 },
    { name: 'Jul', earned: 0, balance: 0 },
    { name: 'Aug', earned: 0, balance: 0 },
    { name: 'Sep', earned: 0, balance: 0 },
    { name: 'Oct', earned: 0, balance: 0 },
    {
      name: 'Nov (Current)',
      earned: wallet.lifetime_earned_points,
      balance: wallet.available_points
    }
  ];

  async function handleExecuteRedeem(e) {
    e.preventDefault();
    setFormError('');

    if (inputPointsNum <= 0) {
      setFormError('Please enter a valid points amount to redeem.');
      return;
    }

    if (inputPointsNum < minPts) {
      setFormError(`Minimum redemption is ${minPts.toLocaleString()} points (₹${(minPts / ptsRatio).toFixed(2)}).`);
      return;
    }

    if (inputPointsNum > wallet.available_points) {
      setFormError(`Insufficient available points. You have ${wallet.available_points.toLocaleString()} points.`);
      return;
    }

    if ((currentMonthRedeemedRupees + Number(redeemRupeeVal)) > monthlyCapRupees) {
      setFormError(`Monthly redemption limit is ₹${monthlyCapRupees}. You have already requested ₹${currentMonthRedeemedRupees.toFixed(2)} this month.`);
      return;
    }

    if (paymentMethod === 'UPI' && (!upiId.trim() || !upiId.includes('@'))) {
      setFormError('Please enter a valid UPI Virtual Payment Address (e.g. mobile@upi).');
      return;
    }

    setRedeeming(true);
    try {
      const res = await requestRedemption({
        points: inputPointsNum,
        upiId: upiId.trim(),
        paymentMethod
      });
      notify(`Redemption request ${res.request_code} for ${inputPointsNum.toLocaleString()} pts (₹${redeemRupeeVal}) submitted! Points reserved awaiting Admin approval.`);
      setIsRedeemModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Error processing redemption request.');
      notify(err.message || 'Error processing redemption.');
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <>
      <Banner
        kicker="GREEN MONEY WALLET · PHASE 3 ENGINE"
        title="Your verified waste has real financial value."
        desc="Turn clean, segregated waste into Green Money points. Redeem via simulated instant UPI cashouts, certified nursery sapling vouchers, or community mangrove pledges."
      />

      {/* Main Glassmorphic Wallet Balance Card */}
      <div
        className="walletbig"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(8, 122, 60, 0.92), rgba(5, 47, 32, 0.96))',
          boxShadow: '0 15px 40px rgba(5, 47, 32, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.35)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <small style={{ letterSpacing: '1.5px', color: '#bbf7d0', fontWeight: 800 }}>
              MY AVAILABLE GREEN MONEY BALANCE
            </small>
            <strong style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 800, margin: '6px 0', display: 'block' }}>
              {wallet.available_points.toLocaleString()} <i style={{ fontStyle: 'normal', fontSize: '20px', color: '#a7f3d0' }}>POINTS</i>
            </strong>
            <h2 style={{ fontSize: '26px', margin: '4px 0', color: '#ffffff', fontWeight: 800 }}>
              ≈ ₹{availableRupeeValue} INR
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#dcfce7', fontWeight: 600 }}>
              Conversion Standard: {ptsRatio} Points = ₹1.00 · Reserved in Pending: {wallet.reserved_points || 0} pts (₹{reservedRupeeValue})
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
            <button
              type="button"
              className="primary"
              onClick={() => {
                setPaymentMethod('UPI');
                setPointsToRedeem(Math.min(wallet.available_points, Math.max(minPts, 5000)).toString());
                setIsRedeemModalOpen(true);
              }}
              style={{
                background: '#ffffff',
                color: '#064e2b',
                fontWeight: 800,
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Gift size={16} /> Redeem Rewards
            </button>
            <small style={{ fontSize: '9px', color: '#bbf7d0', textAlign: 'center', fontWeight: 700 }}>
              Min: {minPts.toLocaleString()} pts (₹{(minPts / ptsRatio).toFixed(0)}) · Cap: ₹{monthlyCapRupees}/mo
            </small>
          </div>
        </div>
      </div>

      {/* 5-Column Stats Grid */}
      <div className="stats four" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '20px' }}>
        <Stat
          Icon={TrendingUp}
          label="Total Points Earned"
          value={wallet.lifetime_earned_points.toLocaleString()}
          sub={`₹${earnedRupeeValue} Total Value`}
        />
        <Stat
          Icon={Gift}
          label="Total Redeemed"
          value={wallet.lifetime_redeemed_points.toLocaleString()}
          sub={`₹${redeemedRupeeValue} Paid Out`}
          tone="purple"
        />
        <Stat
          Icon={Clock3}
          label="Pending Rewards"
          value={pendingPoints.toLocaleString()}
          sub={`₹${pendingRupeeValue} Awaiting Admin`}
          tone="amber"
        />
        <Stat
          Icon={Banknote}
          label="Monthly Cap Remaining"
          value={`₹${Math.max(0, monthlyCapRupees - currentMonthRedeemedRupees).toFixed(2)}`}
          sub={`Limit: ₹${monthlyCapRupees}/month`}
          tone="blue"
        />
      </div>

      {/* Recharts Balance Trend & Active Rates Grid */}
      <div className="grid2">
        <Panel title="Wallet Balance & Earnings Trend" Icon={TrendingUp}>
          <div style={{ height: '220px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5eee7" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val.toLocaleString()} pts`, 'Points']}
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #cce2d1',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                />
                <Area type="monotone" dataKey="balance" stroke="#16a34a" strokeWidth={2.5} fillOpacity={1} fill="url(#balanceColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', color: '#526d5b', fontWeight: 700 }}>
            <span>Dynamic PostgreSQL Ledger History</span>
            <span style={{ color: '#16a34a' }}>● Verified & Admin Approved</span>
          </div>
        </Panel>

        <Panel title="Active Category Reward Rates" Icon={Recycle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map((c) => (
              <div
                className="rate"
                key={c.id || c.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '9px',
                  background: '#f8faf9',
                  border: '1px solid #e2ece5'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#093a20', fontSize: '12px' }}>
                  <span style={{ fontSize: '16px' }}>{c.icon || '♻'}</span> {c.name}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <b style={{ color: '#16a34a', fontSize: '13px', fontWeight: 800 }}>
                    {c.pointsPerKg} pts/kg
                  </b>
                  <small style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 700 }}>
                    1 kg = ₹{(c.pointsPerKg / ptsRatio).toFixed(2)}
                  </small>
                </div>
              </div>
            ))}
          </div>

          <div className="note" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CircleAlert size={14} style={{ flexShrink: 0, color: '#15803d' }} />
            <small style={{ fontSize: '9.5px', color: '#166534', fontWeight: 700 }}>
              Rates governed by Municipal Administration. Points are calculated exclusively from verified scale weight upon Admin approval.
            </small>
          </div>
        </Panel>
      </div>

      {/* Redemption Request History Table */}
      <Panel title="Reward Redemption History & Payout Status" Icon={History}>
        <div className="tablewrap" style={{ overflowX: 'auto' }}>
          {redemptions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Request Ref</th>
                  <th>Date & Time</th>
                  <th>Method</th>
                  <th>Points</th>
                  <th>Rupee Value</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Admin Remarks</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((r) => (
                  <tr key={r.id}>
                    <td><b>{r.request_code}</b></td>
                    <td>{new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td><span className="tag">{r.payment_method}</span></td>
                    <td style={{ color: '#dc2626', fontWeight: 800 }}>-{r.points.toLocaleString()} pts</td>
                    <td><b>₹{r.rupee_value.toFixed(2)}</b></td>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 5px', borderRadius: '4px', fontSize: '10px' }}>{r.upi_id || 'N/A'}</code></td>
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
                      {r.status === 'rejected' ? (
                        <span style={{ color: '#dc2626', fontSize: '10px', fontWeight: 700 }}>
                          Restored: {r.rejection_reason || 'Administrative rejection'}
                        </span>
                      ) : r.status === 'completed' ? (
                        <span style={{ color: '#16a34a', fontSize: '10px', fontWeight: 700 }}>
                          Simulated Payout Successful
                        </span>
                      ) : (
                        <span style={{ color: '#d97706', fontSize: '10px', fontWeight: 700 }}>
                          Under Admin Review
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 12px', color: '#64748b' }}>
              <Gift size={32} style={{ margin: '0 auto 8px', color: '#16a34a', opacity: 0.4, display: 'block' }} />
              <b style={{ display: 'block', fontSize: '12px', color: '#093a20' }}>No Redemption Requests Submitted</b>
              <small style={{ fontSize: '10px', display: 'block', marginTop: '4px' }}>
                Accumulate at least {minPts.toLocaleString()} Green Money points to request simulated UPI cashouts.
              </small>
            </div>
          )}
        </div>
      </Panel>

      {/* Simulated UPI Redemption Modal */}
      {isRedeemModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <b>
                <CreditCard size={18} />
                Simulated Green Money Cashout
              </b>
              <button
                className="icon-btn"
                onClick={() => setIsRedeemModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Prototype Disclaimer Banner */}
              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                <AlertTriangle size={16} style={{ color: '#b45309', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '10px', color: '#78350f', lineHeight: 1.4, fontWeight: 700 }}>
                  <b>PROTOTYPE SIMULATION NOTICE:</b> Real money is NOT debited or transferred from banking rails. This demonstration models the complete state ledger workflow, points reservation, and administrative approval.
                </div>
              </div>

              {/* Wallet Status Card */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <small style={{ fontSize: '10px', color: '#166534', fontWeight: 800 }}>
                    AVAILABLE BALANCE: {wallet.available_points.toLocaleString()} Points
                  </small>
                  <span style={{ fontSize: '12px', color: '#064e2b', fontWeight: 900 }}>
                    ₹{availableRupeeValue}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#4b5563', marginTop: '4px', fontWeight: 700 }}>
                  <span>Min threshold: {minPts.toLocaleString()} pts</span>
                  <span>Monthly cap: ₹{monthlyCapRupees}</span>
                </div>
              </div>

              {formError && (
                <div className="note" style={{ color: '#b91c1c', borderColor: '#fca5a5', background: '#fef2f2', marginBottom: '12px', fontWeight: 700 }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleExecuteRedeem}>
                {/* Method selector */}
                <label>Payout Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                  {[
                    ['UPI', 'UPI Transfer'],
                    ['VOUCHER', 'Sapling Voucher'],
                    ['DONATE', 'Green Mission']
                  ].map(([m, lbl]) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        border: paymentMethod === m ? '2px solid #16a34a' : '1px solid #d1d5db',
                        background: paymentMethod === m ? '#e8f9ed' : '#ffffff',
                        color: paymentMethod === m ? '#166534' : '#374151',
                        fontSize: '10px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <label>Points to Redeem (Multiple of 100)</label>
                <input
                  type="number"
                  min={minPts}
                  max={wallet.available_points}
                  step="100"
                  className="input"
                  required
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                />

                {/* Quick Points Presets */}
                <div style={{ display: 'flex', gap: '6px', margin: '6px 0 12px', flexWrap: 'wrap' }}>
                  {[minPts, 10000, 20000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPointsToRedeem(preset.toString())}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cde5d3',
                        background: '#f8faf9',
                        fontSize: '9px',
                        fontWeight: 700,
                        color: '#0b3d25',
                        cursor: 'pointer'
                      }}
                    >
                      {preset.toLocaleString()} pts (₹{(preset / ptsRatio).toFixed(0)})
                    </button>
                  ))}
                  {wallet.available_points >= minPts && (
                    <button
                      type="button"
                      onClick={() => setPointsToRedeem(wallet.available_points.toString())}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #16a34a',
                        background: '#dcfce7',
                        fontSize: '9px',
                        fontWeight: 800,
                        color: '#15803d',
                        cursor: 'pointer'
                      }}
                    >
                      Max ({wallet.available_points.toLocaleString()})
                    </button>
                  )}
                </div>

                <div
                  style={{
                    padding: '10px 14px',
                    background: '#e2f7e8',
                    borderRadius: '8px',
                    color: '#087a3c',
                    fontWeight: 800,
                    fontSize: '12px',
                    marginBottom: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>Simulated Payout Value:</span>
                  <span style={{ fontSize: '16px' }}>₹{redeemRupeeVal} INR</span>
                </div>

                {paymentMethod === 'UPI' && (
                  <>
                    <label>Virtual Payment Address (UPI ID)</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="e.g. citizen@okaxis or 9876543210@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </>
                )}

                <div className="note" style={{ fontSize: '9.5px', marginBottom: '14px' }}>
                  <ShieldCheck size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                  Upon submission, {inputPointsNum.toLocaleString()} points will be reserved immediately. The Municipal Admin will review and complete the payout.
                </div>

                <button
                  type="submit"
                  disabled={redeeming || inputPointsNum > wallet.available_points || inputPointsNum < minPts}
                  className="primary full"
                  style={{ fontWeight: 800 }}
                >
                  {redeeming ? 'Submitting Request...' : `Submit Redemption for ${inputPointsNum.toLocaleString()} Points (₹${redeemRupeeVal})`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
