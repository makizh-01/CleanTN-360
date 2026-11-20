import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Navigation,
  ShieldCheck,
  Plus,
  CheckCircle2,
  Clock,
  BatteryCharging,
  ExternalLink,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function VehicleTrackingDashboard({ notify }) {
  const {
    vehicleFleet,
    vehicleLogs,
    registerVehicle,
    toggleVehicleShiftConsent,
    advanceVehicleStop
  } = useData();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [vehForm, setVehForm] = useState({
    vehicle_number: '',
    vehicle_type: 'Electric Tipper',
    assigned_collector: '',
    capacity_kg: 1500,
    fuel_type: 'Electric (EV)'
  });

  const activeVehiclesCount = vehicleFleet.filter(v => v.shift_active).length;

  const handleRegister = (e) => {
    e.preventDefault();
    if (!vehForm.vehicle_number.trim()) return;
    registerVehicle(vehForm);
    if (notify) notify(`Vehicle ${vehForm.vehicle_number.toUpperCase()} added to Municipal GPS Fleet.`);
    setIsRegisterOpen(false);
    setVehForm({
      vehicle_number: '',
      vehicle_type: 'Electric Tipper',
      assigned_collector: '',
      capacity_kg: 1500,
      fuel_type: 'Electric (EV)'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(12, 74, 110, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Truck size={28} style={{ color: '#7dd3fc' }} />
              <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
                Live Vehicle Fleet & Collector GPS Tracking
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                AIS-140 IRNSS Compliant
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#bae6fd', maxWidth: '760px', lineHeight: 1.6 }}>
              Authorized municipal vehicle tracking monitors collection routes, arrival timestamps, and payload capacity across Coimbatore EV tippers and compactors.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsRegisterOpen(true)}
            style={{ background: '#10b981', borderColor: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Register Fleet Vehicle
          </button>
        </div>
      </div>

      {/* Privacy & Consent Notice */}
      <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#166534' }}>
        <ShieldCheck size={20} style={{ flexShrink: 0, color: '#15803d' }} />
        <div>
          <b>Collector Privacy & Shift Consent Policy:</b> GPS telemetry operates exclusively during authorized collector shifts on municipal-registered vehicles. Personal devices are never tracked, and collector live coordinates are strictly withheld from public portals.
        </div>
      </div>

      {/* Fleet KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>REGISTERED VEHICLES</div>
          <div style={{ font: '800 26px Manrope', color: '#0f172a', marginTop: '4px' }}>{vehicleFleet.length} Units</div>
          <div style={{ fontSize: '11px', color: '#059669' }}>EV & CNG Municipal Fleet</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>ACTIVE ON-SHIFT</div>
          <div style={{ font: '800 26px Manrope', color: '#0284c7', marginTop: '4px' }}>{activeVehiclesCount} Active</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Shift Consent Verified</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>COMBINED PAYLOAD CARRIED</div>
          <div style={{ font: '800 26px Manrope', color: '#15803d', marginTop: '4px' }}>
            {vehicleFleet.reduce((s, v) => s + Number(v.current_payload_kg || 0), 0).toFixed(1)} kg
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Verified Hub Collections</div>
        </div>
      </div>

      {/* Vehicle Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {vehicleFleet.map(v => {
          const loadPct = Math.min(100, Math.round((v.current_payload_kg / v.capacity_kg) * 100));
          const routePct = Math.min(100, Math.round((v.current_stop_index / Math.max(1, v.total_stops)) * 100));

          return (
            <div key={v.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <b style={{ font: '800 17px Manrope', color: '#0f172a' }}>{v.vehicle_number}</b>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                      {v.vehicle_type}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                    Collector: <b>{v.assigned_collector}</b>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    background: v.shift_active ? '#dcfce7' : '#f1f5f9',
                    color: v.shift_active ? '#15803d' : '#64748b'
                  }}
                >
                  {v.shift_active ? v.status.toUpperCase().replace('_', ' ') : 'OFF DUTY (GPS PAUSED)'}
                </span>
              </div>

              {/* Coordinates & Telemetry */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', display: 'grid', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Active Route:</span>
                  <b style={{ color: '#0f172a' }}>{v.active_route_name}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Next Destination:</span>
                  <b style={{ color: '#0284c7' }}>{v.next_stop}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Authorized GPS:</span>
                  <span style={{ fontFamily: 'monospace', color: '#334155' }}>
                    {v.shift_active ? `${v.current_lat}° N, ${v.current_lng}° E (${v.speed_kmh} km/h)` : 'Tracking Disabled (Off-Shift)'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Energy ({v.fuel_type}):</span>
                  <b style={{ color: '#059669' }}>{v.battery_percent}%</b>
                </div>
              </div>

              {/* Progress Bars */}
              <div style={{ display: 'grid', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                    <span style={{ color: '#475569' }}>Route Stops Progress ({v.current_stop_index}/{v.total_stops})</span>
                    <b>{routePct}%</b>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px' }}>
                    <div style={{ width: `${routePct}%`, height: '100%', background: '#0284c7', borderRadius: '4px' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                    <span style={{ color: '#475569' }}>Payload ({v.current_payload_kg} / {v.capacity_kg} kg)</span>
                    <b>{loadPct}%</b>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px' }}>
                    <div style={{ width: `${loadPct}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    toggleVehicleShiftConsent(v.id);
                    if (notify) notify(`Updated shift GPS consent for ${v.vehicle_number}.`);
                  }}
                  style={{ fontSize: '11px', padding: '6px 10px' }}
                >
                  {v.shift_active ? 'End Shift (Pause GPS)' : 'Start Shift (Enable GPS)'}
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {v.shift_active && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${v.current_lat},${v.current_lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{ fontSize: '11px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ExternalLink size={12} /> Map
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!v.shift_active || v.current_stop_index >= v.total_stops}
                    onClick={() => {
                      advanceVehicleStop(v.id, 75);
                      if (notify) notify(`Recorded stop completion for ${v.vehicle_number} (+75 kg).`);
                    }}
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                  >
                    Mark Next Stop Done
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Log */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ margin: '0 0 14px', font: '800 18px Manrope', color: '#1e293b' }}>
          Authorized Vehicle Dispatch & Arrival History
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {vehicleLogs.map(log => (
            <div key={log.id} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '12px' }}>
              <div>
                <b style={{ color: '#0369a1' }}>{log.vehicle_number}</b> • <b>{log.action}</b> at {log.location}
                <div style={{ color: '#475569', marginTop: '2px' }}>{log.notes}</div>
              </div>
              <span style={{ color: '#64748b', fontSize: '11px' }}>{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Register Vehicle Modal */}
      {isRegisterOpen && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '460px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px', font: '800 18px Manrope', color: '#0f172a' }}>
              Register Municipal Collection Vehicle
            </h3>
            <form onSubmit={handleRegister} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>REGISTRATION NUMBER</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. TN-38-G-9921"
                  value={vehForm.vehicle_number}
                  onChange={(e) => setVehForm({ ...vehForm, vehicle_number: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>VEHICLE TYPE</label>
                <select
                  className="select"
                  value={vehForm.vehicle_type}
                  onChange={(e) => setVehForm({ ...vehForm, vehicle_type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px' }}
                >
                  <option value="Electric Tipper">Electric Tipper</option>
                  <option value="Hydraulic Compactor">Hydraulic Compactor</option>
                  <option value="E-Rickshaw Cart">E-Rickshaw Cart</option>
                  <option value="Bulk Carrier">Bulk Carrier</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>ASSIGNED COLLECTOR</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. Rajesh K. (Badge #COL-410)"
                  value={vehForm.assigned_collector}
                  onChange={(e) => setVehForm({ ...vehForm, assigned_collector: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsRegisterOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
