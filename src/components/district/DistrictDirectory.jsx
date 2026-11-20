import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  AlertCircle,
  TrendingUp,
  Award,
  Globe2
} from 'lucide-react';
import { TN_DISTRICTS_DIRECTORY, TN_ZONES } from '../../lib/districtData';
import { useData } from '../../context/DataContext';

export default function DistrictDirectory({ onSelectDistrict }) {
  const { getDistrictMetrics, calculateDistrictGreenScore, collectionPoints } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'verified_pilot' | 'standby'

  const filteredDistricts = TN_DISTRICTS_DIRECTORY.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.headquarters.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone = selectedZone === 'All' || d.zone === selectedZone;

    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'verified_pilot' && (d.isPilot || d.dataStatus === 'verified_pilot')) ||
      (selectedStatus === 'standby' && !d.isPilot && d.dataStatus === 'standby');

    return matchesSearch && matchesZone && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Directory Filters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          background: '#ffffff',
          padding: '14px 18px',
          borderRadius: '14px',
          border: '1px solid #e2ece5'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #dce9df', borderRadius: '8px', padding: '0 10px', background: '#f8fafc' }}>
          <Search size={16} style={{ color: '#16a34a' }} />
          <input
            placeholder="Search district name, ISO code or headquarters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '8px 0', fontSize: '11px', width: '100%' }}
          />
        </div>

        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          style={{ border: '1px solid #dce9df', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', background: '#fff', color: '#164b2c', fontWeight: 600 }}
        >
          <option value="All">All Administrative Zones</option>
          {TN_ZONES.map((z) => (
            <option key={z} value={z}>
              {z} Zone
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ border: '1px solid #dce9df', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', background: '#fff', color: '#164b2c', fontWeight: 600 }}
        >
          <option value="All">All Data Classifications</option>
          <option value="verified_pilot">Verified Pilot Districts Only</option>
          <option value="standby">Standby (Awaiting Municipal Onboarding)</option>
        </select>
      </div>

      {/* Directory Cards Grid (38 Districts) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {filteredDistricts.map((dist) => {
          const metrics = getDistrictMetrics(dist.code);
          const scoreObj = calculateDistrictGreenScore(dist.code);
          const hubsCount = collectionPoints.filter(p => p.district.toLowerCase() === dist.name.toLowerCase()).length;

          return (
            <div
              key={dist.code}
              onClick={() => onSelectDistrict && onSelectDistrict(dist)}
              style={{
                background: '#ffffff',
                border: dist.name === 'Coimbatore' ? '2px solid #16a34a' : '1px solid #e2ece5',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: dist.name === 'Coimbatore' ? '0 6px 20px rgba(22, 163, 74, 0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
                position: 'relative'
              }}
            >
              {/* Header Badges */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}>
                    {dist.code} · {dist.zone} Zone
                  </span>

                  <span
                    className={`status ${dist.dataStatus === 'verified_pilot' ? 'completed' : dist.dataStatus === 'pilot' ? 'pending' : 'rejected'}`}
                    style={{ fontSize: '9px' }}
                  >
                    {dist.dataStatus === 'verified_pilot' ? 'Verified Pilot' : dist.dataStatus === 'pilot' ? 'Pilot Active' : 'Data Awaited'}
                  </span>
                </div>

                <b style={{ fontSize: '17px', color: '#0b3d25', display: 'block', marginBottom: '2px' }}>
                  {dist.name}
                </b>
                <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginBottom: '10px' }}>
                  HQ: {dist.headquarters} · Area: {dist.areaSqKm.toLocaleString()} km²
                </small>

                <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                  {dist.description}
                </p>
              </div>

              {/* District Quick Metrics Strip */}
              <div>
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '6px',
                    textAlign: 'center',
                    marginBottom: '12px',
                    fontSize: '10px'
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Collection Hubs</span>
                    <b style={{ color: '#0b3d25' }}>{hubsCount}</b>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Verified Waste</span>
                    <b style={{ color: '#15803d' }}>
                      {metrics ? `${metrics.totalVerifiedWeight} kg` : '0 kg'}
                    </b>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Green Score</span>
                    <b style={{ color: scoreObj?.isSufficientData ? '#15803d' : '#94a3b8' }}>
                      {scoreObj?.isSufficientData ? `${scoreObj.totalScore}/100` : 'N/A'}
                    </b>
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 800 }}>
                    {dist.name === 'Coimbatore' ? '⭐ Live Pilot Benchmark' : 'Inspect District Intelligence'}
                  </span>
                  <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800 }}>
                    View <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
