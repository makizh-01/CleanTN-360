import React, { useState } from 'react';
import {
  Bell,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Mail,
  MessageSquare,
  Smartphone,
  RefreshCw,
  Plus,
  Sliders,
  ShieldAlert,
  Send
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { evaluateAutomationTriggers } from '../../lib/automationEngine';

export default function AutomationRulesPage({ notify }) {
  const {
    automationRules,
    toggleAutomationRule,
    deposits,
    collectionPoints,
    redemptions,
    fraudAlerts
  } = useData();

  const [previewChannel, setPreviewChannel] = useState(null); // 'email' | 'sms' | 'whatsapp'
  const [selectedEventForPreview, setSelectedEventForPreview] = useState(null);

  // Evaluate live triggers
  const liveTriggeredEvents = evaluateAutomationTriggers({
    rules: automationRules,
    deposits,
    collectionPoints,
    redemptions,
    fraudAlerts
  });

  const handleSimulateRule = (rule) => {
    if (notify) notify(`Simulation test executed for: "${rule.rule_name}" across configured channels.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #701a75 0%, #a21caf 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(112, 26, 117, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Zap size={28} style={{ color: '#f0abfc' }} />
              <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
                Smart Alert & Notification Automation Engine
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                Phase 5 Event Bus
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#f5d0fe', maxWidth: '750px', lineHeight: 1.6 }}>
              Event-driven background dispatch orchestrator monitors verified deposits, scale SLAs, station outages,
              and fraud anomalies. Broadcasts actionable alerts across In-App, Email, TRAI-compliant SMS, and WhatsApp.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '11px', color: '#f5d0fe', fontWeight: 700 }}>ACTIVE AUTOMATION RULES</div>
            <div style={{ font: '800 22px Manrope', color: '#ffffff', marginTop: '2px' }}>
              {automationRules.filter(r => r.is_active).length} / {automationRules.length} Enabled
            </div>
          </div>
        </div>
      </div>

      {/* Rules Config List */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', font: '800 18px Manrope', color: '#1e293b' }}>
              Configured SLA & Trigger Rules
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Toggle triggers or inspect multi-channel payloads.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                if (notify) notify('All automation queues re-synced.');
              }}
              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={13} /> Re-sync Queues
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {automationRules.map((rule) => {
            const isCritical = rule.priority === 'critical';
            const isHigh = rule.priority === 'high';
            return (
              <div
                key={rule.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: rule.is_active ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                  background: rule.is_active ? '#ffffff' : '#f8fafc',
                  opacity: rule.is_active ? 1 : 0.65,
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <b style={{ font: '800 15px Manrope', color: '#1e293b' }}>{rule.rule_name}</b>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: isCritical ? '#fee2e2' : isHigh ? '#ffedd5' : '#e2e8f0',
                        color: isCritical ? '#dc2626' : isHigh ? '#c2410c' : '#334155'
                      }}
                    >
                      {rule.priority.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                      Target: {rule.target_role}
                    </span>
                  </div>
                  <p style={{ margin: '6px 0 8px', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                    {rule.description}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Channels:</span>
                    {rule.channels.map(ch => (
                      <span
                        key={ch}
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: '#f1f5f9',
                          color: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {ch === 'email' ? <Mail size={11} /> : ch === 'sms' ? <Smartphone size={11} /> : ch === 'whatsapp' ? <MessageSquare size={11} /> : <Bell size={11} />}
                        {ch.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => handleSimulateRule(rule)}
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                  >
                    Test Fire
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAutomationRule(rule.id)}
                    style={{
                      background: rule.is_active ? '#10b981' : '#94a3b8',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {rule.is_active ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Trigger Event Log */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', font: '800 18px Manrope', color: '#1e293b' }}>
              Real-time Event Queue & Delivery Status
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Shows active operational notifications fired by the automation engine in response to live state.
            </p>
          </div>

          <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px' }}>
            {liveTriggeredEvents.length} Active Events Queued
          </span>
        </div>

        {liveTriggeredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '13px' }}>
            <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
            No active SLA breaches or station alerts currently. All systems operating within normal parameters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {liveTriggeredEvents.map(evt => (
              <div
                key={evt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: '12px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <b style={{ color: '#0f172a' }}>{evt.title}</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>• {evt.rule_name}</span>
                  </div>
                  <div style={{ color: '#475569', marginTop: '2px' }}>{evt.message}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                    DELIVERED (0 RETRIES)
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setSelectedEventForPreview(evt);
                      setPreviewChannel('sms');
                    }}
                    style={{ fontSize: '10px', padding: '4px 8px' }}
                  >
                    View Payload
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payload Inspection Modal */}
      {selectedEventForPreview && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 10px', font: '800 18px Manrope', color: '#1e293b' }}>
              Multi-Channel Payload Inspector
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748b' }}>
              Payload structure generated for external telco & messaging providers.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['sms', 'email', 'whatsapp'].map(ch => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setPreviewChannel(ch)}
                  style={{
                    background: previewChannel === ch ? '#047857' : '#f1f5f9',
                    color: previewChannel === ch ? '#ffffff' : '#475569',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {ch.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={{ background: '#0f172a', color: '#38bdf8', borderRadius: '10px', padding: '14px', fontSize: '11px', fontFamily: 'monospace', overflowX: 'auto', marginBottom: '16px', lineHeight: 1.5 }}>
              {previewChannel === 'sms' && (
                <>
                  [TRAI DLT Template ID: CLEANTN_ALERT_102]<br />
                  "CleanTN 360 Alert: {selectedEventForPreview.title}. {selectedEventForPreview.message} - TNPCB Govt of Tamil Nadu"
                </>
              )}
              {previewChannel === 'email' && (
                <>
                  From: alerts@cleantn360.tn.gov.in<br />
                  Subject: [CLEANTN-SLA] {selectedEventForPreview.title}<br />
                  Body: {selectedEventForPreview.message}<br />
                  Timestamp: {selectedEventForPreview.timestamp}
                </>
              )}
              {previewChannel === 'whatsapp' && (
                <>
                  WhatsApp Business API Template: cleantn_sla_warning<br />
                  Parameters: ["{selectedEventForPreview.title}", "{selectedEventForPreview.recipient_role}"]
                </>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedEventForPreview(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
