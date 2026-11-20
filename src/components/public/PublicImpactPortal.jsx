import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe2,
  Recycle,
  Sprout,
  Users,
  Coins,
  MapPin,
  FileText,
  Download,
  Building2,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  Leaf,
  Info
} from 'lucide-react';
import Stat from '../common/Stat';
import Panel from '../common/Panel';
import TamilNaduGISMap from '../common/TamilNaduGISMap';
import EnvironmentalImpactCalculator from '../common/EnvironmentalImpactCalculator';
import { TN_DISTRICTS_DIRECTORY } from '../../lib/districtData';
import { useData } from '../../context/DataContext';

export default function PublicImpactPortal({ onOpenAuth }) {
  const { deposits, collectionPoints, getDistrictMetrics, generateReportData } = useData();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'explorer' | 'impact' | 'reports'
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('TN-CBE');

  const approvedDeposits = deposits.filter((d) => d.status === 'admin_approved');
  const totalWeightKg = approvedDeposits.reduce(
    (sum, d) => sum + (Number(d.actual_weight_kg) || Number(d.weight_kg) || 0),
    0
  );
  const totalPoints = approvedDeposits.reduce(
    (sum, d) => sum + (Number(d.approved_points) || 0),
    0
  );

  const selectedMetrics = getDistrictMetrics(selectedDistrictCode);

  function handleDownloadPublicReport(reportName) {
    const reportData = generateReportData({
      reportType: reportName,
      district: selectedDistrictCode !== 'All' ? selectedMetrics?.district.name : 'All'
    });

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Public_CleanTN_${reportName.replace(/\s+/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5faf6', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Public Top Navbar */}
      <header
        style={{
          height: '74px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2ece5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 5%',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img
            src="/cleantn-logo.png"
            alt="CleanTN 360 Logo"
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
          />
          <div>
            <b style={{ font: '800 18px Manrope', color: '#0b3d25', display: 'block' }}>CleanTN 360</b>
            <small style={{ fontSize: '9px', color: '#16a34a', fontWeight: 700, letterSpacing: '0.8px' }}>
              PUBLIC ENVIRONMENTAL IMPACT & GIS PORTAL
            </small>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#475569',
              textDecoration: 'none',
              padding: '8px 12px'
            }}
          >
            Home
          </Link>
          <button
            type="button"
            className="primary"
            onClick={() => (onOpenAuth ? onOpenAuth('login') : navigate('/app'))}
            style={{ padding: '8px 16px', fontSize: '11px', borderRadius: '8px' }}
          >
            Access Citizen / Staff Portal <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 40px' }}>
        <div
          style={{
            background: 'linear-gradient(120deg, #effcf3 0%, #dcfce7 60%, #e0f2fe 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: '20px',
            padding: '30px 34px',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#15803d', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            CIVIC TRANSPARENCY · 38 REVENUE DISTRICTS
          </span>
          <h1 style={{ font: '800 clamp(24px, 3.5vw, 36px) Manrope', color: '#0a4828', margin: '8px 0 10px', lineHeight: 1.15 }}>
            Tamil Nadu Smart Waste & Climate Action Platform
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#4b6353', maxWidth: '720px', lineHeight: 1.6 }}>
            Explore verified municipal waste diversion, secondary raw materials recovered, decentralized collection hubs, and Green Money incentives credited across Tamil Nadu.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '14px', background: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', color: '#166534', fontWeight: 700 }}>
            <ShieldCheck size={14} style={{ color: '#15803d' }} />
            Privacy Protected: All displayed indicators are aggregated; no citizen contact information or personal transactions are published.
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', overflowX: 'auto' }}>
          {[
            ['overview', 'Tamil Nadu Statewide Overview', Globe2],
            ['explorer', 'District Intelligence & GIS Map', MapPin],
            ['impact', 'CPCB Environmental Impact Methodology', Leaf],
            ['reports', 'Public Audit Reports & Downloads', FileText]
          ].map(([tabKey, label, Icon]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveSection(tabKey)}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: 'pointer',
                border: activeSection === tabKey ? '2px solid #15803d' : '1px solid #e2e8f0',
                background: activeSection === tabKey ? '#f0fdf4' : '#ffffff',
                color: activeSection === tabKey ? '#15803d' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* SECTION A: STATEWIDE OVERVIEW */}
        {activeSection === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="stats four" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <Stat
                Icon={Recycle}
                label="Total Verified Waste Diverted"
                value={`${totalWeightKg.toFixed(2)} kg`}
              />
              <Stat
                Icon={Sprout}
                label="Approved Recyclables"
                value={`${(totalWeightKg * 0.82).toFixed(2)} kg`}
                tone="purple"
              />
              <Stat
                Icon={MapPin}
                label="Collection Hubs Deployed"
                value={collectionPoints.length}
                tone="blue"
              />
              <Stat
                Icon={Coins}
                label="Green Money Incentives Disbursed"
                value={`₹${(totalPoints / 100).toFixed(2)}`}
                tone="emerald"
              />
            </div>

            <Panel title="Tamil Nadu 38-District Master Summary" Icon={Globe2}>
              <div className="scroll">
                <table>
                  <thead>
                    <tr>
                      <th>District Code</th>
                      <th>District Name</th>
                      <th>Zone</th>
                      <th>Headquarters</th>
                      <th>Operational Hubs</th>
                      <th>Data Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TN_DISTRICTS_DIRECTORY.map((d) => {
                      const hubsCount = collectionPoints.filter(p => p.district.toLowerCase() === d.name.toLowerCase()).length;
                      return (
                        <tr key={d.code}>
                          <td><b>{d.code}</b></td>
                          <td><b>{d.name}</b></td>
                          <td>{d.zone} Zone</td>
                          <td>{d.headquarters}</td>
                          <td><b>{hubsCount} hub(s)</b></td>
                          <td>
                            <span className={`status ${d.dataStatus === 'verified_pilot' ? 'completed' : d.dataStatus === 'pilot' ? 'pending' : 'rejected'}`}>
                              {d.dataStatus === 'verified_pilot' ? 'Verified Pilot' : d.dataStatus === 'pilot' ? 'Pilot Active' : 'Standby'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDistrictCode(d.code);
                                setActiveSection('explorer');
                              }}
                              style={{
                                border: '1px solid #86efac',
                                background: '#f0fdf4',
                                color: '#15803d',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '10px',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              Explore <ArrowRight size={11} style={{ display: 'inline' }} />
                            </button>
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

        {/* SECTION B: DISTRICT EXPLORER & GIS MAP */}
        {activeSection === 'explorer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <TamilNaduGISMap
              selectedDistrictCode={selectedDistrictCode}
              onSelectDistrict={(d) => setSelectedDistrictCode(d.code)}
            />
          </div>
        )}

        {/* SECTION C: ENVIRONMENTAL IMPACT */}
        {activeSection === 'impact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <EnvironmentalImpactCalculator />
          </div>
        )}

        {/* SECTION D: PUBLIC REPORTS */}
        {activeSection === 'reports' && (
          <Panel title="Download State & District Open Transparency Reports" Icon={FileText}>
            <p style={{ margin: '0 0 14px', fontSize: '11px', color: '#64748b' }}>
              Open datasets published by CleanTN 360 for environmental researchers, civic partners, and municipal authorities.
            </p>

            <div style={{ display: 'grid', gap: '10px' }}>
              {[
                { title: 'Statewide Waste Diversion & Material Recovery Audit', period: 'Live Daily Ledger' },
                { title: 'District-wise Segregation & Digital Scale Verification Log', period: 'Phase 4 Pilot Feed' },
                { title: 'CleanTN 360 Green Money Incentive Disbursal Ledger', period: 'Current Fiscal Period' },
                { title: 'Tamil Nadu Circular Economy Environmental Impact Assessment', period: 'CPCB 2026.1 Calibrated' }
              ].map((rep) => (
                <div
                  key={rep.title}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2ece5',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dcfce7', color: '#15803d', display: 'grid', placeItems: 'center' }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <b style={{ fontSize: '12px', color: '#0b3d25', display: 'block' }}>{rep.title}</b>
                      <small style={{ color: '#64748b', fontSize: '10px' }}>Reporting Period: {rep.period}</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadPublicReport(rep.title)}
                    className="primary"
                    style={{ padding: '8px 12px', fontSize: '10px', gap: '4px' }}
                  >
                    <Download size={12} /> Download Audit JSON
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
