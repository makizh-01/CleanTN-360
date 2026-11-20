export const DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
  'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar'
];

export const INITIAL_WASTE_CATEGORIES = [
  { id: 'cat-plastic', name: 'Plastic', pointsPerKg: 50, icon: '♻', desc: 'Dry bottles, containers, clean packaging polyethene' },
  { id: 'cat-paper', name: 'Paper', pointsPerKg: 40, icon: '▤', desc: 'Cardboard, newspapers, office papers, cartons' },
  { id: 'cat-metal', name: 'Metal', pointsPerKg: 60, icon: '▣', desc: 'Tin cans, aluminum beverage cans, iron scraps' },
  { id: 'cat-glass', name: 'Glass', pointsPerKg: 50, icon: '♢', desc: 'Bottles, jars safely packed' },
  { id: 'cat-organic', name: 'Organic', pointsPerKg: 20, icon: '❧', desc: 'Segregated wet bio-waste, compostable kitchen organics' },
  { id: 'cat-ewaste', name: 'E-Waste', pointsPerKg: 100, icon: '⌘', desc: 'Obsolete electronics, cables, batteries (Authorized partners only)' }
];

export const WASTE_CATEGORIES = {
  Plastic: { id: 'cat-plastic', name: 'Plastic', pointsPerKg: 50, icon: '♻', desc: 'Dry bottles, containers, clean packaging polyethene', color: '#16a34a' },
  Paper: { id: 'cat-paper', name: 'Paper', pointsPerKg: 40, icon: '▤', desc: 'Cardboard, newspapers, office papers, cartons', color: '#0284c7' },
  Metal: { id: 'cat-metal', name: 'Metal', pointsPerKg: 60, icon: '▣', desc: 'Tin cans, aluminum beverage cans, iron scraps', color: '#f59e0b' },
  Glass: { id: 'cat-glass', name: 'Glass', pointsPerKg: 50, icon: '♢', desc: 'Bottles, jars safely packed', color: '#8b5cf6' },
  Organic: { id: 'cat-organic', name: 'Organic', pointsPerKg: 20, icon: '❧', desc: 'Segregated wet bio-waste, compostable kitchen organics', color: '#10b981' },
  'E-Waste': { id: 'cat-ewaste', name: 'E-Waste', pointsPerKg: 100, icon: '⌘', desc: 'Obsolete electronics, cables, batteries (Authorized partners only)', color: '#64748b' }
};

