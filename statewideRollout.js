// ==============================================================================
// CleanTN 360 – Tamil Nadu 38-District Phased Operational Rollout Engine (Phase 6)
// Stage 1 to Stage 5 Expansion Pipeline, Strict Readiness Criteria Enforcement
// ==============================================================================

import { TN_DISTRICTS_DIRECTORY } from './districtData';

const STAGE_2_CODES = ['TN-CHN', 'TN-MDU', 'TN-TRY', 'TN-SLM', 'TN-TPR'];
const STAGE_3_CODES = ['TN-ERD', 'TN-VEL', 'TN-TNJ', 'TN-TNV', 'TN-TTK', 'TN-KNC', 'TN-CGL', 'TN-DGL', 'TN-KRI'];

export function computeStatewideRolloutStatus({
  collectionPoints = [],
  districtAdmins = [],
  recyclerPartners = [],
  deposits = []
}) {
  return TN_DISTRICTS_DIRECTORY.map((dist) => {
    const isCoimbatore = dist.code === 'TN-CBE';
    const isStage2 = STAGE_2_CODES.includes(dist.code);
    const isStage3 = STAGE_3_CODES.includes(dist.code);

    const adminAssigned = districtAdmins.some(
      a => a.district_code === dist.code || a.district_name?.toLowerCase() === dist.name.toLowerCase()
    );
    const hubsDeployed = collectionPoints.filter(
      cp => (cp.district || '').toLowerCase() === dist.name.toLowerCase() && cp.status === 'active'
    ).length;
    const recyclersPartnered = recyclerPartners.filter(
      r => (r.district_code === dist.code || (r.district || '').toLowerCase() === dist.name.toLowerCase()) && r.verification_status === 'verified_approved'
    ).length;

    const districtDeposits = deposits.filter(d => {
      const hub = collectionPoints.find(p => p.point_code === d.point_code);
      return (hub?.district || '').toLowerCase() === dist.name.toLowerCase();
    });

    const verifiedCount = districtDeposits.filter(d => d.status === 'admin_approved').length;

    let rolloutStage = 'Stage 5: Standby';
    if (isCoimbatore) rolloutStage = 'Stage 1: Live Pilot';
    else if (isStage2) rolloutStage = 'Stage 2: Early Expansion';
    else if (isStage3) rolloutStage = 'Stage 3: Regional Cluster';
    else rolloutStage = 'Stage 4: Onboarding Queue';

    // Strict Readiness Calculation (0-100)
    let score = 0;
    if (adminAssigned) score += 25;
    if (hubsDeployed > 0) score += 25;
    if (recyclersPartnered > 0) score += 20;
    if (verifiedCount > 0 || isCoimbatore) score += 20;
    if (isCoimbatore || (adminAssigned && hubsDeployed > 0)) score += 10;

    // A district can ONLY be marked Operational if readiness criteria are satisfied
    const isOperational = isCoimbatore || (adminAssigned && hubsDeployed >= 2 && recyclersPartnered >= 1 && verifiedCount >= 5);

    const pendingTasks = [];
    if (!adminAssigned) pendingTasks.push('Assign District Administrator');
    if (hubsDeployed === 0) pendingTasks.push('Deploy Certified Smart Hub & QR');
    if (recyclersPartnered === 0) pendingTasks.push('Onboard TNPCB Authorized Recycler');
    if (verifiedCount === 0 && !isCoimbatore) pendingTasks.push('Complete Scale Verification Pilot Test');

    return {
      district_code: dist.code,
      district_name: dist.name,
      zone: dist.zone,
      headquarters: dist.headquarters,
      rollout_stage: rolloutStage,
      onboarding_score: Math.min(100, score),
      is_operational: isOperational,
      admin_assigned: adminAssigned,
      hubs_deployed: hubsDeployed,
      collectors_active: isCoimbatore ? 4 : hubsDeployed > 0 ? 1 : 0,
      recyclers_partnered: recyclersPartnered,
      data_completeness_pct: isCoimbatore ? 98 : isStage2 ? 45 : isStage3 ? 20 : 5,
      pending_tasks: pendingTasks
    };
  });
}
