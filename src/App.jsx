import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

import Sidebar from './components/common/Sidebar';
import TopHeader from './components/common/TopHeader';
import AuthModal from './components/common/AuthModal';
import LogoModal from './components/common/LogoModal';
import NotificationDrawer from './components/common/NotificationDrawer';

import PublicPage from './components/public/PublicPage';
import PublicImpactPortal from './components/public/PublicImpactPortal';

import CitizenDashboard from './components/citizen/CitizenDashboard';
import DepositWaste from './components/citizen/DepositWaste';
import WalletPage from './components/citizen/WalletPage';
import TransactionsPage from './components/citizen/TransactionsPage';
import CollectionPointsPage from './components/citizen/CollectionPointsPage';
import DistrictInsightsPage from './components/citizen/DistrictInsightsPage';
import ImpactReportsPage from './components/citizen/ImpactReportsPage';
import HelpSupportPage from './components/citizen/HelpSupportPage';

import CollectorDashboard from './components/collector/CollectorDashboard';
import RouteOptimizationPage from './components/collector/RouteOptimizationPage';
import AdminDashboard from './components/admin/AdminDashboard';
import StateAdminDashboard from './components/admin/StateAdminDashboard';
import FraudDetectionQueue from './components/admin/FraudDetectionQueue';
import AutomationRulesPage from './components/admin/AutomationRulesPage';
import AIDecisionSupportPage from './components/admin/AIDecisionSupportPage';

import AIWasteAssistant from './components/ai/AIWasteAssistant';
import PredictiveWasteAnalytics from './components/analytics/PredictiveWasteAnalytics';
import WasteSegregationAssistant from './components/citizen/WasteSegregationAssistant';
import GreenCommunityPage from './components/citizen/GreenCommunityPage';

// Phase 6 Production, IoT, Fleet, Gov, Recycler, Payout, Community, Security & Rollout
import IoTManagementDashboard from './components/iot/IoTManagementDashboard';
import VehicleTrackingDashboard from './components/fleet/VehicleTrackingDashboard';
import GovernmentIntegrationsPage from './components/gov/GovernmentIntegrationsPage';
import RecyclerMarketplace from './components/marketplace/RecyclerMarketplace';
import PayoutManagementPage from './components/payout/PayoutManagementPage';
import CommunityNetworkPage from './components/community/CommunityNetworkPage';
import SecurityCenterPage from './components/security/SecurityCenterPage';
import DistrictRolloutDashboard from './components/rollout/DistrictRolloutDashboard';

