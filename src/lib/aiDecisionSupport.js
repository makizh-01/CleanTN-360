// ==============================================================================
// CleanTN 360 – AI Admin Decision Support Engine (Phase 5)
// Explainable Policy & Operational Recommendations with Traceable Database Metrics
// ==============================================================================

export const INITIAL_AI_RECOMMENDATIONS = [
  {
    id: 'rec-01',
    recommendation_code: 'REC-2026-EXP-01',
    title: 'Deploy New Smart Hub in Vadavalli Urban Corridor',
    district_code: 'TN-CBE',
    district_name: 'Coimbatore',
    category: 'Expansion',
    priority: 'high',
    description: 'High deposit density from Ward 17-19 citizens traveling > 4.2 km to RS Puram Hub indicates strong demand for a localized collection node.',
    suggested_action: 'Allocate 1 modular solar weighing kiosk at Vadavalli Bus Terminus and assign 1 field collector.',
    supporting_metrics: {
      travel_distance_km: 4.2,
      affected_citizens: 310,
      estimated_monthly_divert_kg: 480,
      roi_break_even_months: 3.5
    },
    source_period: 'November 2026 Operational Ledger',
    status: 'pending',
    admin_response: null,
    created_at: '2026-11-15T09:00:00Z'
  },
  {
    id: 'rec-02',
    recommendation_code: 'REC-2026-FLT-02',
    title: 'Rebalance Collector Shifts: Peelamedu Evening Surge',
    district_code: 'TN-CBE',
    district_name: 'Coimbatore',
    category: 'Collector_Allocation',
    priority: 'medium',
    description: 'Peelamedu Tech Hub experiences 68% of daily citizen drop-offs between 04:30 PM and 06:30 PM, causing scale queuing delays.',
    suggested_action: 'Shift Collector shift schedule to 12:00 PM – 07:00 PM to eliminate evening bottleneck.',
    supporting_metrics: {
      peak_window: '16:30 - 18:30 IST',
      queue_wait_mins: 14.2,
      deposits_in_window_pct: 68
    },
    source_period: 'Q4 2026 Verified Telemetry',
    status: 'accepted',
    admin_response: 'Approved by Municipal Zonal Officer. Schedule adjusted effective Monday.',
    created_at: '2026-11-14T15:30:00Z'
  },
  {
    id: 'rec-03',
    recommendation_code: 'REC-2026-DAT-03',
    title: 'Mandate Digital Scale Calibration Audit in Tiruppur Pilot',
    district_code: 'TN-TPR',
    district_name: 'Tiruppur',
    category: 'Data_Quality',
    priority: 'critical',
    description: 'Tiruppur textile pilot logged 18 deposits without accompanying secondary certified scale photos, falling below data verification SLA.',
    suggested_action: 'Issue automated compliance advisory to Tiruppur district coordinator and restrict points disbursement until scales are re-synced.',
    supporting_metrics: {
      missing_scale_photos: 18,
      data_verification_score: '6.5/15',
      compliance_deficit_pct: 35
    },
    source_period: 'November 2026 Pilot Audit',
    status: 'under_review',
    admin_response: 'Flagged for State Admin Secretariat review.',
    created_at: '2026-11-16T12:00:00Z'
  },
  {
    id: 'rec-04',
    recommendation_code: 'REC-2026-REC-04',
    title: 'Launch Targeted E-Waste Drive in Madurai South',
    district_code: 'TN-MDU',
    district_name: 'Madurai',
    category: 'Recycling',
    priority: 'medium',
    description: 'E-Waste constitutes only 1.2% of Madurai collection despite high electronics market density in Simmakkal commercial zone.',
    suggested_action: 'Deploy specialized hazardous e-waste receptacles and partner with local telecom retailers for weekend drop-off drives.',
    supporting_metrics: {
      current_ewaste_pct: 1.2,
      statewide_avg_pct: 8.5,
      potential_recovery_kg: 250
    },
    source_period: 'October - November 2026 Benchmark',
    status: 'pending',
    admin_response: null,
    created_at: '2026-11-17T08:15:00Z'
  }
];
