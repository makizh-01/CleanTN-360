// ==============================================================================
// CleanTN 360 – Authorized Recycler Marketplace & Handover Engine (Phase 6)
// CPCB/TNPCB Verified Recyclers, E-Waste Compliance, Digital Handover Certificates
// ==============================================================================

export const INITIAL_RECYCLER_PARTNERS = [
  {
    id: 'rec-01',
    company_name: 'Kovai EcoPolymers & Packaging Recyclers Pvt Ltd',
    registration_number: 'TNPCB/CBE/PWM/2026/0412',
    cpcb_authorization_id: 'CPCB-EPR-TN-2026-1088',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    facility_address: 'SIDCO Industrial Estate, Phase II, Kurichi, Coimbatore - 641021',
    contact_person: 'Thiru. S. Karthikeyan',
    phone: '+91 422 267 8910',
    email: 'operations@kovaiecopolymers.in',
    accepted_waste_types: ['Plastic', 'Paper'],
    daily_capacity_tons: 15.0,
    verification_status: 'verified_approved',
    verified_at: '2026-11-01T10:00:00Z'
  },
  {
    id: 'rec-02',
    company_name: 'GreenVolt E-Waste Scientific Recyclers (TNPCB Authorized)',
    registration_number: 'TNPCB/EWASTE/2026/0089',
    cpcb_authorization_id: 'CPCB-EW-TN-2026-0441',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    facility_address: 'KINFRA Hi-Tech Corridor, Neelambur, Coimbatore - 641062',
    contact_person: 'Dr. M. Anitha',
    phone: '+91 422 262 7744',
    email: 'compliance@greenvoltrecyclers.in',
    accepted_waste_types: ['E-Waste', 'Metal'],
    daily_capacity_tons: 8.5,
    verification_status: 'verified_approved',
    verified_at: '2026-11-04T14:30:00Z'
  },
  {
    id: 'rec-03',
    company_name: 'Madras Circular Glass & Metals Processing Facility',
    registration_number: 'TNPCB/CHN/SWM/2026/0911',
    cpcb_authorization_id: 'CPCB-EPR-TN-2026-2290',
    district: 'Chennai',
    district_code: 'TN-CHN',
    facility_address: 'Ambattur Industrial Estate, North Phase, Chennai - 600098',
    contact_person: 'Thiru. V. Raghavan',
    phone: '+91 44 2625 1122',
    email: 'intake@madrascircular.in',
    accepted_waste_types: ['Glass', 'Metal', 'Paper'],
    daily_capacity_tons: 28.0,
    verification_status: 'verified_approved',
    verified_at: '2026-11-08T09:15:00Z'
  },
  {
    id: 'rec-04',
    company_name: 'Vaigai Organic Compost & Bio-CNG Plant',
    registration_number: 'TNPCB/MDU/BIO/2026/0155',
    cpcb_authorization_id: 'CPCB-BIO-TN-2026-0712',
    district: 'Madurai',
    district_code: 'TN-MDU',
    facility_address: 'Kappalur Industrial Area, Thirumangalam, Madurai - 625008',
    contact_person: 'Smt. K. Lakshmi',
    phone: '+91 452 248 9012',
    email: 'intake@vaigaibio.in',
    accepted_waste_types: ['Organic'],
    daily_capacity_tons: 20.0,
    verification_status: 'pending_verification',
    verified_at: null
  }
];

export const INITIAL_HANDOVER_RECORDS = [
  {
    id: 'ho-01',
    handover_code: 'HO-2611-CBE-001',
    point_name: 'Saibaba Colony Smart Hub',
    recycler_id: 'rec-01',
    recycler_name: 'Kovai EcoPolymers & Packaging Recyclers Pvt Ltd',
    waste_category: 'Plastic',
    weight_kg: 145.5,
    certificate_hash: 'SHA256-9F8A7B6C5D4E3F2A1B0C9D8E7F6A',
    handover_status: 'received_verified',
    collector_name: 'Collector Officer',
    handover_date: '2026-11-16T16:40:00Z'
  },
  {
    id: 'ho-02',
    handover_code: 'HO-2611-CBE-002',
    point_name: 'Peelamedu Tech Park Collection Hub',
    recycler_id: 'rec-02',
    recycler_name: 'GreenVolt E-Waste Scientific Recyclers (TNPCB Authorized)',
    waste_category: 'E-Waste',
    weight_kg: 38.2,
    certificate_hash: 'SHA256-4D3C2B1A0F9E8D7C6B5A4F3E2D1C',
    handover_status: 'in_transit',
    collector_name: 'Deepak V.',
    handover_date: '2026-11-17T14:20:00Z'
  }
];

export function generateHandoverCertificateHash(handoverCode, weightKg) {
  const raw = `${handoverCode}-${weightKg}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return 'SHA256-CTN-' + Math.abs(hash).toString(16).toUpperCase().padStart(12, '0');
}
