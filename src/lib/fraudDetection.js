// ==============================================================================
// CleanTN 360 – Fraud Detection & Smart Verification Engine (Phase 5)
// Explainable Rule-Based Risk Scoring, Anomaly Detection, Human-in-the-Loop Audit
// ==============================================================================

export const DEFAULT_FRAUD_ALERTS = [
  {
    id: 'fa-101',
    deposit_id: 'dep-mock-01',
    deposit_code: 'DEP-2611-CBE-991',
    citizen_name: 'P. Vignesh',
    citizen_id: 'usr-cit-09',
    point_name: 'Saibaba Colony Smart Hub',
    waste_category: 'Plastic',
    claimed_weight_kg: 85.0,
    actual_weight_kg: 12.0,
    risk_score: 88,
    risk_tier: 'critical',
    triggered_rules: [
      {
        code: 'WEIGHT_VARIANCE_CRITICAL',
        title: 'Severe Weight Deviation (> 700% discrepancy)',
        description: 'Citizen estimated 85.0 kg of plastic, but collector verified scale reading was 12.0 kg.'
      },
      {
        code: 'RAPID_SUBMISSION_BURST',
        title: 'Consecutive Submissions Burst',
        description: '3 separate deposits submitted within 8 minutes from the same device IP.'
      }
    ],
    evidence_image_url: '/cleantn-logo.png',
    investigation_status: 'pending_review',
    created_at: '2026-11-16T14:22:00Z',
    admin_notes: null
  },
  {
    id: 'fa-102',
    deposit_id: 'dep-mock-02',
    deposit_code: 'DEP-2611-CBE-812',
    citizen_name: 'S. Divya',
    citizen_id: 'usr-cit-04',
    point_name: 'RS Puram Green Hub',
    waste_category: 'Metal',
    claimed_weight_kg: 45.0,
    actual_weight_kg: 44.5,
    risk_score: 45,
    risk_tier: 'medium',
    triggered_rules: [
      {
        code: 'PHOTO_HASH_SIMILARITY',
        title: 'Visual Evidence Similarity',
        description: 'Uploaded scale photo visual hash has 89% structural similarity with a submission from yesterday.'
      }
    ],
    evidence_image_url: '/cleantn-logo.png',
    investigation_status: 'pending_review',
    created_at: '2026-11-15T11:05:00Z',
    admin_notes: null
  }
];

/**
 * Evaluates a deposit submission against explainable fraud rules.
 */
export function analyzeDepositRisk(deposit, historicalDeposits = []) {
  let score = 0;
  const triggeredRules = [];

  const claimed = Number(deposit.weight_kg) || 0;
  const actual = Number(deposit.actual_weight_kg);

  // Rule 1: High variance between citizen estimate and collector scale
  if (actual && claimed > 0) {
    const ratio = Math.abs(claimed - actual) / actual;
    if (ratio > 2.0 && Math.abs(claimed - actual) > 5) {
      score += 45;
      triggeredRules.push({
        code: 'SCALE_DISCREPANCY',
        title: 'Unusual Weight Discrepancy',
        description: `Variance of ${Math.round(ratio * 100)}% between citizen estimated weight (${claimed}kg) and certified scale (${actual}kg).`
      });
    }
  }

  // Rule 2: Unusually massive single deposit (> 50kg for residential plastic/e-waste)
  if (claimed > 50 && (deposit.category_name === 'Plastic' || deposit.category_name === 'E-Waste')) {
    score += 30;
    triggeredRules.push({
      code: 'ANOMALOUS_BULK_WEIGHT',
      title: 'Anomalous Residential Deposit Volume',
      description: `Single household deposit of ${claimed}kg exceeds normal 99th percentile threshold (15kg).`
    });
  }

  // Rule 3: Velocity check (multiple deposits in last 15 minutes)
  const now = Date.now();
  const recentSameUser = historicalDeposits.filter(d => {
    if (d.citizen_id !== deposit.citizen_id) return false;
    const timeDiff = now - new Date(d.submitted_at || d.created_at || now).getTime();
    return timeDiff < 15 * 60 * 1000;
  });

  if (recentSameUser.length >= 2) {
    score += 35;
    triggeredRules.push({
      code: 'SUBMISSION_VELOCITY_SPIKE',
      title: 'High Velocity Submissions Detected',
      description: `${recentSameUser.length} deposits submitted within 15 minutes by the same citizen account.`
    });
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, score);
  let riskTier = 'low';
  if (finalScore >= 75) riskTier = 'critical';
  else if (finalScore >= 50) riskTier = 'high';
  else if (finalScore >= 25) riskTier = 'medium';

  return {
    riskScore: finalScore,
    riskTier,
    triggeredRules,
    isSuspicious: finalScore >= 40,
    evaluatedAt: new Date().toISOString(),
    safeguardNotice: 'Human Review Mandatory: Automated risk score does not reject deposits or alter balances.'
  };
}
