import React from 'react';
import { Menu, X, Bell, Shield, User, Wrench, LogOut, Globe2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DISTRICTS } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function TopHeader({ isOpen, onToggle, title, onNotify, onOpenNotifications }) {
  const { role, profile, logout } = useAuth();
  const { notifications } = useData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const unreadCount = notifications ? notifications.filter(n => !n.is_read).length : 0;

  async function handleLogout() {
    await logout();
    if (onNotify) onNotify('Logged out successfully.');
    navigate('/');
  }

  return (
    <header className="top">
      {/* Left: Menu button for mobile + Clickable Logo + Title & Subtitle */}
      <div className="top-left">
        <button className="menubtn" onClick={onToggle} aria-label="Toggle menu">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
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
            width: '38px',
            height: '38px',
            objectFit: 'contain',
            borderRadius: '50%',
            background: '#ffffff',
            padding: '2px',
            boxShadow: '0 2px 8px rgba(8, 122, 60, 0.18)',
            flexShrink: 0
          }}
        />
        <div className="top-center">
          <small>{t('top.subtitle', 'CLEANER TOMORROW STARTS TODAY · TAMIL NADU')}</small>
          <b>{title}</b>
        </div>
      </div>

      {/* Right: Role, District, Bell, Language Toggle & Logout */}
      <div className="topright">
        {/* Role status pill */}
        <span
          style={{
            fontSize: '9px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '5px 10px',
            borderRadius: '20px',
            background: role === 'state_admin' ? '#f3e8ff' : role === 'admin' ? '#fef3c7' : role === 'collector' ? '#e0f2fe' : '#dcfce7',
            color: role === 'state_admin' ? '#7e22ce' : role === 'admin' ? '#b45309' : role === 'collector' ? '#0369a1' : '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap'
          }}
        >
          {role === 'state_admin' && <Globe2 size={12} />}
          {role === 'admin' && <Shield size={12} />}
          {role === 'collector' && <Wrench size={12} />}
          {role === 'citizen' && <User size={12} />}
          {t('role.' + role, role.replace('_', ' '))}
        </span>

        {/* District selector */}
        <select defaultValue={profile?.district || 'Coimbatore'}>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Notifications */}
        <button
          className="bell"
          onClick={() => {
            if (onOpenNotifications) onOpenNotifications();
            else if (onNotify) onNotify('Opening notifications...');
          }}
          aria-label="Notifications"
          style={{ position: 'relative' }}
          title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'View in-app notifications'}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '8.5px',
                fontWeight: 900,
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dedicated Bilingual Language Switcher Button */}
        <LanguageToggle compact={true} />

        <button
          type="button"
          onClick={handleLogout}
          title="Sign out of CleanTN 360"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.28)',
            color: '#dc2626',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
            e.currentTarget.style.color = '#dc2626';
          }}
        >
          <LogOut size={13} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

