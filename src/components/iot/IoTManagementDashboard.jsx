import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  WifiOff,
  BatteryCharging,
  AlertTriangle,
  Plus,
  Radio,
  ShieldCheck,
  Activity,
  CheckCircle2,
  RefreshCw,
  Server
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function IoTManagementDashboard({ notify }) {
  const {
    iotFleet,
    telemetryLogs,
    collectionPoints,
    registerIoTDevice,
    ingestSimulatedTelemetry,
    toggleIoTDeviceStatus
  } = useData();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [form, setForm] = useState({
    device_code: '',
    label: '',
    device_type: 'smart_bin_sonar',
    point_code: 'CTN-CBE-001',
    point_name: 'Saibaba Colony Smart Hub',
    hardware_model: 'CleanTN-SonarX-v2 (IP67)'
  });

  const activeCount = iotFleet.filter(d => d.connectivity_status === 'online').length;
  const offlineCount = iotFleet.filter(d => d.connectivity_status === 'offline').length;
  const highFillCount = iotFleet.filter(d => d.fill_level_percent >= 80).length;

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.device_code.trim() || !form.label.trim()) return;
    registerIoTDevice(form);
    if (notify) notify(`IoT Device ${form.device_code.toUpperCase()} registered with encrypted auth token.`);
    setIsRegisterOpen(false);
    setForm({
      device_code: '',
      label: '',
      device_type: 'smart_bin_sonar',
      point_code: 'CTN-CBE-001',
      point_name: 'Saibaba Colony Smart Hub',
      hardware_model: 'CleanTN-SonarX-v2 (IP67)'
    });
  };

  const handleSimulatePing = (device) => {
    const nextFill = Math.min(98, Math.max(15, Math.round(device.fill_level_percent + (Math.random() * 14 - 4))));
    const nextBat = Math.max(20, device.battery_percent - 1);
    const res = ingestSimulatedTelemetry(device.device_code, nextFill, nextBat);
    if (res.isValid && notify) {
      notify(`Simulated HTTPS telemetry ingested for ${device.device_code} (${nextFill}% fill).`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(6, 78, 59, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Cpu size={28} style={{ color: '#5eead4' }} />
              <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
                Real-World IoT Waste Management & Telemetry
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                MQTT over TLS / HTTPS
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#ccfbf1', maxWidth: '780px', lineHeight: 1.6 }}>
              Secure hardware registry for smart-bin ultrasonic fill sensors, Bluetooth Class-III scales, solar inverters, and vehicle GPS nodes.
              Includes token authentication, payload validation, and duplicate event protection.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsRegisterOpen(true)}
            style={{ background: '#10b981', borderColor: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Register IoT Device
          </button>
        </div>
      </div>

      {/* Honest Simulation Disclaimer */}
      <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#92400e' }}>
        <ShieldCheck size={20} style={{ flexShrink: 0, color: '#d97706' }} />
        <div>
          <b>Hardware Policy & Safeguard:</b> Simulated device telemetry is clearly labeled. Existing QR + collector physical scale verification remains mandatory. IoT sensor readings <b>never</b> independently credit Green Money wallets.
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>REGISTERED DEVICES</div>
          <div style={{ font: '800 26px Manrope', color: '#0f172a', marginTop: '4px' }}>{iotFleet.length} Nodes</div>
          <div style={{ fontSize: '11px', color: '#059669' }}>Token-Authenticated Fleet</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>ONLINE / CONNECTED</div>
          <div style={{ font: '800 26px Manrope', color: '#15803d', marginTop: '4px' }}>{activeCount} Online</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{offlineCount} Offline • {iotFleet.length - activeCount - offlineCount} Standby</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>HIGH FILL ALERTS (&ge;80%)</div>
          <div style={{ font: '800 26px Manrope', color: highFillCount > 0 ? '#dc2626' : '#059669', marginTop: '4px' }}>
            {highFillCount} Bins
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Auto-linked to Route Priority</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>TELEMETRY GATEWAY</div>
          <div style={{ font: '800 20px Manrope', color: '#0284c7', marginTop: '6px' }}>TLS 1.3 Verified</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Rate limit: 60 req/min/device</div>
        </div>
      </div>

      {/* Registered IoT Devices Grid */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ margin: '0 0 16px', font: '800 18px Manrope', color: '#1e293b' }}>
          Registered Smart Waste Devices (Pilot Telemetry Mode)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
          {iotFleet.map((dev) => {
            const isOnline = dev.connectivity_status === 'online';
            const isOffline = dev.connectivity_status === 'offline';
            const fillColor = dev.fill_level_percent >= 80 ? '#dc2626' : dev.fill_level_percent >= 60 ? '#d97706' : '#10b981';

            return (
              <div
                key={dev.id}
                style={{
                  padding: '18px',
                  borderRadius: '14px',
                  border: isOffline ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                  background: isOffline ? '#fef2f2' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857' }}>{dev.device_code}</span>
                    <h3 style={{ margin: '2px 0 0', font: '800 15px Manrope', color: '#0f172a' }}>{dev.label}</h3>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{dev.point_name} ({dev.district})</div>
                  </div>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: isOnline ? '#dcfce7' : isOffline ? '#fee2e2' : '#fef3c7',
                      color: isOnline ? '#15803d' : isOffline ? '#dc2626' : '#b45309'
                    }}
                  >
                    {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {dev.connectivity_status.toUpperCase()}
                  </span>
                </div>

                {/* Fill Level Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#475569', fontWeight: 700 }}>Simulated Fill / Load Level</span>
                    <b style={{ color: fillColor }}>{dev.fill_level_percent}%</b>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${dev.fill_level_percent}%`, height: '100%', background: fillColor, borderRadius: '4px' }} />
                  </div>
                </div>

                {/* Specs & Token */}
                <div style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '8px', display: 'grid', gap: '4px' }}>
                  <div>Model: <b>{dev.hardware_model}</b> • FW: {dev.firmware_version}</div>
                  <div>Battery: <b style={{ color: '#059669' }}>{dev.battery_percent}%</b> • Token: <code>{dev.auth_token_masked}</code></div>
                  <div>Last Ping: {new Date(dev.last_ping_at).toLocaleString()}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => toggleIoTDeviceStatus(dev.id)}
                    style={{ fontSize: '11px', padding: '6px 10px' }}
                  >
                    {isOnline ? 'Simulate Offline' : 'Reconnect'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleSimulatePing(dev)}
                    style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Radio size={12} /> Ingest Test Ping
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Telemetry Ingestion Log */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ margin: '0 0 14px', font: '800 18px Manrope', color: '#1e293b' }}>
          Authenticated Device Telemetry Event History
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {telemetryLogs.map(log => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div>
                <b style={{ color: '#047857' }}>{log.device_code}</b> •{' '}
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{log.reading_value}{log.reading_unit}</span>
                <div style={{ color: '#475569', marginTop: '2px' }}>{log.message}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
                <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>
                  VALIDATED
                </span>
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px', font: '800 18px Manrope', color: '#0f172a' }}>
              Register New IoT Hardware Node
            </h3>
            <form onSubmit={handleRegister} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>DEVICE CODE</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. CTN-SONAR-CBE-009"
                  value={form.device_code}
                  onChange={(e) => setForm({ ...form, device_code: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>DEVICE LABEL</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. Singanallur Ultrasonic Bin Sensor"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>SENSOR TYPE</label>
                <select
                  className="select"
                  value={form.device_type}
                  onChange={(e) => setForm({ ...form, device_type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px' }}
                >
                  <option value="smart_bin_sonar">Smart-Bin Ultrasonic Fill Sensor</option>
                  <option value="digital_scale">Bluetooth Digital Weighing Scale</option>
                  <option value="gps_telematics">Truck GPS Telematics Unit</option>
                  <option value="solar_hub_kiosk">Solar Hub Telemetry Unit</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>MAPPED COLLECTION POINT</label>
                <select
                  className="select"
                  value={form.point_code}
                  onChange={(e) => {
                    const cp = collectionPoints.find(p => p.point_code === e.target.value);
                    setForm({ ...form, point_code: e.target.value, point_name: cp?.point_name || e.target.value });
                  }}
                  style={{ width: '100%', padding: '8px 12px' }}
                >
                  {collectionPoints.map(cp => (
                    <option key={cp.id} value={cp.point_code}>
                      {cp.point_code} – {cp.point_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsRegisterOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Provision Token & Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
