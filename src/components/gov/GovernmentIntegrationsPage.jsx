import React from 'react';
import {
  Landmark,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Download,
  ShieldCheck,
  Database,
  Play,
  Pause,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function GovernmentIntegrationsPage({ notify }) {
  const { govIntegrations, govSyncLogs, toggleGovIntegration, triggerGovSync, deposits } = useData();

  const handleExportCSV = () => {
    const approved = deposits.filter(d => d.status === 'admin_approved');
    const headers = 'deposit_code,category,actual_weight_kg,approved_points,approved_at\n';
    const rows = approved.map(d =>
      `${d.deposit_code || d.id},${d.category_name || 'Plastic'},${d.actual_weight_kg || d.weight_kg || 0},${d.approved_points || 0},${d.approved_at || ''}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cleantn360_municipal_exchange_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (notify) notify('Municipal compliant CSV exchange package exported.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(20, 83, 45, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Landmark size={28} style={{ color: '#86efac' }} />
              <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
                Government & Municipal Integration Hub
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                Pilot Sandbox & CSV Gateway
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#dcfce7', maxWidth: '780px', lineHeight: 1.6 }}>
              Authorized data-exchange connectors for Municipal Corporations (CCMC, GCC), Tamil Nadu Pollution Control Board (TNPCB), and CPCB EPR registries. Includes automated retry handling and compliant CSV export fallbacks.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportCSV}
            style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#1e293b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileSpreadsheet size={16} /> Export Municipal CSV
          </button>
        </div>
      </div>

      {/* Compliance Notice */}
      <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#92400e' }}>
        <ShieldCheck size={20} style={{ flexShrink: 0, color: '#d97706' }} />
        <div>
          <b>Official Authorization Disclaimer:</b> External municipal and pollution control API connectors run in clearly labeled <b>Pilot Integration Mode</b> until official production MoU credentials and IP allowlisting are provisioned by the respective departments.
        </div>
      </div>

      {/* Integration Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {govIntegrations.map(intg => {
          const isActive = intg.status === 'active';
          const isPilot = intg.status === 'pilot_sandbox';

          return (
            <div key={intg.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                      {intg.entity_type.replace(/_/g, ' ')} • {intg.district}
                    </span>
                    <h3 style={{ margin: '2px 0 0', font: '800 15px Manrope', color: '#0f172a' }}>
                      {intg.entity_name}
                    </h3>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: isActive ? '#dcfce7' : isPilot ? '#dbeafe' : '#f1f5f9',
                      color: isActive ? '#15803d' : isPilot ? '#1d4ed8' : '#64748b',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {intg.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                  {intg.description}
                </p>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#334155', display: 'grid', gap: '4px' }}>
                  <div>Protocol: <b>{intg.integration_type}</b> • Every {intg.sync_frequency_hours}h</div>
                  <div>Auth: <b>{intg.auth_scheme}</b></div>
                  <div>Records Exchanged: <b style={{ color: '#047857' }}>{intg.records_exchanged_count.toLocaleString()}</b></div>
                  <div>Last Sync: {intg.last_sync_at ? new Date(intg.last_sync_at).toLocaleString() : 'Never'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    toggleGovIntegration(intg.id);
                    if (notify) notify(`Toggled integration status for ${intg.entity_name}.`);
                  }}
                  style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {isActive ? <Pause size={12} /> : <Play size={12} />}
                  {isActive ? 'Pause Connector' : 'Enable Connector'}
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const log = triggerGovSync(intg.id);
                    if (notify && log) notify(`Sync succeeded: ${log.records_count} records exchanged with ${intg.entity_name}.`);
                  }}
                  style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={12} /> Run Sync Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync History Logs */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ margin: '0 0 14px', font: '800 18px Manrope', color: '#1e293b' }}>
          Data Exchange & Integration Audit Logs
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {govSyncLogs.map(log => (
            <div key={log.id} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '12px' }}>
              <div>
                <b style={{ color: '#0f172a' }}>{log.entity_name}</b>{' '}
                <span style={{ fontSize: '10px', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {log.direction.toUpperCase()}
                </span>
                <div style={{ color: '#475569', marginTop: '3px' }}>{log.details}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: log.status === 'success' ? '#dcfce7' : '#fef3c7', color: log.status === 'success' ? '#15803d' : '#b45309' }}>
                  {log.status.toUpperCase()} ({log.records_count} recs)
                </span>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>{new Date(log.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
