// ==============================================================================
// CleanTN 360 – IoT Integration Readiness Registry (Phase 5)
// Device Architecture, Sensor Schemas, Hardware Telemetry Standards (No Fake Data)
// ==============================================================================

export const REGISTERED_IOT_DEVICES = [
  {
    device_id: 'IOT-SONAR-CBE-01',
    device_type: 'smart_bin_sonar',
    label: 'Ultrasonic Fill-Level Sonar Sensor',
    hardware_model: 'CleanTN-SonarX-v2 (IP67)',
    firmware_version: '2.4.1-ota',
    point_name: 'Saibaba Colony Smart Hub',
    district: 'Coimbatore',
    status: 'standby', // Not claiming fake live readings; architecture readiness
    telemetry_unit: 'fill_percentage',
    installed_at: '2026-11-10T10:00:00Z',
    specs: 'Dual-band ultrasonic time-of-flight sensor, LoRaWAN 865 MHz (India ISM Band).'
  },
  {
    device_id: 'IOT-SCALE-CBE-02',
    device_type: 'digital_scale',
    label: 'Industrial Bluetooth Digital Weighing Scale',
    hardware_model: 'Eagle-Precision-BT300',
    firmware_version: '1.8.0',
    point_name: 'Gandhipuram Central Hub',
    district: 'Coimbatore',
    status: 'active',
    telemetry_unit: 'kg',
    installed_at: '2026-11-05T09:30:00Z',
    specs: 'OIML R76 Class III certified, 300kg capacity, 10g division, BLE 5.2 encrypted telemetry.'
  },
  {
    device_id: 'IOT-GPS-TRK-03',
    device_type: 'gps_tracker',
    label: 'Municipal Electric Waste Truck Telematics Unit',
    hardware_model: 'Teltonika FMB920-IND',
    firmware_version: '3.29.00',
    point_name: 'Coimbatore Municipal Depot (Truck #TN-38-G-4491)',
    district: 'Coimbatore',
    status: 'active',
    telemetry_unit: 'lat_lng_speed',
    installed_at: '2026-11-01T08:00:00Z',
    specs: 'High-gain internal GNSS antenna, 4G LTE-M with 2G fallback, AIS-140 IRNSS compliant.'
  }
];
