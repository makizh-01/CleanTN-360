import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Globe2,
  Recycle,
  Gift,
  Clock3,
  ArrowUpRight,
  QrCode
} from 'lucide-react';
import Banner from '../common/Banner';
import Stat from '../common/Stat';
import Panel from '../common/Panel';
import { useData } from '../../context/DataContext';
import { DISTRICTS } from '../../lib/constants';

export default function CollectionPointsPage({ notify }) {
  const { collectionPoints } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [selectedPoint, setSelectedPoint] = useState(collectionPoints[0] || null);

  const filteredPoints = collectionPoints.filter((p) => {
    const matchesSearch =
      p.point_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.point_code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDistrict =
      districtFilter === 'All' || p.district === districtFilter;

    return matchesSearch && matchesDistrict;
  });

  const activeSelected = selectedPoint || filteredPoints[0] || collectionPoints[0];

  return (
    <>
      <Banner
        kicker="DROP · RECYCLE · EARN"
        title="Find an authorized CleanTN 360 collection hub."
        desc="Check operating hours, physical scale availability, accepted waste categories and exact address before visiting."
      />

      <div className="stats four">
        <Stat Icon={MapPin} label="Active hubs" value={collectionPoints.length} />
        <Stat Icon={Globe2} label="District coverage target" value="38" />
        <Stat Icon={Recycle} label="Accepted waste types" value="6" />
        <Stat Icon={Gift} label="Reward rates" value="20–100 pts" tone="amber" />
      </div>

      <div className="grid2">
        <Panel title="Collection Hub Directory" Icon={Search}>
          <div className="filters" style={{ marginBottom: '10px' }}>
            <div className="search">
              <Search size={16} />
              <input
                placeholder="Search area, hub name or point code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
            >
              <option value="All">All Districts</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {filteredPoints.length ? (
              filteredPoints.map((p) => (
                <button
                  type="button"
                  className={`point ${activeSelected?.id === p.id ? 'chosen' : ''}`}
                  key={p.id}
                  onClick={() => setSelectedPoint(p)}
                >
                  <MapPin />
                  <span>
                    <b>{p.point_name}</b>
                    <small>{p.address}</small>
                    <small>
                      <Clock3 size={11} /> {p.operating_hours} · Code: <b>{p.point_code}</b>
                    </small>
                  </span>
                  <strong>{p.distance || 'Active'}</strong>
                </button>
              ))
            ) : (
              <p className="muted" style={{ padding: '20px', textAlign: 'center' }}>
                No collection points located for this district or search query.
              </p>
            )}
          </div>
        </Panel>

        {activeSelected && (
          <Panel title={`Hub Detail · ${activeSelected.point_name}`} Icon={MapPin}>
            <div className="mapdemo">
              <span>{activeSelected.point_name.split(' ')[0]} Hub</span>
              <span>Weighing Scale Calibrated</span>
              <span>Collector On Duty</span>
              <MapPin className="pin p1" />
              <MapPin className="pin p2" />
              <MapPin className="pin p3" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <b>{activeSelected.point_name}</b>
              <span className="status completed" style={{ fontSize: '9px' }}>
                <QrCode size={11} style={{ display: 'inline', marginRight: '3px' }} />
                {activeSelected.point_code}
              </span>
            </div>

            <p className="muted" style={{ margin: '0 0 10px', fontSize: '11px' }}>
              {activeSelected.address}
            </p>

            <div style={{ fontSize: '10px', color: '#374151', marginBottom: '8px' }}>
              <b>Operating Hours:</b> {activeSelected.operating_hours}
            </div>

            <div className="accepted" style={{ marginBottom: '12px' }}>
              <b>Accepted Recyclables:</b>{' '}
              {Array.isArray(activeSelected.accepted_waste_types)
                ? activeSelected.accepted_waste_types.join(' · ')
                : activeSelected.accepted_waste_types}
            </div>

            <button
              type="button"
              className="primary full"
              onClick={() => notify(`Directions to ${activeSelected.point_name} will open in maps.`)}
            >
              Get Directions to Hub <ArrowUpRight size={14} />
            </button>
          </Panel>
        )}
      </div>
    </>
  );
}

