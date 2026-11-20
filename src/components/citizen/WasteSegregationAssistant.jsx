import React, { useState } from 'react';
import {
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { classifyWasteImage, WASTE_STREAM_GUIDES } from '../../lib/wasteVisionClassifier';

export default function WasteSegregationAssistant({ notify }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);
  const [activeTabCategory, setActiveTabCategory] = useState('Plastic');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setClassificationResult(null);
      runClassification(file);
    }
  };

  const runClassification = async (file) => {
    setIsAnalyzing(true);
    try {
      const result = await classifyWasteImage(file);
      setClassificationResult(result);
      setActiveTabCategory(result.category);
      if (notify) notify(`AI Vision identified: ${result.category} (${result.confidencePercentage} confidence)!`);
    } catch (err) {
      console.error(err);
      if (notify) notify('Failed to process image classification.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentGuide = WASTE_STREAM_GUIDES[activeTabCategory] || WASTE_STREAM_GUIDES.Plastic;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(4, 120, 87, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Sparkles size={28} style={{ color: '#34d399' }} />
          <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
            AI Waste Segregation Assistant (செயற்கை நுண்ணறிவு வழிகாட்டி)
          </h1>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
            Computer Vision 5.0
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#a7f3d0', maxWidth: '800px', lineHeight: 1.6 }}>
          Not sure which waste category your item belongs to? Take a quick photo or upload an image.
          Our trained visual segregation engine classifies your waste, provides Tamil and English cleaning instructions,
          and shows accepted vs. rejected municipal items.
        </p>
      </div>

      {/* Main Upload & Inference Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Upload Card */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ margin: '0 0 16px', font: '800 16px Manrope', color: '#1e293b' }}>
            1. Upload or Capture Waste Photograph
          </h2>

          <label
            style={{
              border: '2px dashed #bbf7d0',
              borderRadius: '16px',
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#f0fdf4',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            {previewUrl ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={previewUrl}
                  alt="Waste Preview"
                  style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '10px', objectFit: 'contain' }}
                />
                <span style={{ display: 'block', fontSize: '11px', color: '#047857', fontWeight: 700, marginTop: '8px' }}>
                  Click to replace image
                </span>
              </div>
            ) : (
              <>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'grid', placeItems: 'center' }}>
                  <Camera size={26} />
                </div>
                <div>
                  <b style={{ color: '#064e3b', fontSize: '14px' }}>Click to take a photo or select image</b>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                    Supports PNG, JPG, WEBP (Max 10MB)
                  </p>
                </div>
              </>
            )}
          </label>

          {isAnalyzing && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#ecfdf5', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#047857', fontSize: '13px', fontWeight: 700 }}>
              <RefreshCw size={18} className="animate-spin" />
              Running Computer Vision feature extraction...
            </div>
          )}

          {/* Regulatory Safeguard Notice */}
          <div style={{ marginTop: '20px', padding: '12px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fef3c7', display: 'flex', gap: '10px', fontSize: '11px', color: '#92400e', lineHeight: 1.5 }}>
            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
            <div>
              <b>Mandatory Scale Policy:</b> AI classification is advisory only. Green Money rewards are officially issued only after physical weighing by an authorized municipal collector at a Smart Hub.
            </div>
          </div>
        </div>

        {/* Inference Results Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, font: '800 16px Manrope', color: '#1e293b' }}>
              2. Classification & Segregation Guidelines
            </h2>
            {classificationResult && (
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px' }}>
                {classificationResult.confidencePercentage} Confidence
              </span>
            )}
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
            {Object.keys(WASTE_STREAM_GUIDES).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTabCategory(cat)}
                style={{
                  border: 'none',
                  background: activeTabCategory === cat ? '#047857' : '#f1f5f9',
                  color: activeTabCategory === cat ? '#ffffff' : '#475569',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {WASTE_STREAM_GUIDES[cat].icon} {cat}
              </button>
            ))}
          </div>

          {/* Guide Details */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <b style={{ font: '800 16px Manrope', color: '#0f172a' }}>{currentGuide.tamilName}</b>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{currentGuide.description}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Reward Rate:</span>
                <div style={{ font: '800 14px Manrope', color: '#047857' }}>
                  {currentGuide.rewardPointsPerKg} pts/kg ({currentGuide.rupeeEquivalentPerKg})
                </div>
              </div>
            </div>

            {/* Tamil & English Instructions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', marginBottom: '4px' }}>
                  தமிழ் வழிமுறைகள்:
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                  {currentGuide.tamilInstructions}
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', marginBottom: '4px' }}>
                  English Instructions:
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                  {currentGuide.englishInstructions}
                </p>
              </div>
            </div>

            {/* Accepted vs Rejected Checklists */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <b style={{ fontSize: '12px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <CheckCircle2 size={14} /> Accepted Items:
                </b>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#475569', lineHeight: 1.6 }}>
                  {currentGuide.acceptedMaterials.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>

              <div>
                <b style={{ fontSize: '12px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <XCircle size={14} /> Rejected / Ineligible:
                </b>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#475569', lineHeight: 1.6 }}>
                  {currentGuide.rejectedMaterials.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
