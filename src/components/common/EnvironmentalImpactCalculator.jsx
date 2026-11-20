import React, { useState } from 'react';
import {
  Leaf,
  TreePine,
  Droplets,
  Zap,
  Layers,
  Recycle,
  Info,
  BookOpen,
  X,
  FileCheck,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import Stat from './Stat';
import Panel from './Panel';
import { ENVIRONMENTAL_FACTORS } from '../../lib/environmentalFactors';
import { useData } from '../../context/DataContext';

export default function EnvironmentalImpactCalculator() {
  const { environmentalSummary, deposits } = useData();
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  const env = environmentalSummary || {
    totalWeightKg: 0,
    totalCo2OffsetKg: 0,
    totalCo2OffsetTons: 0,
    totalLandfillSavedM3: 0,
    totalTreesSaved: 0,
    totalWaterSavedLiters: 0,
    totalEnergySavedKwh: 0,
    categoryBreakdown: {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Methodology Alert Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1px solid #86efac',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Leaf size={22} style={{ color: '#15803d', flexShrink: 0 }} />
          <div>
            <b style={{ display: 'block', fontSize: '13px', color: '#14532d' }}>
              Standard Environmental Impact Accounting Model ({ENVIRONMENTAL_FACTORS.version})
            </b>
            <small style={{ color: '#166534', fontSize: '11px' }}>
              Formulas calibrated to Central Pollution Control Board (CPCB) India EPR standards and IPCC Solid Waste Guidelines.
            </small>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMethodologyOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid #16a34a',
            background: '#ffffff',
            color: '#15803d',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          <BookOpen size={13} /> View Calculation Methodology & Standards
        </button>
      </div>

      {/* Primary Impact Indicators Grid */}
      <div className="stats four" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <Stat
          Icon={Recycle}
          label="Total Waste Diverted"
          value={`${env.totalWeightKg.toLocaleString()} kg`}
        />
        <Stat
          Icon={Leaf}
          label="Est. CO₂ Offset"
          value={`${env.totalCo2OffsetTons} tons`}
          tone="emerald"
        />
        <Stat
          Icon={Layers}
          label="Est. Landfill Space Saved"
          value={`${env.totalLandfillSavedM3} m³`}
          tone="purple"
        />
        <Stat
          Icon={TreePine}
          label="Est. Tree Absorption Equivalent"
          value={`${env.totalTreesSaved} trees`}
          tone="blue"
        />
      </div>

      {/* Secondary Resource Conservation Metrics */}
      <div className="grid2">
        <Panel title="Secondary Resource Recovery & Savings" Icon={Zap}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', marginBottom: '6px' }}>
                <Droplets size={18} />
                <span style={{ fontSize: '11px', fontWeight: 800 }}>Water Conserved</span>
              </div>
              <strong style={{ font: '800 22px Manrope', color: '#0f172a' }}>
                {env.totalWaterSavedLiters.toLocaleString()}
              </strong>
              <small style={{ display: 'block', color: '#64748b', fontSize: '10px', marginTop: '2px' }}>
                Liters saved vs virgin material processing
              </small>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', marginBottom: '6px' }}>
                <Zap size={18} />
                <span style={{ fontSize: '11px', fontWeight: 800 }}>Energy Conserved</span>
              </div>
              <strong style={{ font: '800 22px Manrope', color: '#0f172a' }}>
                {env.totalEnergySavedKwh.toLocaleString()}
              </strong>
              <small style={{ display: 'block', color: '#64748b', fontSize: '10px', marginTop: '2px' }}>
                kWh electrical energy saved in remanufacturing
              </small>
            </div>
          </div>
        </Panel>

        <Panel title="Data Governance & Integrity Rules" Icon={ShieldCheck}>
          <div style={{ fontSize: '11px', color: '#334155', lineHeight: 1.5, display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Verified Actual Weight Only:</strong> Zero points or carbon offsets are credited based on citizen estimates; all inputs stem from calibrated digital field scales.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Transparent Estimation Labels:</strong> All ecological offsets are explicitly classified as defensive estimations based on peer-reviewed CPCB / IPCC life-cycle coefficients.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Zero Double-Counting:</strong> Verified municipal scale receipts are immutably tied to single ledger records.</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Methodology Inspector Modal */}
      {isMethodologyOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 99999 }}
          onClick={() => setIsMethodologyOpen(false)}
        >
          <div
            className="modal-card"
            style={{ maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <b style={{ font: '800 16px Manrope', color: '#0b3d25' }}>
                  Documented Environmental Emission Factors
                </b>
                <small style={{ display: 'block', color: '#16a34a', fontSize: '10px', fontWeight: 700 }}>
                  Authority: {ENVIRONMENTAL_FACTORS.authority} ({ENVIRONMENTAL_FACTORS.version})
                </small>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsMethodologyOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '14px', fontSize: '11px' }}>
              {Object.values(ENVIRONMENTAL_FACTORS.categories).map((cat) => (
                <div
                  key={cat.category}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <b style={{ fontSize: '13px', color: '#0b3d25' }}>{cat.category} Waste Stream</b>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                      {cat.co2OffsetPerKg} kg CO₂e / kg
                    </span>
                  </div>

                  <p style={{ margin: '0 0 6px', color: '#475569', lineHeight: 1.4 }}>
                    <strong>Methodology:</strong> {cat.methodology}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#64748b', borderTop: '1px solid #edf2f7', paddingTop: '6px' }}>
                    <span><strong>Source:</strong> {cat.source}</span>
                    <span>Landfill: {cat.landfillVolumeSavedM3PerKg} m³/kg</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button
                type="button"
                className="primary"
                onClick={() => setIsMethodologyOpen(false)}
              >
                Close Methodology
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
