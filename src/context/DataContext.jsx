import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, uploadImageToStorage } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  INITIAL_WASTE_CATEGORIES,
  INITIAL_COLLECTION_POINTS,
  DISTRICTS,
  POINTS_TO_RUPEE_RATIO,
  DEFAULT_REWARD_SETTINGS
} from '../lib/constants';
import {
  TN_DISTRICTS_DIRECTORY,
  getDistrictByCode,
  getDistrictByName
} from '../lib/districtData';
import {
  ENVIRONMENTAL_FACTORS,
  calculateEnvironmentalImpact
} from '../lib/environmentalFactors';
import { DEFAULT_FRAUD_ALERTS } from '../lib/fraudDetection';
import { DEFAULT_AUTOMATION_RULES } from '../lib/automationEngine';
import { INITIAL_COMMUNITY_CHALLENGES } from '../lib/gamificationEngine';
import { INITIAL_AI_RECOMMENDATIONS } from '../lib/aiDecisionSupport';
import { REGISTERED_IOT_DEVICES } from '../lib/iotDeviceRegistry';
import { processAIQuery } from '../lib/aiIntelligenceEngine';
// PHASE 6 IMPORTS
import { INITIAL_IOT_FLEET, INITIAL_TELEMETRY_LOGS, validateTelemetryPayload } from '../lib/iotManagement';
import { INITIAL_VEHICLE_FLEET, VEHICLE_ACTIVITY_LOGS } from '../lib/fleetTracking';
import { INITIAL_GOV_INTEGRATIONS, GOV_SYNC_LOGS } from '../lib/governmentIntegrations';
import { INITIAL_RECYCLER_PARTNERS, INITIAL_HANDOVER_RECORDS, generateHandoverCertificateHash } from '../lib/recyclerMarketplace';
import { INITIAL_PAYOUT_TRANSACTIONS, generateIdempotencyKey, validateUpiVpa } from '../lib/payoutInfrastructure';
import { INITIAL_COMMUNITY_EVENTS, INITIAL_COMMUNITY_PARTNERS } from '../lib/communityNetwork';
import { INITIAL_SECURITY_AUDIT_LOGS } from '../lib/securityAudit';
import { computeStatewideRolloutStatus } from '../lib/statewideRollout';

const INITIAL_DISTRICT_ADMINS = [
  {
    id: 'da-01',
    profile_id: 'usr-adm-01',
    admin_name: 'District Administrator',
    district_code: 'TN-CBE',
    district_name: 'Coimbatore',
    assigned_at: '2026-11-01T10:00:00Z',
    is_active: true
  },
  {
    id: 'da-02',
    profile_id: 'usr-adm-02',
    admin_name: 'Thiru. R. Venkatesh, IAS',
    district_code: 'TN-CHN',
    district_name: 'Chennai',
    assigned_at: '2026-11-05T11:30:00Z',
    is_active: true
  }
];

