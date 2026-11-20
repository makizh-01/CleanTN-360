import React from 'react';

export default function Panel({ title, Icon, children, action, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      <header>
        <b>{Icon && <Icon size={18} />} {title}</b>
        {action}
      </header>
      {children}
    </section>
  );
}

