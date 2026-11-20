import React, { useState } from 'react';
import {
  ReceiptText,
  Search,
  Download,
  Recycle,
  Wallet,
  Banknote,
  Gift,
  Filter,
  Eye,
  X,
  RefreshCw,
  Coins,
  ShieldCheck,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import Banner from '../common/Banner';
import Stat from '../common/Stat';
import Panel from '../common/Panel';
import Status from '../common/Status';
import { useData } from '../../context/DataContext';

export default function TransactionsPage({ notify }) {
  const { transactions, wallet, deposits, rewardSettings } = useData();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTx, setSelectedTx] = useState(null);

  const ptsRatio = rewardSettings?.points_per_rupee || 100;

  const totalKg = deposits
    .filter((d) => d.status === 'admin_approved')
    .reduce((sum, d) => sum + (d.actual_weight_kg || d.weight_kg || 0), 0);

  const filteredTx = transactions.filter((tx) => {
    const q = query.toLowerCase();
    const matchesSearch =
      (tx.code && tx.code.toLowerCase().includes(q)) ||
      (tx.details && tx.details.toLowerCase().includes(q)) ||
      (tx.date && tx.date.toLowerCase().includes(q)) ||
      (tx.typeLabel && tx.typeLabel.toLowerCase().includes(q));

    const matchesType =
      typeFilter === 'All' ||
      (typeFilter === 'deposit_reward' && (tx.type === 'deposit_reward' || tx.type === 'Waste Deposit')) ||
      (typeFilter === 'redemption' && (tx.type === 'redemption' || tx.type.includes('Redeem'))) ||
      (typeFilter === 'redemption_reversal' && tx.type === 'redemption_reversal') ||
      (typeFilter === 'admin_adjustment' && tx.type === 'admin_adjustment');

    const matchesStatus =
      statusFilter === 'All' ||
      (tx.status && tx.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesType && matchesStatus;
  });

  function handleExportCSV() {
    if (!transactions.length) {
      notify('No transactions to export.');
      return;
    }

    const headers = [
      'Transaction Ref',
      'Date & Time',
      'Type',
      'Points',
      'Rupee Equivalent',
      'Previous Balance',
      'New Balance',
      'Status',
      'Details'
    ];

    const rows = transactions.map((t) => [
      t.code,
      t.date,
      t.typeLabel || t.type,
      t.points,
      `₹${((Math.abs(t.points)) / ptsRatio).toFixed(2)}`,
      t.previous_balance !== undefined ? t.previous_balance : 'N/A',
      t.new_balance !== undefined ? t.new_balance : 'N/A',
      t.status,
      `"${t.details}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CleanTN360_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Transaction ledger exported to CSV successfully.');
  }

  return (
    <>
      <Banner
        kicker="FINANCIAL AUDIT TRAIL · IMMUTABLE LEDGER"
        title="Verified Green Money Transaction Ledger"
        desc="A permanent, cryptographically backed record of all waste deposit credits, digital scale verifications, redemption debits, and administrative adjustments."
      />

      <div className="stats four">
        <Stat
          Icon={Recycle}
          label="Verified Waste Weighed"
          value={`${totalKg.toFixed(2)} kg`}
        />
        <Stat
          Icon={Wallet}
          label="Lifetime Points Earned"
          value={wallet.lifetime_earned_points.toLocaleString()}
          tone="purple"
        />
        <Stat
          Icon={Banknote}
          label="Available Points"
          value={wallet.available_points.toLocaleString()}
          sub={`≈ ₹${(wallet.available_points / ptsRatio).toFixed(2)}`}
          tone="amber"
        />
        <Stat
          Icon={Gift}
          label="Total Ledger Records"
          value={transactions.length}
          tone="blue"
        />
      </div>

      <Panel title="Ledger Search, Filter & Audit Queue" Icon={ReceiptText}>
        {/* Search & Filter Controls */}
        <div
          className="filters"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            marginBottom: '15px'
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }}
            />
            <input
              type="text"
              placeholder="Search by Tx code, details, or date..."
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '34px', margin: 0, width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cce2d1',
                fontSize: '11px',
                fontWeight: 700,
                background: '#ffffff'
              }}
            >
              <option value="All">All Types</option>
              <option value="deposit_reward">Deposit Reward Credit</option>
              <option value="redemption">Redemption Debit</option>
              <option value="redemption_reversal">Redemption Reversal</option>
              <option value="admin_adjustment">Admin Adjustment</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cce2d1',
                fontSize: '11px',
                fontWeight: 700,
                background: '#ffffff'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="Reversed">Reversed</option>
            </select>

            <button
              type="button"
              className="outline"
              onClick={handleExportCSV}
              style={{
                margin: 0,
                padding: '8px 14px',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="tablewrap" style={{ overflowX: 'auto' }}>
          {filteredTx.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Tx Ref</th>
                  <th>Date & Time</th>
                  <th>Activity Type</th>
                  <th>Ledger Details</th>
                  <th>Points</th>
                  <th>Prev Balance</th>
                  <th>New Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <b style={{ color: '#0b3d25' }}>{tx.code}</b>
                    </td>
                    <td style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {tx.date}
                    </td>
                    <td>
                      <span
                        className="tag"
                        style={{
                          background:
                            tx.type === 'deposit_reward'
                              ? '#dcfce7'
                              : tx.type === 'redemption_reversal'
                              ? '#f3e8ff'
                              : '#fee2e2',
                          color:
                            tx.type === 'deposit_reward'
                              ? '#15803d'
                              : tx.type === 'redemption_reversal'
                              ? '#7e22ce'
                              : '#b91c1c',
                          fontWeight: 800,
                          fontSize: '9.5px'
                        }}
                      >
                        {tx.typeLabel || tx.type}
                      </span>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600 }}>{tx.details}</span>
                    </td>
                    <td>
                      <strong
                        style={{
                          color: tx.points > 0 ? '#16a34a' : '#dc2626',
                          fontSize: '13px',
                          fontWeight: 900,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {tx.points > 0 ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()} pts
                      </strong>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>
                      {tx.previous_balance !== undefined ? `${tx.previous_balance.toLocaleString()} pts` : '—'}
                    </td>
                    <td style={{ color: '#093a20', fontSize: '11px', fontWeight: 800 }}>
                      {tx.new_balance !== undefined ? `${tx.new_balance.toLocaleString()} pts` : '—'}
                    </td>
                    <td>
                      <Status
                        type={
                          tx.status === 'Completed' || tx.status === 'Approved'
                            ? 'approved'
                            : tx.status === 'Pending'
                            ? 'pending'
                            : 'rejected'
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedTx(tx)}
                        style={{
                          border: '1px solid #cce2d1',
                          background: '#ffffff',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          cursor: 'pointer',
                          color: '#087a3c',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10px',
                          fontWeight: 800
                        }}
                        title="View Full Ledger Details"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 12px', color: '#64748b' }}>
              <ReceiptText size={36} style={{ color: '#16a34a', opacity: 0.35, margin: '0 auto 8px', display: 'block' }} />
              <b style={{ display: 'block', fontSize: '12px', color: '#0b3d25' }}>No Matching Transaction Records</b>
              <small style={{ fontSize: '10px', display: 'block', marginTop: '4px' }}>
                Try adjusting your search query, transaction type filter, or status criteria.
              </small>
            </div>
          )}
        </div>
      </Panel>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ReceiptText size={18} style={{ color: '#16a34a' }} />
                <b>Ledger Audit Breakdown · {selectedTx.code}</b>
              </div>
              <button
                className="icon-btn"
                onClick={() => setSelectedTx(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div
                style={{
                  background: selectedTx.points > 0 ? '#f0fdf4' : '#fef2f2',
                  border: selectedTx.points > 0 ? '1px solid #bbf7d0' : '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}
              >
                <small style={{ fontSize: '10px', color: '#4b5563', fontWeight: 800, letterSpacing: '0.5px' }}>
                  NET LEDGER IMPACT
                </small>
                <h2
                  style={{
                    fontSize: '28px',
                    margin: '4px 0',
                    color: selectedTx.points > 0 ? '#15803d' : '#b91c1c',
                    fontWeight: 900
                  }}
                >
                  {selectedTx.points > 0 ? `+${selectedTx.points.toLocaleString()}` : selectedTx.points.toLocaleString()} Points
                </h2>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#374151' }}>
                  Equivalent Value: ₹{((Math.abs(selectedTx.points)) / ptsRatio).toFixed(2)} INR
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div style={{ padding: '8px 12px', background: '#f8faf9', borderRadius: '8px', border: '1px solid #e2ece5' }}>
                  <small style={{ fontSize: '9px', color: '#64748b', fontWeight: 700 }}>PREVIOUS BALANCE</small>
                  <b style={{ display: 'block', fontSize: '13px', color: '#1f2937' }}>
                    {selectedTx.previous_balance !== undefined ? `${selectedTx.previous_balance.toLocaleString()} pts` : 'N/A'}
                  </b>
                </div>
                <div style={{ padding: '8px 12px', background: '#f8faf9', borderRadius: '8px', border: '1px solid #e2ece5' }}>
                  <small style={{ fontSize: '9px', color: '#64748b', fontWeight: 700 }}>NEW BALANCE</small>
                  <b style={{ display: 'block', fontSize: '13px', color: '#064e2b' }}>
                    {selectedTx.new_balance !== undefined ? `${selectedTx.new_balance.toLocaleString()} pts` : 'N/A'}
                  </b>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: '#374151', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #edf2ee' }}>
                  <span style={{ fontWeight: 700 }}>Activity Description:</span>
                  <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{selectedTx.details}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #edf2ee' }}>
                  <span style={{ fontWeight: 700 }}>Transaction Type:</span>
                  <span style={{ fontWeight: 800, color: '#0b3d25' }}>{selectedTx.typeLabel || selectedTx.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #edf2ee' }}>
                  <span style={{ fontWeight: 700 }}>Timestamp:</span>
                  <span style={{ fontWeight: 600 }}>{selectedTx.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #edf2ee' }}>
                  <span style={{ fontWeight: 700 }}>Verification & Audit Status:</span>
                  <span style={{ fontWeight: 800, color: '#16a34a' }}>{selectedTx.status}</span>
                </div>
                {selectedTx.reward_rate_used && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #edf2ee' }}>
                    <span style={{ fontWeight: 700 }}>Reward Rate Applied:</span>
                    <span style={{ fontWeight: 800, color: '#16a34a' }}>{selectedTx.reward_rate_used} pts/kg</span>
                  </div>
                )}
                {selectedTx.actual_weight_kg && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #edf2ee' }}>
                    <span style={{ fontWeight: 700 }}>Scale Verified Weight:</span>
                    <span style={{ fontWeight: 800, color: '#0b3d25' }}>{selectedTx.actual_weight_kg} kg</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="outline full"
                onClick={() => setSelectedTx(null)}
                style={{ fontWeight: 800 }}
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
