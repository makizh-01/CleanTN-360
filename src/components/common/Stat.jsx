import React from 'react';

export default function Stat({ Icon, label, value, tone = '' }) {
  return (
    <div className="stat">
      <div className={`staticon ${tone}`}>
        <Icon />
      </div>
      <div>
        <b>{value}</b>
        <small>{label}</small>
      </div>
    </div>
  );
}

