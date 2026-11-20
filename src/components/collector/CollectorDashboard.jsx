import React, { useState } from 'react';
import {
  Scale,
  Recycle,
  Clock3,
  CheckCircle2,
  MapPin,
  Camera,
  AlertCircle,
  FileText,
  Search,
  Filter,
  ShieldAlert,
  Coins,
  PackageCheck,
  Layers
} from 'lucide-react';
import Banner from '../common/Banner';
import Stat from '../common/Stat';
import Panel from '../common/Panel';
import Status from '../common/Status';
import CollectorVerificationModal from './CollectorVerificationModal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { WASTE_CATEGORIES } from '../../lib/constants';

export default function CollectorDashboard({ notify }) {
  const { deposits, collectionPoints } = useData();
  const { profile } = useAuth();

  const [selectedDepositForVerify, setSelectedDepositForVerify] = useState(null);
  const [filterPoint, setFilterPoint] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Assigned hub code (e.g. CTN-CBE-001)
  const assignedCode = profile?.assigned_point_code || 'CTN-CBE-001';
  const assignedHub = collectionPoints.find(p => p.point_code === assignedCode) || collectionPoints[0];

  // 1. Pending verification count
  const pendingDeposits = deposits.filter((d) => d.status === 'submitted');

  // 2. Total deposits verified (verified by collector or further approved by admin)
  const verifiedDeposits = deposits.filter(
    (d) => d.status === 'collector_verified' || d.status === 'admin_approved'
  );

  // 3. Successfully approved deposits by admin
  const approvedDeposits = deposits.filter((d) => d.status === 'admin_approved');

  // 4. Total verified waste weight (kg)
  const totalVerifiedWeight = verifiedDeposits.reduce(
    (sum, d) => sum + (Number(d.actual_weight_kg) || Number(d.weight_kg) || 0),
    0
  );

  // 5. Waste category breakdown
  const categoryBreakdown = Object.keys(WASTE_CATEGORIES).map((catKey) => {
    const meta = WASTE_CATEGORIES[catKey];
    const catDeposits = verifiedDeposits.filter((d) => {
      const cName = (d.category_name || '').toLowerCase();
      return cName.includes(catKey.toLowerCase()) || cName.includes(meta.name.toLowerCase());
    });
    const weight = catDeposits.reduce(
      (sum, d) => sum + (Number(d.actual_weight_kg) || Number(d.weight_kg) || 0),
      0
    );
    return {
      id: catKey,
      name: meta.name,
      icon: meta.icon,
      color: meta.color,
      count: catDeposits.length,
      weight: Number(weight.toFixed(2))
    };
  });

  const displayedQueue = pendingDeposits.filter((d) => {
    const matchesPoint = filterPoint === 'All' || d.point_code === filterPoint;
    const matchesSearch =
      d.deposit_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.citizen_name && d.citizen_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.category_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPoint && matchesSearch;
  });

  return (
    <>
      <Banner
        kicker="FIELD OPERATIONS · DIGITAL SCALE PROTOCOL"
        title={`Field Collector Portal · ${profile?.full_name || 'Collector'}`}
        desc={`Assigned to ${assignedHub?.point_name || 'R.S. Puram Hub'} (${assignedCode}). Verify citizen segregation and capture physical scale measurements.`}
      />

      {/* Role-Based Security Notice as mandated by Section 8 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1px solid #86efac',
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <ShieldAlert size={22} style={{ color: '#15803d', flexShrink: 0 }} />
        <div style={{ fontSize: '11px', color: '#166534', lineHeight: 1.5 }}>
          <b style={{ display: 'block', fontSize: '12px', color: '#14532d', marginBottom: '2px' }}>
            Role-Based Wallet Ledger Security Boundary
          </b>
          Field Collectors record verified digital scale weights and LCD camera evidence only. Collectors <strong>cannot directly credit points or modify citizen wallet balances</strong>. Reward points are calculated on actual weight and credited automatically upon municipal Admin Approval.
        </div>
      </div>

      {/* Primary Field Verification Metrics */}
      <div className="stats four" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <Stat
          Icon={Clock3}
          label="Pending Verification"
          value={pendingDeposits.length}
          tone="amber"
        />
        <Stat
          Icon={Scale}
          label="Total Deposits Verified"
          value={verifiedDeposits.length}
          tone="purple"
        />
        <Stat
          Icon={PackageCheck}
          label="Successfully Approved"
          value={approvedDeposits.length}
          tone="emerald"
        />
        <Stat
          Icon={Recycle}
          label="Total Verified Waste"
          value={`${totalVerifiedWeight.toFixed(2)} kg`}
          tone="blue"
        />
      </div>

      {/* Waste Category Breakdown Cards (Section 8) */}
      <Panel title="Waste Category Segregation Breakdown" Icon={Layers}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '4px' }}>
          {categoryBreakdown.map((cat) => (
            <div
              key={cat.id}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: '#dcfce7', color: '#15803d' }}>
                  {cat.count} verified
                </span>
              </div>
              <b style={{ fontSize: '13px', color: '#1e293b', marginTop: '4px' }}>{cat.name}</b>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#15803d' }}>{cat.weight.toFixed(2)}</span>
                <small style={{ color: '#64748b', fontSize: '10px', fontWeight: 700 }}>kg</small>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Hub Status Card */}
      <div style={{ background: '#fff', border: '1px solid #e2ece5', borderRadius: '14px', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <small style={{ fontSize: '9px', fontWeight: 800, color: '#16a34a', letterSpacing: '1px' }}>
            ACTIVE STATION ASSIGNMENT
          </small>
          <b style={{ display: 'block', fontSize: '15px', color: '#1e3a29' }}>
            {assignedHub?.point_name || 'Collection Hub'} ({assignedCode})
          </b>
          <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#64748b' }}>
            {assignedHub?.address} · Hours: {assignedHub?.operating_hours}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="status completed" style={{ fontSize: '10px' }}>
            <Scale size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Digital Scale: Online & Calibrated
          </span>
        </div>
      </div>

      {/* Pending Deposits Queue */}
      <Panel
        title={`Pending Scale Verifications (${pendingDeposits.length})`}
        Icon={Clock3}
        action={
          <small style={{ color: '#15803d', fontWeight: 800 }}>
            Physical scale photo required per deposit
          </small>
        }
      >
        <div className="filters">
          <div>
            <Search size={16} />
            <input
              placeholder="Search deposit code, citizen or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={filterPoint}
            onChange={(e) => setFilterPoint(e.target.value)}
          >
            <option value="All">All Collection Hubs</option>
            {collectionPoints.map((cp) => (
              <option key={cp.point_code} value={cp.point_code}>
                {cp.point_code} ({cp.point_name.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>

        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Deposit Code</th>
                <th>Citizen</th>
                <th>Collection Hub</th>
                <th>Declared Category</th>
                <th>Citizen Est. Weight</th>
                <th>Est. Points</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedQueue.length ? (
                displayedQueue.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <b>{d.deposit_code}</b>
                      <small style={{ display: 'block', color: '#64748b' }}>
                        {d.submitted_at ? new Date(d.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </small>
                    </td>
                    <td>
                      <b>{d.citizen_name || 'Citizen'}</b>
                      <small style={{ display: 'block', color: '#64748b' }}>{d.citizen_email || ''}</small>
                    </td>
                    <td>
                      <span className="status completed">{d.point_code}</span>
                    </td>
                    <td><b>{d.category_name}</b></td>
                    <td>{d.weight_kg ? `${Number(d.weight_kg).toFixed(2)} kg` : '—'}</td>
                    <td>~{d.estimated_points} pts</td>
                    <td><Status s={d.status} /></td>
                    <td>
                      <button
                        type="button"
                        className="primary"
                        style={{ padding: '6px 12px', fontSize: '10px' }}
                        onClick={() => setSelectedDepositForVerify(d)}
                      >
                        <Scale size={13} /> Weigh & Verify
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '28px', color: '#6b7280' }}>
                    <CheckCircle2 size={24} style={{ margin: '0 auto 6px', color: '#16a34a', display: 'block' }} />
                    No pending deposits waiting for scale verification. You are all caught up!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Collector Verification History */}
      <Panel title="Recent Verified & Forwarded Submissions" Icon={CheckCircle2}>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Deposit Code</th>
                <th>Citizen</th>
                <th>Verified Category</th>
                <th>Actual Scale Weight</th>
                <th>Scale Photo</th>
                <th>Collector Remarks</th>
                <th>Current Status</th>
              </tr>
            </thead>
            <tbody>
              {verifiedDeposits.length ? (
                verifiedDeposits.slice(0, 5).map((v) => (
                  <tr key={v.id}>
                    <td><b>{v.deposit_code}</b></td>
                    <td>{v.citizen_name}</td>
                    <td><b>{v.category_name}</b></td>
                    <td>
                      <b style={{ color: '#15803d' }}>
                        {v.actual_weight_kg ? `${Number(v.actual_weight_kg).toFixed(2)} kg` : `${Number(v.weight_kg).toFixed(2)} kg`}
                      </b>
                    </td>
                    <td>
                      {v.scale_photo_url ? (
                        <a
                          href={v.scale_photo_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#087a3c', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 'bold' }}
                        >
                          <Camera size={12} /> View LCD Photo
                        </a>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>No photo</span>
                      )}
                    </td>
                    <td>
                      <small>{v.collector_remarks || 'Verified on calibrated scale'}</small>
                    </td>
                    <td>
                      <Status s={v.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No verifications completed today. Pending citizen deposits waiting for scale measurement will appear above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Collector Verification Modal */}
      <CollectorVerificationModal
        isOpen={Boolean(selectedDepositForVerify)}
        onClose={() => setSelectedDepositForVerify(null)}
        deposit={selectedDepositForVerify}
        onVerificationComplete={(msg) => notify(msg)}
      />
    </>
  );
}

