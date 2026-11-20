// ==============================================================================
// CleanTN 360 – Citizen Gamification & Green Community Engine (Phase 5)
// Badges, Challenges, Leaderboards (Privacy-Protected), Digital Certificates
// ==============================================================================

export const BADGE_DEFINITIONS = [
  {
    id: 'badge-first-deposit',
    name: 'First Green Deposit',
    icon: '🌱',
    category: 'Milestone',
    description: 'Submitted and successfully completed your first verified waste deposit.',
    bonusPoints: 50,
    checkUnlocked: (stats) => stats.totalDeposits >= 1
  },
  {
    id: 'badge-plastic-champ',
    name: 'Plastic Recycling Champion',
    icon: '♻',
    category: 'Material Master',
    description: 'Diverted more than 10 kg of verified polymers from entering water bodies and landfills.',
    bonusPoints: 150,
    checkUnlocked: (stats) => stats.plasticWeightKg >= 10
  },
  {
    id: 'badge-paper-saver',
    name: 'Paper Saver',
    icon: '📄',
    category: 'Material Master',
    description: 'Recycled over 15 kg of paper and cardboard, preserving valuable forest pulp.',
    bonusPoints: 100,
    checkUnlocked: (stats) => stats.paperWeightKg >= 15
  },
  {
    id: 'badge-community-contributor',
    name: 'Community Contributor',
    icon: '🤝',
    category: 'Civic Dedication',
    description: 'Completed 5 or more verified waste deposits across Tamil Nadu smart hubs.',
    bonusPoints: 200,
    checkUnlocked: (stats) => stats.totalDeposits >= 5
  },
  {
    id: 'badge-ewaste-pioneer',
    name: 'E-Waste Pioneer',
    icon: '⚡',
    category: 'Hazard Prevention',
    description: 'Safely handed over obsolete electronic waste or lithium batteries for certified scientific disposal.',
    bonusPoints: 300,
    checkUnlocked: (stats) => stats.ewasteWeightKg > 0
  },
  {
    id: 'badge-green-champion',
    name: 'Monthly Green Champion',
    icon: '🏆',
    category: 'Elite Honor',
    description: 'Ranked in the top 5% of environmentally proactive citizens in your district.',
    bonusPoints: 500,
    checkUnlocked: (stats) => stats.totalPointsEarned >= 2500
  }
];

export const INITIAL_COMMUNITY_CHALLENGES = [
  {
    id: 'chal-01',
    title: 'Kovai Clean Waterways: Plastic Interceptor Drive',
    district: 'Coimbatore',
    district_code: 'TN-CBE',
    target_category: 'Plastic',
    target_weight_kg: 500.0,
    current_weight_kg: 342.5,
    bonus_points_pool: 25000,
    participants_count: 64,
    start_date: '2026-11-01',
    end_date: '2026-11-30',
    description: 'Join fellow Coimbatore citizens to divert 500 kg of rigid and film plastics before monsoon drainage blockages.',
    is_active: true
  },
  {
    id: 'chal-02',
    title: 'Tamil Nadu E-Waste Safe Drop Month',
    district: 'Tamil Nadu Statewide',
    district_code: 'ALL',
    target_category: 'E-Waste',
    target_weight_kg: 200.0,
    current_weight_kg: 84.0,
    bonus_points_pool: 40000,
    participants_count: 42,
    start_date: '2026-11-10',
    end_date: '2026-12-10',
    description: 'Bring dead smartphone batteries, circuit boards, and cables to any certified Smart Hub to earn 2x bonus Green Money.',
    is_active: true
  },
  {
    id: 'chal-03',
    title: 'Cauvery Delta Paper & Pulp Conservation Relay',
    district: 'Tiruchirappalli',
    district_code: 'TN-TRY',
    target_category: 'Paper',
    target_weight_kg: 350.0,
    current_weight_kg: 195.0,
    bonus_points_pool: 15000,
    participants_count: 31,
    start_date: '2026-11-05',
    end_date: '2026-11-25',
    description: 'Collecting clean corrugated boxes and office archives across Tiruchirappalli educational institutions.',
    is_active: true
  }
];

export const MOCK_DISTRICT_LEADERBOARD = [
  { rank: 1, handle: 'Citizen Pioneer (You)', district: 'Coimbatore', verifiedKg: 38.5, points: 1925, badgeCount: 4, avatar: 'C' },
  { rank: 2, handle: 'Arun M.', district: 'Coimbatore', verifiedKg: 32.0, points: 1600, badgeCount: 3, avatar: 'A' },
  { rank: 3, handle: 'Meena S.', district: 'Coimbatore', verifiedKg: 28.4, points: 1420, badgeCount: 3, avatar: 'M' },
  { rank: 4, handle: 'Saravanan K.', district: 'Coimbatore', verifiedKg: 24.1, points: 1205, badgeCount: 2, avatar: 'S' },
  { rank: 5, handle: 'Deepa V.', district: 'Coimbatore', verifiedKg: 19.8, points: 990, badgeCount: 2, avatar: 'D' }
];

export function computeCitizenBadges(userDeposits = [], userWallet = {}) {
  const approved = userDeposits.filter(d => d.status === 'admin_approved');

  const stats = {
    totalDeposits: approved.length,
    totalPointsEarned: userWallet?.lifetime_earned_points || userWallet?.available_points || 0,
    plasticWeightKg: approved
      .filter(d => (d.category_name || '').toLowerCase() === 'plastic')
      .reduce((acc, d) => acc + (Number(d.actual_weight_kg) || Number(d.weight_kg) || 0), 0),
    paperWeightKg: approved
      .filter(d => (d.category_name || '').toLowerCase() === 'paper')
      .reduce((acc, d) => acc + (Number(d.actual_weight_kg) || Number(d.weight_kg) || 0), 0),
    ewasteWeightKg: approved
      .filter(d => (d.category_name || '').toLowerCase() === 'e-waste')
      .reduce((acc, d) => acc + (Number(d.actual_weight_kg) || Number(d.weight_kg) || 0), 0)
  };

  return BADGE_DEFINITIONS.map(badge => ({
    ...badge,
    isUnlocked: badge.checkUnlocked(stats)
  }));
}