const INITIAL_DATA_SOURCES = [
  {
    id: 'ds-01',
    source_name: 'Coimbatore Municipal Corporation Field Scales Feed',
    source_url: 'https://ccmc.gov.in/solid-waste',
    coverage: 'Coimbatore District (Pilot)',
    reporting_period: 'Q4 2026',
    verification_status: 'verified',
    classification: 'official',
    record_count: 1420
  },
  {
    id: 'ds-02',
    source_name: 'CleanTN 360 Operational Ledger',
    source_url: 'PostgreSQL Realtime Ledger',
    coverage: 'Tamil Nadu Statewide',
    reporting_period: 'Live Operations',
    verification_status: 'verified',
    classification: 'user_operational',
    record_count: 580
  },
  {
    id: 'ds-03',
    source_name: 'CPCB Solid Waste Inventory 2024-25',
    source_url: 'https://cpcb.nic.in',
    coverage: 'Tamil Nadu 38 Districts',
    reporting_period: 'Annual Audit 2024-25',
    verification_status: 'provisional',
    classification: 'imported_historical',
    record_count: 38
  }
];

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { profile, user } = useAuth();
  const [categories, setCategories] = useState(INITIAL_WASTE_CATEGORIES);
  const [collectionPoints, setCollectionPoints] = useState(INITIAL_COLLECTION_POINTS);
  const [deposits, setDeposits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [rewardSettings, setRewardSettings] = useState(DEFAULT_REWARD_SETTINGS);
  const [tickets, setTickets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [districtAdmins, setDistrictAdmins] = useState(INITIAL_DISTRICT_ADMINS);
  const [dataSources, setDataSources] = useState(INITIAL_DATA_SOURCES);
  const [wallet, setWallet] = useState({
    available_points: 0,
    reserved_points: 0,
    lifetime_earned_points: 0,
    lifetime_redeemed_points: 0
  });

  // PHASE 5 STATES
  const [fraudAlerts, setFraudAlerts] = useState(DEFAULT_FRAUD_ALERTS);
  const [automationRules, setAutomationRules] = useState(DEFAULT_AUTOMATION_RULES);
  const [communityChallenges, setCommunityChallenges] = useState(INITIAL_COMMUNITY_CHALLENGES);
  const [aiRecommendations, setAiRecommendations] = useState(INITIAL_AI_RECOMMENDATIONS);
  const [iotDevices, setIotDevices] = useState(REGISTERED_IOT_DEVICES);
  const [activeRoute, setActiveRoute] = useState(null);
  const [aiChatHistory, setAiChatHistory] = useState([
    {
      id: 'ai-init-1',
      sender_type: 'assistant',
      content: 'Vanakkam! I am your CleanTN 360 AI Waste Intelligence Assistant. I have live access to verified collection records, district benchmarks, and CPCB environmental indices. Ask me anything in English or Tamil!',
      sources_cited: [{ label: 'Tamil Nadu 38-District Master DB', detail: 'Live Operations' }],
      data_classification: 'verified_operational_data',
      reporting_period: 'Live Operations (Q4 2026)',
      confidence: 1.0,
      timestamp: 'Now'
    }
  ]);

  // PHASE 6 STATES
  const [iotFleet, setIotFleet] = useState(INITIAL_IOT_FLEET);
  const [telemetryLogs, setTelemetryLogs] = useState(INITIAL_TELEMETRY_LOGS);
  const [vehicleFleet, setVehicleFleet] = useState(INITIAL_VEHICLE_FLEET);
  const [vehicleLogs, setVehicleLogs] = useState(VEHICLE_ACTIVITY_LOGS);
  const [govIntegrations, setGovIntegrations] = useState(INITIAL_GOV_INTEGRATIONS);
  const [govSyncLogs, setGovSyncLogs] = useState(GOV_SYNC_LOGS);
  const [recyclerPartners, setRecyclerPartners] = useState(INITIAL_RECYCLER_PARTNERS);
  const [handoverRecords, setHandoverRecords] = useState(INITIAL_HANDOVER_RECORDS);
  const [payoutTransactions, setPayoutTransactions] = useState(INITIAL_PAYOUT_TRANSACTIONS);
  const [communityEvents, setCommunityEvents] = useState(INITIAL_COMMUNITY_EVENTS);
  const [communityPartners, setCommunityPartners] = useState(INITIAL_COMMUNITY_PARTNERS);
  const [securityAuditLogs, setSecurityAuditLogs] = useState(INITIAL_SECURITY_AUDIT_LOGS);

  // Load data on mount or when user session changes
  useEffect(() => {
    loadAllData();
  }, [user, profile]);

  async function loadAllData() {
    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Fetch categories
        const { data: catData } = await supabase.from('waste_categories').select('*').eq('is_active', true);
        if (catData && catData.length) {
          setCategories(catData.map(c => ({
            id: c.id,
            name: c.category_name,
            pointsPerKg: c.reward_points_per_kg,
            desc: c.description,
            icon: c.icon_symbol || '♻'
          })));
        }

        // 2. Fetch collection points
        const { data: cpData } = await supabase.from('collection_points').select('*, districts(district_name)');
        if (cpData && cpData.length) {
          setCollectionPoints(cpData.map(cp => ({
            id: cp.id,
            point_code: cp.point_code,
            point_name: cp.point_name,
            district: cp.districts?.district_name || 'Coimbatore',
            address: cp.address,
            operating_hours: cp.operating_hours,
            accepted_waste_types: cp.accepted_waste_types || ['Plastic', 'Paper'],
            status: cp.status
          })));
        }

        // 3. Fetch system reward settings
        const { data: settData } = await supabase.from('reward_settings').select('*').eq('id', 'current').single();
        if (settData) {
          setRewardSettings({
            points_per_rupee: settData.points_per_rupee || 100,
            min_redemption_points: settData.min_redemption_points || 5000,
            monthly_limit_rupees: settData.monthly_limit_rupees || 100
          });
        }

        // 4. Fetch deposits
        let depositQuery = supabase.from('waste_deposits').select(`
          *,
          profiles:citizen_id (full_name, email),
          collection_points:collection_point_id (point_code, point_name),
          waste_categories:waste_category_id (category_name, reward_points_per_kg),
          deposit_verifications (*)
        `).order('created_at', { ascending: false });

        if (profile?.role === 'citizen' && user) {
          depositQuery = depositQuery.eq('citizen_id', user.id);
        }

        const { data: depData, error: depError } = await depositQuery;
        if (!depError && depData) {
          const mappedDeposits = depData.map(d => ({
            id: d.id,
            deposit_code: d.deposit_code,
            citizen_id: d.citizen_id,
            citizen_name: d.profiles?.full_name || 'Citizen',
            citizen_email: d.profiles?.email,
            collection_point_id: d.collection_point_id,
            point_code: d.collection_points?.point_code,
            point_name: d.collection_points?.point_name,
            waste_category_id: d.waste_category_id,
            category_name: d.waste_categories?.category_name,
            weight_kg: Number(d.weight_kg),
            actual_weight_kg: d.deposit_verifications?.[0]?.actual_weight_kg ? Number(d.deposit_verifications[0].actual_weight_kg) : null,
            reward_rate: d.reward_rate,
            estimated_points: d.estimated_points,
            approved_points: d.approved_points,
            proof_image_url: d.proof_image_url,
            scale_photo_url: d.deposit_verifications?.[0]?.scale_photo_url || null,
            status: d.status,
            citizen_remarks: d.citizen_remarks,
            collector_remarks: d.deposit_verifications?.[0]?.collector_remarks || null,
            submitted_at: d.submitted_at,
            verified_at: d.verified_at,
            approved_at: d.approved_at,
            rejection_reason: d.rejection_reason
          }));
          setDeposits(mappedDeposits);
        }

        // 5. Fetch Wallet, Transactions, Redemptions & Notifications
        if (user) {
          const { data: walData } = await supabase.from('wallet_accounts').select('*').eq('citizen_id', user.id).single();
          if (walData) {
            setWallet({
              available_points: walData.available_points || 0,
              reserved_points: walData.reserved_points || 0,
              lifetime_earned_points: walData.lifetime_earned_points || 0,
              lifetime_redeemed_points: walData.lifetime_redeemed_points || 0
            });
          }

          let txQuery = supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false });
          if (profile?.role === 'citizen') {
            txQuery = txQuery.eq('citizen_id', user.id);
          }
          const { data: txData } = await txQuery;
          if (txData) {
            setTransactions(txData.map(t => ({
              id: t.id,
              code: 'TX-' + t.id.substring(0, 8).toUpperCase(),
              citizen_id: t.citizen_id,
              date: new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              type: t.transaction_type,
              typeLabel: t.transaction_type === 'deposit_reward' ? 'Deposit Reward' : t.transaction_type === 'redemption_reversal' ? 'Redemption Reversal' : t.transaction_type === 'admin_adjustment' ? 'Admin Adjustment' : 'Redemption (Debit)',
              details: t.description,
              points: t.points,
              conversion_value: t.conversion_value,
              previous_balance: t.previous_balance,
              new_balance: t.new_balance,
              reward_rate_used: t.reward_rate_used,
              actual_weight_kg: t.actual_weight_kg,
              status: t.status === 'completed' ? 'Completed' : t.status === 'pending' ? 'Pending' : t.status === 'rejected' ? 'Rejected' : 'Reversed',
              created_at: t.created_at
            })));
          }

          // Redemptions query
          let redQuery = supabase.from('redemption_requests').select('*, profiles:citizen_id(full_name, email)').order('created_at', { ascending: false });
          if (profile?.role === 'citizen') {
            redQuery = redQuery.eq('citizen_id', user.id);
          }
          const { data: redData } = await redQuery;
          if (redData) {
            setRedemptions(redData.map(r => ({
              id: r.id,
              request_code: r.request_code,
              citizen_id: r.citizen_id,
              citizen_name: r.profiles?.full_name || 'Citizen User',
              citizen_email: r.profiles?.email,
              points: r.points_requested,
              conversion_rate: r.conversion_rate,
              rupee_value: Number(r.rupee_value),
              payment_method: r.payment_method,
              upi_id: r.upi_id,
              status: r.status,
              rejection_reason: r.rejection_reason,
              created_at: r.created_at,
              processed_at: r.processed_at
            })));
          }

          // Notifications query
          const { data: notifData } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          if (notifData) {
            setNotifications(notifData);
          }

          // Support tickets
          const { data: tktData } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
          if (tktData) {
            setTickets(tktData);
          }
        }
      } catch (err) {
        console.warn('Error reading from live Supabase, using local state:', err);
        restoreLocalData();
      }
    } else {
      restoreLocalData();
    }
  }

  function restoreLocalData() {
    const savedDeposits = localStorage.getItem('cleantn_deposits');
    const savedTx = localStorage.getItem('cleantn_tx');
    const savedWallet = localStorage.getItem('cleantn_wallet');
    const savedRedemptions = localStorage.getItem('cleantn_redemptions');
    const savedNotifs = localStorage.getItem('cleantn_notifications');
    const savedSettings = localStorage.getItem('cleantn_settings');
    const savedTickets = localStorage.getItem('cleantn_tickets');
    const savedCats = localStorage.getItem('cleantn_categories');
    const savedAudits = localStorage.getItem('cleantn_audits');

    setDeposits(savedDeposits ? JSON.parse(savedDeposits) : []);
    setTransactions(savedTx ? JSON.parse(savedTx) : []);
    setRedemptions(savedRedemptions ? JSON.parse(savedRedemptions) : []);
    setNotifications(savedNotifs ? JSON.parse(savedNotifs) : []);
    setRewardSettings(savedSettings ? JSON.parse(savedSettings) : DEFAULT_REWARD_SETTINGS);
    setCategories(savedCats ? JSON.parse(savedCats) : INITIAL_WASTE_CATEGORIES);
    setAuditLogs(savedAudits ? JSON.parse(savedAudits) : []);
    setWallet(savedWallet ? JSON.parse(savedWallet) : {
      available_points: 0,
      reserved_points: 0,
      lifetime_earned_points: 0,
      lifetime_redeemed_points: 0
    });
    setTickets(savedTickets ? JSON.parse(savedTickets) : []);
  }

  function resetAllDataToZero() {
    localStorage.removeItem('cleantn_deposits');
    localStorage.removeItem('cleantn_tx');
    localStorage.removeItem('cleantn_wallet');
    localStorage.removeItem('cleantn_redemptions');
    localStorage.removeItem('cleantn_notifications');
    localStorage.removeItem('cleantn_tickets');
    localStorage.removeItem('cleantn_audits');

    setDeposits([]);
    setTransactions([]);
    setRedemptions([]);
    setNotifications([]);
    setAuditLogs([]);
    setWallet({
      available_points: 0,
      reserved_points: 0,
      lifetime_earned_points: 0,
      lifetime_redeemed_points: 0
    });
    setTickets([]);
  }

  function saveLocalState({
    newDeposits,
    newTx,
    newWallet,
    newRedemptions,
    newNotifs,
    newSettings,
    newCats,
    newTickets,
    newAudits
  }) {
    if (newDeposits !== undefined) {
      setDeposits(newDeposits);
      localStorage.setItem('cleantn_deposits', JSON.stringify(newDeposits));
    }
    if (newTx !== undefined) {
      setTransactions(newTx);
      localStorage.setItem('cleantn_tx', JSON.stringify(newTx));
    }
    if (newWallet !== undefined) {
      setWallet(newWallet);
      localStorage.setItem('cleantn_wallet', JSON.stringify(newWallet));
    }
    if (newRedemptions !== undefined) {
      setRedemptions(newRedemptions);
      localStorage.setItem('cleantn_redemptions', JSON.stringify(newRedemptions));
    }
    if (newNotifs !== undefined) {
      setNotifications(newNotifs);
      localStorage.setItem('cleantn_notifications', JSON.stringify(newNotifs));
    }
    if (newSettings !== undefined) {
      setRewardSettings(newSettings);
      localStorage.setItem('cleantn_settings', JSON.stringify(newSettings));
    }
    if (newCats !== undefined) {
      setCategories(newCats);
      localStorage.setItem('cleantn_categories', JSON.stringify(newCats));
    }
    if (newTickets !== undefined) {
      setTickets(newTickets);
      localStorage.setItem('cleantn_tickets', JSON.stringify(newTickets));
    }
    if (newAudits !== undefined) {
      setAuditLogs(newAudits);
      localStorage.setItem('cleantn_audits', JSON.stringify(newAudits));
    }
  }

  // 1. CITIZEN ACTION: Submit a waste deposit request
  async function submitDeposit({ pointCode, categoryName, weightKg, remarks, proofFile }) {
    const cat = categories.find(c => c.name === categoryName) || categories[0];
    const cp = collectionPoints.find(p => p.point_code === pointCode) || collectionPoints[0];
    const weightNum = parseFloat(weightKg) || 1.0;
    const estPoints = Math.round(weightNum * cat.pointsPerKg);
    const depositCode = `CTN-26${Math.floor(100 + Math.random() * 900)}`;

    let proofUrl = null;
    if (proofFile) {
      proofUrl = await uploadImageToStorage('waste-deposit-images', proofFile, 'deposit');
    }

    if (isSupabaseConfigured && supabase && user) {
      try {
        const { data, error } = await supabase.from('waste_deposits').insert({
          deposit_code: depositCode,
          citizen_id: user.id,
          collection_point_id: cp.id,
          waste_category_id: cat.id,
          weight_kg: weightNum,
          reward_rate: cat.pointsPerKg,
          estimated_points: estPoints,
          citizen_remarks: remarks,
          proof_image_url: proofUrl,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        }).select().single();

        if (error) throw error;

        // Create citizen notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Deposit Submitted Successfully 📦',
          message: `Your deposit ${depositCode} for ${weightNum} kg of ${cat.name} was registered. Estimated reward: ${estPoints} pts (₹${(estPoints / rewardSettings.points_per_rupee).toFixed(2)}). Awaiting scale weighing at ${cp.point_name}.`,
          type: 'deposit_submitted',
          reference_id: depositCode
        });

        await loadAllData();
        return data;
      } catch (err) {
        console.warn('Supabase submit error, falling back locally:', err);
      }
    }

    // Local / Offline fallback
    const newRecord = {
      id: 'dep-' + Date.now().toString(36),
      deposit_code: depositCode,
      citizen_id: user?.id || 'usr-cit-01',
      citizen_name: profile?.full_name || 'Citizen User',
      citizen_email: profile?.email || 'citizen@cleantn360.org',
      collection_point_id: cp.id,
      point_code: cp.point_code,
      point_name: cp.point_name,
      waste_category_id: cat.id,
      category_name: cat.name,
      weight_kg: weightNum,
      actual_weight_kg: null,
      reward_rate: cat.pointsPerKg,
      estimated_points: estPoints,
      approved_points: null,
      proof_image_url: proofUrl,
      scale_photo_url: null,
      status: 'submitted',
      citizen_remarks: remarks,
      submitted_at: new Date().toISOString(),
      verified_at: null,
      approved_at: null
    };

    const newNotif = {
      id: 'notif-' + Date.now().toString(36),
      user_id: user?.id || 'usr-cit-01',
      title: 'Deposit Submitted Successfully 📦',
      message: `Your deposit ${depositCode} for ${weightNum} kg of ${cat.name} was registered. Estimated reward: ${estPoints} pts (₹${(estPoints / rewardSettings.points_per_rupee).toFixed(2)}). Awaiting scale weighing at ${cp.point_name}.`,
      type: 'deposit_submitted',
      reference_id: depositCode,
      is_read: false,
      created_at: new Date().toISOString()
    };

    const updated = [newRecord, ...deposits];
    const updatedNotifs = [newNotif, ...notifications];
    saveLocalState({ newDeposits: updated, newNotifs: updatedNotifs });
    return newRecord;
  }

  // 2. COLLECTOR ACTION: Verify physical weight on scale
  async function verifyDeposit({ depositId, actualWeightKg, categoryName, remarks, scalePhotoFile }) {
    const weightNum = parseFloat(actualWeightKg);
    if (!weightNum || weightNum <= 0) throw new Error('Enter a valid physical scale weight.');

    const cat = categories.find(c => c.name === categoryName) || categories[0];
    let scalePhotoUrl = null;
    if (scalePhotoFile) {
      scalePhotoUrl = await uploadImageToStorage('scale-lcd-photos', scalePhotoFile, 'scale');
    }

    const target = deposits.find(d => d.id === depositId);

    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('deposit_verifications').insert({
          deposit_id: depositId,
          collector_id: user.id,
          actual_weight_kg: weightNum,
          verified_category_id: cat.id,
          scale_photo_url: scalePhotoUrl,
          collector_remarks: remarks,
          verification_status: 'verified',
          verified_at: new Date().toISOString()
        });

        await supabase.from('waste_deposits').update({
          status: 'collector_verified',
          verified_by: user.id,
          verified_at: new Date().toISOString()
        }).eq('id', depositId);

        if (target) {
          await supabase.from('notifications').insert({
            user_id: target.citizen_id,
            title: 'Scale Weighing Verified by Collector ⚖️',
            message: `Deposit ${target.deposit_code} was weighed at the hub. Physical scale weight: ${weightNum.toFixed(2)} kg (${cat.name}). Forwarded to Municipal Admin for approval and reward credit.`,
            type: 'collector_verified',
            reference_id: target.deposit_code
          });
        }

        await loadAllData();
        return true;
      } catch (err) {
        console.warn('Supabase verification error, falling back locally:', err);
      }
    }

    // Local / Offline fallback
    const updated = deposits.map(d => {
      if (d.id === depositId) {
        return {
          ...d,
          status: 'collector_verified',
          actual_weight_kg: weightNum,
          category_name: cat.name,
          scale_photo_url: scalePhotoUrl,
          collector_remarks: remarks || 'Verified on digital scale.',
          verified_at: new Date().toISOString()
        };
      }
      return d;
    });

    const notif = target ? {
      id: 'notif-' + Date.now().toString(36),
      user_id: target.citizen_id,
      title: 'Scale Weighing Verified by Collector ⚖️',
      message: `Deposit ${target.deposit_code} was weighed at the hub. Physical scale weight: ${weightNum.toFixed(2)} kg (${cat.name}). Forwarded to Municipal Admin for approval and reward credit.`,
      type: 'collector_verified',
      reference_id: target.deposit_code,
      is_read: false,
      created_at: new Date().toISOString()
    } : null;

    const updatedNotifs = notif ? [notif, ...notifications] : notifications;
    saveLocalState({ newDeposits: updated, newNotifs: updatedNotifs });
    return true;
  }

  // 3. ADMIN ACTION: Idempotent Atomic Approval & Automatic Wallet Credit
  async function approveDeposit(depositId) {
    if (isSupabaseConfigured && supabase && user) {
      try {
        const { data, error } = await supabase.rpc('approve_and_credit_deposit_phase3', {
          p_deposit_id: depositId,
          p_admin_id: user.id
        });
        if (error) throw error;
        await loadAllData();
        return data;
      } catch (err) {
        console.warn('Supabase RPC approve error, falling back locally:', err);
      }
    }

    // Local / Offline Atomic Approval Logic
    const target = deposits.find(d => d.id === depositId);
    if (!target) throw new Error('Deposit record not found');
    if (target.status === 'admin_approved') throw new Error('Idempotency check: Deposit has already been approved and credited.');
    if (target.status !== 'collector_verified') throw new Error('Deposit must be verified by a collector before approval.');

    const cat = categories.find(c => c.name === target.category_name) || categories[0];
    const verifiedWeight = target.actual_weight_kg || target.weight_kg;
    const rateUsed = cat.pointsPerKg;
    const finalPoints = Math.round(verifiedWeight * rateUsed);
    const rupeeValue = Number((finalPoints / rewardSettings.points_per_rupee).toFixed(2));

    const prevBal = wallet.available_points;
    const newBal = prevBal + finalPoints;

    // Update deposit
    const updatedDeposits = deposits.map(d => {
      if (d.id === depositId) {
        return {
          ...d,
          status: 'admin_approved',
          approved_points: finalPoints,
          approved_at: new Date().toISOString()
        };
      }
      return d;
    });

    // Credit Wallet
    const updatedWallet = {
      ...wallet,
      available_points: newBal,
      lifetime_earned_points: wallet.lifetime_earned_points + finalPoints
    };

    // Insert Wallet Transaction with previous & new balance and rate used
    const newTx = {
      id: 'tx-' + Date.now().toString(36),
      code: target.deposit_code,
      citizen_id: target.citizen_id,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      type: 'deposit_reward',
      typeLabel: 'Deposit Reward',
      details: `${target.category_name} · ${verifiedWeight.toFixed(2)} kg @ ${rateUsed} pts/kg (${target.point_code})`,
      points: finalPoints,
      conversion_value: rupeeValue,
      previous_balance: prevBal,
      new_balance: newBal,
      reward_rate_used: rateUsed,
      actual_weight_kg: verifiedWeight,
      status: 'Completed',
      created_at: new Date().toISOString()
    };
    const updatedTx = [newTx, ...transactions];

    // Create Notification
    const notif = {
      id: 'notif-' + Date.now().toString(36),
      user_id: target.citizen_id,
      title: 'Green Money Points Credited! 🎉',
      message: `Your deposit ${target.deposit_code} of ${verifiedWeight.toFixed(2)} kg ${target.category_name} was approved. +${finalPoints} Green Money Points (₹${rupeeValue}) credited to your wallet balance.`,
      type: 'deposit_approved',
      reference_id: target.deposit_code,
      is_read: false,
      created_at: new Date().toISOString()
    };
    const updatedNotifs = [notif, ...notifications];

    // Audit log
    const auditEntry = {
      id: 'aud-' + Date.now().toString(36),
      action: 'APPROVE_DEPOSIT_REWARD',
      performed_by: profile?.full_name || 'Admin Officer',
      details: `Approved ${target.deposit_code} (${verifiedWeight.toFixed(2)} kg ${cat.name}) -> Credited ${finalPoints} pts (₹${rupeeValue}) to ${target.citizen_name}`,
      timestamp: new Date().toISOString()
    };
    const updatedAudits = [auditEntry, ...auditLogs];

    saveLocalState({
      newDeposits: updatedDeposits,
      newTx: updatedTx,
      newWallet: updatedWallet,
      newNotifs: updatedNotifs,
      newAudits: updatedAudits
    });

    return { success: true, points_credited: finalPoints, rupee_value: rupeeValue, new_balance: newBal };
  }

  // 4. ADMIN ACTION: Reject deposit with reason
  async function rejectDeposit(depositId, reason) {
    if (isSupabaseConfigured && supabase && user) {
      try {
        const { data, error } = await supabase.rpc('reject_deposit', {
          p_deposit_id: depositId,
          p_admin_id: user.id,
          p_reason: reason
        });
        if (error) throw error;
        await loadAllData();
        return data;
      } catch (err) {
        console.warn('Supabase RPC reject error, falling back locally:', err);
      }
    }

    const target = deposits.find(d => d.id === depositId);
    const updatedDeposits = deposits.map(d => {
      if (d.id === depositId) {
        return {
          ...d,
          status: 'rejected',
          rejection_reason: reason || 'Non-recyclable or contaminated material.',
          approved_at: new Date().toISOString()
        };
      }
      return d;
    });

    const notif = target ? {
      id: 'notif-' + Date.now().toString(36),
      user_id: target.citizen_id,
      title: 'Deposit Rejected ⚠️',
      message: `Your deposit ${target.deposit_code} could not be approved. Reason: "${reason || 'Contaminated/unsegregated waste'}". No points credited.`,
      type: 'deposit_rejected',
      reference_id: target.deposit_code,
      is_read: false,
      created_at: new Date().toISOString()
    } : null;

    const updatedNotifs = notif ? [notif, ...notifications] : notifications;

    const auditEntry = {
      id: 'aud-' + Date.now().toString(36),
      action: 'REJECT_DEPOSIT',
      performed_by: profile?.full_name || 'Admin Officer',
      details: `Rejected deposit ${target?.deposit_code || depositId}. Reason: ${reason}`,
      timestamp: new Date().toISOString()
    };
    const updatedAudits = [auditEntry, ...auditLogs];

    saveLocalState({
      newDeposits: updatedDeposits,
      newNotifs: updatedNotifs,
      newAudits: updatedAudits
    });

    return { success: true, status: 'rejected' };
  }

  // 5. CITIZEN ACTION: Request Redemption (Reserves points)
  async function requestRedemption({ points, upiId, paymentMethod = 'UPI' }) {
    const pts = parseInt(points, 10);
    if (!pts || pts <= 0) throw new Error('Enter a valid points amount to redeem.');
    if (pts < rewardSettings.min_redemption_points) {
      throw new Error(`Minimum redemption threshold is ${rewardSettings.min_redemption_points.toLocaleString()} points (₹${(rewardSettings.min_redemption_points / rewardSettings.points_per_rupee).toFixed(2)}).`);
    }
    if (pts > wallet.available_points) {
      throw new Error(`Insufficient available points! You have ${wallet.available_points.toLocaleString()} available points.`);
    }

    const rupeeVal = Number((pts / rewardSettings.points_per_rupee).toFixed(2));

    // Monthly cap check
    const currentMonthRedeemedRupees = redemptions
      .filter(r => r.citizen_id === (user?.id || 'usr-cit-01') && (r.status === 'pending' || r.status === 'completed'))
      .reduce((sum, r) => sum + r.rupee_value, 0);

    if ((currentMonthRedeemedRupees + rupeeVal) > rewardSettings.monthly_limit_rupees) {
      throw new Error(`Monthly redemption limit exceeded (Max ₹${rewardSettings.monthly_limit_rupees}/month). Already requested this month: ₹${currentMonthRedeemedRupees.toFixed(2)}.`);
    }

    if (isSupabaseConfigured && supabase && user) {
      try {
        const { data, error } = await supabase.rpc('request_redemption_phase3', {
          p_citizen_id: user.id,
          p_points: pts,
          p_upi_id: upiId.trim(),
          p_payment_method: paymentMethod
        });
        if (error) throw error;
        await loadAllData();
        return data;
      } catch (err) {
        console.warn('Supabase RPC request_redemption error, falling back locally:', err);
      }
    }

    // Local / Offline fallback
    const prevBal = wallet.available_points;
    const newBal = prevBal - pts;
    const reqCode = `RED-${Date.now().toString().slice(-6)}`;

    // Reserve points
    const updatedWallet = {
      ...wallet,
      available_points: newBal,
      reserved_points: (wallet.reserved_points || 0) + pts
    };

    const newRedemption = {
      id: 'red-' + Date.now().toString(36),
      request_code: reqCode,
      citizen_id: user?.id || 'usr-cit-01',
      citizen_name: profile?.full_name || 'Citizen User',
      citizen_email: profile?.email || 'citizen@cleantn360.org',
      points: pts,
      conversion_rate: rewardSettings.points_per_rupee,
      rupee_value: rupeeVal,
      payment_method: paymentMethod,
      upi_id: upiId.trim(),
      status: 'pending',
      rejection_reason: null,
      created_at: new Date().toISOString(),
      processed_at: null
    };
    const updatedRedemptions = [newRedemption, ...redemptions];

    // Ledger Transaction
    const newTx = {
      id: 'tx-' + Date.now().toString(36),
      code: reqCode,
      citizen_id: user?.id || 'usr-cit-01',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      type: 'redemption',
      typeLabel: 'Redemption (Pending)',
      details: `Simulated ${paymentMethod} to ${upiId.trim()} · ₹${rupeeVal} (Awaiting Admin Review)`,
      points: -pts,
      conversion_value: rupeeVal,
      previous_balance: prevBal,
      new_balance: newBal,
      reward_rate_used: rewardSettings.points_per_rupee,
      status: 'Pending',
      created_at: new Date().toISOString()
    };
    const updatedTx = [newTx, ...transactions];

    // Notification
    const notif = {
      id: 'notif-' + Date.now().toString(36),
      user_id: user?.id || 'usr-cit-01',
      title: 'Redemption Request Submitted ⏳',
      message: `Your request ${reqCode} to redeem ${pts.toLocaleString()} points (₹${rupeeVal}) via ${paymentMethod} is submitted. ${pts.toLocaleString()} points are reserved.`,
      type: 'redemption_requested',
      reference_id: reqCode,
      is_read: false,
      created_at: new Date().toISOString()
    };
    const updatedNotifs = [notif, ...notifications];

    saveLocalState({
      newWallet: updatedWallet,
      newRedemptions: updatedRedemptions,
      newTx: updatedTx,
      newNotifs: updatedNotifs
    });

    return {
      success: true,
      request_code: reqCode,
      points_reserved: pts,
      rupee_value: rupeeVal,
      available_balance: newBal
    };
  }

  // 6. ADMIN ACTION: Process Redemption (Approve or Reject with Reversal)
  async function processRedemption({ redemptionId, action, rejectionReason }) {
    if (isSupabaseConfigured && supabase && user) {
      try {
        const { data, error } = await supabase.rpc('process_redemption_phase3', {
          p_redemption_id: redemptionId,
          p_admin_id: user.id,
          p_action: action,
          p_reason: rejectionReason
        });
        if (error) throw error;
        await loadAllData();
        return data;
      } catch (err) {
        console.warn('Supabase RPC process_redemption error, falling back locally:', err);
      }
    }

    // Local / Offline Logic
    const target = redemptions.find(r => r.id === redemptionId);
    if (!target) throw new Error('Redemption request not found.');
    if (target.status !== 'pending') throw new Error(`Redemption ${target.request_code} has already been ${target.status}.`);

    if (action === 'approve') {
      // Release reserved points & increment lifetime redeemed
      const updatedWallet = {
        ...wallet,
        reserved_points: Math.max(0, (wallet.reserved_points || 0) - target.points),
        lifetime_redeemed_points: wallet.lifetime_redeemed_points + target.points
      };

      const updatedRedemptions = redemptions.map(r => {
        if (r.id === redemptionId) {
          return {
            ...r,
            status: 'completed',
            processed_at: new Date().toISOString()
          };
        }
        return r;
      });

      // Update tx to Completed
      const updatedTx = transactions.map(t => {
        if (t.code === target.request_code) {
          return {
            ...t,
            status: 'Completed',
            typeLabel: 'Redemption (Paid)'
          };
        }
        return t;
      });

      const notif = {
        id: 'notif-' + Date.now().toString(36),
        user_id: target.citizen_id,
        title: 'Redemption Approved & Paid! 💰',
        message: `Your redemption request ${target.request_code} for ${target.points.toLocaleString()} points (₹${target.rupee_value}) via ${target.payment_method} has been approved and simulated payout completed.`,
        type: 'redemption_approved',
        reference_id: target.request_code,
        is_read: false,
        created_at: new Date().toISOString()
      };
      const updatedNotifs = [notif, ...notifications];

      const auditEntry = {
        id: 'aud-' + Date.now().toString(36),
        action: 'APPROVE_REDEMPTION',
        performed_by: profile?.full_name || 'Admin Officer',
        details: `Approved simulated redemption ${target.request_code} for ${target.points} pts (₹${target.rupee_value}) to ${target.citizen_name}`,
        timestamp: new Date().toISOString()
      };
      const updatedAudits = [auditEntry, ...auditLogs];

      saveLocalState({
        newWallet: updatedWallet,
        newRedemptions: updatedRedemptions,
        newTx: updatedTx,
        newNotifs: updatedNotifs,
        newAudits: updatedAudits
      });

      return { success: true, status: 'completed', request_code: target.request_code };
    } else if (action === 'reject') {
      if (!rejectionReason || !rejectionReason.trim()) {
        throw new Error('A valid rejection reason is required to reject a redemption.');
      }

      // RESTORE POINTS: Add back to available, remove from reserved
      const prevBal = wallet.available_points;
      const restoredBal = prevBal + target.points;

      const updatedWallet = {
        ...wallet,
        available_points: restoredBal,
        reserved_points: Math.max(0, (wallet.reserved_points || 0) - target.points)
      };

      const updatedRedemptions = redemptions.map(r => {
        if (r.id === redemptionId) {
          return {
            ...r,
            status: 'rejected',
            rejection_reason: rejectionReason.trim(),
            processed_at: new Date().toISOString()
          };
        }
        return r;
      });

      // Update original pending tx to Rejected
      const mappedTx = transactions.map(t => {
        if (t.code === target.request_code) {
          return {
            ...t,
            status: 'Rejected'
          };
        }
        return t;
      });

      // Create Reversal Transaction Entry (Permanent Audit Record)
      const reversalTx = {
        id: 'tx-' + Date.now().toString(36),
        code: `REV-${target.request_code}`,
        citizen_id: target.citizen_id,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        type: 'redemption_reversal',
        typeLabel: 'Redemption Reversal',
        details: `Reversal of ${target.request_code}: +${target.points.toLocaleString()} points restored. Reason: ${rejectionReason.trim()}`,
        points: target.points,
        conversion_value: target.rupee_value,
        previous_balance: prevBal,
        new_balance: restoredBal,
        reward_rate_used: target.conversion_rate,
        status: 'Completed',
        created_at: new Date().toISOString()
      };
      const updatedTx = [reversalTx, ...mappedTx];

      // Notify citizen of restoration
      const notif = {
        id: 'notif-' + Date.now().toString(36),
        user_id: target.citizen_id,
        title: 'Redemption Rejected – Points Restored 🔄',
        message: `Your redemption request ${target.request_code} for ${target.points.toLocaleString()} points was rejected. Reason: "${rejectionReason.trim()}". ${target.points.toLocaleString()} points have been restored to your available balance.`,
        type: 'points_restored',
        reference_id: target.request_code,
        is_read: false,
        created_at: new Date().toISOString()
      };
      const updatedNotifs = [notif, ...notifications];

      const auditEntry = {
        id: 'aud-' + Date.now().toString(36),
        action: 'REJECT_REDEMPTION_RESTORE',
        performed_by: profile?.full_name || 'Admin Officer',
        details: `Rejected redemption ${target.request_code}. Restored ${target.points} pts to ${target.citizen_name}. Reason: ${rejectionReason}`,
        timestamp: new Date().toISOString()
      };
      const updatedAudits = [auditEntry, ...auditLogs];

      saveLocalState({
        newWallet: updatedWallet,
        newRedemptions: updatedRedemptions,
        newTx: updatedTx,
        newNotifs: updatedNotifs,
        newAudits: updatedAudits
      });

      return { success: true, status: 'rejected', request_code: target.request_code, points_restored: target.points };
    }
  }

  // 7. ADMIN ACTION: Configure Category Reward Rates
  async function updateCategoryRate(categoryId, newPointsPerKg) {
    const rateNum = parseInt(newPointsPerKg, 10);
    if (!rateNum || rateNum <= 0) throw new Error('Points per kg must be greater than zero.');

    const cat = categories.find(c => c.id === categoryId);
    const oldRate = cat ? cat.pointsPerKg : 0;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('waste_categories').update({
          reward_points_per_kg: rateNum,
          updated_at: new Date().toISOString()
        }).eq('id', categoryId);
        await loadAllData();
      } catch (err) {
        console.warn('Supabase update category error:', err);
      }
    }

    const updatedCats = categories.map(c => {
      if (c.id === categoryId) {
        return { ...c, pointsPerKg: rateNum };
      }
      return c;
    });

    const auditEntry = {
      id: 'aud-' + Date.now().toString(36),
      action: 'UPDATE_REWARD_RATE',
      performed_by: profile?.full_name || 'Admin Officer',
      details: `Updated reward rate for ${cat?.name || categoryId} from ${oldRate} to ${rateNum} pts/kg`,
      timestamp: new Date().toISOString()
    };
    const updatedAudits = [auditEntry, ...auditLogs];

    saveLocalState({ newCats: updatedCats, newAudits: updatedAudits });
    return true;
  }

  // 8. ADMIN ACTION: Configure System Reward Settings
  async function updateRewardSettingsConfig(newSettings) {
    const ptsPerRupee = parseInt(newSettings.points_per_rupee, 10) || 100;
    const minPts = parseInt(newSettings.min_redemption_points, 10) || 5000;
    const monthlyLimit = parseInt(newSettings.monthly_limit_rupees, 10) || 100;

    const merged = {
      points_per_rupee: ptsPerRupee,
      min_redemption_points: minPts,
      monthly_limit_rupees: monthlyLimit
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('reward_settings').upsert({
          id: 'current',
          ...merged,
          updated_at: new Date().toISOString()
        });
        await loadAllData();
      } catch (err) {
        console.warn('Supabase update settings error:', err);
      }
    }

    const auditEntry = {
      id: 'aud-' + Date.now().toString(36),
      action: 'UPDATE_REWARD_SETTINGS',
      performed_by: profile?.full_name || 'Admin Officer',
      details: `Updated reward settings: ${ptsPerRupee} pts/₹, Min ${minPts} pts, Monthly Limit ₹${monthlyLimit}`,
      timestamp: new Date().toISOString()
    };
    const updatedAudits = [auditEntry, ...auditLogs];

    saveLocalState({ newSettings: merged, newAudits: updatedAudits });
    return true;
  }

  // 9. NOTIFICATIONS: Mark Read & Mark All
  async function markNotificationRead(notifId) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
      } catch (err) {
        console.warn('Error marking notification read:', err);
      }
    }
    const updated = notifications.map(n => n.id === notifId ? { ...n, is_read: true } : n);
    saveLocalState({ newNotifs: updated });
  }

  async function markAllNotificationsRead() {
    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
      } catch (err) {
        console.warn('Error marking all notifications read:', err);
      }
    }
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    saveLocalState({ newNotifs: updated });
  }

  // 10. CITIZEN ACTION: Raise support ticket
  async function createSupportTicket({ category, subject, description }) {
    const ticketCode = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    if (isSupabaseConfigured && supabase && user) {
      try {
        const { data, error } = await supabase.from('support_tickets').insert({
          ticket_code: ticketCode,
          citizen_id: user.id,
          category,
          subject,
          description,
          status: 'Open'
        }).select().single();
        if (error) throw error;
        await loadAllData();
        return data;
      } catch (err) {
        console.warn('Supabase ticket error, falling back locally:', err);
      }
    }

    const newTkt = {
      id: 'tkt-' + Date.now().toString(36),
      ticket_code: ticketCode,
      citizen_id: user?.id || 'usr-cit-01',
      category,
      subject: subject || 'Citizen Query',
      description,
      status: 'Open',
      admin_response: null,
      created_at: new Date().toISOString()
    };

    const updated = [newTkt, ...tickets];
    saveLocalState({ newTickets: updated });
    return newTkt;
  }

  // 11. ADMIN ACTION: Respond & update support ticket
  async function updateTicketStatus(ticketId, status, response) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('support_tickets').update({
          status,
          admin_response: response,
          updated_at: new Date().toISOString()
        }).eq('id', ticketId);
        await loadAllData();
        return true;
      } catch (err) {
        console.warn('Supabase ticket update error, falling back locally:', err);
      }
    }

    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status,
          admin_response: response || t.admin_response,
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });

    saveLocalState({ newTickets: updated });
    return true;
  }

  // 12. ADMIN ACTION: Add new collection point
  async function addCollectionPoint(newPoint) {
    const cp = {
      id: 'cp-' + Date.now().toString(36),
      point_code: newPoint.point_code,
      point_name: newPoint.point_name,
      district: newPoint.district || 'Coimbatore',
      address: newPoint.address,
      lat: Number(newPoint.lat) || 11.0168,
      lng: Number(newPoint.lng) || 76.9558,
      distance: '1.0 km',
      operating_hours: newPoint.operating_hours || '8:00 AM – 7:00 PM',
      accepted_waste_types: newPoint.accepted_waste_types || ['Plastic', 'Paper', 'Metal'],
      assigned_collector: newPoint.assigned_collector || 'Unassigned',
      status: newPoint.status || 'active'
    };

    const updated = [...collectionPoints, cp];
    setCollectionPoints(updated);
    return cp;
  }

  // 13. PHASE 4: Update Collection Point
  async function updateCollectionPoint(pointId, updates) {
    const updated = collectionPoints.map(cp => {
      if (cp.id === pointId || cp.point_code === pointId) {
        return {
          ...cp,
          ...updates,
          lat: updates.lat !== undefined ? Number(updates.lat) : cp.lat,
          lng: updates.lng !== undefined ? Number(updates.lng) : cp.lng
        };
      }
      return cp;
    });
    setCollectionPoints(updated);
    return true;
  }

  // 14. PHASE 4: Assign District Admin
  async function assignDistrictAdmin(assignment) {
    const newAdmin = {
      id: 'da-' + Date.now().toString(36),
      profile_id: assignment.profile_id || 'usr-adm-new',
      admin_name: assignment.admin_name || 'Designated Zonal Administrator',
      district_code: assignment.district_code,
      district_name: assignment.district_name,
      assigned_at: new Date().toISOString(),
      is_active: true
    };
    const updated = [...districtAdmins, newAdmin];
    setDistrictAdmins(updated);
    return newAdmin;
  }

  // 15. PHASE 4: Import External Data Source
  async function importDataSource(datasetInfo, parsedRows = []) {
    const newSource = {
      id: 'ds-' + Date.now().toString(36),
      source_name: datasetInfo.source_name || 'Municipal Imported Dataset',
      source_url: datasetInfo.source_url || 'N/A',
      coverage: datasetInfo.coverage || 'Tamil Nadu',
      reporting_period: datasetInfo.reporting_period || '2026',
      verification_status: datasetInfo.verification_status || 'verified',
      classification: datasetInfo.classification || 'imported_historical',
      record_count: parsedRows.length || datasetInfo.record_count || 0,
      imported_at: new Date().toISOString()
    };
    const updated = [newSource, ...dataSources];
    setDataSources(updated);
    return newSource;
  }

  // 16. PHASE 4: District Intelligence Metrics Aggregator
  function getDistrictMetrics(districtNameOrCode) {
    if (!districtNameOrCode) return null;
    const dist = getDistrictByCode(districtNameOrCode) || getDistrictByName(districtNameOrCode);
    if (!dist) return null;

    // Filter deposits matching this district
    const matchingDeposits = deposits.filter(d => {
      if (d.point_code && d.point_code.includes(dist.code.replace('TN-', ''))) return true;
      const hub = collectionPoints.find(p => p.point_code === d.point_code);
      if (hub && hub.district.toLowerCase() === dist.name.toLowerCase()) return true;
      return false;
    });

    const verifiedDeposits = matchingDeposits.filter(d => d.status === 'collector_verified' || d.status === 'admin_approved');
    const approvedDeposits = matchingDeposits.filter(d => d.status === 'admin_approved');

    const totalVerifiedWeight = verifiedDeposits.reduce((sum, d) => sum + (Number(d.actual_weight_kg) || Number(d.weight_kg) || 0), 0);
    const totalApprovedWeight = approvedDeposits.reduce((sum, d) => sum + (Number(d.actual_weight_kg) || Number(d.weight_kg) || 0), 0);

    const recyclableCategories = ['plastic', 'paper', 'metal', 'glass', 'e-waste'];
    const totalRecyclableWeight = approvedDeposits.filter(d => {
      const c = (d.category_name || '').toLowerCase();
      return recyclableCategories.some(r => c.includes(r));
    }).reduce((sum, d) => sum + (Number(d.actual_weight_kg) || Number(d.weight_kg) || 0), 0);

    // Matching collection points
    const districtHubs = collectionPoints.filter(p => p.district.toLowerCase() === dist.name.toLowerCase());

    // Participating citizens
    const citizensSet = new Set(matchingDeposits.map(d => d.citizen_id || d.citizen_name));

    // Green money metrics
    const pointsIssued = approvedDeposits.reduce((sum, d) => sum + (Number(d.approved_points) || 0), 0);
    const rupeeValue = pointsIssued / (rewardSettings?.points_per_rupee || 100);

    // Category breakdown
    const categoryBreakdown = categories.map(cat => {
      const catDeposits = approvedDeposits.filter(d => (d.category_name || '').toLowerCase().includes(cat.name.toLowerCase()));
      const weight = catDeposits.reduce((sum, d) => sum + (Number(d.actual_weight_kg) || Number(d.weight_kg) || 0), 0);
      return {
        name: cat.name,
        icon: cat.icon,
        count: catDeposits.length,
        weight: Number(weight.toFixed(2))
      };
    });

    // Determine honest data status
    let dataStatus = 'standby';
    if (dist.name === 'Coimbatore' || (dist.isPilot && matchingDeposits.length > 0)) {
      dataStatus = 'verified_pilot';
    } else if (matchingDeposits.length > 0) {
      dataStatus = 'pilot';
    }

    return {
      district: dist,
      dataStatus,
      totalDeposits: matchingDeposits.length,
      verifiedDepositsCount: verifiedDeposits.length,
      approvedDepositsCount: approvedDeposits.length,
      totalVerifiedWeight: Number(totalVerifiedWeight.toFixed(2)),
      totalApprovedWeight: Number(totalApprovedWeight.toFixed(2)),
      totalRecyclableWeight: Number(totalRecyclableWeight.toFixed(2)),
      recyclingRatePct: totalApprovedWeight > 0 ? Number(((totalRecyclableWeight / totalApprovedWeight) * 100).toFixed(1)) : 0,
      citizenCount: citizensSet.size,
      pointsIssued,
      rupeeValue: Number(rupeeValue.toFixed(2)),
      hubs: districtHubs,
      activeHubsCount: districtHubs.filter(h => h.status === 'active').length,
      maintenanceHubsCount: districtHubs.filter(h => h.status === 'maintenance').length,
      categoryBreakdown
    };
  }

  // 17. PHASE 4: District Green Score Calculation Engine
  function calculateDistrictGreenScore(districtNameOrCode) {
    const metrics = getDistrictMetrics(districtNameOrCode);
    if (!metrics) return null;

    // SECTION 9 CRITICAL RULE: Districts with insufficient data MUST display "Insufficient Data" instead of an invented score.
    if (metrics.totalDeposits === 0 && metrics.hubs.length === 0) {
      return {
        districtName: metrics.district.name,
        districtCode: metrics.district.code,
        isSufficientData: false,
        totalScore: null,
        performanceLabel: 'Insufficient Data',
        parameters: {
          collection: 0,
          recycling: 0,
          participation: 0,
          coverage: 0,
          verification: 0
        },
        missingReason: 'No verified field scale transactions or collection hubs registered yet in this district.',
        lastCalculated: new Date().toISOString(),
        methodology: 'Phase 4 Parametric Model (Weights: 25-25-20-15-15)'
      };
    }

    // Weight 1: Waste Collection Performance (25 pts max)
    // Pilot benchmark: 20 kg monthly verified baseline
    const collectionScore = Math.min(25, Number(((metrics.totalApprovedWeight / 20) * 25).toFixed(1)));

    // Weight 2: Recycling Performance (25 pts max)
    const recyclingScore = metrics.totalApprovedWeight > 0
      ? Math.min(25, Number(((metrics.totalRecyclableWeight / metrics.totalApprovedWeight) * 25).toFixed(1)))
      : 15;

    // Weight 3: Citizen Participation (20 pts max)
    const participationScore = Math.min(20, (metrics.citizenCount * 5) + Math.min(10, metrics.totalDeposits * 2));

    // Weight 4: Collection Point Coverage (15 pts max)
    const coverageScore = Math.min(15, metrics.activeHubsCount * 5);

    // Weight 5: Data Verification Quality (15 pts max)
    const verificationRate = metrics.totalDeposits > 0 ? (metrics.verifiedDepositsCount / metrics.totalDeposits) : 0;
    const verificationScore = Number((verificationRate * 15).toFixed(1));

    const totalScore = Number((collectionScore + recyclingScore + participationScore + coverageScore + verificationScore).toFixed(1));

    let performanceLabel = 'Needs Attention';
    if (totalScore >= 80) performanceLabel = 'Excellent';
    else if (totalScore >= 60) performanceLabel = 'Good';
    else if (totalScore >= 40) performanceLabel = 'Improving';

    return {
      districtName: metrics.district.name,
      districtCode: metrics.district.code,
      isSufficientData: true,
      totalScore,
      performanceLabel,
      parameters: {
        collection: collectionScore,
        recycling: recyclingScore,
        participation: participationScore,
        coverage: coverageScore,
        verification: verificationScore
      },
      missingReason: null,
      lastCalculated: new Date().toISOString(),
      methodology: 'CleanTN 360 Prototype Scoring Model (Weights: 25 Collection, 25 Recycling, 20 Citizen, 15 Coverage, 15 Verification)'
    };
  }

  // 18. PHASE 4: Report Data Generator
  function generateReportData({ reportType = 'statewide', district = 'All', category = 'All', dateRange = 'All' }) {
    let filtered = [...deposits];

    if (district !== 'All') {
      filtered = filtered.filter(d => {
        const hub = collectionPoints.find(p => p.point_code === d.point_code);
        return hub?.district.toLowerCase() === district.toLowerCase();
      });
    }

    if (category !== 'All') {
      filtered = filtered.filter(d => (d.category_name || '').toLowerCase() === category.toLowerCase());
    }

    const approvedOnly = filtered.filter(d => d.status === 'admin_approved');
    const totalWeight = approvedOnly.reduce((sum, d) => sum + (Number(d.actual_weight_kg) || Number(d.weight_kg) || 0), 0);
    const totalPoints = approvedOnly.reduce((sum, d) => sum + (Number(d.approved_points) || 0), 0);
    const env = calculateEnvironmentalImpact(approvedOnly);

    return {
      reportType,
      district,
      category,
      dateRange,
      generatedAt: new Date().toISOString(),
      depositsCount: filtered.length,
      approvedDepositsCount: approvedOnly.length,
      totalWeightKg: Number(totalWeight.toFixed(2)),
      totalPointsIssued: totalPoints,
      totalValueRupees: Number((totalPoints / 100).toFixed(2)),
      environmentalImpact: env,
      records: filtered
    };
  }

  // ==============================================================================
  // PHASE 5 METHODS
  // ==============================================================================

  function askAIAssistant(prompt, language = 'en') {
    const userMsg = {
      id: 'msg-u-' + Date.now(),
      sender_type: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const aiResponse = processAIQuery({
      query: prompt,
      userRole: profile?.role || 'citizen',
      contextData: {
        deposits,
        collectionPoints,
        categories,
        fraudAlerts,
        communityChallenges
      },
      language
    });

    setAiChatHistory(prev => [...prev, userMsg, aiResponse]);
    return aiResponse;
  }

  function clearAIChatHistory() {
    setAiChatHistory([
      {
        id: 'ai-init-cleared',
        sender_type: 'assistant',
        content: 'Conversation history cleared. How may I assist you with Tamil Nadu waste intelligence today?',
        sources_cited: [],
        timestamp: 'Now'
      }
    ]);
  }

  function reviewFraudAlert(alertId, newStatus, adminNotes = '') {
    setFraudAlerts(prev => prev.map(fa => {
      if (fa.id === alertId) {
        return {
          ...fa,
          investigation_status: newStatus,
          admin_notes: adminNotes || fa.admin_notes,
          reviewed_at: new Date().toISOString()
        };
      }
      return fa;
    }));
  }

  function toggleAutomationRule(ruleId) {
    setAutomationRules(prev => prev.map(r => r.id === ruleId ? { ...r, is_active: !r.is_active } : r));
  }

  function joinCommunityChallenge(challengeId) {
    setCommunityChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        return {
          ...c,
          participants_count: (c.participants_count || 0) + 1,
          isUserJoined: true
        };
      }
      return c;
    }));
  }

  function updateAIRecommendation(recId, status, responseText) {
    setAiRecommendations(prev => prev.map(r => {
      if (r.id === recId) {
        return {
          ...r,
          status,
          admin_response: responseText,
          reviewed_at: new Date().toISOString()
        };
      }
      return r;
    }));
  }

  function updateRouteStopStatus(stopSequenceNumber, newStatus, collectedWeightKg = null) {
    if (!activeRoute) return;
    const updatedStops = activeRoute.orderedStops.map(stop => {
      if (stop.sequenceNumber === stopSequenceNumber) {
        return {
          ...stop,
          status: newStatus,
          collected_weight_kg: collectedWeightKg ? Number(collectedWeightKg) : stop.collected_weight_kg,
          completed_at: newStatus === 'collected' ? new Date().toISOString() : stop.completed_at
        };
      }
      return stop;
    });

    const isAllCompleted = updatedStops.every(s => s.status === 'collected' || s.status === 'skipped');

    setActiveRoute({
      ...activeRoute,
      orderedStops: updatedStops,
      status: isAllCompleted ? 'completed' : 'in_progress'
    });
  }

  // ==============================================================================
  // PHASE 6 METHODS (IOT, FLEET, GOV INTEGRATIONS, RECYCLER, PAYOUTS, COMMUNITY, SECURITY)
  // ==============================================================================

  function registerIoTDevice(deviceData) {
    const newDevice = {
      id: 'iot-' + Date.now(),
      device_code: deviceData.device_code.toUpperCase(),
      device_type: deviceData.device_type || 'smart_bin_sonar',
      label: deviceData.label,
      point_code: deviceData.point_code || 'CTN-CBE-001',
      point_name: deviceData.point_name || 'Coimbatore Smart Hub',
      district: deviceData.district || 'Coimbatore',
      district_code: deviceData.district_code || 'TN-CBE',
      hardware_model: deviceData.hardware_model || 'CleanTN-SonarX-v2',
      firmware_version: deviceData.firmware_version || 'v2.4.1-ota',
      auth_token_masked: 'tok_live_' + Math.random().toString(36).substring(2, 6) + '_••••' + Math.floor(1000 + Math.random() * 9000),
      fill_level_percent: 0,
      battery_percent: 100,
      connectivity_status: 'standby',
      last_ping_at: new Date().toISOString(),
      specs: 'Registered hardware node awaiting certified field pairing.'
    };
    setIotFleet(prev => [newDevice, ...prev]);
    recordSecurityAuditEvent('iot_device_registered', 'info', `Registered IoT hardware node ${newDevice.device_code}`);
    return newDevice;
  }

  function ingestSimulatedTelemetry(deviceCode, fillLevel, battery) {
    const targetDevice = iotFleet.find(d => d.device_code === deviceCode);
    const validation = validateTelemetryPayload({
      device_code: deviceCode,
      auth_token: targetDevice?.auth_token_masked || 'tok_sim',
      timestamp: new Date().toISOString()
    });
    if (!validation.isValid) return validation;

    setIotFleet(prev => prev.map(d => {
      if (d.device_code === deviceCode) {
        return {
          ...d,
          fill_level_percent: Number(fillLevel),
          battery_percent: Number(battery),
          connectivity_status: 'online',
          last_ping_at: new Date().toISOString()
        };
      }
      return d;
    }));

    const newLog = {
      id: 'tel-' + Date.now(),
      device_code: deviceCode,
      event_type: 'simulated_fill_ping',
      reading_value: Number(fillLevel),
      reading_unit: '%',
      message: `[SIMULATED TELEMETRY] Authenticated HTTPS reading ingested: ${fillLevel}% fill, ${battery}% battery.`,
      timestamp: new Date().toISOString(),
      is_valid: true
    };
    setTelemetryLogs(prev => [newLog, ...prev]);
    return { isValid: true, log: newLog };
  }

  function toggleIoTDeviceStatus(deviceId) {
    setIotFleet(prev => prev.map(d => {
      if (d.id === deviceId) {
        const nextStatus = d.connectivity_status === 'online' ? 'offline' : 'online';
        return { ...d, connectivity_status: nextStatus };
      }
      return d;
    }));
  }

  function registerVehicle(vehData) {
    const newVeh = {
      id: 'veh-' + Date.now(),
      vehicle_number: vehData.vehicle_number.toUpperCase(),
      vehicle_type: vehData.vehicle_type || 'Electric Tipper',
      district: vehData.district || 'Coimbatore',
      district_code: vehData.district_code || 'TN-CBE',
      assigned_collector: vehData.assigned_collector || 'Unassigned Collector',
      capacity_kg: Number(vehData.capacity_kg) || 1500,
      current_payload_kg: 0,
      fuel_type: vehData.fuel_type || 'Electric (EV)',
      status: 'active',
      battery_percent: 100,
      speed_kmh: 0,
      current_lat: 11.0045,
      current_lng: 76.9612,
      active_route_name: 'Depot Staging Area',
      current_stop_index: 0,
      total_stops: 4,
      completed_stops: [],
      next_stop: 'Awaiting Dispatch',
      shift_active: true,
      consent_recorded: true
    };
    setVehicleFleet(prev => [newVeh, ...prev]);
    return newVeh;
  }

  function toggleVehicleShiftConsent(vehicleId) {
    setVehicleFleet(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const nextShift = !v.shift_active;
        return {
          ...v,
          shift_active: nextShift,
          status: nextShift ? 'on_route' : 'off_duty',
          speed_kmh: nextShift ? 20 : 0
        };
      }
      return v;
    }));
  }

  function advanceVehicleStop(vehicleId, addedWeightKg = 65) {
    setVehicleFleet(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const nextIdx = Math.min(v.total_stops, v.current_stop_index + 1);
        const newPayload = Math.min(v.capacity_kg, Number(v.current_payload_kg) + Number(addedWeightKg));
        const nextLat = Number((v.current_lat + 0.004).toFixed(4));
        const nextLng = Number((v.current_lng + 0.003).toFixed(4));
        const completed = [...v.completed_stops, v.next_stop];
        const actLog = {
          id: 'act-' + Date.now(),
          vehicle_number: v.vehicle_number,
          action: nextIdx >= v.total_stops ? 'Route Completed' : 'Stop Verified & Departed',
          location: v.next_stop,
          timestamp: new Date().toISOString(),
          notes: `Loaded ${addedWeightKg} kg verified recyclables. Total truck load: ${newPayload} kg.`
        };
        setVehicleLogs(logs => [actLog, ...logs]);
        return {
          ...v,
          current_stop_index: nextIdx,
          current_payload_kg: newPayload,
          current_lat: nextLat,
          current_lng: nextLng,
          completed_stops: completed,
          next_stop: nextIdx >= v.total_stops ? 'Returning to Municipal Yard' : `Hub Stop #${nextIdx + 1}`,
          status: nextIdx >= v.total_stops ? 'active' : 'on_route'
        };
      }
      return v;
    }));
  }

  function toggleGovIntegration(integrationId) {
    setGovIntegrations(prev => prev.map(g => {
      if (g.id === integrationId) {
        const nextStatus = g.status === 'active' ? 'paused' : 'active';
        return { ...g, status: nextStatus };
      }
      return g;
    }));
  }

  function triggerGovSync(integrationId) {
    const target = govIntegrations.find(g => g.id === integrationId);
    if (!target) return;
    const syncedCount = Math.max(5, deposits.filter(d => d.status === 'admin_approved').length + 12);

    setGovIntegrations(prev => prev.map(g => {
      if (g.id === integrationId) {
        return {
          ...g,
          records_exchanged_count: g.records_exchanged_count + syncedCount,
          last_sync_at: new Date().toISOString(),
          status: g.status === 'paused' ? 'active' : g.status
        };
      }
      return g;
    }));

    const newLog = {
      id: 'sync-' + Date.now(),
      entity_name: target.entity_name,
      direction: 'outbound',
      records_count: syncedCount,
      status: 'success',
      timestamp: new Date().toISOString(),
      details: `[${target.status.toUpperCase()}] Synchronized ${syncedCount} verified municipal ledger packets via ${target.integration_type}.`
    };
    setGovSyncLogs(prev => [newLog, ...prev]);
    return newLog;
  }

  function registerRecyclerPartner(partnerData) {
    const newPartner = {
      id: 'rec-' + Date.now(),
      company_name: partnerData.company_name,
      registration_number: partnerData.registration_number,
      cpcb_authorization_id: partnerData.cpcb_authorization_id,
      district: partnerData.district || 'Coimbatore',
      district_code: partnerData.district_code || 'TN-CBE',
      facility_address: partnerData.facility_address,
      contact_person: partnerData.contact_person,
      phone: partnerData.phone,
      email: partnerData.email,
      accepted_waste_types: partnerData.accepted_waste_types || ['Plastic'],
      daily_capacity_tons: Number(partnerData.daily_capacity_tons) || 10,
      verification_status: 'pending_verification',
      verified_at: null
    };
    setRecyclerPartners(prev => [newPartner, ...prev]);
    return newPartner;
  }

  function verifyRecyclerPartner(partnerId, newStatus) {
    setRecyclerPartners(prev => prev.map(r => {
      if (r.id === partnerId) {
        return {
          ...r,
          verification_status: newStatus,
          verified_at: newStatus === 'verified_approved' ? new Date().toISOString() : r.verified_at
        };
      }
      return r;
    }));
  }

  function createWasteHandover({ pointName, recyclerId, wasteCategory, weightKg }) {
    const recycler = recyclerPartners.find(r => r.id === recyclerId);
    const code = 'HO-2611-' + Math.floor(100 + Math.random() * 900);
    const newRecord = {
      id: 'ho-' + Date.now(),
      handover_code: code,
      point_name: pointName || 'Saibaba Colony Smart Hub',
      recycler_id: recyclerId,
      recycler_name: recycler?.company_name || 'Authorized Recycler',
      waste_category: wasteCategory,
      weight_kg: Number(weightKg),
      certificate_hash: generateHandoverCertificateHash(code, weightKg),
      handover_status: 'in_transit',
      collector_name: profile?.full_name || 'Field Officer',
      handover_date: new Date().toISOString()
    };
    setHandoverRecords(prev => [newRecord, ...prev]);
    return newRecord;
  }

  function verifyWasteHandover(handoverId) {
    setHandoverRecords(prev => prev.map(h => h.id === handoverId ? { ...h, handover_status: 'received_verified' } : h));
  }

  function executeSandboxPayout({ citizenName, upiId, points, provider = 'Razorpay_Sandbox', simulateFailure = false }) {
    if (!validateUpiVpa(upiId)) {
      return { success: false, error: 'Invalid UPI VPA format. Expected format: name@bank' };
    }
    const redCode = 'RED-2611-' + Math.floor(100 + Math.random() * 900);
    const idempKey = generateIdempotencyKey(redCode);
    const amount = Number((Number(points) / 100).toFixed(2));

    const newPayout = {
      id: 'pay-' + Date.now(),
      redemption_code: redCode,
      citizen_name: citizenName || 'Citizen User',
      citizen_id: user?.id || 'usr-cit-01',
      upi_id: upiId,
      points_redeemed: Number(points),
      amount_rupees: amount,
      provider,
      provider_payout_id: 'pout_SBX_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      idempotency_key: idempKey,
      payout_status: simulateFailure ? 'failed' : 'success',
      webhook_verified: true,
      failure_reason: simulateFailure ? 'Simulated Gateway Failure: Beneficiary Bank Timeout. Eligible for point reversal.' : null,
      reconciled_at: simulateFailure ? null : new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    setPayoutTransactions(prev => [newPayout, ...prev]);
    recordSecurityAuditEvent(
      simulateFailure ? 'payout_sandbox_failed' : 'payout_sandbox_settled',
      simulateFailure ? 'medium' : 'info',
      `Payout ${redCode} (₹${amount}) via ${provider} [${idempKey}]: ${newPayout.payout_status.toUpperCase()}`
    );
    return { success: true, payout: newPayout };
  }

  function reconcileFailedPayout(payoutId) {
    setPayoutTransactions(prev => prev.map(p => {
      if (p.id === payoutId && p.payout_status === 'failed') {
        return {
          ...p,
          payout_status: 'reversed',
          failure_reason: (p.failure_reason || '') + ` | Reconciled: ${p.points_redeemed} Green Money pts restored via immutable reversal entry.`,
          reconciled_at: new Date().toISOString()
        };
      }
      return p;
    }));
    recordSecurityAuditEvent('payout_failure_reconciled', 'info', `Restored reserved points for failed payout ${payoutId}`);
  }

  function registerForCommunityEvent(eventId) {
    setCommunityEvents(prev => prev.map(ev => {
      if (ev.id === eventId && !ev.isUserRegistered) {
        return {
          ...ev,
          registered_volunteers_count: ev.registered_volunteers_count + 1,
          isUserRegistered: true
        };
      }
      return ev;
    }));
  }

  function createCommunityEvent(evData) {
    const newEv = {
      id: 'ev-' + Date.now(),
      event_title: evData.event_title,
      organizer_type: evData.organizer_type || 'NGO',
      organizer_name: evData.organizer_name,
      district: evData.district || 'Coimbatore',
      district_code: evData.district_code || 'TN-CBE',
      event_date: evData.event_date || '2026-12-15',
      venue_name: evData.venue_name,
      target_volunteers: Number(evData.target_volunteers) || 100,
      registered_volunteers_count: 1,
      waste_stream_focus: evData.waste_stream_focus || 'Plastic & Paper',
      status: 'upcoming',
      hours_credit: Number(evData.hours_credit) || 4.0,
      isUserRegistered: true,
      description: evData.description || 'Community sustainability campaign organized under CleanTN 360.'
    };
    setCommunityEvents(prev => [newEv, ...prev]);
    return newEv;
  }

  function recordSecurityAuditEvent(eventType, severity = 'info', message = '') {
    const entry = {
      id: 'aud-' + Date.now(),
      event_type: eventType,
      actor: profile?.full_name || 'Authenticated User',
      severity,
      ip_address: '10.0.14.99 (Verified Session)',
      timestamp: new Date().toISOString(),
      message
    };
    setSecurityAuditLogs(prev => [entry, ...prev]);
  }

  const districtRolloutStatus = computeStatewideRolloutStatus({
    collectionPoints,
    districtAdmins,
    recyclerPartners,
    deposits
  });

  return (
    <DataContext.Provider
      value={{
        categories,
        collectionPoints,
        deposits,
        transactions,
        redemptions,
        notifications,
        rewardSettings,
        auditLogs,
        tickets,
        wallet,
        districtAdmins,
        dataSources,
        environmentalSummary: calculateEnvironmentalImpact(deposits.filter(d => d.status === 'admin_approved')),
        // Phase 5 States
        fraudAlerts,
        automationRules,
        communityChallenges,
        aiRecommendations,
        iotDevices,
        activeRoute,
        aiChatHistory,
        // Phase 6 States
        iotFleet,
        telemetryLogs,
        vehicleFleet,
        vehicleLogs,
        govIntegrations,
        govSyncLogs,
        recyclerPartners,
        handoverRecords,
        payoutTransactions,
        communityEvents,
        communityPartners,
        securityAuditLogs,
        districtRolloutStatus,
        // Existing Methods
        submitDeposit,
        verifyDeposit,
        approveDeposit,
        rejectDeposit,
        requestRedemption,
        processRedemption,
        updateCategoryRate,
        updateRewardSettingsConfig,
        markNotificationRead,
        markAllNotificationsRead,
        createSupportTicket,
        updateTicketStatus,
        addCollectionPoint,
        updateCollectionPoint,
        assignDistrictAdmin,
        importDataSource,
        getDistrictMetrics,
        calculateDistrictGreenScore,
        generateReportData,
        resetAllDataToZero,
        refreshData: loadAllData,
        // Phase 5 Methods
        askAIAssistant,
        clearAIChatHistory,
        reviewFraudAlert,
        toggleAutomationRule,
        joinCommunityChallenge,
        updateAIRecommendation,
        setActiveRoute,
        updateRouteStopStatus,
        // Phase 6 Methods
        registerIoTDevice,
        ingestSimulatedTelemetry,
        toggleIoTDeviceStatus,
        registerVehicle,
        toggleVehicleShiftConsent,
        advanceVehicleStop,
        toggleGovIntegration,
        triggerGovSync,
        registerRecyclerPartner,
        verifyRecyclerPartner,
        createWasteHandover,
        verifyWasteHandover,
        executeSandboxPayout,
        reconcileFailedPayout,
        registerForCommunityEvent,
        createCommunityEvent,
        recordSecurityAuditEvent
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
