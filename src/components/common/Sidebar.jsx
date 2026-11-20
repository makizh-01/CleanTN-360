import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageToggle from './LanguageToggle';
import {
  Leaf,
  LayoutDashboard,
  Recycle,
  Wallet,
  ReceiptText,
  MapPin,
  ChartNoAxesColumn,
  FileBarChart,
  CircleHelp,
  LogOut,
  ShieldCheck,
  Users,
  CheckCircle2,
  Scale,
  RefreshCw,
  Menu,
  Globe2,
  ExternalLink,
  Bot,
  Sparkles,
  Trophy,
  TrendingUp,
  Navigation,
  ShieldAlert,
  Zap,
  Brain,
  Cpu,
  Truck,
  Landmark,
  Factory,
  CreditCard,
  HeartHandshake,
  Lock,
  Layers
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, onToggle, onNotify }) {
  const { profile, role, logout, switchDemoRole } = useAuth();
  const { resetAllDataToZero } = useData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Role-specific navigation items (Phase 1-6 Complete, Bilingual)
  const citizenNav = [
    ['/app', t('nav.dashboard', 'Dashboard'), LayoutDashboard],
    ['/app/deposit', t('nav.deposit', 'Deposit Waste'), Recycle],
    ['/app/segregation', t('nav.segregation', 'AI Segregation Guide'), Sparkles],
    ['/app/ai-assistant', t('nav.aiAssistant', 'AI Waste Assistant'), Bot],
    ['/app/wallet', t('nav.wallet', 'Green Money Wallet'), Wallet],
    ['/app/green-community', t('nav.greenCommunity', 'Green Community & Badges'), Trophy],
    ['/app/community-network', t('nav.awareness', 'Awareness & Cleanups'), HeartHandshake],
    ['/app/recyclers', t('nav.recyclers', 'Authorized Recyclers'), Factory],
    ['/app/transactions', t('nav.transactions', 'My Transactions'), ReceiptText],
    ['/app/collection-points', t('nav.collectionPoints', 'Collection Points'), MapPin],
    ['/app/predictive-analytics', t('nav.predictiveTrends', 'Predictive Trends'), TrendingUp],
    ['/app/district-insights', t('nav.districtInsights', 'District Insights'), ChartNoAxesColumn],
    ['/app/impact-reports', t('nav.impactReports', 'Impact & Reports'), FileBarChart],
    ['/public-impact', t('nav.publicImpact', 'Public Impact Portal'), ExternalLink],
    ['/app/help', t('nav.helpSupport', 'Help & Support'), CircleHelp],
  ];

  const collectorNav = [
    ['/collector', t('nav.collectorPortal', 'Collector Portal'), LayoutDashboard],
    ['/collector/verify', t('nav.verifyDeposits', 'Verify Deposits'), Scale],
    ['/collector/routes', t('nav.routeOptimizer', 'Smart Route Optimizer'), Navigation],
    ['/collector/fleet', t('nav.fleetTracking', 'Vehicle GPS Tracking'), Truck],
    ['/app/recyclers', t('nav.recyclers', 'Recycler Handovers'), Factory],
    ['/app/ai-assistant', t('nav.aiAssistant', 'AI Field Assistant'), Bot],
    ['/app/collection-points', t('nav.collectionPoints', 'Assigned Hubs'), MapPin],
    ['/app/help', t('nav.helpSupport', 'Support Desk'), CircleHelp],
  ];

  const adminNav = [
    ['/admin', t('nav.adminDashboard', 'Admin Dashboard'), ShieldCheck],
    ['/admin/approvals', t('nav.depositApprovals', 'Deposit Approvals'), CheckCircle2],
    ['/admin/payouts', t('nav.payoutManagement', 'Payout Management'), CreditCard],
    ['/admin/iot', t('nav.iotFleet', 'IoT Device Fleet'), Cpu],
    ['/admin/fleet', t('nav.fleetTracking', 'Vehicle GPS Tracking'), Truck],
    ['/app/recyclers', t('nav.recyclers', 'Recycler Marketplace'), Factory],
    ['/admin/gov-integrations', t('nav.govIntegrations', 'Gov Integrations'), Landmark],
    ['/admin/fraud', t('nav.fraudQueue', 'Fraud & Anomaly Queue'), ShieldAlert],
    ['/admin/ai-advisory', t('nav.aiAdvisory', 'AI Decision Support'), Brain],
    ['/admin/automation', t('nav.automationRules', 'Automation Rules'), Zap],
    ['/app/community-network', t('nav.awareness', 'Community Network'), HeartHandshake],
    ['/admin/security', t('nav.securityCenter', 'Security Center'), Lock],
    ['/app/predictive-analytics', t('nav.predictiveTrends', 'Predictive Analytics'), TrendingUp],
    ['/collector/routes', t('nav.routeOptimizer', 'Collection Routes'), Navigation],
    ['/admin/users', 'User Management', Users],
    ['/admin/points', t('nav.collectionPoints', 'Collection Points'), MapPin],
    ['/admin/tickets', t('nav.helpSupport', 'Support Tickets'), CircleHelp],
    ['/app/district-insights', t('nav.districtInsights', 'District Insights'), ChartNoAxesColumn],
    ['/public-impact', t('nav.publicImpact', 'Public Impact Portal'), ExternalLink],
  ];

  const stateAdminNav = [
    ['/state-admin', t('nav.stateOverview', 'State Overview & Command'), Globe2],
    ['/state-admin/rollout', t('nav.districtRollout', '38-District Rollout'), Layers],
    ['/admin/iot', t('nav.iotFleet', 'Statewide IoT Fleet'), Cpu],
    ['/admin/fleet', t('nav.fleetTracking', 'Vehicle GPS Fleet'), Truck],
    ['/admin/gov-integrations', t('nav.govIntegrations', 'Gov & CPCB Sync'), Landmark],
    ['/app/recyclers', t('nav.recyclers', 'Recycler Marketplace'), Factory],
    ['/admin/payouts', t('nav.payoutManagement', 'Payout Infrastructure'), CreditCard],
    ['/admin/security', t('nav.securityCenter', 'Security & Monitoring'), Lock],
    ['/app/community-network', t('nav.awareness', 'Community Network'), HeartHandshake],
    ['/admin/ai-advisory', t('nav.aiAdvisory', 'AI Policy Advisory'), Brain],
    ['/app/predictive-analytics', t('nav.predictiveTrends', 'Predictive Analytics'), TrendingUp],
    ['/admin/fraud', t('nav.fraudQueue', 'State Fraud Audits'), ShieldAlert],
    ['/admin/automation', t('nav.automationRules', 'Alert Automations'), Zap],
    ['/app/ai-assistant', t('nav.aiAssistant', 'AI Waste Intelligence'), Bot],
    ['/app/district-insights', t('nav.districtInsights', 'District Intelligence'), ChartNoAxesColumn],
    ['/app/collection-points', t('nav.collectionPoints', 'Smart Hubs Fleet'), MapPin],
    ['/app/impact-reports', t('nav.impactReports', 'Environmental Impact'), FileBarChart],
    ['/public-impact', t('nav.publicImpact', 'Public Impact Portal'), ExternalLink],
    ['/admin/approvals', t('nav.depositApprovals', 'Audit Ledger Queue'), CheckCircle2],
    ['/admin/tickets', t('nav.helpSupport', 'Grievance Resolution'), CircleHelp],
  ];

  const currentNav =
    role === 'state_admin'
      ? stateAdminNav
      : role === 'admin'
      ? adminNav
      : role === 'collector'
      ? collectorNav
      : citizenNav;

  async function handleLogout() {
    await logout();
    onNotify('Logged out successfully.');
    navigate('/');
  }

  function handleRoleSwitch(targetRole) {
    switchDemoRole(targetRole);
    onNotify(`Switched to ${targetRole} role.`);
    if (targetRole === 'state_admin') navigate('/state-admin');
    else if (targetRole === 'admin') navigate('/admin');
    else if (targetRole === 'collector') navigate('/collector');
    else navigate('/app');
  }

  return (
    <aside className={`sidebar ${isOpen ? 'show' : 'closed'}`}>
      <div className="brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <img
            src="/cleantn-logo.png"
            alt="CleanTN 360 Logo"
            className="clickable-logo"
            data-logo-view="true"
            title="Click to view CleanTN 360 Official Emblem"
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('cleantn:view-logo'));
            }}
            style={{
              width: '42px',
              height: '42px',
              objectFit: 'contain',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '2px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              flexShrink: 0
            }}
          />
          <div style={{ minWidth: 0 }}>
            <b style={{ whiteSpace: 'nowrap', fontSize: '18px' }}>CleanTN 360</b>
            <small style={{ fontSize: '9px', lineHeight: 1.25, whiteSpace: 'nowrap' }}>
              Smart Waste Management<br />
              & Green Money Wallet
            </small>
          </div>
        </div>

        {/* Three Dash Hamburger Toggle Button inside Sidebar */}
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={() => {
            if (onToggle) onToggle();
            else if (onClose) onClose();
          }}
          title="Toggle / Collapse Sidebar (Three Dash)"
          aria-label="Toggle Sidebar"
        >
          <Menu size={18} />
        </button>
      </div>

      <div className="profile">
        <div className="avatar">
          {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile?.full_name || 'Citizen User'}
          </b>
          <small style={{ textTransform: 'capitalize' }}>
            {t('role.' + role, role.replace('_', ' '))} · {profile?.district || 'Coimbatore'}
          </small>
        </div>
      </div>

      {/* Role Switcher for Phase 4 multi-role testing */}
      <div style={{ margin: '0 0 8px', padding: '6px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <small style={{ fontSize: '8px', color: '#c4dfcc', fontWeight: 800 }}>{t('top.activeRole', 'ACTIVE PORTAL ROLE:')}</small>
          <RefreshCw size={10} style={{ color: '#86efac' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px' }}>
          {[
            ['citizen', t('role.citizen', 'Citizen')],
            ['collector', t('role.collector', 'Collector')],
            ['admin', t('role.admin', 'Dist. Admin')],
            ['state_admin', t('role.state_admin', 'State Admin')]
          ].map(([r, label]) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleSwitch(r)}
              style={{
                border: 'none',
                borderRadius: '5px',
                padding: '4px 2px',
                fontSize: '7.5px',
                fontWeight: 800,
                background: role === r ? '#16a34a' : 'rgba(255,255,255,0.12)',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            resetAllDataToZero();
            onNotify('All dummy data cleared. Ledger reset to 0.');
          }}
          style={{
            width: '100%',
            marginTop: '4px',
            border: '1px dashed rgba(255,255,255,0.25)',
            borderRadius: '5px',
            background: 'transparent',
            color: '#a7f3d0',
            fontSize: '8px',
            fontWeight: 700,
            padding: '2px',
            cursor: 'pointer'
          }}
        >
          {t('top.resetLedger', 'Reset Ledger to 0 (Fresh Start)')}
        </button>
      </div>

      <nav style={{ flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
        {currentNav.map(([to, label, Icon]) => (
          <NavLink
            end={to === '/app' || to === '/collector' || to === '/admin' || to === '/state-admin'}
            to={to}
            key={to}
            onClick={onClose}
            className={({ isActive }) => `navitem ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ paddingTop: '8px', marginTop: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LanguageToggle compact={true} />
        </div>
        <button className="logout" onClick={handleLogout} style={{ width: '100%' }}>
          <LogOut size={16} /> {t('nav.logout', 'Logout')}
        </button>
      </div>
    </aside>
  );
}