export const INITIAL_COLLECTION_POINTS = [
  {
    id: 'cp-001',
    point_code: 'CTN-CBE-001',
    point_name: 'R.S. Puram Collection Hub',
    district: 'Coimbatore',
    address: 'Diwan Bahadur Rd, R.S. Puram, Coimbatore · 641002',
    lat: 11.0112,
    lng: 76.9472,
    distance: '0.8 km',
    operating_hours: '8:00 AM – 8:00 PM',
    accepted_waste_types: ['Plastic', 'Paper', 'Metal', 'Glass'],
    assigned_collector: 'Sanitation Collector Officer',
    status: 'active'
  },
  {
    id: 'cp-002',
    point_code: 'CTN-CBE-002',
    point_name: 'Gandhipuram Central Hub',
    district: 'Coimbatore',
    address: 'Cross Cut Road, Gandhipuram, Coimbatore · 641012',
    lat: 11.0183,
    lng: 76.9688,
    distance: '2.1 km',
    operating_hours: '7:30 AM – 8:30 PM',
    accepted_waste_types: ['Plastic', 'Paper', 'Organic'],
    assigned_collector: 'Sanitation Collector Officer',
    status: 'active'
  },
  {
    id: 'cp-003',
    point_code: 'CTN-CBE-003',
    point_name: 'Peelamedu Tech Hub Point',
    district: 'Coimbatore',
    address: 'Avinashi Rd, Peelamedu, Coimbatore · 641004',
    lat: 11.0315,
    lng: 77.0175,
    distance: '3.8 km',
    operating_hours: '8:00 AM – 7:00 PM',
    accepted_waste_types: ['Plastic', 'Metal', 'E-Waste'],
    assigned_collector: 'Ramesh K (Field Staff)',
    status: 'active'
  },
  {
    id: 'cp-004',
    point_code: 'CTN-CBE-004',
    point_name: 'Singanallur Lake Eco-Station',
    district: 'Coimbatore',
    address: 'Trichy Road, Singanallur, Coimbatore · 641005',
    lat: 10.9984,
    lng: 77.0256,
    distance: '5.2 km',
    operating_hours: '8:30 AM – 6:30 PM',
    accepted_waste_types: ['Plastic', 'Glass', 'Organic', 'E-Waste'],
    assigned_collector: 'Unassigned',
    status: 'maintenance'
  },
  {
    id: 'cp-005',
    point_code: 'CTN-CHN-001',
    point_name: 'T. Nagar Civic Center Hub',
    district: 'Chennai',
    address: 'Usman Road, T. Nagar, Chennai · 600017',
    lat: 13.0418,
    lng: 80.2341,
    distance: '1.2 km',
    operating_hours: '8:00 AM – 8:00 PM',
    accepted_waste_types: ['Plastic', 'Paper', 'Metal', 'Glass', 'E-Waste'],
    assigned_collector: 'Karthik N',
    status: 'active'
  },
  {
    id: 'cp-006',
    point_code: 'CTN-CHN-002',
    point_name: 'Adyar Green Hub',
    district: 'Chennai',
    address: 'Sardar Patel Rd, Adyar, Chennai · 600020',
    lat: 13.0064,
    lng: 80.2575,
    distance: '2.5 km',
    operating_hours: '8:00 AM – 7:00 PM',
    accepted_waste_types: ['Plastic', 'Organic', 'Glass'],
    assigned_collector: 'Suresh V',
    status: 'active'
  },
  {
    id: 'cp-007',
    point_code: 'CTN-MDU-001',
    point_name: 'Madurai Meenakshi Civic Hub',
    district: 'Madurai',
    address: 'West Tower Street, Madurai · 625001',
    lat: 9.9195,
    lng: 78.1193,
    distance: '0.9 km',
    operating_hours: '8:00 AM – 7:30 PM',
    accepted_waste_types: ['Plastic', 'Paper', 'Metal', 'Organic'],
    assigned_collector: 'Pandian M',
    status: 'active'
  },
  {
    id: 'cp-008',
    point_code: 'CTN-TRY-001',
    point_name: 'Trichy Central Bus Stand Hub',
    district: 'Tiruchirappalli',
    address: 'Cantonment, Tiruchirappalli · 620001',
    lat: 10.8055,
    lng: 78.6856,
    distance: '1.5 km',
    operating_hours: '8:00 AM – 7:00 PM',
    accepted_waste_types: ['Plastic', 'Paper', 'Glass'],
    assigned_collector: 'Ganesh T',
    status: 'active'
  },
  {
    id: 'cp-009',
    point_code: 'CTN-SLM-001',
    point_name: 'Salem New Bus Stand Green Hub',
    district: 'Salem',
    address: 'Meyyanur Bypass, Salem · 636004',
    lat: 11.6685,
    lng: 78.1398,
    distance: '2.0 km',
    operating_hours: '8:00 AM – 7:30 PM',
    accepted_waste_types: ['Plastic', 'Paper', 'Metal'],
    assigned_collector: 'Unassigned',
    status: 'inactive'
  }
];

export const POINTS_TO_RUPEE_RATIO = 100; // 100 points = Rs. 1

export const DEFAULT_REWARD_SETTINGS = {
  points_per_rupee: 100, // 100 points = Rs. 1
  min_redemption_points: 5000, // Min 5,000 points (Rs. 50)
  monthly_limit_rupees: 100 // Max Rs. 100 reward per citizen per month
};