function AppContent() {
  const [open, setOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 800 : true);
  const [toast, setToast] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [notifOpen, setNotifOpen] = useState(false);

  const loc = useLocation();
  const { user, role, isSupabaseConfigured, loading } = useAuth();
  const { t } = useLanguage();

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const isPublicRoute =
    loc.pathname === '/' ||
    loc.pathname === '/about' ||
    loc.pathname === '/how-it-works' ||
    loc.pathname === '/impact';

  const isPublicImpactPortal = loc.pathname === '/public-impact';

  // Automatically pop login modal if visitor tries to access protected app routes directly
  useEffect(() => {
    if (!loading && !user && !isPublicRoute && !isPublicImpactPortal) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
    }
  }, [user, loading, isPublicRoute, isPublicImpactPortal]);

  const routeTitles = {
    '/app': t('nav.dashboard', 'Citizen Dashboard'),
    '/app/deposit': t('nav.deposit', 'Deposit Waste'),
    '/app/wallet': t('nav.wallet', 'Green Money Wallet'),
    '/app/transactions': t('nav.transactions', 'My Transactions Ledger'),
    '/app/collection-points': t('nav.collectionPoints', 'Authorized Collection Hubs'),
    '/app/district-insights': t('nav.districtInsights', 'Tamil Nadu District Insights'),
    '/app/impact-reports': t('nav.impactReports', 'Environmental Impact & Reports'),
    '/app/help': t('nav.helpSupport', 'Help Desk & Citizen Grievances'),
    '/app/ai-assistant': t('nav.aiAssistant', 'CleanTN 360 AI Waste Intelligence'),
    '/app/segregation': t('nav.segregation', 'AI Waste Segregation Assistant'),
    '/app/green-community': t('nav.greenCommunity', 'Citizen Gamification & Green Community'),
    '/app/predictive-analytics': t('nav.predictiveTrends', 'Predictive Waste Analytics & Forecasting'),
    '/collector': t('nav.collectorPortal', 'Field Collector Station Portal'),
    '/collector/verify': t('nav.verifyDeposits', 'Scale Verifications Queue'),
    '/collector/routes': t('nav.routeOptimizer', 'Smart Collection Route Optimization'),
    '/admin': t('nav.adminDashboard', 'Municipal Administrator Console'),
    '/admin/approvals': t('nav.depositApprovals', 'Deposit Ledger Approval Queue'),
    '/admin/users': 'User & Staff Permissions',
    '/admin/points': t('nav.collectionPoints', 'Collection Hub Management'),
    '/admin/tickets': 'Support Desk Resolution',
    '/admin/fraud': t('nav.fraudQueue', 'Fraud Detection & Anomaly Review Queue'),
    '/admin/automation': t('nav.automationRules', 'Smart Alert & Notification Automation'),
    '/admin/ai-advisory': t('nav.aiAdvisory', 'AI Admin Decision Support & Advisory'),
    '/app/recyclers': t('nav.recyclers', 'Authorized Recycler Marketplace'),
    '/app/community-network': t('nav.awareness', 'Community & Environmental Awareness Network'),
    '/collector/fleet': t('nav.fleetTracking', 'Live Vehicle & Collector GPS Tracking'),
    '/admin/iot': t('nav.iotFleet', 'Real-World IoT Waste Management'),
    '/admin/fleet': t('nav.fleetTracking', 'Municipal Vehicle Fleet Tracking'),
    '/admin/gov-integrations': t('nav.govIntegrations', 'Government & Municipal Integrations'),
    '/admin/payouts': t('nav.payoutManagement', 'Green Money Payout Management'),
    '/admin/security': t('nav.securityCenter', 'Security Center & Production Monitoring'),
    '/state-admin/rollout': t('nav.districtRollout', 'Tamil Nadu 38-District Phased Rollout'),
    '/state-admin': t('nav.stateOverview', 'State Secretariat 38-District Command'),
    '/public-impact': t('nav.publicImpact', 'Public Environmental Impact Portal')
  };

  const currentTitle = routeTitles[loc.pathname] || 'CleanTN 360';

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(245, 250, 246, 0.96)',
          fontFamily: "'DM Sans', sans-serif"
        }}
      >
        <img
          src="/cleantn-logo.png"
          alt="CleanTN 360"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            marginBottom: '16px',
            boxShadow: '0 4px 18px rgba(8, 122, 60, 0.22)'
          }}
        />
        <b style={{ color: '#0b3d25', fontSize: '18px', fontFamily: "'Manrope', sans-serif" }}>CleanTN 360</b>
        <small style={{ color: '#16a34a', fontWeight: 700, marginTop: '6px', letterSpacing: '0.8px' }}>
          {t('common.loading', 'Loading Civic Platform...')}
        </small>
      </div>
    );
  }

  if (isPublicImpactPortal) {
    return (
      <>
        <PublicImpactPortal
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
          onSuccess={notify}
        />
        <LogoModal />
        <NotificationDrawer
          isOpen={notifOpen}
          onClose={() => setNotifOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      {(!user || isPublicRoute) ? (
        <PublicPage
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setAuthModalOpen(true);
          }}
        />
      ) : (
        <div className="shell">
          <Sidebar
            isOpen={open}
            onClose={() => setOpen(false)}
            onToggle={() => setOpen(!open)}
            onNotify={notify}
          />

          <main className={`main ${open ? 'sidebar-open' : 'sidebar-closed'}`}>
            <TopHeader
              isOpen={open}
              onToggle={() => setOpen(!open)}
              title={currentTitle}
              onNotify={notify}
              onOpenNotifications={() => setNotifOpen(true)}
            />

            <div className="content">
              <Routes>
                {/* Citizen Routes */}
                <Route path="/app" element={<CitizenDashboard notify={notify} />} />
                <Route path="/app/deposit" element={<DepositWaste notify={notify} />} />
                <Route path="/app/wallet" element={<WalletPage notify={notify} />} />
                <Route path="/app/transactions" element={<TransactionsPage notify={notify} />} />
                <Route path="/app/collection-points" element={<CollectionPointsPage notify={notify} />} />
                <Route path="/app/district-insights" element={<DistrictInsightsPage notify={notify} />} />
                <Route path="/app/district/:districtCode" element={<DistrictInsightsPage notify={notify} />} />
                <Route path="/app/impact-reports" element={<ImpactReportsPage notify={notify} />} />
                <Route path="/app/help" element={<HelpSupportPage notify={notify} />} />
                {/* Phase 5 Citizen Additions */}
                <Route path="/app/ai-assistant" element={<AIWasteAssistant notify={notify} />} />
                <Route path="/app/segregation" element={<WasteSegregationAssistant notify={notify} />} />
                <Route path="/app/green-community" element={<GreenCommunityPage notify={notify} />} />
                <Route path="/app/predictive-analytics" element={<PredictiveWasteAnalytics notify={notify} />} />
                {/* Phase 6 Citizen Additions */}
                <Route path="/app/recyclers" element={<RecyclerMarketplace notify={notify} />} />
                <Route path="/app/community-network" element={<CommunityNetworkPage notify={notify} />} />

                {/* Collector Routes */}
                <Route path="/collector" element={<CollectorDashboard notify={notify} />} />
                <Route path="/collector/verify" element={<CollectorDashboard notify={notify} />} />
                <Route path="/collector/routes" element={<RouteOptimizationPage notify={notify} />} />
                <Route path="/collector/fleet" element={<VehicleTrackingDashboard notify={notify} />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard notify={notify} />} />
                <Route path="/admin/approvals" element={<AdminDashboard notify={notify} />} />
                <Route path="/admin/users" element={<AdminDashboard notify={notify} />} />
                <Route path="/admin/points" element={<AdminDashboard notify={notify} />} />
                <Route path="/admin/tickets" element={<AdminDashboard notify={notify} />} />
                {/* Phase 5 Admin Additions */}
                <Route path="/admin/fraud" element={<FraudDetectionQueue notify={notify} />} />
                <Route path="/admin/automation" element={<AutomationRulesPage notify={notify} />} />
                <Route path="/admin/ai-advisory" element={<AIDecisionSupportPage notify={notify} />} />
                {/* Phase 6 Admin Additions */}
                <Route path="/admin/iot" element={<IoTManagementDashboard notify={notify} />} />
                <Route path="/admin/fleet" element={<VehicleTrackingDashboard notify={notify} />} />
                <Route path="/admin/gov-integrations" element={<GovernmentIntegrationsPage notify={notify} />} />
                <Route path="/admin/payouts" element={<PayoutManagementPage notify={notify} />} />
                <Route path="/admin/security" element={<SecurityCenterPage notify={notify} />} />

                {/* State Admin Routes (Phase 4, 5 & 6) */}
                <Route path="/state-admin" element={<StateAdminDashboard notify={notify} />} />
                <Route path="/state-admin/rollout" element={<DistrictRolloutDashboard notify={notify} />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={notify}
      />

      {/* Global Logo Viewer Lightbox Modal */}
      <LogoModal />

      {/* Global In-App Notification Drawer */}
      <NotificationDrawer
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
      />

      {/* Global Toast */}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
