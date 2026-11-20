// ==============================================================================
// CleanTN 360 – Real Green Money Payout Infrastructure (Phase 6)
// Razorpay/Cashfree Sandbox UPI Orchestrator, Idempotency Keys, Webhook HMAC
// ==============================================================================

export const PAYOUT_PROVIDERS = [
  {
    id: 'Razorpay_Sandbox',
    name: 'RazorpayX UPI Payouts (Sandbox)',
    mode: 'SANDBOX_SIMULATION',
    status: 'connected',
    webhookEndpoint: '/api/webhooks/razorpay-payout',
    settlementEta: 'Instant (IMPS/UPI Sandbox)',
    complianceStatus: 'Pending Production RBI / Merchant KYC'
  },
  {
    id: 'Cashfree_Sandbox',
    name: 'Cashfree Payouts UPI Gateway (Sandbox)',
    mode: 'SANDBOX_SIMULATION',
    status: 'standby',
    webhookEndpoint: '/api/webhooks/cashfree-payout',
    settlementEta: 'Instant (UPI Sandbox)',
    complianceStatus: 'Pending Production Merchant KYC'
  },
  {
    id: 'Simulated_Pilot',
    name: 'CleanTN Pilot Ledger Simulator',
    mode: 'PROTOTYPE_LEDGER',
    status: 'active',
    webhookEndpoint: 'Internal Ledger RPC',
    settlementEta: 'Immediate Demo Settlement',
    complianceStatus: 'Pilot Mode (No Real Funds Moved)'
  }
];

export const INITIAL_PAYOUT_TRANSACTIONS = [
  {
    id: 'pay-01',
    redemption_code: 'RED-2611-001',
    citizen_name: 'Citizen Member',
    citizen_id: 'usr-cit-01',
    upi_id: 'citizen@okicici',
    points_redeemed: 5000,
    amount_rupees: 50.0,
    provider: 'Razorpay_Sandbox',
    provider_payout_id: 'pout_SBX_99214811A',
    idempotency_key: 'IDEMP-RED-2611-001-CBE',
    payout_status: 'success',
    webhook_verified: true,
    failure_reason: null,
    reconciled_at: '2026-11-16T15:10:00Z',
    created_at: '2026-11-16T15:08:00Z'
  },
  {
    id: 'pay-02',
    redemption_code: 'RED-2611-002',
    citizen_name: 'Meena S.',
    citizen_id: 'usr-cit-02',
    upi_id: 'meena.invalid@failbank',
    points_redeemed: 5000,
    amount_rupees: 50.0,
    provider: 'Razorpay_Sandbox',
    provider_payout_id: 'pout_SBX_99214899F',
    idempotency_key: 'IDEMP-RED-2611-002-CBE',
    payout_status: 'reversed',
    webhook_verified: true,
    failure_reason: 'Beneficiary VPA rejected by destination NPCI switch (Simulated Failure). 5,000 pts automatically restored to citizen wallet.',
    reconciled_at: '2026-11-17T10:25:00Z',
    created_at: '2026-11-17T10:20:00Z'
  }
];

export function validateUpiVpa(upiId) {
  const regex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return regex.test((upiId || '').trim());
}

export function generateIdempotencyKey(redemptionCode) {
  return `IDEMP-${redemptionCode}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export function simulateWebhookVerification(payoutId, signature) {
  // Validates presence of HMAC-SHA256 signature header in sandbox mode
  return Boolean(payoutId && signature && signature.startsWith('hmac_sha256_'));
}
