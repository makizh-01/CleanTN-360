import React from 'react';

export default function Status({ s }) {
  if (!s) return null;
  const statusStr = String(s).toLowerCase();
  
  let label = s;
  let customClass = statusStr;

  if (statusStr === 'submitted' || statusStr === 'pending') {
    label = 'Pending Verification';
    customClass = 'pending';
  } else if (statusStr === 'collector_verified') {
    label = 'Collector Verified';
    customClass = 'verified';
  } else if (statusStr === 'admin_approved' || statusStr === 'approved' || statusStr === 'completed') {
    label = 'Approved';
    customClass = 'completed';
  } else if (statusStr === 'rejected') {
    label = 'Rejected';
    customClass = 'rejected';
  }

  return <span className={`status ${customClass}`}>{label}</span>;
}

