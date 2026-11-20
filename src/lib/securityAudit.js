// ==============================================================================
// CleanTN 360 – Advanced Security & Compliance Audit Engine (Phase 6)
// RLS Enforcement Matrix, MFA Readiness, Rate-Limiting, Audit Telemetry
// ==============================================================================

export const SECURITY_CONTROLS_MATRIX = [
  {
    id: 'sec-01',
    control: 'PostgreSQL Row-Level Security (RLS)',
    scope: 'All 24 Core & Phase 6 Tables',
    status: 'ENFORCED',
    compliance: 'ISO 27001 / CERT-In India',
    details: 'Citizen wallets, UPI details, device tokens, and collector GPS traces strictly isolated by auth.uid() & role claims.'
  },
  {
    id: 'sec-02',
    control: 'Encryption in Transit & At Rest',
    scope: 'TLS 1.3 HTTPS + AES-256 Storage',
    status: 'ENFORCED',
    compliance: 'DPDP Act 2023 (India)',
    details: 'Mandatory HSTS headers, signed storage URLs for scale evidence, and zero plaintext API keys in frontend bundles.'
  },
  {
    id: 'sec-03',
    control: 'Multi-Factor Authentication (MFA / TOTP)',
    scope: 'Admin, State Admin & Financial Payout Approvals',
    status: 'READY',
    compliance: 'RBI / Gov Secretariat Policy',
    details: 'Supabase Auth MFA TOTP enrollment ready for all privileged municipal officer accounts.'
  },
  {
    id: 'sec-04',
    control: 'API Rate Limiting & Abuse Throttling',
    scope: 'IoT Ingestion, AI Assistant & Deposit Endpoints',
    status: 'ACTIVE',
    compliance: 'OWASP API Security Top 10',
    details: 'Sliding window limits: 60 req/min per IoT device token; 20 queries/min per citizen AI session.'
  },
  {
    id: 'sec-05',
    control: 'Zero-PII Public Portal Isolation',
    scope: '/public-impact & Leaderboards',
    status: 'VERIFIED',
    compliance: 'DPDP Act 2023 Privacy by Design',
    details: 'Public views exclusively serve district aggregates and anonymized handles. Zero phone numbers, emails, or UPI IDs exposed.'
  }
];

export const INITIAL_SECURITY_AUDIT_LOGS = [
  {
    id: 'aud-01',
    event_type: 'rls_policy_verification',
    actor: 'System Compliance Scanner',
    severity: 'info',
    ip_address: '10.0.14.22 (Internal)',
    timestamp: '2026-11-18T11:30:00Z',
    message: 'Verified RLS active on payout_transactions, iot_device_fleet, and wallet_accounts (0 policy gaps).'
  },
  {
    id: 'aud-02',
    event_type: 'rate_limit_throttle',
    actor: 'IoT Gateway Edge',
    severity: 'medium',
    ip_address: '49.205.118.42',
    timestamp: '2026-11-18T09:15:00Z',
    message: 'Duplicate sonar ping packet from CTN-SONAR-CBE-004 dropped automatically (idempotency guard).'
  },
  {
    id: 'aud-03',
    event_type: 'privileged_role_login',
    actor: 'State Secretariat Command (State Admin)',
    severity: 'info',
    ip_address: '117.247.82.19 (Secretariat WAN)',
    timestamp: '2026-11-18T08:45:00Z',
    message: 'Authenticated State Secretariat session initiated with verified role token.'
  },
  {
    id: 'aud-04',
    event_type: 'unauthorized_payout_block',
    actor: 'Wallet Guard RPC',
    severity: 'high',
    ip_address: '103.48.199.11',
    timestamp: '2026-11-17T22:12:00Z',
    message: 'Blocked non-admin client attempt to call payout settlement endpoint directly. Logged & denied (HTTP 403).'
  }
];

export const DATA_RETENTION_POLICIES = [
  { category: 'Financial Ledger & Green Money Transactions', retention: '7 Years (Statutory Municipal Audit)', deletion: 'Immutable (Reversal Entries Only)' },
  { category: 'Collector GPS Operational Traces', retention: '90 Days Rolling Window', deletion: 'Automated Purge After Route Reconciliation' },
  { category: 'Waste Deposit Verification Photographs', retention: '2 Years (CPCB EPR Audit Period)', deletion: 'Encrypted Cold Archive After 180 Days' },
  { category: 'AI Assistant Chat Logs', retention: '30 Days (Anonymized)', deletion: 'User Clearable On Demand' }
];
