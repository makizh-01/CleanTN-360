import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, QrCode, AlertCircle, CheckCircle2 } from 'lucide-react';
import { INITIAL_COLLECTION_POINTS } from '../../lib/constants';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    let isMounted = true;

    async function startScanner() {
      setErrorMsg('');
      try {
        const html5QrCode = new Html5Qrcode('qr-reader-container');
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (isMounted) {
              handleCodeFound(decodedText);
            }
          },
          (errorMessage) => {
            // Scanner frame scan failure (normal before QR enters frame)
          }
        );
        if (isMounted) setScanning(true);
      } catch (err) {
        console.warn('Camera error or permission denied:', err);
        if (isMounted) {
          setErrorMsg('Camera access unavailable or denied. Please enter or select a collection point code below.');
          setScanning(false);
        }
      }
    }

    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        // Ignore stop error
      }
      scannerRef.current = null;
      setScanning(false);
    }
  }

  function handleCodeFound(code) {
    stopScanner();
    onScanSuccess(code.trim());
    onClose();
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualCode.trim()) {
      setErrorMsg('Please enter a collection point code.');
      return;
    }
    handleCodeFound(manualCode.trim());
  }

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <b><QrCode size={20} /> Scan Collection Point QR</b>
          <button className="icon-btn" onClick={() => { stopScanner(); onClose(); }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Point your camera at the QR code displayed at any authorized CleanTN 360 collection hub.
          </p>

          <div id="qr-reader-container" style={{ width: '100%', minHeight: '260px', borderRadius: '12px', overflow: 'hidden', background: '#052f20' }}></div>

          {errorMsg && (
            <div className="note" style={{ color: '#b91c1c', borderColor: '#fca5a5', background: '#fef2f2', marginTop: '12px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ margin: '18px 0 10px', textAlign: 'center', fontSize: '11px', color: '#6b7280', fontWeight: 'bold' }}>
            ─── OR ENTER POINT CODE MANUALLY ───
          </div>

          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="e.g. CTN-CBE-001"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              className="input"
              style={{ margin: 0 }}
            />
            <button type="submit" className="primary" style={{ whiteSpace: 'nowrap' }}>
              Select
            </button>
          </form>

          <div style={{ marginTop: '14px' }}>
            <small style={{ color: '#526d5b', display: 'block', marginBottom: '6px', fontSize: '10px' }}>
              Quick Pilot Collection Hubs:
            </small>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {INITIAL_COLLECTION_POINTS.slice(0, 3).map((cp) => (
                <button
                  key={cp.point_code}
                  type="button"
                  className="outline"
                  style={{ padding: '6px 9px', fontSize: '9px' }}
                  onClick={() => handleCodeFound(cp.point_code)}
                >
                  {cp.point_code} ({cp.point_name.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

