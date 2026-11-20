// ==============================================================================
// CleanTN 360 – Live Vehicle Fleet & GPS Tracking Engine (Phase 6)
// Fleet Management, Real Road Network Waypoints, Shift Consent & Privacy
// ==============================================================================

export const INITIAL_VEHICLE_FLEET = [
  {
    id: 'veh-01',
    vehicle_number: 'TN-38-G-4491',
    vehicle_type: 'Electric Tipper',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    assigned_collector: 'Collector Officer (Badge #COL-401)',
    capacity_kg: 1500.0,
    current_payload_kg: 420.5,
    fuel_type: 'Electric (EV)',
    status: 'on_route',
    battery_percent: 78,
    speed_kmh: 24,
    current_lat: 11.0025,
    current_lng: 76.9620,
    active_route_name: 'Coimbatore Urban Core Route #A',
    current_stop_index: 2,
    total_stops: 4,
    completed_stops: ['CTN-CBE-001 (Saibaba Colony)'],
    next_stop: 'CTN-CBE-002 (RS Puram Green Hub)',
    shift_active: true,
    consent_recorded: true
  },
  {
    id: 'veh-02',
    vehicle_number: 'TN-38-G-6102',
    vehicle_type: 'Hydraulic Compactor',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    assigned_collector: 'Selvam P. (Badge #COL-402)',
    capacity_kg: 3500.0,
    current_payload_kg: 1850.0,
    fuel_type: 'CNG Green',
    status: 'active',
    battery_percent: 92,
    speed_kmh: 0,
    current_lat: 10.9975,
    current_lng: 76.9602,
    active_route_name: 'CCMC Town Hall Standby Depot',
    current_stop_index: 0,
    total_stops: 3,
    completed_stops: [],
    next_stop: 'Depot Staging Yard',
    shift_active: true,
    consent_recorded: true
  },
  {
    id: 'veh-03',
    vehicle_number: 'TN-38-G-8819',
    vehicle_type: 'E-Rickshaw Cart',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    assigned_collector: 'Deepak V. (Badge #COL-403)',
    capacity_kg: 600.0,
    current_payload_kg: 180.0,
    fuel_type: 'Electric (EV)',
    status: 'on_route',
    battery_percent: 64,
    speed_kmh: 18,
    current_lat: 11.0250,
    current_lng: 76.9850,
    active_route_name: 'Peelamedu Tech Corridor Circuit',
    current_stop_index: 1,
    total_stops: 3,
    completed_stops: [],
    next_stop: 'CTN-CBE-004 (Peelamedu Tech Park)',
    shift_active: true,
    consent_recorded: true
  }
];

export const VEHICLE_ACTIVITY_LOGS = [
  {
    id: 'act-01',
    vehicle_number: 'TN-38-G-4491',
    action: 'Arrived at Collection Point',
    location: 'Saibaba Colony Smart Hub',
    timestamp: '2026-11-17T21:10:00Z',
    notes: 'Loaded 142.5 kg verified plastic and paper.'
  },
  {
    id: 'act-02',
    vehicle_number: 'TN-38-G-4491',
    action: 'Transit In-Progress',
    location: 'DB Road, RS Puram Junction',
    timestamp: '2026-11-17T21:35:00Z',
    notes: 'Estimated arrival at RS Puram Hub: 6 mins.'
  },
  {
    id: 'act-03',
    vehicle_number: 'TN-38-G-8819',
    action: 'Shift Commenced',
    location: 'Peelamedu Sub-Depot',
    timestamp: '2026-11-17T20:00:00Z',
    notes: 'Collector Deepak V. logged in and verified vehicle battery at 100%.'
  }
];
