// ==============================================================================
// CleanTN 360 – Statewide Community & Environmental Awareness Network (Phase 6)
// NGOs, College Eco-Clubs, Volunteer Cleanups, Digital Volunteer Certificates
// ==============================================================================

export const INITIAL_COMMUNITY_EVENTS = [
  {
    id: 'ev-01',
    event_title: 'Noyyal Riverbank Zero-Plastic Cleanup Drive',
    organizer_type: 'NGO',
    organizer_name: 'Siruthuli Environmental Trust (Coimbatore)',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    event_date: '2026-11-24',
    venue_name: 'Perur Noyyal Check Dam Bank, Coimbatore',
    target_volunteers: 120,
    registered_volunteers_count: 86,
    waste_stream_focus: 'Plastic & Packaging',
    status: 'upcoming',
    hours_credit: 4.5,
    isUserRegistered: false,
    description: 'Joint citizen-NGO river corridor cleanup with live weighbridge verification by CCMC field staff.'
  },
  {
    id: 'ev-02',
    event_title: 'PSG & CIT Inter-College E-Waste Awareness Hackathon',
    organizer_type: 'College_Eco_Club',
    organizer_name: 'Coimbatore Collegiate Eco-Club Alliance',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    event_date: '2026-11-29',
    venue_name: 'Peelamedu Campus Auditorium & Hub',
    target_volunteers: 200,
    registered_volunteers_count: 145,
    waste_stream_focus: 'E-Waste & Batteries',
    status: 'upcoming',
    hours_credit: 6.0,
    isUserRegistered: true,
    description: 'Student-led drive collecting defunct laptops, chargers, and dry cells for certified CPCB handover.'
  },
  {
    id: 'ev-03',
    event_title: 'Marina Beach Dawn Coastal Cleanup & Segregation Camp',
    organizer_type: 'Municipality',
    organizer_name: 'Greater Chennai Corporation (GCC) Youth Wing',
    district: 'Chennai',
    district_code: 'TN-CHN',
    event_date: '2026-12-06',
    venue_name: 'Marina Lighthouse Promenade, Chennai',
    target_volunteers: 300,
    registered_volunteers_count: 210,
    waste_stream_focus: 'Marine Plastics & Glass',
    status: 'upcoming',
    hours_credit: 4.0,
    isUserRegistered: false,
    description: 'Statewide coastal sustainability showcase introducing CleanTN 360 to Chennai North & Central wards.'
  },
  {
    id: 'ev-04',
    event_title: 'Vaigai Heritage Temple Corridor Paper & Compost Drive',
    organizer_type: 'NGO',
    organizer_name: 'Madurai Green Heritage Volunteers',
    district: 'Madurai',
    district_code: 'TN-MDU',
    event_date: '2026-11-12',
    venue_name: 'East Masi Street Civic Square, Madurai',
    target_volunteers: 80,
    registered_volunteers_count: 80,
    waste_stream_focus: 'Organic & Paper',
    status: 'completed',
    hours_credit: 3.5,
    isUserRegistered: true,
    description: 'Successfully diverted 310 kg of floral and paper waste into verified municipal micro-composting units.'
  }
];

export const INITIAL_COMMUNITY_PARTNERS = [
  {
    id: 'prt-01',
    name: 'Siruthuli Environmental Trust',
    type: 'NGO',
    district: 'Coimbatore',
    verified: true,
    volunteers_mobilized: 420
  },
  {
    id: 'prt-02',
    name: 'Coimbatore Collegiate Eco-Club Alliance',
    type: 'College Eco-Club',
    district: 'Coimbatore',
    verified: true,
    volunteers_mobilized: 615
  },
  {
    id: 'prt-03',
    name: 'Chennai Coastal Guardians Collective',
    type: 'NGO',
    district: 'Chennai',
    verified: true,
    volunteers_mobilized: 380
  }
];
