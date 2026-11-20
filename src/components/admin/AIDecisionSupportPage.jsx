import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin,
  Users,
  Database,
  Filter
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function AIDecisionSupportPage({ notify }) {
  const { aiRecommendations, updateAIRecommendation } = useData();
  const [selectedRec, setSelectedRec] = useState(null);
  const [responseTextInput, setResponseTextInput] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const filteredRecs = aiRecommendations.filter(r => {
    if (filterCategory === 'ALL') return true;
    return r.category.toLowerCase() === filterCategory.toLowerCase();
  });

  const handleUpdateStatus = (recId, status) => {
    updateAIRecommendation(recId, status, responseTextInput || 'Updated by administrative authority.');
    if (notify) notify(`AI recommendation marked as: ${status.toUpperCase()}!`);
    setSelectedRec(null);
    setResponseTextInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(30, 27, 75, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Brain size={28} style={{ color: '#a5b4fc' }} />
              <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
                AI Admin Decision Support & Policy Advisory
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                Advisory Only
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#c7d2fe', maxWidth: '750px', lineHeight: 1.6 }}>
              Evidence-based administrative recommendations derived from continuous cross-district ledger analysis.
              Highlights capacity bottlenecks, collector scheduling mismatches, and infrastructure expansion priorities.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '11px', color: '#c7d2fe', fontWeight: 700 }}>PENDING ADVISORIES</div>
            <div style={{ font: '800 22px Manrope', color: '#ffffff', marginTop: '2px' }}>
              {aiRecommendations.filter(r => r.status === 'pending').length} Actions Required
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Legal Disclaimer */}
      <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#92400e' }}>
        <ShieldAlert size={20} style={{ flexShrink: 0, color: '#d97706' }} />
        <div>
          <b>Statutory Governance Notice:</b> In strict accordance with CleanTN 360 Phase 5 architecture rules, AI recommendations are strictly advisory and traceable to supporting database metrics. The AI cannot independently enact municipal orders, shift budgets, or modify civil infrastructure.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Advisory Category:</span>
          {['ALL', 'Expansion', 'Collector_Allocation', 'Data_Quality', 'Recycling'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              style={{
                border: 'none',
                background: filterCategory === cat ? '#312e81' : '#f1f5f9',
                color: filterCategory === cat ? '#ffffff' : '#475569',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Showing <b>{filteredRecs.length}</b> traceable recommendations
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredRecs.map((rec) => {
          const isPending = rec.status === 'pending';
          const isAccepted = rec.status === 'accepted';
          const isUnderReview = rec.status === 'under_review';
          const isRejected = rec.status === 'rejected';

          return (
            <div
              key={rec.id}
              className="card"
              style={{
                padding: '24px',
                border: isAccepted ? '1px solid #86efac' : isUnderReview ? '1px solid #fef08a' : '1px solid #e2e8f0',
                background: isAccepted ? '#f0fdf4' : isUnderReview ? '#fffbeb' : '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>{rec.recommendation_code}</span>
                    <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                      {rec.category.replace(/_/g, ' ')}
                    </span>
                    <span style={{ background: rec.priority === 'critical' ? '#fee2e2' : rec.priority === 'high' ? '#ffedd5' : '#e0e7ff', color: rec.priority === 'critical' ? '#dc2626' : rec.priority === 'high' ? '#c2410c' : '#3730a3', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <h3 style={{ margin: 0, font: '800 17px Manrope', color: '#0f172a' }}>
                    {rec.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Target District: <b>{rec.district_name} ({rec.district_code})</b> • Source: {rec.source_period}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      background: isAccepted ? '#dcfce7' : isUnderReview ? '#fef3c7' : isRejected ? '#fee2e2' : '#f1f5f9',
                      color: isAccepted ? '#15803d' : isUnderReview ? '#b45309' : isRejected ? '#dc2626' : '#475569',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}
                  >
                    STATUS: {rec.status.toUpperCase().replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Description & Suggested Action */}
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                {rec.description}
              </p>

              <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                <b style={{ fontSize: '11px', color: '#047857', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  💡 Suggested Administrative Action:
                </b>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
                  {rec.suggested_action}
                </div>
              </div>

              {/* Supporting Metrics Citations */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Database size={13} /> Supporting DB Metrics:
                </span>
                {Object.entries(rec.supporting_metrics).map(([k, v]) => (
                  <span key={k} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', padding: '2px 8px', color: '#334155' }}>
                    {k.replace(/_/g, ' ')}: <b>{String(v)}</b>
                  </span>
                ))}
              </div>

              {/* Admin Response Note */}
              {rec.admin_response && (
                <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: '#334155', marginBottom: '14px' }}>
                  <b>Administrative Log:</b> {rec.admin_response}
                </div>
              )}

              {/* Action Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSelectedRec(rec)}
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                >
                  Review & Respond
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Response Modal */}
      {selectedRec && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 10px', font: '800 18px Manrope', color: '#1e293b' }}>
              Administrative Action: {selectedRec.recommendation_code}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              {selectedRec.title}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Official Administrative Comment:
              </label>
              <textarea
                className="input"
                rows={3}
                value={responseTextInput}
                onChange={(e) => setResponseTextInput(e.target.value)}
                placeholder="Enter formal justification or execution directive..."
                style={{ width: '100%', padding: '10px' }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedRec(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleUpdateStatus(selectedRec.id, 'rejected')}
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              >
                Reject Advisory
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleUpdateStatus(selectedRec.id, 'under_review')}
                style={{ color: '#d97706', borderColor: '#fef08a' }}
              >
                Mark Under Review
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleUpdateStatus(selectedRec.id, 'accepted')}
                style={{ background: '#10b981', borderColor: '#10b981' }}
              >
                Accept & Implement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
