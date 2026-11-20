import React, { useState } from 'react';
import {
  Award,
  Trophy,
  Users,
  Target,
  Sparkles,
  CheckCircle2,
  Lock,
  Download,
  Share2,
  Calendar,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  computeCitizenBadges,
  MOCK_DISTRICT_LEADERBOARD
} from '../../lib/gamificationEngine';

export default function GreenCommunityPage({ notify }) {
  const { profile } = useAuth();
  const { deposits, wallet, communityChallenges, joinCommunityChallenge } = useData();
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const badges = computeCitizenBadges(deposits, wallet);
  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  const handleJoinChallenge = (challengeId) => {
    joinCommunityChallenge(challengeId);
    if (notify) notify('You joined the community challenge! Deposits in this category will count toward the target.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #15803d 0%, #047857 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(21, 128, 61, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Trophy size={28} style={{ color: '#fef08a' }} />
              <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
                Citizen Gamification & Green Community
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                Phase 5 Civic Engagement
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#bbf7d0', maxWidth: '750px', lineHeight: 1.6 }}>
              Earn digital achievements, participate in regional clean-up relays, and compete on privacy-safe district leaderboards.
              All achievements are unlocked strictly through certified municipal scale deposits.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowCertModal(true)}
              style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#1e293b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Award size={16} /> View My Certificate
            </button>
          </div>
        </div>
      </div>

      {/* Gamification Stats Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>BADGES UNLOCKED</div>
          <div style={{ font: '800 26px Manrope', color: '#047857', marginTop: '4px' }}>
            {unlockedCount} / {badges.length}
          </div>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
            {Math.round((unlockedCount / badges.length) * 100)}% Milestone Completed
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>MY DISTRICT RANK</div>
          <div style={{ font: '800 26px Manrope', color: '#0284c7', marginTop: '4px' }}>
            #1 in Coimbatore
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Top 1% Citizen Recycler
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>ACTIVE CHALLENGES</div>
          <div style={{ font: '800 26px Manrope', color: '#d97706', marginTop: '4px' }}>
            {communityChallenges.filter(c => c.is_active).length} Drives Live
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Statewide Civic Campaigns
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', font: '800 18px Manrope', color: '#1e293b' }}>
              Environmental Achievement Badges
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Badges unlock automatically when your verified waste deposits meet official municipal criteria.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {badges.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBadge(b)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '12px',
                border: b.isUnlocked ? '1px solid #86efac' : '1px dashed #cbd5e1',
                background: b.isUnlocked ? '#f0fdf4' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: b.isUnlocked ? '#dcfce7' : '#e2e8f0',
                  color: b.isUnlocked ? '#15803d' : '#94a3b8',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '24px',
                  flexShrink: 0
                }}
              >
                {b.isUnlocked ? b.icon : <Lock size={20} />}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <b style={{ font: '800 14px Manrope', color: b.isUnlocked ? '#1e293b' : '#94a3b8' }}>
                    {b.name}
                  </b>
                  {b.isUnlocked && (
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                      UNLOCKED
                    </span>
                  )}
                </div>
                <p style={{ margin: '4px 0 6px', fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                  {b.description}
                </p>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#047857' }}>
                  Bonus: +{b.bonusPoints} Points
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Challenges & Leaderboard Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Active Challenges */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', font: '800 18px Manrope', color: '#1e293b' }}>
            Regional Community Challenges
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {communityChallenges.map((chal) => {
              const progressPct = Math.min(100, Math.round((chal.current_weight_kg / chal.target_weight_kg) * 100));
              return (
                <div
                  key={chal.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <b style={{ font: '800 14px Manrope', color: '#0f172a' }}>{chal.title}</b>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {chal.district} • Stream: <b>{chal.target_category}</b>
                      </div>
                    </div>
                    <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                      Pool: {chal.bonus_points_pool.toLocaleString()} Pts
                    </span>
                  </div>

                  <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                    {chal.description}
                  </p>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      <span>Progress: <b>{chal.current_weight_kg} / {chal.target_weight_kg} kg</b></span>
                      <b>{progressPct}%</b>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${progressPct}%`, height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      👥 <b>{chal.participants_count}</b> Citizens Enrolled
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleJoinChallenge(chal.id)}
                      disabled={chal.isUserJoined}
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                    >
                      {chal.isUserJoined ? '✓ Enrolled' : 'Join Challenge'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* District Leaderboard */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, font: '800 18px Manrope', color: '#1e293b' }}>
              Coimbatore District Leaderboard
            </h2>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Privacy-Protected</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MOCK_DISTRICT_LEADERBOARD.map((item) => (
              <div
                key={item.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: item.rank === 1 ? '1px solid #fef08a' : '1px solid #f1f5f9',
                  background: item.rank === 1 ? '#fffbeb' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: item.rank === 1 ? '#f59e0b' : item.rank === 2 ? '#94a3b8' : item.rank === 3 ? '#d97706' : '#f1f5f9',
                      color: item.rank <= 3 ? '#ffffff' : '#475569',
                      display: 'grid',
                      placeItems: 'center',
                      font: '800 12px Manrope'
                    }}
                  >
                    {item.rank}
                  </span>

                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#047857',
                      color: '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: '12px'
                    }}
                  >
                    {item.avatar}
                  </div>

                  <div>
                    <b style={{ font: '800 13px Manrope', color: '#0f172a' }}>{item.handle}</b>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{item.badgeCount} Badges Earned</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <b style={{ font: '800 14px Manrope', color: '#047857' }}>{item.verifiedKg} kg</b>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{item.points} Pts</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
            Rankings update daily based strictly on certified scale weighings. Citizen contact details are hidden for privacy.
          </div>
        </div>
      </div>

      {/* Digital Certificate Lightbox Modal */}
      {showCertModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '580px', padding: '32px', textAlign: 'center', border: '8px solid #bbf7d0', borderRadius: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <Trophy size={36} />
            </div>

            <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '11px', fontWeight: 800, color: '#047857' }}>
              Government of Tamil Nadu • CleanTN 360
            </div>
            <h2 style={{ margin: '6px 0 14px', font: '800 24px Manrope', color: '#064e3b' }}>
              Certificate of Environmental Stewardship
            </h2>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
              This is to certify that <b>{profile?.full_name || 'Citizen Member'}</b> has actively participated in the CleanTN 360 Smart Waste Management & Green Money Ecosystem, having diverted verified recyclable municipal waste in <b>Coimbatore District</b>.
            </p>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>VERIFIED DIVERTED</div>
                <b style={{ font: '800 16px Manrope', color: '#047857' }}>38.5 kg</b>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>CPCB CO₂ OFFSET</div>
                <b style={{ font: '800 16px Manrope', color: '#0284c7' }}>71.2 kg CO₂e</b>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>REWARDS EARNED</div>
                <b style={{ font: '800 16px Manrope', color: '#d97706' }}>1,925 Pts</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowCertModal(false)}
              >
                Close Certificate
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (notify) notify('Digital certificate downloaded in PDF format.');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
