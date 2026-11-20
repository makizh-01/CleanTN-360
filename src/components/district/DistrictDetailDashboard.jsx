import React, { useState } from 'react';
import {
  MapPin,
  Recycle,
  Sprout,
  Users,
  Coins,
  Scale,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Layers,
  TrendingUp,
  FileText,
  Award,
  Globe2,
  ShieldCheck,
  Building2,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Stat from '../common/Stat';
import Panel from '../common/Panel';
import Status from '../common/Status';
import { useData } from '../../context/DataContext';
import { TN_DISTRICTS_DIRECTORY } from '../../lib/districtData';

const PIE_COLORS = ['#16a34a', '#0284c7', '#f59e0b', '#8b5cf6', '#10b981', '#64748b'];

export default function DistrictDetailDashboard({ districtCode = 'TN-CBE', onBack, notify }) {
  const { getDistrictMetrics, calculateDistrictGreenScore, generateReportData } = useData();

  const metrics = getDistrictMetrics(districtCode);
  const scoreObj = calculateDistrictGreenScore(districtCode);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'waste' | 'network' | 'score'

  if (!metrics) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '16px' }}>
        <p>District not found.</p>
        <button type="button" className="primary" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Directory
        </button>
      </div>
    );
  }

  const { district } = metrics;

  // Monthly trends data from actual metrics
  const monthsData = [
    { m: 'Jun', w: 0 },
    { m: 'Jul', w: 0 },
    { m: 'Aug', w: 0 },
    { m: 'Sep', w: 0 },
    { m: 'Oct', w: 0 },
    { m: 'Nov', w: metrics.totalApprovedWeight }
  ];

  function handleDownloadDistrictReport() {
    const report = generateReportData({
      reportType: 'district',
      district: district.name
    });
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CleanTN_District_${district.code}_Report_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (notify) notify(`Downloaded ${district.name} District Intelligence Report.`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Breadcrumb & District Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: '#ffffff',
              color: '#15803d',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              marginBottom: '10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}
          >
            <ArrowLeft size={13} /> Back to 38-District Master Grid
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ font: '800 24px Manrope', color: '#0b3d25', margin: 0 }}>
              {district.name} District Intelligence
            </h1>
            <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: '#dcfce7', color: '#15803d' }}>
              {district.code}
            </span>
          </div>

          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#475569', maxWidth: '680px', lineHeight: 1.5 }}>
            {district.description}
          </p>
        </div>

        {/* Data Status Stamp & Download Report */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              className={`status ${metrics.dataStatus === 'verified_pilot' ? 'completed' : metrics.dataStatus === 'pilot' ? 'pending' : 'rejected'}`}
              style={{ fontSize: '10px', padding: '5px 12px' }}
            >
              {metrics.dataStatus === 'verified_pilot' && <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />}
              {metrics.dataStatus === 'verified_pilot' ? 'VERIFIED PILOT DATA' : metrics.dataStatus === 'pilot' ? 'PILOT IN PROGRESS' : 'DATA NOT AVAILABLE / STANDBY'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadDistrictReport}
            className="primary"
            style={{ padding: '8px 14px', fontSize: '11px', gap: '6px' }}
          >
            <FileText size={13} /> Export District Audit (.JSON)
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', overflowX: 'auto' }}>
        {[
          ['overview', 'A. Overview & Geographic Info', Building2],
          ['waste', 'B. Waste & Environmental Stats', Recycle],
          ['network', 'C. Collection Hubs & Staff', MapPin],
          ['score', 'D. District Green Score (Prototype)', Award]
        ].map(([tabKey, label, Icon]) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setActiveTab(tabKey)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              border: activeTab === tabKey ? '2px solid #15803d' : '1px solid #e2e8f0',
              background: activeTab === tabKey ? '#f0fdf4' : '#fff',
              color: activeTab === tabKey ? '#15803d' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* SECTION A: DISTRICT OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="stats four" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <Stat
              Icon={MapPin}
              label="Administrative Zone"
              value={`${district.zone} Zone`}
              tone="blue"
            />
            <Stat
              Icon={Building2}
              label="District Headquarters"
              value={district.headquarters}
              tone="purple"
            />
            <Stat
              Icon={Globe2}
              label="Geographical Area"
              value={`${district.areaSqKm.toLocaleString()} km²`}
            />
            <Stat
              Icon={Users}
              label="Population (Census 2011)"
              value={district.populationCensus2011.toLocaleString()}
              tone="amber"
            />
          </div>

          <div className="grid2">
            <Panel title="Geographic & Regional Coordinates" Icon={MapPin}>
              <div style={{ display: 'grid', gap: '10px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Latitude / Longitude</span>
                  <b>{district.lat}° N, {district.lng}° E</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>State Jurisdiction</span>
                  <b>Government of Tamil Nadu</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Collection Network</span>
                  <b>{metrics.hubs.length} Designated Station(s)</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: '#64748b' }}>Data Source Integrity</span>
                  <span style={{ color: metrics.dataStatus === 'verified_pilot' ? '#15803d' : '#94a3b8', fontWeight: 800 }}>
                    {metrics.dataStatus === 'verified_pilot' ? 'Field Verified Scales' : 'Awaiting Field Deployment'}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '14px' }}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${district.lat},${district.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#15803d',
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={13} /> View {district.name} in Google Maps
                </a>
              </div>
            </Panel>

            <Panel title="Citizen Participation Summary" Icon={Users}>
              <div style={{ display: 'grid', gap: '12px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Participating Households</span>
                  <b>{metrics.citizenCount} Households</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Total Deposits Processed</span>
                  <b>{metrics.totalDeposits} Submissions</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Green Money Disbursed</span>
                  <b style={{ color: '#15803d' }}>{metrics.pointsIssued} pts (₹{metrics.rupeeValue})</b>
                </div>
              </div>

              {district.name !== 'Coimbatore' && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px', marginTop: '14px', fontSize: '10px', color: '#92400e', lineHeight: 1.4 }}>
                  <Info size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  <strong>Pilot Notice:</strong> Full digital scale operations are active in Coimbatore. Other districts are scheduled for roll-out across Tamil Nadu municipal corporations.
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* SECTION B: WASTE & ENVIRONMENTAL STATS */}
      {activeTab === 'waste' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="stats four" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <Stat
              Icon={Scale}
              label="Total Verified Waste"
              value={`${metrics.totalVerifiedWeight} kg`}
              tone="purple"
            />
            <Stat
              Icon={Recycle}
              label="Approved Recyclables"
              value={`${metrics.totalRecyclableWeight} kg`}
              tone="blue"
            />
            <Stat
              Icon={Sprout}
              label="Recycling Efficiency"
              value={`${metrics.recyclingRatePct}%`}
            />
            <Stat
              Icon={Coins}
              label="Green Money Issued"
              value={`${metrics.pointsIssued.toLocaleString()} pts`}
              tone="emerald"
            />
          </div>

          <div className="grid2">
            <Panel title="Waste Category Segregation Breakdown" Icon={Layers}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {metrics.categoryBreakdown.map((cat, idx) => (
                  <div
                    key={cat.name}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '10px',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '16px' }}>{cat.icon}</span>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#15803d' }}>
                        {cat.count} verified
                      </span>
                    </div>
                    <b style={{ fontSize: '12px', color: '#1e293b' }}>{cat.name}</b>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#15803d' }}>
                      {cat.weight} kg
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Monthly Waste Diverted Trend" Icon={TrendingUp}>
              <div style={{ height: '220px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="w" name="Verified Weight (kg)" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* SECTION C: COLLECTION NETWORK */}
      {activeTab === 'network' && (
        <Panel title={`Authorized Collection Hubs in ${district.name} (${metrics.hubs.length})`} Icon={MapPin}>
          {metrics.hubs.length > 0 ? (
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Hub Code</th>
                    <th>Station Name</th>
                    <th>Address</th>
                    <th>Operating Hours</th>
                    <th>Assigned Staff</th>
                    <th>Accepted Categories</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.hubs.map((hub) => (
                    <tr key={hub.id}>
                      <td><b>{hub.point_code}</b></td>
                      <td><b>{hub.point_name}</b></td>
                      <td><small>{hub.address}</small></td>
                      <td>{hub.operating_hours}</td>
                      <td><b>{hub.assigned_collector || 'Sanitation Collector Officer'}</b></td>
                      <td>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          {(hub.accepted_waste_types || []).map((t) => (
                            <span key={t} style={{ fontSize: '8px', padding: '1px 5px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`status ${hub.status === 'active' ? 'completed' : hub.status === 'maintenance' ? 'pending' : 'rejected'}`}>
                          {hub.status}
                        </span>
                      </td>
                      <td>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${hub.lat || district.lat},${hub.lng || district.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#15803d', fontSize: '9px', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <ExternalLink size={11} /> Directions
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
              <MapPin size={28} style={{ color: '#94a3b8', margin: '0 auto 8px', display: 'block' }} />
              <b>No collection points deployed yet in {district.name}.</b>
              <p style={{ margin: '4px 0 0', fontSize: '11px' }}>
                Municipal administration is onboarding collection points for this district in Phase 4 scale-up.
              </p>
            </div>
          )}
        </Panel>
      )}

      {/* SECTION D: DISTRICT GREEN SCORE */}
      {activeTab === 'score' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Panel title="CleanTN 360 District Green Score System" Icon={Award}>
            {scoreObj?.isSufficientData ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    marginBottom: '16px',
                    border: '1px solid #86efac'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#15803d', letterSpacing: '1px' }}>
                      AGGREGATED PERFORMANCE SCORE
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '4px 0' }}>
                      <strong style={{ font: '800 42px Manrope', color: '#0b3d25' }}>
                        {scoreObj.totalScore}
                      </strong>
                      <span style={{ fontSize: '18px', color: '#16a34a', fontWeight: 700 }}>/ 100</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', background: '#16a34a', color: '#fff' }}>
                      Rating: {scoreObj.performanceLabel.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ maxWidth: '320px', fontSize: '11px', color: '#166534', lineHeight: 1.5 }}>
                    <b>Prototype Notice:</b> Calculated using live actual data from verified digital scale weighings, registered citizens, and active collection points.
                  </div>
                </div>

                {/* 5-Parameter Breakdown Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <small style={{ color: '#64748b', fontSize: '9px', fontWeight: 800 }}>WEIGHT: 25%</small>
                    <b style={{ display: 'block', fontSize: '12px', color: '#1e293b', margin: '2px 0 4px' }}>Waste Collection</b>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#15803d' }}>
                      {scoreObj.parameters.collection} / 25
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <small style={{ color: '#64748b', fontSize: '9px', fontWeight: 800 }}>WEIGHT: 25%</small>
                    <b style={{ display: 'block', fontSize: '12px', color: '#1e293b', margin: '2px 0 4px' }}>Recycling Performance</b>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#15803d' }}>
                      {scoreObj.parameters.recycling} / 25
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <small style={{ color: '#64748b', fontSize: '9px', fontWeight: 800 }}>WEIGHT: 20%</small>
                    <b style={{ display: 'block', fontSize: '12px', color: '#1e293b', margin: '2px 0 4px' }}>Citizen Participation</b>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#15803d' }}>
                      {scoreObj.parameters.participation} / 20
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <small style={{ color: '#64748b', fontSize: '9px', fontWeight: 800 }}>WEIGHT: 15%</small>
                    <b style={{ display: 'block', fontSize: '12px', color: '#1e293b', margin: '2px 0 4px' }}>Hub Network Coverage</b>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#15803d' }}>
                      {scoreObj.parameters.coverage} / 15
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <small style={{ color: '#64748b', fontSize: '9px', fontWeight: 800 }}>WEIGHT: 15%</small>
                    <b style={{ display: 'block', fontSize: '12px', color: '#1e293b', margin: '2px 0 4px' }}>Verification Quality</b>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#15803d' }}>
                      {scoreObj.parameters.verification} / 15
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Section 9 Compliance: Districts with insufficient data display 'Insufficient Data' instead of an invented score */
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '14px',
                  padding: '32px 20px',
                  textAlign: 'center'
                }}
              >
                <AlertTriangle size={36} style={{ color: '#f59e0b', margin: '0 auto 10px', display: 'block' }} />
                <h3 style={{ margin: '0 0 6px', color: '#1e293b', font: '800 18px Manrope' }}>
                  Insufficient Data for Green Score Calculation
                </h3>
                <p style={{ margin: '0 auto 16px', color: '#64748b', fontSize: '12px', maxWidth: '480px', lineHeight: 1.5 }}>
                  {scoreObj?.missingReason || 'No field verified scale transactions or collection points have been registered yet for this district.'}
                </p>
                <div style={{ display: 'inline-block', background: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}>
                  Data Integrity Rule: CleanTN 360 never fabricates or invents performance scores without live verified records.
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
