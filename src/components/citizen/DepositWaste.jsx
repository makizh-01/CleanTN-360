import React, { useState } from 'react';
import {
  QrCode,
  Recycle,
  Settings,
  Gift,
  Camera,
  ArrowRight,
  ReceiptText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import Banner from '../common/Banner';
import Panel from '../common/Panel';
import Status from '../common/Status';
import QRScannerModal from '../common/QRScannerModal';
import { useData } from '../../context/DataContext';

export default function DepositWaste({ notify }) {
  const { categories, collectionPoints, deposits, submitDeposit } = useData();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [pointCode, setPointCode] = useState('CTN-CBE-001');
  const [selectedCategory, setSelectedCategory] = useState('Plastic');
  const [weight, setWeight] = useState('2.0');
  const [remarks, setRemarks] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState(null);

  // Find selected collection point
  const activePoint = collectionPoints.find(
    (p) => p.point_code.toUpperCase() === pointCode.trim().toUpperCase()
  );

  // Find active category
  const activeCat = categories.find((c) => c.name === selectedCategory) || categories[0];
  const rate = activeCat?.pointsPerKg || 50;
  const numWeight = parseFloat(weight) || 0;
  const estimatedPoints = Math.round(numWeight * rate);

  function handleScanSuccess(scannedCode) {
    setPointCode(scannedCode);
    const found = collectionPoints.find(
      (p) => p.point_code.toUpperCase() === scannedCode.toUpperCase()
    );
    if (found) {
      notify(`Collection point located: ${found.point_name}`);
    } else {
      notify(`Collection point code ${scannedCode} selected.`);
    }
  }

  function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      notify('Deposit photo attached.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!activePoint) {
      notify('Please enter or scan a valid active collection point code.');
      return;
    }
    if (numWeight <= 0) {
      notify('Please enter a valid weight in kilograms (> 0).');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitDeposit({
        pointCode: activePoint.point_code,
        categoryName: selectedCategory,
        weightKg: numWeight,
        remarks,
        proofFile
      });

      setLastSubmitted(result);
      notify(`Deposit request ${result.deposit_code} submitted successfully for collector verification!`);
      // Reset form
      setWeight('2.0');
      setRemarks('');
      setProofFile(null);
      setPreviewUrl(null);
    } catch (err) {
      notify(err.message || 'Error submitting deposit request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Banner
        kicker="DEPOSIT · VERIFY · EARN"
        title="Turn your segregated waste into Green Money."
        desc="Scan a collection point QR, choose waste category, enter estimated weight, and hand over to our field collector for scale verification."
      />

      <div className="steps">
        {[
          '1. Scan Hub QR',
          '2. Select Category',
          '3. Enter Estimate',
          '4. Collector Weighs'
        ].map((x) => (
          <span key={x}>
            <b>✓</b>
            <strong>{x}</strong>
          </span>
        ))}
      </div>

      <div className="depositgrid">
        {/* Step 1: Collection Point */}
        <Panel title="1 · Collection Point" Icon={QrCode}>
          <div className="qr" onClick={() => setIsScannerOpen(true)} style={{ cursor: 'pointer' }}>
            <QrCode size={56} />
            <b>{activePoint ? activePoint.point_name : 'Click to Scan QR'}</b>
            <small>{activePoint ? activePoint.address : 'Point camera at bin / hub QR'}</small>
          </div>

          <label>Collection Point Code</label>
          <input
            value={pointCode}
            onChange={(e) => setPointCode(e.target.value.toUpperCase())}
            placeholder="e.g. CTN-CBE-001"
            className="input"
          />

          {activePoint ? (
            <div style={{ padding: '8px 10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontSize: '10px', fontWeight: 'bold' }}>
                <CheckCircle2 size={13} /> Active Hub: {activePoint.point_name}
              </div>
              <small style={{ fontSize: '9px', color: '#4b5563', display: 'block', marginTop: '2px' }}>
                Hours: {activePoint.operating_hours} · {activePoint.district}
              </small>
            </div>
          ) : (
            <div style={{ padding: '8px 10px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '8px' }}>
              <small style={{ color: '#b91c1c', fontSize: '9px', fontWeight: 600 }}>
                Unverified point code. Click button below to scan camera QR or pick a verified hub.
              </small>
            </div>
          )}

          <button
            type="button"
            className="outline full"
            onClick={() => setIsScannerOpen(true)}
          >
            <Camera size={14} /> Open Camera QR Scanner
          </button>
        </Panel>

        {/* Step 2: Select Waste Category */}
        <Panel title="2 · Waste Category" Icon={Recycle}>
          <div className="wastegrid">
            {categories.map((cat) => (
              <button
                type="button"
                className={selectedCategory === cat.name ? 'chosen' : ''}
                key={cat.id || cat.name}
                onClick={() => setSelectedCategory(cat.name)}
              >
                <b>
                  {cat.icon || '♻'} {cat.name}
                </b>
                <small>{cat.pointsPerKg} pts/kg</small>
              </button>
            ))}
          </div>
          <div className="note" style={{ margin: '10px 0 0' }}>
            <small style={{ fontSize: '9px' }}>
              {selectedCategory === 'E-Waste'
                ? 'Notice: E-waste must be dispatched strictly to authorised recycling partners.'
                : activeCat?.desc || 'Segregate recyclables clean and dry.'}
            </small>
          </div>
        </Panel>

        {/* Step 3: Deposit Details */}
        <Panel title="3 · Deposit Details" Icon={Settings}>
          <label>Estimated weight (kg)</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="input"
          />

          <label>Proof Photograph (Optional)</label>
          <label className="upload" style={{ cursor: 'pointer' }}>
            <Camera size={18} />
            {proofFile ? (
              <span>Photo Attached: {proofFile.name}</span>
            ) : (
              <span>Upload Bag / Container Photo</span>
            )}
            <small>Supports JPEG/PNG/WebP</small>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
            />
          </label>
          {previewUrl && (
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <img
                src={previewUrl}
                alt="Proof Preview"
                style={{ width: '100%', maxHeight: '80px', objectFit: 'cover', borderRadius: '6px' }}
              />
            </div>
          )}

          <label style={{ marginTop: '8px' }}>Citizen Remarks</label>
          <textarea
            placeholder="e.g. 5 PET bottles, dry and sorted"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="input"
            rows="2"
          />
        </Panel>

        {/* Step 4: Estimated Reward & Submit */}
        <Panel title="4 · Estimated Reward" Icon={Gift}>
          <div className="rewardrows">
            <span>
              Waste Category <b>{selectedCategory}</b>
            </span>
            <span>
              Est. Weight <b>{numWeight.toFixed(2)} kg</b>
            </span>
            <span>
              Reward Rate <b>{rate} pts/kg</b>
            </span>
          </div>

          <div className="total">
            Estimated Points <b>{estimatedPoints} pts</b>
          </div>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '9px', marginBottom: '12px' }}>
            <small style={{ fontSize: '9px', color: '#92400e', lineHeight: 1.4, display: 'block' }}>
              <b>IMPORTANT:</b> Points credit occurs only <i>after</i> the on-duty field collector measures actual weight on the calibrated digital scale and the zonal admin approves the deposit.
            </small>
          </div>

          <button
            type="button"
            className="primary full"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting...' : 'Submit Deposit Request'} <ArrowRight size={14} />
          </button>
        </Panel>
      </div>

      {/* Recent Deposits Table */}
      <Panel title="My Recent Deposit Requests" Icon={ReceiptText}>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Deposit Code</th>
                <th>Submitted Date</th>
                <th>Category</th>
                <th>Est. Weight</th>
                <th>Actual Weight</th>
                <th>Est. Points</th>
                <th>Approved Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length ? (
                deposits.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <b>{d.deposit_code}</b>
                      <small style={{ display: 'block', color: '#6b7280' }}>{d.point_code}</small>
                    </td>
                    <td>{d.submitted_at ? new Date(d.submitted_at).toLocaleDateString('en-GB') : 'Today'}</td>
                    <td>{d.category_name}</td>
                    <td>{d.weight_kg ? `${d.weight_kg.toFixed(2)} kg` : '—'}</td>
                    <td>
                      {d.actual_weight_kg ? (
                        <b style={{ color: '#16a34a' }}>{d.actual_weight_kg.toFixed(2)} kg</b>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>Awaiting Scale</span>
                      )}
                    </td>
                    <td>{d.estimated_points} pts</td>
                    <td>
                      {d.approved_points !== null ? (
                        <b style={{ color: '#15803d' }}>+{d.approved_points} pts</b>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <Status s={d.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    <ReceiptText size={24} style={{ margin: '0 auto 6px', color: '#16a34a', opacity: 0.5, display: 'block' }} />
                    No deposit requests yet. Fill in the form above to submit your first waste deposit!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* HTML5 QR Camera Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
}

