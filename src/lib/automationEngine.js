// ==============================================================================
// CleanTN 360 – Smart Alert & Automation Engine (Phase 5)
// Configurable Event Triggers, Multi-Channel Handlers (In-App, Email, SMS, WhatsApp)
// ==============================================================================

export const DEFAULT_AUTOMATION_RULES = [
  {
    id: 'rule-01',
    rule_name: 'Pending Scale Verification SLA Alert',
    event_trigger: 'deposit_pending_sla',
    threshold_hours: 24,
    channels: ['in_app', 'email'],
    target_role: 'collector',
    priority: 'high',
    is_active: true,
    description: 'Triggers when a citizen submits a deposit that remains unverified by a field collector for over 24 hours.'
  },
  {
    id: 'rule-02',
    rule_name: 'Hub Inactive or Maintenance Alert',
    event_trigger: 'hub_status_offline',
    threshold_hours: 1,
    channels: ['in_app', 'sms'],
    target_role: 'admin',
    priority: 'critical',
    is_active: true,
    description: 'Triggers immediately when a Smart Collection Hub drops offline or enters maintenance mode during operating hours.'
  },
  {
    id: 'rule-03',
    rule_name: 'Waste Accumulation Surge Warning',
    event_trigger: 'waste_surge_threshold',
    threshold_kg: 100,
    channels: ['in_app', 'whatsapp'],
    target_role: 'collector',
    priority: 'medium',
    is_active: true,
    description: 'Triggers when a hub accumulates over 100 kg of recyclable materials within a single shift, scheduling priority pickup.'
  },
  {
    id: 'rule-04',
    rule_name: 'High Fraud Risk Anomaly Alert',
    event_trigger: 'suspicious_deposit_flagged',
    threshold_risk_score: 65,
    channels: ['in_app', 'email', 'sms'],
    target_role: 'admin',
    priority: 'critical',
    is_active: true,
    description: 'Alerts Municipal Admin when automated fraud engine scores a deposit at or above 65% risk.'
  },
  {
    id: 'rule-05',
    rule_name: 'Redemption SLA Reminder',
    event_trigger: 'redemption_pending_sla',
    threshold_hours: 48,
    channels: ['in_app'],
    target_role: 'admin',
    priority: 'medium',
    is_active: true,
    description: 'Notifies financial admin if citizen UPI redemption request is pending disbursement for over 48 hours.'
  }
];

export function evaluateAutomationTriggers({
  rules = DEFAULT_AUTOMATION_RULES,
  deposits = [],
  collectionPoints = [],
  redemptions = [],
  fraudAlerts = []
}) {
  const triggeredEvents = [];
  const now = Date.now();

  rules.forEach(rule => {
    if (!rule.is_active) return;

    // Trigger 1: Pending deposits SLA
    if (rule.event_trigger === 'deposit_pending_sla') {
      const pendingDeposits = deposits.filter(d => d.status === 'submitted');
      pendingDeposits.forEach(d => {
        const submittedTime = new Date(d.submitted_at || d.created_at || now).getTime();
        const ageHours = (now - submittedTime) / (1000 * 60 * 60);

        if (ageHours >= (rule.threshold_hours || 24)) {
          triggeredEvents.push({
            id: 'evt-' + d.id + '-' + rule.id,
            rule_id: rule.id,
            rule_name: rule.rule_name,
            event_type: 'deposit_pending_sla',
            priority: rule.priority,
            channels: rule.channels,
            title: `SLA Alert: Deposit ${d.deposit_code || d.id.slice(0, 8)} Pending Verification`,
            message: `Deposit at ${d.point_name || 'Hub'} has been pending scale verification for ${Math.round(ageHours)} hours.`,
            recipient_role: rule.target_role,
            timestamp: new Date().toISOString(),
            delivery_status: 'delivered',
            retry_count: 0
          });
        }
      });
    }

    // Trigger 2: Offline collection point
    if (rule.event_trigger === 'hub_status_offline') {
      const offlineHubs = collectionPoints.filter(cp => cp.status === 'maintenance' || cp.status === 'inactive');
      offlineHubs.forEach(hub => {
        triggeredEvents.push({
          id: 'evt-hub-' + hub.id + '-' + rule.id,
          rule_id: rule.id,
          rule_name: rule.rule_name,
          event_type: 'hub_status_offline',
          priority: rule.priority,
          channels: rule.channels,
          title: `Station Alert: ${hub.point_name} is ${hub.status.toUpperCase()}`,
          message: `Collection hub ${hub.point_code} in ${hub.district} is currently offline. Citizen deposits are temporarily rerouted.`,
          recipient_role: rule.target_role,
          timestamp: new Date().toISOString(),
          delivery_status: 'delivered',
          retry_count: 0
        });
      });
    }

    // Trigger 3: Suspicious deposit flag
    if (rule.event_trigger === 'suspicious_deposit_flagged') {
      const criticalAlerts = fraudAlerts.filter(fa => fa.risk_score >= (rule.threshold_risk_score || 65) && fa.investigation_status === 'pending_review');
      criticalAlerts.forEach(fa => {
        triggeredEvents.push({
          id: 'evt-fraud-' + fa.id,
          rule_id: rule.id,
          rule_name: rule.rule_name,
          event_type: 'suspicious_deposit_flagged',
          priority: 'critical',
          channels: rule.channels,
          title: `Security Anomaly: Deposit Risk Score ${fa.risk_score}/100`,
          message: `Automated audit detected suspicious pattern on deposit #${fa.deposit_id?.slice(0, 8) || 'DEP'}. Human review required.`,
          recipient_role: rule.target_role,
          timestamp: new Date().toISOString(),
          delivery_status: 'delivered',
          retry_count: 0
        });
      });
    }
  });

  return triggeredEvents;
}
