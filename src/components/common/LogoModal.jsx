import React, { useEffect, useState } from 'react';
import { X, Download, ExternalLink, ShieldCheck, Sparkles, MapPin, Coins, Leaf } from 'lucide-react';

export default function LogoModal({ isOpen: propIsOpen, onClose: propOnClose }) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = propIsOpen !== undefined ? propIsOpen : internalOpen;
  const handleClose = () => {
    if (propOnClose) propOnClose();
    setInternalOpen(false);
  };

  useEffect(() => {
    // Custom event listener so any component can trigger it easily
    function handleCustomEvent() {
      setInternalOpen(true);
    }

    // Global click listener: if user clicks any element with data-logo-view or img with /cleantn-logo.png
    function handleGlobalClick(e) {
      const target = e.target;
      if (!target || typeof target.getAttribute !== 'function') return;
      const isLogoImg = target.tagName === 'IMG' && target.getAttribute('src')?.includes('cleantn-logo.png');
      const isLogoWrapper = target.closest && target.closest('[data-logo-view="true"]');
      
      if (isLogoImg || isLogoWrapper) {
        // Prevent default navigation if wrapped in a link when specifically clicking the logo
        e.preventDefault();
        e.stopPropagation();
        setInternalOpen(true);
      }
    }

    // ESC key to close
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        handleClose();
      }
    }

    window.addEventListener('cleantn:view-logo', handleCustomEvent);
    document.addEventListener('click', handleGlobalClick, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('cleantn:view-logo', handleCustomEvent);
      document.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        zIndex: 99999,
        background: 'rgba(5, 35, 20, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '20px'
      }}
      onClick={handleClose}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: '560px',
          width: '100%',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.94)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.35)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid #e8f2eb',
            background: 'linear-gradient(135deg, rgba(239, 251, 242, 0.9), rgba(255, 255, 255, 0.95))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#16a34a',
                display: 'inline-block',
                boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.2)'
              }}
            />
            <b style={{ font: '800 15px Manrope', color: '#0b3d25' }}>
              CleanTN 360 · Official Emblem
            </b>
          </div>
          <button
            className="icon-btn"
            onClick={handleClose}
            aria-label="Close"
            style={{
              border: 'none',
              background: 'rgba(0,0,0,0.05)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Image Showcase */}
        <div className="modal-body" style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
          {/* Logo Showcase with soft glow backdrop */}
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              margin: '0 auto 18px',
              padding: '16px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, rgba(255, 255, 255, 0.9) 70%)',
              boxShadow: '0 12px 40px rgba(8, 122, 60, 0.15)'
            }}
          >
            <img
              src="/cleantn-logo.png"
              alt="CleanTN 360 Official Logo Full View"
              style={{
                width: '100%',
                maxWidth: '320px',
                height: 'auto',
                aspectRatio: '1 / 1',
                objectFit: 'contain',
                filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.18))',
                borderRadius: '50%',
                transition: 'transform 0.3s ease'
              }}
            />
          </div>

          <h3
            style={{
              margin: '6px 0 4px',
              font: '800 20px Manrope',
              color: '#094425',
              letterSpacing: '-0.5px'
            }}
          >
            CleanTN 360
          </h3>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: '12px',
              color: '#4b6353',
              fontWeight: 600,
              letterSpacing: '0.2px'
            }}
          >
            Smart Waste Management & Green Money Ecosystem for Tamil Nadu
          </p>

          {/* Key Emblem Feature Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              marginBottom: '20px'
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '5px 10px',
                borderRadius: '16px',
                background: '#e8f9ed',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Leaf size={12} /> 100% Circular Economy
            </span>

            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '5px 10px',
                borderRadius: '16px',
                background: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Coins size={12} /> Green Money (100 Pts = ₹1)
            </span>

            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '5px 10px',
                borderRadius: '16px',
                background: '#e0f2fe',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <MapPin size={12} /> 38 Districts Covered
            </span>

            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '5px 10px',
                borderRadius: '16px',
                background: '#f3e8ff',
                color: '#7e22ce',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <ShieldCheck size={12} /> TN Govt State Initiative
            </span>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              paddingTop: '8px',
              borderTop: '1px solid #edf2ee'
            }}
          >
            <a
              href="/cleantn-logo.png"
              download="CleanTN_360_Official_Emblem.png"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #15803d, #087a3c)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '11px',
                boxShadow: '0 4px 14px rgba(8, 122, 60, 0.25)',
                textDecoration: 'none'
              }}
            >
              <Download size={14} /> Download Logo (PNG)
            </a>

            <a
              href="/cleantn-logo.png"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid #cde5d3',
                color: '#15803d',
                fontWeight: 700,
                fontSize: '11px',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={14} /> Open Full Size
            </a>

            <button
              type="button"
              onClick={handleClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '10px 18px',
                borderRadius: '10px',
                background: '#f1f5f2',
                border: '1px solid #dbe6de',
                color: '#4b6353',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

