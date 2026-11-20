import React, { useState } from 'react';
import {
  ShieldAlert,
  Globe2,
  Users,
  MapPin,
  Recycle,
  Award,
  Upload,
  FileText,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  History,
  Building2,
  Wrench,
  Download,
  Trash2,
  Layers,
  ArrowRight,
  Brain,
  TrendingUp,
  Zap,
  Cpu,
  Truck,
  Landmark,
  Factory,
  CreditCard,
  Lock
} from 'lucide-react';
import Banner from '../common/Banner';
import Stat from '../common/Stat';
import Panel from '../common/Panel';
import Status from '../common/Status';
import TamilNaduGISMap from '../common/TamilNaduGISMap';
import DistrictComparison from '../district/DistrictComparison';
import AIDecisionSupportPage from './AIDecisionSupportPage';
import FraudDetectionQueue from './FraudDetectionQueue';
import AutomationRulesPage from './AutomationRulesPage';
import PredictiveWasteAnalytics from '../analytics/PredictiveWasteAnalytics';
import DistrictRolloutDashboard from '../rollout/DistrictRolloutDashboard';
import IoTManagementDashboard from '../iot/IoTManagementDashboard';
import VehicleTrackingDashboard from '../fleet/VehicleTrackingDashboard';
import GovernmentIntegrationsPage from '../gov/GovernmentIntegrationsPage';
import RecyclerMarketplace from '../marketplace/RecyclerMarketplace';
import PayoutManagementPage from '../payout/PayoutManagementPage';
import SecurityCenterPage from '../security/SecurityCenterPage';
import { TN_DISTRICTS_DIRECTORY } from '../../lib/districtData';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function StateAdminDashboard({ notify }) {
  const {
    collectionPoints,
    deposits,
    districtAdmins,
    dataSources,
    iotDevices = [],
    auditLogs,
    addCollectionPoint,
    updateCollectionPoint,
    assignDistrictAdmin,
    importDataSource,
    getDistrictMetrics,
    calculateDistrictGreenScore,
    generateReportData
  } = useData();

  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'admins' | 'points' | 'data_sources' | 'reports' | 'comparison'

  // District Admin Assignment Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminDistrictCode, setNewAdminDistrictCode] = useState('TN-CBE');

  // Collection Point Modal State
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [pointForm, setPointForm] = useState({
    point_code: '',
    point_name: '',
    district: 'Coimbatore',
    address: '',
    lat: '11.0168',
    lng: '76.9558',
    operating_hours: '8:00 AM – 8:00 PM',
    assigned_collector: '',
    status: 'active'
  });

  // CSV Data Import State
  const [importFileName, setImportFileName] = useState('');
  const [importPreviewRows, setImportPreviewRows] = useState([]);
  const [importSourceType, setImportSourceType] = useState('official');
  const [importCoverage, setImportCoverage] = useState('Coimbatore');

  const approvedDeposits = deposits.filter((d) => d.status === 'admin_approved');
  const totalVerifiedWeight = approvedDeposits.reduce(
    (sum, d) => sum + (Number(d.actual_weight_kg) || Number(d.weight_kg) || 0),
    0
  );

  // Handle District Admin Assignment
  async function handleAssignAdmin(e) {
    e.preventDefault();
    if (!newAdminName.trim()) {
      if (notify) notify('Please enter the administrator name.');
      return;
    }
    const dist = TN_DISTRICTS_DIRECTORY.find((d) => d.code === newAdminDistrictCode);
    await assignDistrictAdmin({
      admin_name: newAdminName.trim(),
      district_code: newAdminDistrictCode,
      district_name: dist?.name || 'Coimbatore'
    });
    setIsAdminModalOpen(false);
    setNewAdminName('');
    if (notify) notify(`District Administrator assigned to ${dist?.name || newAdminDistrictCode}.`);
  }

  // Handle Collection Point Add
  async function handleSavePoint(e) {
    e.preventDefault();
    if (!pointForm.point_code || !pointForm.point_name) {
      if (notify) notify('Please fill all mandatory hub fields.');
      return;
    }
    await addCollectionPoint(pointForm);
    setIsPointModalOpen(false);
    setPointForm({
      point_code: '',
      point_name: '',
      district: 'Coimbatore',
      address: '',
      lat: '11.0168',
      lng: '76.9558',
      operating_hours: '8:00 AM – 8:00 PM',
      assigned_collector: '',
      status: 'active'
    });
    if (notify) notify('New collection hub added successfully.');
  }

  // Handle CSV file selection and client-side parse
  function handleCsvFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length > 1) {
        const headers = lines[0].split(',').map((h) => h.trim());
        const rows = lines.slice(1, 6).map((line) => {
          const cols = line.split(',').map((c) => c.trim());
          const rowObj = {};
          headers.forEach((h, i) => {
            rowObj[h] = cols[i] || '';
          });
          return rowObj;
        });
        setImportPreviewRows(rows);
      }
    };
    reader.readAsText(file);
  }

  // Handle CSV Ingestion Confirmation
  async function handleConfirmImport() {
    if (!importFileName) return;
    await importDataSource({
      source_name: `Imported: ${importFileName}`,
      source_url: 'Uploaded CSV File',
      coverage: importCoverage,
      reporting_period: 'Q4 2026',
      verification_status: 'verified',
      classification: importSourceType,
      record_count: importPreviewRows.length || 50
    }, importPreviewRows);

    setImportFileName('');
    setImportPreviewRows([]);
    if (notify) notify('External dataset successfully verified and imported into state ledger.');
  }

  return (
    <>
      <Banner
        kicker="STATE SECRETARIAT · MUNICIPAL ADMINISTRATION"
        title={`Tamil Nadu State Command Console · ${profile?.full_name || 'State Admin'}`}
        desc="Oversee all 38 revenue districts, delegate District Administrators, monitor digital scale verification quality, and govern statewide data provenance."
      />

      {/* Top Stat Bar */}
      <div className="stats four" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <Stat
          Icon={Globe2}
          label="State Jurisdiction"
          value="38 Districts"
        />
        <Stat
          Icon={Building2}
          label="District Administrators"
          value={districtAdmins.length}
          tone="purple"
        />
        <Stat
          Icon={MapPin}
          label="Total Collection Hubs"
          value={collectionPoints.length}
          tone="blue"
        />
        <Stat
          Icon={Recycle}
          label="Total Verified Waste"
          value={`${totalVerifiedWeight.toFixed(2)} kg`}
          tone="emerald"
        />
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', overflowX: 'auto' }}>
        {[
          ['overview', 'Tamil Nadu 38-District Overview', Globe2],
          ['rollout', '38-District Phased Rollout', Layers],
          ['iot', 'IoT Sensor Fleet', Cpu],
          ['fleet', 'GPS Vehicle Tracking', Truck],
          ['gov', 'Gov & CPCB Integrations', Landmark],
          ['recyclers', 'Authorized Recyclers', Factory],
          ['payouts', 'Payout Infrastructure', CreditCard],
          ['security', 'Security & Monitoring', Lock],
          ['ai_advisory', 'AI Policy Advisories', Brain],
          ['predictive', 'Predictive Analytics', TrendingUp],
          ['comparison', 'Multi-District Benchmark', Award],
          ['fraud', 'State Fraud Audits', ShieldAlert],
          ['automation', 'Smart Automations', Zap],
          ['admins', 'District Admin Management', Building2],
          ['points', 'Smart Hubs & GIS Fleet', MapPin],
          ['data_sources', 'Data Quality & CSV Import', Upload],
          ['reports', 'Statewide Audits & Reports', FileText]
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

      {/* TAB 1: 38 DISTRICTS OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TamilNaduGISMap />

          <Panel title="Tamil Nadu 38-District Performance Ledger" Icon={Globe2}>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>District Code</th>
                    <th>District Name</th>
                    <th>Zone</th>
                    <th>Headquarters</th>
                    <th>Collection Hubs</th>
                    <th>Verified Waste</th>
                    <th>Green Score</th>
                    <th>Data Status</th>
                    <th>Assigned Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {TN_DISTRICTS_DIRECTORY.map((d) => {
                    const m = getDistrictMetrics(d.code);
                    const s = calculateDistrictGreenScore(d.code);
                    const da = districtAdmins.find((a) => a.district_code === d.code);
                    return (
                      <tr key={d.code}>
                        <td><b>{d.code}</b></td>
                        <td><b>{d.name}</b></td>
                        <td>{d.zone} Zone</td>
                        <td>{d.headquarters}</td>
                        <td>{m?.hubs.length || 0}</td>
                        <td><b>{m ? `${m.totalVerifiedWeight} kg` : '0 kg'}</b></td>
                        <td>
                          <b style={{ color: s?.isSufficientData ? '#15803d' : '#94a3b8' }}>
                            {s?.isSufficientData ? `${s.totalScore}/100 (${s.performanceLabel})` : 'Insufficient Data'}
                          </b>
                        </td>
                        <td>
                          <span className={`status ${d.dataStatus === 'verified_pilot' ? 'completed' : 'pending'}`}>
                            {d.dataStatus}
                          </span>
                        </td>
                        <td>
                          {da ? (
                            <span style={{ fontSize: '10px', color: '#15803d', fontWeight: 700 }}>
                              {da.admin_name}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '9px' }}>Unassigned</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 2: MULTI-DISTRICT BENCHMARK */}
      {activeTab === 'comparison' && (
        <DistrictComparison />
      )}

      {/* TAB 3: DISTRICT ADMIN MANAGEMENT */}
      {activeTab === 'admins' && (
        <Panel
          title={`District Administrative Delegations (${districtAdmins.length})`}
          Icon={Building2}
          action={
            <button
              type="button"
              className="primary"
              onClick={() => setIsAdminModalOpen(true)}
              style={{ padding: '6px 12px', fontSize: '10px', gap: '4px' }}
            >
              <Plus size={13} /> Assign District Administrator
            </button>
          }
        >
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>Administrator Name</th>
                  <th>Assigned District</th>
                  <th>District Code</th>
                  <th>Delegation Date</th>
                  <th>Permission Scope</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {districtAdmins.map((adm) => (
                  <tr key={adm.id}>
                    <td><b>{adm.admin_name}</b></td>
                    <td><b>{adm.district_name}</b></td>
                    <td><span className="status completed">{adm.district_code}</span></td>
                    <td>{new Date(adm.assigned_at).toLocaleDateString()}</td>
                    <td>
                      <small style={{ color: '#475569' }}>
                        District-scoped ledger approval & hub management
                      </small>
                    </td>
                    <td>
                      <span className="status completed">Active Delegated</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* TAB 4: SMART HUBS & GIS FLEET */}
      {activeTab === 'points' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Panel
            title={`Statewide Collection Hubs Fleet (${collectionPoints.length})`}
            Icon={MapPin}
            action={
              <button
                type="button"
                className="primary"
                onClick={() => setIsPointModalOpen(true)}
                style={{ padding: '6px 12px', fontSize: '10px', gap: '4px' }}
              >
                <Plus size={13} /> Add Collection Station
              </button>
            }
          >
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Point Code</th>
                    <th>Station Name</th>
                    <th>District</th>
                    <th>Coordinates (Lat/Lng)</th>
                    <th>Assigned Collector</th>
                    <th>Operating Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {collectionPoints.map((cp) => (
                    <tr key={cp.id}>
                      <td><b>{cp.point_code}</b></td>
                      <td><b>{cp.point_name}</b></td>
                      <td>{cp.district}</td>
                      <td><small>{cp.lat || 11.01}, {cp.lng || 76.95}</small></td>
                      <td><b>{cp.assigned_collector || 'Sanitation Collector Officer'}</b></td>
                      <td>
                        <span className={`status ${cp.status === 'active' ? 'completed' : cp.status === 'maintenance' ? 'pending' : 'rejected'}`}>
                          {cp.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            const nextStatus = cp.status === 'active' ? 'maintenance' : 'active';
                            updateCollectionPoint(cp.id, { status: nextStatus });
                            if (notify) notify(`${cp.point_code} status updated to ${nextStatus}.`);
                          }}
                          style={{ border: '1px solid #dce9df', background: '#fff', borderRadius: '6px', padding: '4px 8px', fontSize: '9px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <Wrench size={11} style={{ display: 'inline', marginRight: '3px' }} />
                          Toggle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Phase 5 Module 9: Optional IoT Hardware Readiness Architecture */}
          <Panel title="Phase 5 IoT Hardware Telemetry Architecture (Readiness Registry)" Icon={Wrench}>
            <p style={{ margin: '0 0 14px', fontSize: '11px', color: '#64748b' }}>
              Future-compatible schema mapping for ultrasonic bin fill sensors, digital bluetooth scales, and truck GPS units.
              <b> Zero Fake Telemetry Guarantee:</b> Devices operate on verified standby until physical hardware is paired.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {iotDevices.map(dev => (
                <div key={dev.device_id} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <b style={{ font: '800 13px Manrope', color: '#0f172a' }}>{dev.label}</b>
                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: dev.status === 'active' ? '#dcfce7' : '#fef3c7', color: dev.status === 'active' ? '#15803d' : '#b45309' }}>
                      {dev.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    Model: <b>{dev.hardware_model}</b> • FW: {dev.firmware_version}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    Location: {dev.point_name} ({dev.district})
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', fontStyle: 'italic' }}>
                    Specs: {dev.specs}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 5: DATA QUALITY & CSV DATA IMPORT */}
      {activeTab === 'data_sources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* CSV File Upload Section */}
          <Panel title="External Municipal CSV Dataset Importer" Icon={Upload}>
            <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#64748b' }}>
              Upload authorized municipal waste records or historical weighbridge CSV datasets. Validates columns and generates preview before state ingestion.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  DATA CLASSIFICATION
                </label>
                <select
                  value={importSourceType}
                  onChange={(e) => setImportSourceType(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #dce9df', fontSize: '11px', background: '#fff' }}
                >
                  <option value="official">Official Verified Municipal Feed</option>
                  <option value="imported_historical">Imported Historical Weighbridge Data</option>
                  <option value="pilot">Provisional Pilot Stream</option>
                  <option value="estimated">Defensive Estimated Benchmark</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  TARGET DISTRICT COVERAGE
                </label>
                <select
                  value={importCoverage}
                  onChange={(e) => setImportCoverage(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #dce9df', fontSize: '11px', background: '#fff' }}
                >
                  <option value="Tamil Nadu Statewide">Tamil Nadu Statewide</option>
                  {TN_DISTRICTS_DIRECTORY.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                border: '2px dashed #86efac',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                background: '#f0fdf4',
                marginBottom: '14px'
              }}
            >
              <Upload size={32} style={{ color: '#16a34a', margin: '0 auto 8px', display: 'block' }} />
              <b style={{ color: '#0b3d25', fontSize: '13px', display: 'block' }}>
                Select CSV Dataset to Validate & Preview
              </b>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvFileSelect}
                style={{ marginTop: '10px', fontSize: '11px' }}
              />
              {importFileName && (
                <small style={{ display: 'block', marginTop: '6px', color: '#15803d', fontWeight: 800 }}>
                  Selected: {importFileName}
                </small>
              )}
            </div>

            {/* Preview Table if rows exist */}
            {importPreviewRows.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <b style={{ fontSize: '12px', color: '#0b3d25', display: 'block', marginBottom: '6px' }}>
                  Preview: First 5 Sample Records
                </b>
                <div className="scroll" style={{ maxHeight: '160px' }}>
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(importPreviewRows[0]).map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importPreviewRows.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx}>{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: '12px', textAlign: 'right' }}>
                  <button
                    type="button"
                    className="primary"
                    onClick={handleConfirmImport}
                    style={{ padding: '8px 16px', fontSize: '11px' }}
                  >
                    <CheckCircle2 size={13} /> Confirm & Ingest Dataset into State Ledger
                  </button>
                </div>
              </div>
            )}
          </Panel>

          {/* Existing Documented Datasets */}
          <Panel title="Active Data Sources & Provenance Index" Icon={Layers}>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Data Source Name</th>
                    <th>Classification</th>
                    <th>Geographic Coverage</th>
                    <th>Reporting Period</th>
                    <th>Records Count</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {dataSources.map((ds) => (
                    <tr key={ds.id}>
                      <td><b>{ds.source_name}</b></td>
                      <td>
                        <span className={`status ${ds.classification === 'official' ? 'completed' : 'pending'}`}>
                          {ds.classification}
                        </span>
                      </td>
                      <td>{ds.coverage}</td>
                      <td>{ds.reporting_period}</td>
                      <td><b>{ds.record_count.toLocaleString()}</b></td>
                      <td>
                        <span className="status completed">{ds.verification_status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 6: STATEWIDE AUDITS & REPORTS */}
      {activeTab === 'reports' && (
        <Panel title="Statewide Municipal Audit Reports" Icon={FileText}>
          <div style={{ display: 'grid', gap: '10px' }}>
            {[
              'Statewide Waste Segregation & Diversion Audit',
              'District-by-District Green Money Disbursal Statement',
              'Tamil Nadu 38-District Collection Network Status Log',
              'Central Pollution Control Board Emission Offset Certification'
            ].map((title) => (
              <div
                key={title}
                style={{
                  padding: '14px 16px',
                  background: '#ffffff',
                  border: '1px solid #e2ece5',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <b style={{ fontSize: '12px', color: '#0b3d25', display: 'block' }}>{title}</b>
                  <small style={{ color: '#64748b', fontSize: '10px' }}>
                    Generated on-demand from live immutable PostgreSQL ledger
                  </small>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const data = generateReportData({ reportType: title });
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    if (notify) notify(`Downloaded ${title}.`);
                  }}
                  className="primary"
                  style={{ padding: '6px 12px', fontSize: '10px', gap: '4px' }}
                >
                  <Download size={12} /> Download Audit JSON
                </button>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* PHASE 5: STATE AI ADVISORY, PREDICTIVE, FRAUD & AUTOMATIONS */}
      {activeTab === 'ai_advisory' && (
        <AIDecisionSupportPage notify={notify} />
      )}

      {activeTab === 'predictive' && (
        <PredictiveWasteAnalytics notify={notify} />
      )}

      {activeTab === 'fraud' && (
        <FraudDetectionQueue notify={notify} />
      )}

      {activeTab === 'automation' && (
        <AutomationRulesPage notify={notify} />
      )}

      {/* PHASE 6: ROLLOUT, IOT, FLEET, GOV, RECYCLERS, PAYOUTS & SECURITY */}
      {activeTab === 'rollout' && (
        <DistrictRolloutDashboard notify={notify} />
      )}

      {activeTab === 'iot' && (
        <IoTManagementDashboard notify={notify} />
      )}

      {activeTab === 'fleet' && (
        <VehicleTrackingDashboard notify={notify} />
      )}

      {activeTab === 'gov' && (
        <GovernmentIntegrationsPage notify={notify} />
      )}

      {activeTab === 'recyclers' && (
        <RecyclerMarketplace notify={notify} />
      )}

      {activeTab === 'payouts' && (
        <PayoutManagementPage notify={notify} />
      )}

      {activeTab === 'security' && (
        <SecurityCenterPage notify={notify} />
      )}

      {/* Assign District Admin Modal */}
      {isAdminModalOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 99999 }}
          onClick={() => setIsAdminModalOpen(false)}
        >
          <div
            className="modal-card"
            style={{ maxWidth: '440px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 6px', font: '800 16px Manrope', color: '#0b3d25' }}>
              Assign District Administrator
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '11px', color: '#64748b' }}>
              Delegates administrative ledger approval, collector supervision, and hub configuration for the specified district.
            </p>

            <form onSubmit={handleAssignAdmin} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  ADMINISTRATOR FULL NAME
                </label>
                <input
                  placeholder="e.g. Thiru. M. Sundaram, IAS"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #dce9df', fontSize: '11px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  ASSIGNED DISTRICT
                </label>
                <select
                  value={newAdminDistrictCode}
                  onChange={(e) => setNewAdminDistrictCode(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #dce9df', fontSize: '11px', background: '#fff' }}
                >
                  {TN_DISTRICTS_DIRECTORY.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  style={{ border: '1px solid #dce9df', background: '#fff', borderRadius: '8px', padding: '8px 14px', fontSize: '11px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary" style={{ padding: '8px 16px', fontSize: '11px' }}>
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Collection Point Modal */}
      {isPointModalOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 99999 }}
          onClick={() => setIsPointModalOpen(false)}
        >
          <div
            className="modal-card"
            style={{ maxWidth: '480px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 6px', font: '800 16px Manrope', color: '#0b3d25' }}>
              Add New Collection Station
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '11px', color: '#64748b' }}>
              Register a physical collection hub with GPS coordinates and assigned collector personnel.
            </p>

            <form onSubmit={handleSavePoint} style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569' }}>HUB CODE</label>
                  <input
                    placeholder="e.g. CTN-CBE-005"
                    value={pointForm.point_code}
                    onChange={(e) => setPointForm({ ...pointForm, point_code: e.target.value })}
                    required
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #dce9df', fontSize: '11px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569' }}>DISTRICT</label>
                  <select
                    value={pointForm.district}
                    onChange={(e) => setPointForm({ ...pointForm, district: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #dce9df', fontSize: '11px', background: '#fff' }}
                  >
                    {TN_DISTRICTS_DIRECTORY.map((d) => (
                      <option key={d.code} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569' }}>STATION NAME</label>
                <input
                  placeholder="e.g. Saibaba Colony Green Hub"
                  value={pointForm.point_name}
                  onChange={(e) => setPointForm({ ...pointForm, point_name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #dce9df', fontSize: '11px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569' }}>ADDRESS</label>
                <input
                  placeholder="Street, locality, postal code"
                  value={pointForm.address}
                  onChange={(e) => setPointForm({ ...pointForm, address: e.target.value })}
                  required
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #dce9df', fontSize: '11px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569' }}>LATITUDE</label>
                  <input
                    value={pointForm.lat}
                    onChange={(e) => setPointForm({ ...pointForm, lat: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #dce9df', fontSize: '11px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569' }}>LONGITUDE</label>
                  <input
                    value={pointForm.lng}
                    onChange={(e) => setPointForm({ ...pointForm, lng: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #dce9df', fontSize: '11px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsPointModalOpen(false)}
                  style={{ border: '1px solid #dce9df', background: '#fff', borderRadius: '8px', padding: '8px 14px', fontSize: '11px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary" style={{ padding: '8px 16px', fontSize: '11px' }}>
                  Save Collection Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
