import React, { useState } from 'react';
import {
  Users,
  Calendar,
  MapPin,
  Award,
  Plus,
  CheckCircle2,
  HeartHandshake,
  Download,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export default function CommunityNetworkPage({ notify }) {
  const { profile, role } = useAuth();
  const {
    communityEvents,
    communityPartners,
    registerForCommunityEvent,
    createCommunityEvent
  } = useData();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [certEvent, setCertEvent] = useState(null);
  const [evForm, setEvForm] = useState({
    event_title: '',
    organizer_type: 'NGO',
    organizer_name: '',
    district: 'Coimbatore',
    event_date: '2026-12-12',
    venue_name: '',
    target_volunteers: 100,
    waste_stream_focus: 'Plastic & Packaging',
    hours_credit: 4.0,
    description: ''
  });

  const isAdmin = role === 'admin' || role === 'state_admin';

  const handleCreate = (e) => {
    e.preventDefault();
    if (!evForm.event_title.trim() || !evForm.organizer_name.trim()) return;
    createCommunityEvent(evForm);
    if (notify) notify(`Community event "${evForm.event_title}" published statewide!`);
    setIsCreateOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #047857 0%, #15803d 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(4, 120, 87, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <HeartHandshake size={28} style={{ color: '#fef08a' }} />
              <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
                Tamil Nadu Community & Environmental Awareness Network
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#dcfce7', maxWidth: '780px', lineHeight: 1.6 }}>
              Statewide network uniting NGOs, College Eco-Clubs, schools, and civic volunteers for river cleanups, e-waste drives, and zero-waste awareness campaigns with verified volunteer certificates.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsCreateOpen(true)}
              style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#1e293b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Create Cleanup Event
            </button>
          )}
        </div>
      </div>

      {/* Upcoming & Completed Events */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {communityEvents.map(ev => {
          const pct = Math.min(100, Math.round((ev.registered_volunteers_count / Math.max(1, ev.target_volunteers)) * 100));
          const isCompleted = ev.status === 'completed';

          return (
            <div key={ev.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ background: '#ecfdf5', color: '#047857', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                    {ev.organizer_type.replace(/_/g, ' ')} • {ev.district}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '8px', background: isCompleted ? '#e2e8f0' : '#dcfce7', color: isCompleted ? '#475569' : '#15803d' }}>
                    {ev.status.toUpperCase()}
                  </span>
                </div>

                <h3 style={{ margin: '4px 0', font: '800 16px Manrope', color: '#0f172a' }}>{ev.event_title}</h3>
                <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700, marginBottom: '8px' }}>
                  Organizer: {ev.organizer_name}
                </div>
                <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>{ev.description}</p>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '11px', color: '#334155', display: 'grid', gap: '4px', marginBottom: '12px' }}>
                  <div><Calendar size={12} style={{ display: 'inline' }} /> Date: <b>{ev.event_date}</b> ({ev.hours_credit} Volunteer Hours)</div>
                  <div><MapPin size={12} style={{ display: 'inline' }} /> Venue: {ev.venue_name}</div>
                  <div>Focus Stream: <b>{ev.waste_stream_focus}</b></div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: '#475569' }}>
                    <span>Registered Volunteers: <b>{ev.registered_volunteers_count} / {ev.target_volunteers}</b></span>
                    <b>{pct}%</b>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                {ev.isUserRegistered ? (
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={15} /> Registered
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Open for Citizens & Students</span>
                )}

                {ev.isUserRegistered ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setCertEvent(ev)}
                    style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Award size={13} /> Volunteer Certificate
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isCompleted}
                    onClick={() => {
                      registerForCommunityEvent(ev.id);
                      if (notify) notify(`Registered for "${ev.event_title}"!`);
                    }}
                    style={{ fontSize: '11px', padding: '6px 14px' }}
                  >
                    Register as Volunteer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Verified NGO & College Partners */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ margin: '0 0 14px', font: '800 18px Manrope', color: '#1e293b' }}>
          Verified NGO & College Eco-Club Partners
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {communityPartners.map(p => (
            <div key={p.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ font: '800 14px Manrope', color: '#0f172a' }}>{p.name}</b>
                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px' }}>VERIFIED</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                {p.type} • {p.district}
              </div>
              <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700, marginTop: '6px' }}>
                {p.volunteers_mobilized} Active Volunteers Mobilized
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      {isCreateOpen && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px', font: '800 18px Manrope', color: '#0f172a' }}>
              Create Statewide Community Cleanup Event
            </h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '10px' }}>
              <input className="input" required placeholder="Event Title" value={evForm.event_title} onChange={e => setEvForm({ ...evForm, event_title: e.target.value })} style={{ padding: '8px 12px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select className="select" value={evForm.organizer_type} onChange={e => setEvForm({ ...evForm, organizer_type: e.target.value })} style={{ padding: '8px 12px' }}>
                  <option value="NGO">NGO</option>
                  <option value="College_Eco_Club">College Eco-Club</option>
                  <option value="Municipality">Municipality</option>
                </select>
                <input className="input" required placeholder="Organizer Name" value={evForm.organizer_name} onChange={e => setEvForm({ ...evForm, organizer_name: e.target.value })} style={{ padding: '8px 12px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input className="input" required placeholder="District (e.g. Coimbatore)" value={evForm.district} onChange={e => setEvForm({ ...evForm, district: e.target.value })} style={{ padding: '8px 12px' }} />
                <input type="date" className="input" required value={evForm.event_date} onChange={e => setEvForm({ ...evForm, event_date: e.target.value })} style={{ padding: '8px 12px' }} />
              </div>
              <input className="input" required placeholder="Venue / Location" value={evForm.venue_name} onChange={e => setEvForm({ ...evForm, venue_name: e.target.value })} style={{ padding: '8px 12px' }} />
              <textarea className="input" rows={2} placeholder="Event objective & instructions" value={evForm.description} onChange={e => setEvForm({ ...evForm, description: e.target.value })} style={{ padding: '8px 12px' }} />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Volunteer Certificate Modal */}
      {certEvent && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '560px', padding: '32px', textAlign: 'center', border: '6px solid #86efac', borderRadius: '20px' }}>
            <Award size={44} color="#15803d" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              CleanTN 360 • Tamil Nadu Civic Awareness Network
            </div>
            <h2 style={{ margin: '8px 0 14px', font: '800 22px Manrope', color: '#064e3b' }}>
              Volunteer Participation Certificate
            </h2>
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, marginBottom: '18px' }}>
              Presented to <b>{profile?.full_name || 'Citizen Member'}</b> for active civic participation in <b>{certEvent.event_title}</b> organized by <b>{certEvent.organizer_name}</b> ({certEvent.district}) — credited with <b>{certEvent.hours_credit} Environmental Service Hours</b>.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button type="button" className="btn btn-outline" onClick={() => setCertEvent(null)}>Close</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (notify) notify('Volunteer certificate downloaded!');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} /> Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
