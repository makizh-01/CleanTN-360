import React, { useState } from 'react';
import {
  TrendingUp,
  Brain,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  BarChart2,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { useData } from '../../context/DataContext';
import { generateWasteForecasts, MODEL_REGISTRY } from '../../lib/predictiveAnalytics';
import { TN_DISTRICTS_DIRECTORY } from '../../lib/districtData';

export default function PredictiveWasteAnalytics({ notify }) {
  const { deposits } = useData();
  const [selectedDistrict, setSelectedDistrict] = useState('TN-CBE');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [horizonDays, setHorizonDays] = useState(7);

  const forecastData = generateWasteForecasts({
    deposits,
    districtCode: selectedDistrict,
    category: selectedCategory,
    horizonDays
  });

  const currentDistrictObj = TN_DISTRICTS_DIRECTORY.find(d => d.code === selectedDistrict);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(6, 78, 59, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Brain size={28} style={{ color: '#34d399' }} />
              <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
                Predictive Waste Analytics & Forecasting
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                {MODEL_REGISTRY.active_version}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#a7f3d0', maxWidth: '750px', lineHeight: 1.6 }}>
              Time-series forecasting calibrated on verified municipal scale records. Employs chronological cross-validation,
              ridge regularization, and 95% confidence intervals to assist in truck dispatch, depot staging, and recycling capacity planning.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '11px', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase' }}>ML Model Status</div>
            <div style={{ font: '800 16px Manrope', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#34d399" /> Operational Evaluated
            </div>
            <div style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '4px' }}>
              MAE: <b>{MODEL_REGISTRY.evaluation_metrics.mae} kg</b> • R²: <b>{MODEL_REGISTRY.evaluation_metrics.r2}</b>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
              TARGET DISTRICT
            </label>
            <select
              className="select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{ minWidth: '180px', padding: '8px 12px', fontSize: '13px' }}
            >
              {TN_DISTRICTS_DIRECTORY.map(d => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code}) {d.code === 'TN-CBE' ? '⭐ Pilot' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
              WASTE STREAM
            </label>
            <select
              className="select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ minWidth: '140px', padding: '8px 12px', fontSize: '13px' }}
            >
              <option value="All">All Streams Combined</option>
              <option value="Plastic">Plastic Polymers</option>
              <option value="Paper">Paper & Cardboard</option>
              <option value="Metal">Scrap Metal</option>
              <option value="Glass">Glass Containers</option>
              <option value="E-Waste">Electronic Waste</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
              FORECAST HORIZON
            </label>
            <select
              className="select"
              value={horizonDays}
              onChange={(e) => setHorizonDays(Number(e.target.value))}
              style={{ minWidth: '120px', padding: '8px 12px', fontSize: '13px' }}
            >
              <option value={7}>7 Days Ahead</option>
              <option value={14}>14 Days Ahead</option>
              <option value={30}>30 Days Ahead</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Data Policy: <b style={{ color: '#059669' }}>Admin-Approved Verified Records Only</b>
        </div>
      </div>

      {/* Main Forecast Content / Insufficient Data Guard */}
      {!forecastData.hasSufficientData ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '16px'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <AlertTriangle size={28} />
          </div>
          <h2 style={{ margin: '0 0 8px', color: '#92400e', font: '800 20px Manrope' }}>
            Insufficient Historical Data for Machine Learning Forecast
          </h2>
          <p style={{ margin: '0 auto 20px', color: '#b45309', fontSize: '13px', maxWidth: '600px', lineHeight: 1.6 }}>
            <b>{currentDistrictObj?.name || selectedDistrict}</b> is currently an infrastructure rollout standby node.
            In compliance with CleanTN 360 data integrity rules, predictive models require at least 60 verified municipal scale entries
            and are never trained on fictitious or unverified estimates.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setSelectedDistrict('TN-CBE')}
            style={{ borderRadius: '10px', padding: '10px 20px' }}
          >
            Switch to Coimbatore Live Operational Pilot (TN-CBE)
          </button>
        </div>
      ) : (
        <>
          {/* Main Forecast Chart */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', font: '800 18px Manrope', color: '#1e293b' }}>
                  Daily Collection Trajectory (Actual vs. 95% Confidence Forecast)
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Solid green indicates verified scale weighings. Dashed orange indicates model projection with standard error envelope.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '3px', background: '#059669', borderRadius: '2px' }}></span>
                  <b>Historical Actual</b>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '3px', background: '#ea580c', borderRadius: '2px' }}></span>
                  <b>Predicted Weight</b>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '10px', background: 'rgba(234, 88, 12, 0.15)', borderRadius: '2px' }}></span>
                  <b>95% CI Band</b>
                </span>
              </div>
            </div>

            <div style={{ width: '100%', height: '340px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastData.combinedSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit=" kg" />
                  <Tooltip
                    contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', fontSize: '12px' }}
                    formatter={(value, name) => [value ? `${value} kg` : 'N/A', name === 'actual' ? 'Actual Verified' : name === 'predicted' ? 'Predicted' : name]}
                  />
                  {/* Confidence Interval Shaded Area */}
                  <Area
                    type="monotone"
                    dataKey="confidence_upper"
                    stroke="none"
                    fill="#fed7aa"
                    fillOpacity={0.4}
                    name="95% Upper Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="confidence_lower"
                    stroke="none"
                    fill="#ffffff"
                    fillOpacity={1.0}
                    name="95% Lower Bound"
                  />
                  {/* Historical Solid Line */}
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#059669' }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                    name="Actual Verified Weight"
                  />
                  {/* Forecast Dashed Line */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#ea580c"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: '#ea580c' }}
                    activeDot={{ r: 6 }}
                    connectNulls={true}
                    name="Forecasted Weight"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Highlights */}
            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>NEXT 7 DAYS PROJECTED VOLUME</div>
                <div style={{ font: '800 20px Manrope', color: '#0f172a', marginTop: '4px' }}>
                  {forecastData.summary.next7DaysProjectedKg} kg
                </div>
                <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                  {forecastData.summary.trendDirection}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>DAILY MEAN DEMAND</div>
                <div style={{ font: '800 20px Manrope', color: '#0f172a', marginTop: '4px' }}>
                  {forecastData.summary.averageDailyKg} kg/day
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Baseline urban throughput
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>MODEL UNCERTAINTY (RMSE)</div>
                <div style={{ font: '800 20px Manrope', color: '#ea580c', marginTop: '4px' }}>
                  ±{MODEL_REGISTRY.evaluation_metrics.rmse} kg
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Holdout validation error
                </div>
              </div>
            </div>
          </div>

          {/* Waste Category Demand Projections */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px', font: '800 18px Manrope', color: '#1e293b' }}>
              Waste Category Demand Projections & Depot Allocation
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {forecastData.categoryDemandProjection.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: item.category === 'Plastic' ? '#f0fdf4' : item.category === 'E-Waste' ? '#fef3c7' : '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ font: '800 15px Manrope', color: '#1e293b' }}>{item.category}</b>
                    <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: item.demandLevel === 'Surging' ? '#fee2e2' : '#e2e8f0', color: item.demandLevel === 'Surging' ? '#dc2626' : '#334155' }}>
                      {item.demandLevel}
                    </span>
                  </div>
                  <div style={{ font: '800 22px Manrope', color: '#047857', margin: '8px 0 4px' }}>
                    {item.sharePercent}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Weekly Growth: <b style={{ color: '#059669' }}>{item.projectedGrowth}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Registry & Traceability Card */}
          <div className="card" style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldCheck size={18} color="#059669" />
              <h3 style={{ margin: 0, font: '800 14px Manrope', color: '#0f172a' }}>
                Machine Learning Model Registry & Mathematical Transparency
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px', color: '#475569' }}>
              <div>• <b>Version:</b> {MODEL_REGISTRY.active_version}</div>
              <div>• <b>Algorithm:</b> {MODEL_REGISTRY.algorithm}</div>
              <div>• <b>Training Range:</b> {MODEL_REGISTRY.training_period}</div>
              <div>• <b>Samples:</b> {MODEL_REGISTRY.trained_records} verified scale tickets</div>
              <div>• <b>Mean Absolute Error:</b> {MODEL_REGISTRY.evaluation_metrics.mae} kg</div>
              <div>• <b>Coefficient R²:</b> {MODEL_REGISTRY.evaluation_metrics.r2} (Excellent fit)</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
