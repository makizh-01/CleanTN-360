import React, { useState } from 'react';
import {
  CircleHelp,
  MessageCircle,
  FileText,
  Clock3,
  ChevronDown,
  Phone,
  Mail,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Banner from '../common/Banner';
import Stat from '../common/Stat';
import Panel from '../common/Panel';
import Status from '../common/Status';
import { useData } from '../../context/DataContext';

export default function HelpSupportPage({ notify }) {
  const { tickets, createSupportTicket } = useData();

  const [faqOpen, setFaqOpen] = useState(0);
  const [category, setCategory] = useState('Wallet & Points');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    [
      'How does the waste deposit workflow work?',
      'Bring segregated dry or wet recyclables to your nearest CleanTN 360 collection hub. Scan the hub QR code in the app, select category and estimated weight, and hand over the waste. The field collector will measure the exact weight on the calibrated digital scale and upload photos for zonal administrative approval.'
    ],
    [
      'When are Green Money wallet points credited?',
      'Points are credited immediately after the Zonal Admin reviews and approves the collector’s verified weight and scale photograph. This prevents duplicate submissions and ensures reward integrity.'
    ],
    [
      'What is the Green Money points conversion rate?',
      'Under the current municipal pilot scheme, 100 points = ₹1.00 INR. Points can be redeemed for simulated instant UPI payouts, saplings at government nurseries, or donated to Green Tamil Nadu tree-planting missions.'
    ],
    [
      'Where can I deposit obsolete electronic waste (E-Waste)?',
      'E-Waste carries our highest incentive (100 points/kg) but must only be dropped off at authorized partner collection hubs (such as Peelamedu Tech Hub in Coimbatore or T. Nagar Civic Center in Chennai) to prevent hazardous landfill contamination.'
    ],
    [
      'Why does my deposit status show "Collector Verified"?',
      'This means the sanitation worker has weighed your waste on the digital scale and confirmed the category. It is now awaiting final administrative approval before wallet points are credited.'
    ]
  ];

  async function handleTicketSubmit(e) {
    e.preventDefault();
    if (!description.trim()) {
      notify('Please describe your issue before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const newTkt = await createSupportTicket({
        category,
        subject: subject.trim() || `${category} Query`,
        description: description.trim()
      });
      notify(`Support ticket ${newTkt.ticket_code} created successfully! Our team will respond shortly.`);
      setSubject('');
      setDescription('');
    } catch (err) {
      notify(err.message || 'Error submitting ticket.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Banner
        kicker="HELP · GUIDES · CITIZEN GRIEVANCE"
        title="We're here to assist your green journey."
        desc="Browse frequently asked questions, learn how collection hubs operate, or lodge a formal support grievance."
      />

      <div className="stats four">
        <Stat Icon={CircleHelp} label="FAQ Topics" value="5 Core Guides" />
        <Stat
          Icon={MessageCircle}
          label="My Support Tickets"
          value={tickets.length}
          tone="purple"
        />
        <Stat
          Icon={FileText}
          label="Response SLA"
          value="< 24 Hours"
          tone="amber"
        />
        <Stat
          Icon={Clock3}
          label="Helpdesk Hours"
          value="8 AM – 8 PM"
          tone="blue"
        />
      </div>

      <div className="grid2">
        <Panel title="Frequently Asked Questions" Icon={CircleHelp}>
          {faqs.map(([q, a], i) => (
            <div className="faq" key={q}>
              <button
                type="button"
                onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}
              >
                {q}
                <ChevronDown size={14} style={{ transform: faqOpen === i ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>
              {faqOpen === i && <p>{a}</p>}
            </div>
          ))}
        </Panel>

        <Panel title="Raise a Formal Grievance / Ticket" Icon={MessageCircle}>
          <form onSubmit={handleTicketSubmit}>
            <label>Issue Category</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Wallet & Points">Wallet & Points Ledger</option>
              <option value="Deposit Waste">Deposit Waste & Scale Discrepancy</option>
              <option value="Collection Points">Collection Hub Operations</option>
              <option value="Login & Account">Citizen Account & Authentication</option>
              <option value="Other">Other Community Query</option>
            </select>

            <label>Subject</label>
            <input
              type="text"
              className="input"
              placeholder="Brief summary of your query"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <label>Detailed Description *</label>
            <textarea
              className="input"
              rows="4"
              required
              placeholder="Provide deposit codes or relevant details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              type="submit"
              disabled={submitting}
              className="primary full"
            >
              {submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'} <Send size={14} />
            </button>
          </form>
        </Panel>
      </div>

      {/* Citizen's Tickets History */}
      <Panel title="My Raised Tickets & Status Tracking" Icon={FileText}>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Ticket Code</th>
                <th>Date</th>
                <th>Category</th>
                <th>Subject / Query</th>
                <th>Status</th>
                <th>Admin Response</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length ? (
                tickets.map((t) => (
                  <tr key={t.id}>
                    <td><b>{t.ticket_code}</b></td>
                    <td>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : 'Today'}</td>
                    <td>{t.category}</td>
                    <td>
                      <b>{t.subject}</b>
                      <small style={{ display: 'block', color: '#64748b' }}>{t.description}</small>
                    </td>
                    <td><Status s={t.status} /></td>
                    <td style={{ maxWidth: '280px' }}>
                      {t.admin_response ? (
                        <div style={{ background: '#f0fdf4', padding: '6px 8px', borderRadius: '6px', fontSize: '9px', color: '#166534' }}>
                          <b>Officer:</b> {t.admin_response}
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '9px' }}>In review by municipal desk</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                    No support grievances registered. You're all caught up!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="contact">
        <div>
          <Phone />
          <b>Tamil Nadu Toll-Free Helplines</b>
          <small>Toll Free: 1913 (Chennai) / 1800 425 0001 (Districts)</small>
        </div>
        <div>
          <Mail />
          <b>Official Department Email</b>
          <small>support@cleantn360.tn.gov.in</small>
        </div>
        <div>
          <ShieldCheck />
          <b>Privacy & Data Ethics</b>
          <small>Compliant with TN Cyber Security & Personal Data Protection Rules</small>
        </div>
      </div>
    </>
  );
}

