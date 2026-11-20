import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Leaf,
  Recycle,
  Target,
  Sprout,
  ShieldCheck,
  QrCode,
  Wallet,
  ChartNoAxesColumn,
  Users,
  Banknote,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageToggle from '../common/LanguageToggle';

function Feature({ Icon, title, text }) {
  return (
    <div className="feature">
      <Icon />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export default function PublicPage({ onOpenAuth }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { t } = useLanguage();

  const path = loc.pathname;
  const isAbout = path === '/about';
  const isHow = path === '/how-it-works';
  const isImpact = path === '/impact';
  // Default to isHome if visited from any unhandled route or /app while unauthenticated
  const isHome = path === '/' || (!isAbout && !isHow && !isImpact);

  function handlePortalClick(e) {
    if (user) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'collector') navigate('/collector');
      else navigate('/app');
    } else {
      if (onOpenAuth) onOpenAuth('login');
    }
  }

  function handleGetStartedClick(e) {
    if (user) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'collector') navigate('/collector');
      else navigate('/app');
    } else {
      if (onOpenAuth) onOpenAuth('register');
    }
  }

  return (
    <div className="public" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        className="public-navbar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(163, 212, 178, 0.4)',
          boxShadow: '0 4px 20px rgba(8, 122, 60, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 5%',
          minHeight: '70px',
          boxSizing: 'border-box'
        }}
      >
        <Link to="/" className="brand dark" style={{ gap: '12px', alignItems: 'center' }}>
          <img
            src="/cleantn-logo.png"
            alt="CleanTN 360 Logo"
            className="clickable-logo"
            data-logo-view="true"
            title="Click to view CleanTN 360 Official Emblem"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('cleantn:view-logo'));
            }}
            style={{
              width: '46px',
              height: '46px',
              objectFit: 'contain',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '2px',
              boxShadow: '0 4px 14px rgba(8, 122, 60, 0.15)',
              flexShrink: 0
            }}
          />
          <div>
            <b>CleanTN 360</b>
            <small>Smart Waste Management & Green Money</small>
          </div>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link className={isHome ? 'selected' : ''} to="/">
            {t('public.home', 'Home')}
          </Link>
          <Link className={isAbout ? 'selected' : ''} to="/about">
            {t('public.about', 'About')}
          </Link>
          <Link className={isHow ? 'selected' : ''} to="/how-it-works">
            {t('public.howItWorks', 'How It Works')}
          </Link>
          <Link className={isImpact ? 'selected' : ''} to="/impact">
            {t('public.impact', 'Impact')}
          </Link>

          {/* Bilingual Language Switcher Button */}
          <LanguageToggle compact={true} />

          <button
            type="button"
            className="outline"
            onClick={handlePortalClick}
            style={{ margin: 0, padding: '8px 14px', fontSize: '10px' }}
          >
            {user ? t('public.openPortal', 'Open Portal') : t('public.login', 'Login')}
          </button>
          <button
            type="button"
            className="primary"
            onClick={handleGetStartedClick}
            style={{ margin: 0, padding: '8px 14px', fontSize: '10px' }}
          >
            {user ? t('public.myDashboard', 'My Dashboard') : t('public.getStarted', 'Get Started')} <ArrowRight size={13} />
          </button>
        </nav>
      </header>

      {/* HOME VIEW */}
      {isHome && (
        <>
          <section className="hero">
            <div>
              <span className="tag">{t('public.tagline', 'TAMIL NADU · 38 DISTRICTS')}</span>
              <h1>
                {t('public.heroTitle1', 'A Cleaner, Greener')}
                <br />
                <em>{t('public.heroTitle2', 'Tamil Nadu.')}</em>
              </h1>
              <p>
                {t('public.heroDesc', 'A unified civic platform to manage waste segregation, verify deposits on calibrated scales, and earn traceable Green Money rewards across our communities.')}
              </p>
              <div className="heroactions">
                <button
                  type="button"
                  className="primary"
                  onClick={handleGetStartedClick}
                  style={{ fontSize: '11px', padding: '12px 18px' }}
                >
                  {t('public.joinBtn', 'Join CleanTN 360')} <ArrowRight size={14} />
                </button>
                <Link className="outline" to="/how-it-works" style={{ fontSize: '11px', padding: '12px 18px' }}>
                  How it works
                </Link>
              </div>
              <div className="herostats">
                <div>
                  <b>38</b>
                  <small>District vision</small>
                </div>
                <div>
                  <b>6</b>
                  <small>Waste categories</small>
                </div>
                <div>
                  <b>1</b>
                  <small>Greener future</small>
                </div>
              </div>
            </div>
            <div
              className="heroart"
              style={{
                background: 'transparent',
                height: 'auto',
                aspectRatio: '16 / 9',
                width: '100%',
                maxHeight: 'none',
                borderRadius: '22px',
                overflow: 'hidden',
                boxShadow: '0 16px 40px rgba(5, 47, 32, 0.16)',
                border: '2px solid rgba(255, 255, 255, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src="/thanjavur-temple.jpg"
                alt="Thanjavur Brihadisvara Temple - Tamil Nadu Heritage"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '20px'
                }}
              />
            </div>
          </section>

          <section className="publicsection">
            <span>ABOUT CLEANTN 360</span>
            <h2>Waste has value. Your actions create impact.</h2>
            <p>
              CleanTN 360 connects citizens, field collection workers, and municipal administrators through a transparent, verified waste management workflow.
            </p>
            <div className="featurecards">
              <Feature
                Icon={Target}
                title="Our Mission"
                text="Make responsible waste segregation and recycling simple and rewarding for every household in Tamil Nadu."
              />
              <Feature
                Icon={Sprout}
                title="Our Vision"
                text="A circular, zero-landfill Tamil Nadu where citizens and municipal sanitation staff work as partners."
              />
              <Feature
                Icon={ShieldCheck}
                title="Transparent Rewards"
                text="Verified deposits measured on calibrated scales, atomic database ledger crediting, and simulated instant redemptions."
              />
            </div>
          </section>

          <section className="publicsection pale">
            <span>HOW IT WORKS</span>
            <h2>From waste deposit to Green Money</h2>
            <div className="stepcards">
              {[
                'Register',
                'Scan collection QR',
                'Deposit & weigh',
                'Collector verifies',
                'Admin approves',
                'Earn points'
              ].map((s, i) => (
                <div key={s}>
                  <b>{i + 1}</b>
                  <strong>{s}</strong>
                  <small>
                    {[
                      'Create your verified citizen account.',
                      'Scan the unique QR at any collection hub.',
                      'Hand over segregated dry/wet waste.',
                      'Collector records weight on calibrated digital scale.',
                      'Zonal Admin validates scale photos & remarks.',
                      'Points credited atomically to your wallet ledger.'
                    ][i]}
                  </small>
                </div>
              ))}
            </div>
          </section>

          <section className="publicsection">
            <div className="cta">
              <div>
                <span>BUILD A BETTER TOMORROW</span>
                <h2>Every responsible deposit makes a difference.</h2>
                <p>
                  Join thousands of citizens across Tamil Nadu turning recyclables into Green Money while protecting our rivers, soil and communities.
                </p>
              </div>
              <button
                type="button"
                className="lightbtn"
                onClick={handleGetStartedClick}
              >
                Access Portal Now <ArrowRight size={14} />
              </button>
            </div>
          </section>
        </>
      )}

      {/* ABOUT VIEW */}
      {isAbout && (
        <>
          <section className="publichero">
            <span>ABOUT CLEANTN 360</span>
            <h1>Technology for a cleaner Tamil Nadu.</h1>
            <p>
              A Tamil Nadu-focused digital platform that encourages responsible disposal, transparent physical verification, and community participation across all 38 revenue districts.
            </p>
          </section>

          <section className="publicsection">
            <div className="featurecards">
              <Feature
                Icon={Target}
                title="Our Mission"
                text="Create a citizen-driven, technology-enabled waste management ecosystem that promotes segregation, recycling and responsible disposal."
              />
              <Feature
                Icon={Leaf}
                title="Our Vision"
                text="A cleaner, greener and more circular Tamil Nadu where every citizen contributes to a sustainable environment."
              />
              <Feature
                Icon={ShieldCheck}
                title="Our Objectives"
                text="Improve waste collection visibility, reward verified deposits, support recycling partners and provide district-level insights."
              />
            </div>
          </section>

          <section className="publicsection pale">
            <span>CORE CAPABILITIES</span>
            <h2>One connected waste management ecosystem</h2>
            <div className="featurecards">
              <Feature
                Icon={QrCode}
                title="QR-based reporting"
                text="Identify designated collection points and link each deposit to a traceable request."
              />
              <Feature
                Icon={Wallet}
                title="Green Money"
                text="Calculate reward points after weight verification and approval."
              />
              <Feature
                Icon={ChartNoAxesColumn}
                title="District intelligence"
                text="Explore waste trends, collection performance and environmental indicators."
              />
            </div>
          </section>
        </>
      )}

      {/* HOW IT WORKS VIEW */}
      {isHow && (
        <>
          <section className="publichero">
            <span>HOW IT WORKS</span>
            <h1>From responsible disposal to verified rewards.</h1>
            <p>A transparent process connects citizens, collection teams and administrators.</p>
          </section>

          <section className="publicsection">
            <div className="stepcards">
              {[
                'Register / Login',
                'Scan collection QR',
                'Select waste type',
                'Collector weighs & verifies',
                'Admin approves',
                'Green Money credited'
              ].map((s, i) => (
                <div key={s}>
                  <b>{i + 1}</b>
                  <strong>{s}</strong>
                  <small>
                    {[
                      'Create your citizen account and choose your district.',
                      'Scan the unique QR code at an eligible collection point.',
                      'Segregate waste and select the matching category.',
                      'Collector records the actual weight using a physical digital scale.',
                      'Admin reviews the transaction and supporting evidence.',
                      'Approved points are added to your wallet ledger.'
                    ][i]}
                  </small>
                </div>
              ))}
            </div>
          </section>

          <section className="publicsection pale">
            <h2>Three roles, one workflow</h2>
            <div className="featurecards">
              <Feature
                Icon={Users}
                title="Citizen Portal"
                text="Submit deposits, follow verification status and track rewards."
              />
              <Feature
                Icon={Recycle}
                title="Collector Portal"
                text="Review requests, weigh waste on calibrated digital scales, and submit photo evidence."
              />
              <Feature
                Icon={ShieldCheck}
                title="Admin Portal"
                text="Approve deposits, manage reward rules and monitor reports."
              />
            </div>
          </section>
        </>
      )}

      {/* IMPACT VIEW */}
      {isImpact && (
        <>
          <section className="publichero">
            <span>IMPACT PORTAL</span>
            <h1>Measure progress. Build a greener future.</h1>
            <p>
              CleanTN 360 brings environmental, social and economic indicators into one view. Metrics are populated from verified platform activity.
            </p>
          </section>

          <section className="publicsection">
            <div className="featurecards">
              <Feature
                Icon={Recycle}
                title="Environmental impact"
                text="Track waste collected, recycled or processed and carefully calculated emissions estimates."
              />
              <Feature
                Icon={Users}
                title="Social impact"
                text="Understand citizen participation, collection teams and community engagement."
              />
              <Feature
                Icon={Banknote}
                title="Economic impact"
                text="Monitor funded rewards, redemption activity and verified recycling value."
              />
            </div>
          </section>

          <section className="publicsection pale">
            <h2>Data transparency matters</h2>
            <p>
              All figures integrate live transactions from our PostgreSQL database. Verified impact reporting adheres to Central Pollution Control Board (CPCB) standards.
            </p>
            <button
              type="button"
              className="primary"
              onClick={handleGetStartedClick}
            >
              Explore live reports <ArrowRight size={14} />
            </button>
          </section>
        </>
      )}

      <footer
        style={{
          marginTop: 'auto',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(163, 212, 178, 0.4)',
          padding: '16px 5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '11px',
          color: '#526d5b'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/cleantn-logo.png"
            alt="CleanTN 360 Logo"
            className="clickable-logo"
            data-logo-view="true"
            title="Click to view CleanTN 360 Official Emblem"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('cleantn:view-logo'));
            }}
            style={{
              width: '28px',
              height: '28px',
              objectFit: 'contain',
              borderRadius: '50%',
              background: '#ffffff',
              padding: '2px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          />
          <b style={{ color: '#087a3c', fontSize: '14px', fontFamily: "'Manrope', sans-serif" }}>CleanTN 360</b>
        </div>
        <span>{t('public.tagline', 'TAMIL NADU · 38 DISTRICTS')} · Smart Waste Management & Green Money</span>
        <span style={{ color: '#16a34a', fontWeight: 700 }}>CleanTN 360 · Phase 6: Production Ecosystem Active</span>
      </footer>
    </div>
  );
}

