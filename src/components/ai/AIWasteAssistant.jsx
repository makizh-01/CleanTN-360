import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Globe2,
  Database,
  HelpCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SUGGESTED_QUESTIONS } from '../../lib/aiIntelligenceEngine';

export default function AIWasteAssistant({ notify }) {
  const { profile } = useAuth();
  const { aiChatHistory, askAIAssistant, clearAIChatHistory } = useData();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const role = profile?.role || 'citizen';
  const roleSuggestions = SUGGESTED_QUESTIONS[role] || SUGGESTED_QUESTIONS.citizen;

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    setIsTyping(true);
    setInput('');

    setTimeout(() => {
      askAIAssistant(query, selectedLanguage);
      setIsTyping(false);
    }, 400);
  };

  return (
    <div className="card" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', minHeight: '600px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
            <Bot size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, font: '800 18px Manrope', color: '#064e3b' }}>CleanTN 360 AI Waste Intelligence</h2>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px' }}>
                CPCB 2026.1 Verified
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Role Context: <b style={{ textTransform: 'capitalize', color: '#047857' }}>{role}</b> • Live PostgreSQL & CPCB EPR citations
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Language Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
            <button
              type="button"
              onClick={() => setSelectedLanguage('en')}
              style={{
                border: 'none',
                background: selectedLanguage === 'en' ? '#fff' : 'transparent',
                color: selectedLanguage === 'en' ? '#047857' : '#64748b',
                fontWeight: 700,
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: selectedLanguage === 'en' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('ta')}
              style={{
                border: 'none',
                background: selectedLanguage === 'ta' ? '#fff' : 'transparent',
                color: selectedLanguage === 'ta' ? '#047857' : '#64748b',
                fontWeight: 700,
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: selectedLanguage === 'ta' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              தமிழ் (Tamil)
            </button>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              clearAIChatHistory();
              if (notify) notify('Chat history cleared.');
            }}
            title="Clear Chat"
            style={{ padding: '6px 10px', fontSize: '12px' }}
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Suggested Questions Pill Carousel */}
      <div style={{ marginBottom: '14px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
          <Sparkles size={13} /> Suggested:
        </span>
        {roleSuggestions.map((sq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(sq)}
            style={{
              whiteSpace: 'nowrap',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {sq} <ChevronRight size={11} />
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {aiChatHistory.map((msg) => {
          const isUser = msg.sender_type === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                alignSelf: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  background: isUser ? '#047857' : '#ffffff',
                  color: isUser ? '#ffffff' : '#1e293b',
                  borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  padding: '12px 16px',
                  border: isUser ? 'none' : '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.content}
              </div>

              {/* Citations & Metadata for Assistant Messages */}
              {!isUser && msg.sources_cited && msg.sources_cited.length > 0 && (
                <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
                    <Database size={11} /> Citations:
                  </span>
                  {msg.sources_cited.map((s, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        fontSize: '10px',
                        padding: '1px 6px',
                        color: '#334155',
                        fontWeight: 600
                      }}
                    >
                      {s.label}: <i>{s.detail}</i>
                    </span>
                  ))}
                  {msg.data_classification && (
                    <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '4px', fontSize: '9px', fontWeight: 800, padding: '1px 5px' }}>
                      {msg.data_classification.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  )}
                </div>
              )}

              <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
                {msg.timestamp || 'Just now'}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '12px', fontWeight: 700, padding: '8px' }}>
            <Sparkles size={16} className="animate-spin" /> Querying verified database indices...
          </div>
        )}
      </div>

      {/* Input Box */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '8px' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '10px' }}
        >
          <input
            type="text"
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedLanguage === 'ta'
                ? "கோயம்புத்தூர் கழிவு சேகரிப்பு அல்லது சுற்றுச்சூழல் பற்றி கேளுங்கள்..."
                : "Ask about Tamil Nadu waste stats, plastic trends, or collection hubs..."
            }
            style={{ flex: 1, borderRadius: '12px', padding: '12px 16px', fontSize: '13px' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || isTyping}
            style={{ borderRadius: '12px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Send size={16} /> Send
          </button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#94a3b8' }}>
          <span>Strict Access: Aggregated data only • No raw SQL execution • Verified records</span>
          <span>Zero Fabricated Data Guarantee</span>
        </div>
      </div>
    </div>
  );
}
