import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Filter,
  ExternalLink,
  QrCode,
  Clock3,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  X,
  UserCheck
} from 'lucide-react';
import { TN_DISTRICTS_DIRECTORY } from '../../lib/districtData';
import { useData } from '../../context/DataContext';

export default function TamilNaduGISMap({ onSelectDistrict, selectedDistrictCode = 'TN-CBE' }) {
  const { collectionPoints } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState(selectedDistrictCode || 'All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'active' | 'maintenance' | 'inactive'
  const [activePopupPoint, setActivePopupPoint] = useState(null);
  const [qrModalPoint, setQrModalPoint] = useState(null);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);

  // Filtered collection points
  const filteredPoints = collectionPoints.filter((p) => {
    const matchesSearch =
      p.point_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.point_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDistrict =
      districtFilter === 'All' ||
      p.district.toLowerCase() === districtFilter.toLowerCase() ||
      p.point_code.includes(districtFilter.replace('TN-', ''));

    const matchesCategory =
      categoryFilter === 'All' ||
      (p.accepted_waste_types && p.accepted_waste_types.includes(categoryFilter));

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesDistrict && matchesCategory && matchesStatus;
  });

  // Calculate coordinates mapping for TN SVG Canvas (Bounding Box: Lat ~8.0 to 13.5, Lng ~76.2 to 80.4)
  function projectGeoToSvg(lat, lng) {
    const minLat = 8.05;
    const maxLat = 13.55;
    const minLng = 76.2;
    const maxLng = 80.4;

    const x = ((lng - minLng) / (maxLng - minLng)) * 520 + 40;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 560 + 30;
    return { x: Math.max(30, Math.min(570, x)), y: Math.max(30, Math.min(600, y)) };
  }

  function handleDistrictClick(d) {
    setDistrictFilter(d.code);
    if (onSelectDistrict) onSelectDistrict(d);
  }

  return (
    <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2ece5', padding: '16px', boxShadow: '0 4px 20px rgba(8, 122, 60, 0.05)' }}>
      {/* Map Control Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #dce9df', borderRadius: '8px', padding: '0 10px', background: '#f8fafc' }}>
          <Search size={15} style={{ color: '#16a34a' }} />
          <input
            placeholder="Search hub name, code or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '8px 0', fontSize: '11px', width: '100%' }}
          />
        </div>

        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          style={{ border: '1px solid #dce9df', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', background: '#fff', color: '#164b2c', fontWeight: 600 }}
        >
          <option value="All">All 38 Districts</option>
          {TN_DISTRICTS_DIRECTORY.map((d) => (
            <option key={d.code} value={d.name}>
              {d.name} ({d.code}) {d.isPilot ? '· Pilot' : ''}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ border: '1px solid #dce9df', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', background: '#fff', color: '#164b2c', fontWeight: 600 }}
        >
          <option value="All">All Accepted Categories</option>
          <option value="Plastic">Plastic</option>
          <option value="Paper">Paper</option>
          <option value="Metal">Metal</option>
          <option value="Glass">Glass</option>
          <option value="Organic">Organic</option>
          <option value="E-Waste">E-Waste</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ border: '1px solid #dce9df', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', background: '#fff', color: '#164b2c', fontWeight: 600 }}
        >
          <option value="All">All Operating Statuses</option>
          <option value="active">Active Online</option>
          <option value="maintenance">Maintenance / Calibration</option>
          <option value="inactive">Standby / Inactive</option>
        </select>
      </div>

      {/* Legend & Summary Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '10px', marginBottom: '12px', fontSize: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#166534', fontWeight: 700 }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            Active Online ({collectionPoints.filter(p => p.status === 'active').length})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#9a3412', fontWeight: 700 }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            Maintenance / Scale Calibration ({collectionPoints.filter(p => p.status === 'maintenance').length})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontWeight: 700 }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }} />
            Standby ({collectionPoints.filter(p => p.status === 'inactive').length})
          </span>
        </div>
        <span style={{ fontWeight: 800, color: '#15803d' }}>
          Showing {filteredPoints.length} Collection Hub{filteredPoints.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* GIS Visual Canvas & Details Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(280px, 1fr)', gap: '16px' }}>
        {/* Left: Interactive Tamil Nadu SVG GIS Canvas */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #effcf3 0%, #e2f7e8 100%)',
            borderRadius: '14px',
            border: '1px solid #ccebd3',
            overflow: 'hidden',
            minHeight: '480px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Watermark / Title */}
          <div style={{ position: 'absolute', top: '10px', left: '12px', zIndex: 10 }}>
            <small style={{ fontSize: '9px', fontWeight: 800, color: '#15803d', letterSpacing: '1px' }}>
              TAMIL NADU STATE GIS · SMART WASTE MONITORING
            </small>
            <b style={{ display: 'block', fontSize: '13px', color: '#0b3d25' }}>
              38 Revenue Districts Master Grid
            </b>
          </div>

          <svg
            viewBox="0 0 600 620"
            style={{ width: '100%', height: '100%', minHeight: '460px', flex: 1 }}
          >
            {/* Tamil Nadu State Outer Approximate Contour */}
            <path
              d="M 450 40 
                 L 490 60 
                 L 530 110 
                 L 510 180 
                 L 480 230 
                 L 490 280 
                 L 450 330 
                 L 400 370 
                 L 430 430 
                 L 400 490 
                 L 330 540 
                 L 270 590 
                 L 250 610 
                 L 220 590 
                 L 190 530 
                 L 160 460 
                 L 140 380 
                 L 120 310 
                 L 130 250 
                 L 150 180 
                 L 220 120 
                 L 300 70 
                 Z"
              fill="#d7f5dd"
              stroke="#86efac"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />

            {/* Render All 38 District Centroid Nodes */}
            {TN_DISTRICTS_DIRECTORY.map((dist) => {
              const pos = projectGeoToSvg(dist.lat, dist.lng);
              const isSelected = districtFilter.toLowerCase() === dist.name.toLowerCase() || districtFilter === dist.code;
              const isPilot = dist.isPilot;
              const hubsInDistrict = collectionPoints.filter(p => p.district.toLowerCase() === dist.name.toLowerCase()).length;

              return (
                <g
                  key={dist.code}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleDistrictClick(dist)}
                  onMouseEnter={() => setHoveredDistrict(dist)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                >
                  <circle
                    r={isSelected ? 14 : isPilot ? 10 : 7}
                    fill={isSelected ? '#15803d' : isPilot ? '#22c55e' : '#94a3b8'}
                    opacity={isSelected ? 0.95 : isPilot ? 0.8 : 0.55}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  {isSelected && (
                    <circle
                      r={20}
                      fill="none"
                      stroke="#15803d"
                      strokeWidth="1.5"
                      opacity="0.5"
                      strokeDasharray="3 2"
                    />
                  )}
                  <text
                    y={isSelected ? -16 : -10}
                    textAnchor="middle"
                    fontSize={isSelected ? '10px' : '7.5px'}
                    fontWeight={isSelected ? '800' : '600'}
                    fill={isSelected ? '#0b3d25' : '#334155'}
                  >
                    {dist.name}
                  </text>
                </g>
              );
            })}

            {/* Render Collection Point Markers onto Canvas */}
            {filteredPoints.map((point) => {
              const ptLat = point.lat || (TN_DISTRICTS_DIRECTORY.find(d => d.name === point.district)?.lat) || 11.0;
              const ptLng = point.lng || (TN_DISTRICTS_DIRECTORY.find(d => d.name === point.district)?.lng) || 77.0;
              const pos = projectGeoToSvg(ptLat, ptLng);

              const isPointSelected = activePopupPoint?.id === point.id;
              const statusColor = point.status === 'active' ? '#16a34a' : point.status === 'maintenance' ? '#f59e0b' : '#64748b';

              return (
                <g
                  key={point.id}
                  transform={`translate(${pos.x + 4}, ${pos.y + 4})`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePopupPoint(point);
                  }}
                >
                  <circle
                    r={isPointSelected ? 12 : 8}
                    fill={statusColor}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <circle
                    r={isPointSelected ? 18 : 12}
                    fill="none"
                    stroke={statusColor}
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                  <text
                    y={3}
                    textAnchor="middle"
                    fontSize="7px"
                    fontWeight="800"
                    fill="#ffffff"
                  >
                    ●
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hovered District Tooltip */}
          {hoveredDistrict && (
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #bbf7d0',
                fontSize: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              <b style={{ color: '#0b3d25', display: 'block' }}>{hoveredDistrict.name} ({hoveredDistrict.code})</b>
              <span style={{ color: '#64748b' }}>Zone: {hoveredDistrict.zone} · HQ: {hoveredDistrict.headquarters}</span>
              <div style={{ marginTop: '2px', color: hoveredDistrict.isPilot ? '#15803d' : '#94a3b8', fontWeight: 700 }}>
                {hoveredDistrict.isPilot ? '● Active Operational Pilot' : '○ Standby / Data Awaited'}
              </div>
            </div>
          )}
        </div>

        {/* Right: Selected Collection Hub Inspector / Directory Listing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activePopupPoint ? (
            /* Selected Collection Point Popup Card */
            <div
              style={{
                background: '#ffffff',
                border: '2px solid #86efac',
                borderRadius: '14px',
                padding: '16px',
                boxShadow: '0 8px 24px rgba(8, 122, 60, 0.12)',
                position: 'relative'
              }}
            >
              <button
                type="button"
                onClick={() => setActivePopupPoint(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  border: 'none',
                  background: '#f1f5f9',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                <X size={14} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className={`status ${activePopupPoint.status === 'active' ? 'completed' : activePopupPoint.status === 'maintenance' ? 'pending' : 'rejected'}`}>
                  {activePopupPoint.status === 'active' && <CheckCircle2 size={11} style={{ display: 'inline', marginRight: '3px' }} />}
                  {activePopupPoint.status === 'maintenance' && <Wrench size={11} style={{ display: 'inline', marginRight: '3px' }} />}
                  {activePopupPoint.status.toUpperCase()}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                  {activePopupPoint.point_code}
                </span>
              </div>

              <b style={{ fontSize: '15px', color: '#0b3d25', display: 'block', lineHeight: 1.3 }}>
                {activePopupPoint.point_name}
              </b>
              <p style={{ margin: '4px 0 10px', fontSize: '11px', color: '#64748b' }}>
                <MapPin size={12} style={{ display: 'inline', marginRight: '4px', color: '#16a34a' }} />
                {activePopupPoint.address}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '10px', marginBottom: '10px' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Operating Hours</span>
                  <b>{activePopupPoint.operating_hours || '8:00 AM – 8:00 PM'}</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Assigned Collector</span>
                  <b>{activePopupPoint.assigned_collector || 'Sanitation Collector Officer'}</b>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <small style={{ fontSize: '9px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  ACCEPTED WASTE STREAMS:
                </small>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {(activePopupPoint.accepted_waste_types || ['Plastic', 'Paper', 'Metal']).map((cat) => (
                    <span
                      key={cat}
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activePopupPoint.lat || 11.0168},${activePopupPoint.lng || 76.9558}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#15803d',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={12} /> Google Maps
                </a>

                <button
                  type="button"
                  onClick={() => setQrModalPoint(activePopupPoint)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #86efac',
                    color: '#15803d',
                    fontSize: '10px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <QrCode size={12} /> View Hub QR
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '11px' }}>
              <MapPin size={24} style={{ color: '#16a34a', margin: '0 auto 6px', display: 'block' }} />
              <b>Click any pin on the map</b>
              <p style={{ margin: '4px 0 0', fontSize: '10px' }}>
                Inspect operating hours, scale calibration status, accepted materials, and open directions.
              </p>
            </div>
          )}

          {/* Quick List of Filtered Hubs */}
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <small style={{ fontSize: '10px', fontWeight: 800, color: '#334155' }}>
              MATCHING COLLECTION HUBS ({filteredPoints.length}):
            </small>
            {filteredPoints.map((p) => (
              <div
                key={p.id}
                onClick={() => setActivePopupPoint(p)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: activePopupPoint?.id === p.id ? '2px solid #16a34a' : '1px solid #e2e8f0',
                  background: activePopupPoint?.id === p.id ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <b style={{ fontSize: '11px', color: '#1e293b', display: 'block' }}>{p.point_name}</b>
                  <span style={{ fontSize: '9px', color: '#64748b' }}>{p.district} · {p.point_code}</span>
                </div>
                <span className={`status ${p.status === 'active' ? 'completed' : p.status === 'maintenance' ? 'pending' : 'rejected'}`} style={{ fontSize: '8px' }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Inspection Modal */}
      {qrModalPoint && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 99999 }}
          onClick={() => setQrModalPoint(null)}
        >
          <div
            className="modal-card"
            style={{ maxWidth: '360px', padding: '24px', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setQrModalPoint(null)}
              >
                <X size={18} />
              </button>
            </div>

            <QrCode size={40} style={{ color: '#15803d', margin: '0 auto 8px' }} />
            <h3 style={{ margin: '0 0 4px', font: '800 16px Manrope', color: '#0b3d25' }}>
              {qrModalPoint.point_name}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '11px', color: '#64748b' }}>
              Official Station QR Code · {qrModalPoint.point_code}
            </p>

            <div
              style={{
                width: '180px',
                height: '180px',
                background: '#ffffff',
                border: '3px solid #15803d',
                borderRadius: '12px',
                margin: '0 auto 16px',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 8px 20px rgba(8, 122, 60, 0.15)',
                padding: '12px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <QrCode size={110} style={{ color: '#0b3d25' }} />
                <b style={{ display: 'block', fontSize: '10px', color: '#15803d', marginTop: '4px' }}>
                  {qrModalPoint.point_code}
                </b>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px', fontSize: '9px', color: '#166534', lineHeight: 1.4 }}>
              <strong>Privacy & Security Verified:</strong> QR code only identifies physical collection station. It contains zero citizen wallet or reward data.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
