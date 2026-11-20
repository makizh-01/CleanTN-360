import React, { useState } from 'react';
import {
  Globe2,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Factory,
  Cpu,
  Truck,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function DistrictRolloutDashboard({ notify }) {
  const {
    districtRolloutStatus,
    iotFleet,
    vehicleFleet,
    recyclerPartners,
    govIntegrations,
    communityEvents,
    securityAuditLogs
  } = useData();

  const [stageFilter, setStageFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const operationalCount = districtRolloutStatus.filter(d => d.is_operational).length;
  const stage2Count = districtRolloutStatus.filter(d => d.rollout_stage.startsWith('Stage 2')).length;
  const stage3Count = districtRolloutStatus.filter(d => d.rollout_stage.startsWith('Stage 3')).length;

  const filteredDistricts = districtRolloutStatus.filter(d => {
    const matchesStage = stageFilter === 'ALL' || d.rollout_stage.startsWith(stageFilter);
    const matchesQuery =
      d.district_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.district_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.zone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesQuery;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #0f766e 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(6, 78, 59, 0.22)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Globe2 size={28} style={{ color: '#6ee7b7' }} />
              <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
                Tamil Nadu 38-District Phased Rollout & State Operations
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                Stage 1–5 Expansion
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#d1fae5', maxWidth: '780px', lineHeight: 1.6 }}>
              Master State Operations telemetry unifying all 38 districts, IoT nodes, EV fleet tracking, authorized CPCB recyclers, government integrations, and strict onboarding readiness criteria.
            </p>
          </div>
        </div>
      </div>

      {/* Central State Operations KPI Matrix (Module 6.10) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b' }}>OPERATIONAL PILOTS</div>
          <div style={{ font: '800 24px Manrope', color: '#15803d', marginTop: '4px' }}>{operationalCount} / 38</div>
          <div style={{ fontSize: '11px', color: '#059669' }}>Coimbatore Live Pilot</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b' }}>EXPANSION PIPELINE</div>
          <div style={{ font: '800 24px Manrope', color: '#0284c7', marginTop: '4px' }}>{stage2Count + stage3Count} Districts</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Stage 2 ({stage2Count}) • Stage 3 ({stage3Count})</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b' }}>IOT SENSOR NODES</div>
          <div style={{ font: '800 24px Manrope', color: '#0f766e', marginTop: '4px' }}>{iotFleet.length} Devices</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{iotFleet.filter(i => i.connectivity_status === 'online').length} Online (Pilot Telemetry)</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b' }}>GPS VEHICLE FLEET</div>
          <div style={{ font: '800 24px Manrope', color: '#1e40af', marginTop: '4px' }}>{vehicleFleet.length} Trucks</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{vehicleFleet.filter(v => v.shift_active).length} Active On-Shift</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b' }}>VERIFIED RECYCLERS</div>
          <div style={{ font: '800 24px Manrope', color: '#047857', marginTop: '4px' }}>
            {recyclerPartners.filter(r => r.verification_status === 'verified_approved').length} Facilities
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>CPCB EPR Certified</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b' }}>GOV INTEGRATIONS</div>
          <div style={{ font: '800 24px Manrope', color: '#7c3aed', marginTop: '4px' }}>{govIntegrations.length} Bridges</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>CCMC, TNPCB, GCC, CPCB</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b' }}>COMMUNITY DRIVES</div>
          <div style={{ font: '800 24px Manrope', color: '#d97706', marginTop: '4px' }}>{communityEvents.length} Events</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>NGO & Eco-Club Network</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b' }}>SECURITY EVENTS</div>
          <div style={{ font: '800 24px Manrope', color: '#be123c', marginTop: '4px' }}>{securityAuditLogs.length} Logged</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>RLS 100% Enforced</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStageFilter(st)}
              style={{
                border: 'none',
                background: stageFilter === st ? '#047857' : '#f1f5f9',
                color: stageFilter === st ? '#ffffff' : '#475569',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {st === 'ALL' ? 'All 38 Districts' : st}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="input"
          placeholder="Search district or zone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ minWidth: '220px', padding: '7px 12px', fontSize: '12px' }}
        />
      </div>

      {/* 38-District Rollout Readiness Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ margin: 0, font: '800 18px Manrope', color: '#1e293b' }}>
            District Onboarding Readiness Matrix ({filteredDistricts.length} Districts)
          </h2>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Policy: District becomes Operational only after Admin + Smart Hub + Recycler + Scale Pilot pass.
          </span>
        </div>

        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>District</th>
                <th>Rollout Stage</th>
                <th>Readiness</th>
                <th>Hubs</th>
                <th>Collectors</th>
                <th>Recyclers</th>
                <th>Operational Status</th>
                <th>Pending Onboarding Tasks</th>
              </tr>
            </thead>
            <tbody>
              {filteredDistricts.map(d => (
                <tr key={d.district_code}>
                  <td>
                    <b>{d.district_name}</b>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{d.district_code} • {d.zone}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: d.rollout_stage.startsWith('Stage 1')
                          ? '#dcfce7'
                          : d.rollout_stage.startsWith('Stage 2')
                          ? '#dbeafe'
                          : d.rollout_stage.startsWith('Stage 3')
                          ? '#fef3c7'
                          : '#f1f5f9',
                        color: d.rollout_stage.startsWith('Stage 1')
                          ? '#15803d'
                          : d.rollout_stage.startsWith('Stage 2')
                          ? '#1d4ed8'
                          : d.rollout_stage.startsWith('Stage 3')
                          ? '#b45309'
                          : '#475569'
                      }}
                    >
                      {d.rollout_stage}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <b style={{ fontSize: '12px', color: d.onboarding_score >= 80 ? '#15803d' : '#475569' }}>
                        {d.onboarding_score}%
                      </b>
                    </div>
                  </td>
                  <td><b>{d.hubs_deployed}</b></td>
                  <td><b>{d.collectors_active}</b></td>
                  <td><b>{d.recyclers_partnered}</b></td>
                  <td>
                    <span className={`status ${d.is_operational ? 'completed' : 'pending'}`}>
                      {d.is_operational ? 'Operational' : 'Onboarding'}
                    </span>
                  </td>
                  <td>
                    {d.pending_tasks.length === 0 ? (
                      <span style={{ color: '#15803d', fontSize: '11px', fontWeight: 700 }}>
                        ✓ All Criteria Met
                      </span>
                    ) : (
                      <small style={{ color: '#64748b' }}>
                        {d.pending_tasks.slice(0, 2).join(' • ')}
                        {d.pending_tasks.length > 2 ? ` (+${d.pending_tasks.length - 2} more)` : ''}
                      </small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
