import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Scale,
  Gift,
  Coins,
  RefreshCw,
  CheckCheck,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  function getIcon(type) {
    switch (type) {
      case 'deposit_approved':
      case 'redemption_approved':
        return <CheckCircle2 size={18} style={{ color: '#16a34a' }} />;
      case 'deposit_submitted':
      case 'collector_verified':
        return <Scale size={18} style={{ color: '#0284c7' }} />;
      case 'redemption_requested':
        return <Clock3 size={18} style={{ color: '#d97706' }} />;
      case 'deposit_rejected':
      case 'redemption_rejected':
        return <AlertCircle size={18} style={{ color: '#dc2626' }} />;
      case 'points_restored':
        return <RefreshCw size={18} style={{ color: '#9333ea' }} />;
      default:
        return <Coins size={18} style={{ color: '#16a34a' }} />;
    }
  }

  return (
    <div
      className="modal-backdrop"
      style={{
        zIndex: 9999,
        background: 'rgba(5, 35, 20, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        padding: 0
      }}
      onClick={onClose}
    >
      <div
        className="modal-card"
        style={{
          width: '100%',
          maxWidth: '430px',
          height: '100vh',
          borderRadius: 0,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(24px) saturate(180%)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #e5eee7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(239, 251, 242, 0.9), rgba(255, 255, 255, 0.95))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <b style={{ font: '800 15px Manrope', color: '#0b3d25', display: 'block' }}>
                Notifications
              </b>
              <small style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                style={{
                  border: '1px solid #cce2d1',
                  background: '#ffffff',
                  color: '#15803d',
                  borderRadius: '6px',
                  padding: '5px 9px',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
            <button
              className="icon-btn"
              onClick={onClose}
              aria-label="Close"
              style={{
                border: 'none',
                background: 'rgba(0,0,0,0.06)',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                color: '#374151'
              }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
          {notifications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: n.is_read ? 'rgba(255, 255, 255, 0.7)' : '#f0fdf4',
                    border: n.is_read ? '1px solid #e2ece5' : '1px solid #86efac',
                    boxShadow: n.is_read ? '0 2px 6px rgba(0,0,0,0.02)' : '0 4px 14px rgba(22, 163, 74, 0.12)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      {getIcon(n.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <b style={{ fontSize: '12px', color: '#093a20', fontWeight: 800 }}>
                          {n.title}
                        </b>
                        {!n.is_read && (
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: '#16a34a',
                              flexShrink: 0
                            }}
                          />
                        )}
                      </div>
                      <p style={{ margin: '4px 0 6px', fontSize: '11px', color: '#1f4830', lineHeight: 1.45, fontWeight: 600 }}>
                        {n.message}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', fontWeight: 700 }}>
                        {n.reference_id && (
                          <span style={{ padding: '2px 6px', background: '#e2ece5', borderRadius: '4px', color: '#0b3d25' }}>
                            Ref: {n.reference_id}
                          </span>
                        )}
                        <span>
                          {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Bell size={40} style={{ color: '#16a34a', opacity: 0.35, margin: '0 auto 12px', display: 'block' }} />
              <b style={{ display: 'block', fontSize: '13px', color: '#0b3d25' }}>No Notifications Yet</b>
              <small style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#526d5b' }}>
                When you submit deposits, receive collector verifications, earn Green Money rewards, or request redemptions, updates will appear here in real-time.
              </small>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid #e5eee7',
            background: '#fafdfb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: '#526d5b',
            fontWeight: 700
          }}
        >
          <span>CleanTN 360 Notification Engine</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#15803d' }}>
            <ShieldCheck size={12} /> Real-Time Sync
          </span>
        </div>
      </div>
    </div>
  );
}

