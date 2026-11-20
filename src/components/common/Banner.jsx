import React from 'react';
import { TreePine, Recycle, Leaf } from 'lucide-react';

export default function Banner({ title, desc, kicker = 'CLEANER COMMUNITIES · GREENER FUTURE' }) {
  return (
    <div className="banner">
      <div>
        <small>{kicker}</small>
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
      <div className="bannerart">
        <TreePine />
        <Recycle />
        <Leaf />
      </div>
    </div>
  );
}

