import React, { useState } from 'react';
import {
  Factory,
  ShieldCheck,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Truck,
  FileCheck2,
  MapPin,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export default function RecyclerMarketplace({ notify }) {
  const { role } = useAuth();
  const {
    recyclerPartners,
    handoverRecords,
    collectionPoints,
    registerRecyclerPartner,
    verifyRecyclerPartner,
    createWasteHandover,
    verifyWasteHandover
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

  const [regForm, setRegForm] = useState({
    company_name: '',
    registration_number: '',
    cpcb_authorization_id: '',
    district: 'Coimbatore',
    facility_address: '',
    contact_person: '',
    phone: '',
    email: '',
    daily_capacity_tons: 10,
    accepted_waste_types: ['Plastic', 'Paper']
  });

  const [handoverForm, setHandoverForm] = useState({
    pointName: 'Saibaba Colony Smart Hub',
    recyclerId: recyclerPartners[0]?.id || '',
    wasteCategory: 'Plastic',
    weightKg: 50
  });

  const isAdmin = role === 'admin' || role === 'state_admin';

  const filteredRecyclers = recyclerPartners.filter(r => {
    const matchesSearch =
      r.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cpcb_authorization_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      filterCategory === 'All' || (r.accepted_waste_types || []).includes(filterCategory);
    return matchesSearch && matchesCat;
  });

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    registerRecyclerPartner(regForm);
    if (notify) notify(`Recycler "${regForm.company_name}" submitted for TNPCB/Admin verification.`);
    setIsRegisterModalOpen(false);
  };

  const handleHandoverSubmit = (e) => {
    e.preventDefault();
    const targetRec = recyclerPartners.find(r => r.id === handoverForm.recyclerId);
    if (!targetRec || targetRec.verification_status !== 'verified_approved') {
      if (notify) notify('Error: Waste handover is strictly restricted to verified & approved recyclers.');
      return;
    }
    if (handoverForm.wasteCategory === 'E-Waste' && !(targetRec.accepted_waste_types || []).includes('E-Waste')) {
      if (notify) notify('CPCB Regulatory Block: Selected facility is NOT authorized to receive hazardous E-Waste!');
      return;
    }

    const rec = createWasteHandover(handoverForm);
    if (notify) notify(`Handover ${rec.handover_code} dispatched with Certificate ${rec.certificate_hash}.`);
    setIsHandoverModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(6, 95, 70, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Factory size={28} style={{ color: '#6ee7b7' }} />
              <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
                Authorized Recycler Marketplace & Handover Registry
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                CPCB EPR Verified
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#d1fae5', maxWidth: '780px', lineHeight: 1.6 }}>
              Verified circular-economy network connecting CleanTN 360 collection hubs directly with TNPCB/CPCB-authorized recyclers. Enforces strict hazardous E-Waste compliance and cryptographic handover certificates.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsRegisterModalOpen(true)}
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <Plus size={15} /> Register Recycler
            </button>
            {(isAdmin || role === 'collector') && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsHandoverModalOpen(true)}
                style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#1e293b', fontWeight: 800 }}
              >
                <Truck size={15} /> Initiate Waste Handover
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Category Filters */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '240px', flex: 1, maxWidth: '380px' }}>
            <input
              type="text"
              className="input"
              placeholder="Search recycler, district, or CPCB license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 12px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['All', 'Plastic', 'Paper', 'Metal', 'Glass', 'Organic', 'E-Waste'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                style={{
                  border: 'none',
                  background: filterCategory === cat ? '#047857' : '#f1f5f9',
                  color: filterCategory === cat ? '#ffffff' : '#475569',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Authorized Recycler Directory Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {filteredRecyclers.map(rec => {
          const isApproved = rec.verification_status === 'verified_approved';
          const isPending = rec.verification_status === 'pending_verification';

          return (
            <div key={rec.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#047857' }}>{rec.cpcb_authorization_id}</span>
                    <h3 style={{ margin: '2px 0 0', font: '800 15px Manrope', color: '#0f172a' }}>{rec.company_name}</h3>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      <MapPin size={11} style={{ display: 'inline' }} /> {rec.district} • Capacity: <b>{rec.daily_capacity_tons} TPD</b>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: isApproved ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                      color: isApproved ? '#15803d' : isPending ? '#b45309' : '#dc2626',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {rec.verification_status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#475569', margin: '10px 0' }}>
                  {rec.facility_address}
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {(rec.accepted_waste_types || []).map(wt => (
                    <span key={wt} style={{ background: wt === 'E-Waste' ? '#fef3c7' : '#ecfdf5', color: wt === 'E-Waste' ? '#b45309' : '#047857', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                      {wt}
                    </span>
                  ))}
                </div>

                <div style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div>TNPCB Reg: <b>{rec.registration_number}</b></div>
                  <div>Contact: {rec.contact_person} • {rec.phone}</div>
                </div>
              </div>

              {isAdmin && isPending && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      verifyRecyclerPartner(rec.id, 'rejected');
                      if (notify) notify(`Recycler ${rec.company_name} registration rejected.`);
                    }}
                    style={{ fontSize: '11px', color: '#dc2626', borderColor: '#fca5a5' }}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      verifyRecyclerPartner(rec.id, 'verified_approved');
                      if (notify) notify(`Recycler ${rec.company_name} verified and activated!`);
                    }}
                    style={{ fontSize: '11px' }}
                  >
                    Approve CPCB Facility
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verified Waste Handover Ledger */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ margin: '0 0 14px', font: '800 18px Manrope', color: '#1e293b' }}>
          Chain-of-Custody Waste Handover Records
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {handoverRecords.map(ho => (
            <div key={ho.id} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <b style={{ color: '#0f172a' }}>{ho.handover_code}</b>
                  <span style={{ background: '#ecfdf5', color: '#047857', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                    {ho.waste_category} • {ho.weight_kg} kg
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>
                  From: <b>{ho.point_name}</b> → To: <b>{ho.recycler_name}</b>
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', marginTop: '3px' }}>
                  Certificate: {ho.certificate_hash}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '8px', background: ho.handover_status === 'received_verified' ? '#dcfce7' : '#dbeafe', color: ho.handover_status === 'received_verified' ? '#15803d' : '#1d4ed8' }}>
                  {ho.handover_status.replace(/_/g, ' ').toUpperCase()}
                </span>
                {isAdmin && ho.handover_status !== 'received_verified' && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      verifyWasteHandover(ho.id);
                      if (notify) notify(`Handover ${ho.handover_code} verified & sealed in recycling ledger.`);
                    }}
                    style={{ fontSize: '11px', padding: '5px 10px' }}
                  >
                    Verify Receipt
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Register Recycler Modal */}
      {isRegisterModalOpen && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px', font: '800 18px Manrope', color: '#0f172a' }}>
              Register Authorized Recycling Facility
            </h3>
            <form onSubmit={handleRegisterSubmit} style={{ display: 'grid', gap: '10px' }}>
              <input className="input" required placeholder="Organization / Facility Name" value={regForm.company_name} onChange={e => setRegForm({ ...regForm, company_name: e.target.value })} style={{ padding: '8px 12px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input className="input" required placeholder="TNPCB Reg Number" value={regForm.registration_number} onChange={e => setRegForm({ ...regForm, registration_number: e.target.value })} style={{ padding: '8px 12px' }} />
                <input className="input" required placeholder="CPCB Authorization ID" value={regForm.cpcb_authorization_id} onChange={e => setRegForm({ ...regForm, cpcb_authorization_id: e.target.value })} style={{ padding: '8px 12px' }} />
              </div>
              <input className="input" required placeholder="Facility Address" value={regForm.facility_address} onChange={e => setRegForm({ ...regForm, facility_address: e.target.value })} style={{ padding: '8px 12px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input className="input" required placeholder="Authorized Contact Name" value={regForm.contact_person} onChange={e => setRegForm({ ...regForm, contact_person: e.target.value })} style={{ padding: '8px 12px' }} />
                <input className="input" required placeholder="Phone Number" value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} style={{ padding: '8px 12px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsRegisterModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit for Admin Verification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Handover Modal */}
      {isHandoverModalOpen && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px', font: '800 18px Manrope', color: '#0f172a' }}>
              Create Certified Waste Handover
            </h3>
            <form onSubmit={handleHandoverSubmit} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>ORIGIN COLLECTION HUB</label>
                <select className="select" value={handoverForm.pointName} onChange={e => setHandoverForm({ ...handoverForm, pointName: e.target.value })} style={{ width: '100%', padding: '8px 12px' }}>
                  {collectionPoints.map(cp => <option key={cp.id} value={cp.point_name}>{cp.point_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>AUTHORIZED RECYCLER PARTNER</label>
                <select className="select" value={handoverForm.recyclerId} onChange={e => setHandoverForm({ ...handoverForm, recyclerId: e.target.value })} style={{ width: '100%', padding: '8px 12px' }}>
                  {recyclerPartners.filter(r => r.verification_status === 'verified_approved').map(r => (
                    <option key={r.id} value={r.id}>{r.company_name} ({r.accepted_waste_types.join(', ')})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>WASTE CATEGORY</label>
                  <select className="select" value={handoverForm.wasteCategory} onChange={e => setHandoverForm({ ...handoverForm, wasteCategory: e.target.value })} style={{ width: '100%', padding: '8px 12px' }}>
                    {['Plastic', 'Paper', 'Metal', 'Glass', 'Organic', 'E-Waste'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>WEIGHT (KG)</label>
                  <input type="number" step="0.5" min="1" className="input" value={handoverForm.weightKg} onChange={e => setHandoverForm({ ...handoverForm, weightKg: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsHandoverModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Handover Certificate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
