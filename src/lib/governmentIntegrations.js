// ==============================================================================
// CleanTN 360 – Government & Municipal Integration Framework (Phase 6)
// REST APIs, CPCB EPR Data Exchange, Municipal CSV Pipelines, Sync Logs
// ==============================================================================

export const INITIAL_GOV_INTEGRATIONS = [
  {
    id: 'gov-01',
    entity_name: 'Coimbatore Municipal Corporation (CCMC) SWM Feed',
    entity_type: 'Municipal_Corporation',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    integration_type: 'REST_API',
    endpoint_url: 'https://ccmc.gov.in/api/v2/solid-waste/sync',
    status: 'active',
    sync_frequency_hours: 4,
    records_exchanged_count: 3410,
    last_sync_at: '2026-11-17T21:00:00Z',
    auth_scheme: 'Bearer OAuth2 (Gov Portal Token)',
    description: 'Bi-directional live exchange of weighbridge tickets, collector shifts, and municipal ward disposal volumes.'
  },
  {
    id: 'gov-02',
    entity_name: 'Tamil Nadu Pollution Control Board (TNPCB) EPR Portal',
    entity_type: 'State_Pollution_Board',
    district: 'Tamil Nadu Statewide',
    district_code: 'ALL',
    integration_type: 'REST_API',
    endpoint_url: 'https://tnpcb.tn.gov.in/api/epr/ingest',
    status: 'active',
    sync_frequency_hours: 12,
    records_exchanged_count: 1280,
    last_sync_at: '2026-11-17T18:00:00Z',
    auth_scheme: 'API-Key (CPCB-TN-PWM-2026)',
    description: 'Statutory compliance feed dispatching verified plastic, metal, and e-waste recycling credits.'
  },
  {
    id: 'gov-03',
    entity_name: 'Greater Chennai Corporation (GCC) Swachh Chennai Data Lake',
    entity_type: 'Municipal_Corporation',
    district: 'Chennai',
    district_code: 'TN-CHN',
    integration_type: 'CSV_BATCH',
    endpoint_url: 'https://chennaicorporation.gov.in/swm/batch-csv',
    status: 'pilot_sandbox',
    sync_frequency_hours: 24,
    records_exchanged_count: 650,
    last_sync_at: '2026-11-16T12:00:00Z',
    auth_scheme: 'SFTP Batch Drop (Sandbox)',
    description: 'Batch synchronization of Ward 1 to 15 urban collection station metrics for Chennai Phase 6 rollout.'
  },
  {
    id: 'gov-04',
    entity_name: 'Central Pollution Control Board (CPCB) National Waste Registry',
    entity_type: 'Central_CPCB',
    district: 'National / Tamil Nadu',
    district_code: 'ALL',
    integration_type: 'REST_API',
    endpoint_url: 'https://cpcb.nic.in/epr-portal/v1/credits',
    status: 'pilot_sandbox',
    sync_frequency_hours: 24,
    records_exchanged_count: 190,
    last_sync_at: '2026-11-15T10:00:00Z',
    auth_scheme: 'HMAC-SHA256 Signed Gateway',
    description: 'Central registry integration validating Plastic Waste Management (PWM) Rule 2026.1 traceability.'
  }
];

export const GOV_SYNC_LOGS = [
  {
    id: 'sync-01',
    entity_name: 'Coimbatore Municipal Corporation (CCMC)',
    direction: 'outbound',
    records_count: 42,
    status: 'success',
    timestamp: '2026-11-17T21:00:00Z',
    details: 'Dispatched 42 scale-verified waste receipts (1,240.5 kg total weight).'
  },
  {
    id: 'sync-02',
    entity_name: 'TNPCB EPR Portal',
    direction: 'outbound',
    records_count: 18,
    status: 'success',
    timestamp: '2026-11-17T18:00:00Z',
    details: 'CPCB EPR plastic certificates synced and acknowledged.'
  },
  {
    id: 'sync-03',
    entity_name: 'Greater Chennai Corporation (GCC)',
    direction: 'inbound',
    records_count: 0,
    status: 'retrying',
    timestamp: '2026-11-16T12:00:00Z',
    details: 'Sandbox SFTP gateway timeout; auto-retry scheduled in 2 hours.'
  }
];
