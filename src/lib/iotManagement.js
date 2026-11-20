// ==============================================================================
// CleanTN 360 – Real-World IoT Waste Management Engine (Phase 6)
// Device Fleet, Authenticated Telemetry, Sonar Fill Gauges, Duplicate Prevention
// ==============================================================================

export const INITIAL_IOT_FLEET = [
  {
    id: 'iot-01',
    device_code: 'CTN-SONAR-CBE-001',
    device_type: 'smart_bin_sonar',
    label: 'Ultrasonic Sonar Fill Sensor (Bin A)',
    point_code: 'CTN-CBE-001',
    point_name: 'Saibaba Colony Smart Hub',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    hardware_model: 'CleanTN-SonarX-v2 (IP67 Rated)',
    firmware_version: 'v2.4.1-ota',
    auth_token_masked: 'tok_live_cbe_sonar_••••9941',
    fill_level_percent: 68,
    battery_percent: 88,
    connectivity_status: 'online',
    last_ping_at: '2026-11-17T21:45:00Z',
    specs: 'Dual-band ultrasonic time-of-flight sensor, LoRaWAN 865 MHz (India ISM Band).'
  },
  {
    id: 'iot-02',
    device_code: 'CTN-SCALE-CBE-002',
    device_type: 'digital_scale',
    label: 'Industrial Bluetooth Digital Scale Station',
    point_code: 'CTN-CBE-002',
    point_name: 'RS Puram Green Hub',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    hardware_model: 'Eagle-Precision-BT300 (Class III)',
    firmware_version: 'v1.8.0',
    auth_token_masked: 'tok_live_cbe_scale_••••2210',
    fill_level_percent: 42,
    battery_percent: 94,
    connectivity_status: 'online',
    last_ping_at: '2026-11-17T21:50:00Z',
    specs: 'OIML R76 Class III certified, 300kg capacity, 10g division, BLE 5.2 telemetry.'
  },
  {
    id: 'iot-03',
    device_code: 'CTN-GPS-TRK-003',
    device_type: 'gps_telematics',
    label: 'EV Tipper Truck Telematics Unit #1',
    point_code: 'CTN-CBE-001',
    point_name: 'CCMC Town Hall Central Yard',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    hardware_model: 'Teltonika FMB920-IND (AIS-140)',
    firmware_version: 'v3.29.00',
    auth_token_masked: 'tok_live_cbe_gps_••••8873',
    fill_level_percent: 15,
    battery_percent: 99,
    connectivity_status: 'online',
    last_ping_at: '2026-11-17T21:55:00Z',
    specs: 'High-gain internal GNSS antenna, 4G LTE-M with 2G fallback, AIS-140 IRNSS compliant.'
  },
  {
    id: 'iot-04',
    device_code: 'CTN-SONAR-CBE-004',
    device_type: 'smart_bin_sonar',
    label: 'Ultrasonic Sonar Fill Sensor (Bin B)',
    point_code: 'CTN-CBE-003',
    point_name: 'Gandhipuram Central Hub',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    hardware_model: 'CleanTN-SonarX-v2 (IP67 Rated)',
    firmware_version: 'v2.4.1-ota',
    auth_token_masked: 'tok_live_cbe_sonar_••••4412',
    fill_level_percent: 85,
    battery_percent: 74,
    connectivity_status: 'online',
    last_ping_at: '2026-11-17T21:30:00Z',
    specs: 'Dual-band ultrasonic time-of-flight sensor, LoRaWAN 865 MHz.'
  },
  {
    id: 'iot-05',
    device_code: 'CTN-SOLAR-CBE-005',
    device_type: 'solar_hub_kiosk',
    label: 'Solar Inverter & Telemetry Unit',
    point_code: 'CTN-CBE-004',
    point_name: 'Peelamedu Tech Park Collection Hub',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    hardware_model: 'Luminous Solar-Edge-IoT 1kW',
    firmware_version: 'v1.12.4',
    auth_token_masked: 'tok_live_cbe_solar_••••1109',
    fill_level_percent: 30,
    battery_percent: 82,
    connectivity_status: 'standby',
    last_ping_at: '2026-11-17T20:15:00Z',
    specs: 'Grid-interactive 1kW MPPT solar power unit with battery telemetry.'
  }
];

export const INITIAL_TELEMETRY_LOGS = [
  {
    id: 'tel-01',
    device_code: 'CTN-SONAR-CBE-004',
    event_type: 'fill_reading',
    reading_value: 85,
    reading_unit: '%',
    message: 'High fill level threshold reached (85%). Priority pickup triggered.',
    timestamp: '2026-11-17T21:30:00Z',
    is_valid: true
  },
  {
    id: 'tel-02',
    device_code: 'CTN-SCALE-CBE-002',
    event_type: 'scale_ticket',
    reading_value: 24.5,
    reading_unit: 'kg',
    message: 'Certified weighbridge calibration ping recorded successfully.',
    timestamp: '2026-11-17T21:50:00Z',
    is_valid: true
  },
  {
    id: 'tel-03',
    device_code: 'CTN-GPS-TRK-003',
    event_type: 'gps_ping',
    reading_value: 22.4,
    reading_unit: 'km/h',
    message: 'Vehicle TN-38-G-4491 en route to Gandhipuram Hub.',
    timestamp: '2026-11-17T21:55:00Z',
    is_valid: true
  }
];

/**
 * Validates inbound authenticated telemetry payload and prevents duplicate event timestamps.
 */
export function validateTelemetryPayload(payload, lastTimestamp = null) {
  if (!payload || !payload.device_code) {
    return { isValid: false, error: 'Missing device_code in payload.' };
  }
  if (!payload.auth_token) {
    return { isValid: false, error: 'Missing device authentication token.' };
  }
  if (payload.timestamp && lastTimestamp && payload.timestamp <= lastTimestamp) {
    return { isValid: false, error: 'Duplicate or out-of-order timestamp rejected.' };
  }
  return { isValid: true, error: null };
}
