import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { optimizeRoute, DEFAULT_DEPOTS } from '../../lib/routeOptimizer';

export default function RouteOptimizationPage({ notify }) {
  const { collectionPoints, activeRoute, setActiveRoute, updateRouteStopStatus } = useData();

  const [selectedDepot, setSelectedDepot] = useState(DEFAULT_DEPOTS[0]);
  const [selectedHubIds, setSelectedHubIds] = useState(
    collectionPoints.slice(0, 5).map(cp => cp.id)
  );
  const [collectedWeightInput, setCollectedWeightInput] = useState('');
  const [activeStopModal, setActiveStopModal] = useState(null);

  // Filter hubs for active district
  const availableHubs = collectionPoints.filter(cp => cp.status !== 'inactive');

  const handleToggleHub = (id) => {
    if (selectedHubIds.includes(id)) {
      if (selectedHubIds.length === 1) {
        if (notify) notify('At least 1 collection hub is required for routing.');
        return;
      }
      setSelectedHubIds(selectedHubIds.filter(x => x !== id));
    } else {
      setSelectedHubIds([...selectedHubIds, id]);
    }
  };

  const handleRunOptimization = () => {
    const hubsToRoute = availableHubs
      .filter(h => selectedHubIds.includes(h.id))
      .map(h => ({
        ...h,
        priority: h.point_code.includes('CBE-01') ? 'urgent' : h.point_code.includes('CBE-03') ? 'high' : 'normal'
      }));

    const result = optimizeRoute({
      startDepot: selectedDepot,
      selectedHubs: hubsToRoute,
      averageSpeedKmh: 24
    });

    setActiveRoute(result);
    if (notify) notify(`Optimized route generated: ${result.totalStopsCount} stops, ${result.totalDistanceKm} km!`);
  };

  const handleStopCompletion = (sequenceNumber, status) => {
    updateRouteStopStatus(
      sequenceNumber,
      status,
      status === 'collected' ? (Number(collectedWeightInput) || 25.0) : null
    );
    setActiveStopModal(null);
    setCollectedWeightInput('');
    if (notify) notify(`Stop #${sequenceNumber} marked as ${status.toUpperCase()}!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(30, 58, 138, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Navigation size={28} style={{ color: '#93c5fd' }} />
              <h1 style={{ margin: 0, font: '800 24px Manrope', color: '#ffffff' }}>
                Smart Collection Route Optimization
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                TSP Algorithm
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#bfdbfe', maxWidth: '750px', lineHeight: 1.6 }}>
              Heuristic routing engine calculates the most energy-efficient vehicle pathing between municipal depots
              and Smart Collection Hubs. Prioritizes overflowing stations to reduce diesel consumption and turnaround time.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRunOptimization}
              style={{ background: '#10b981', borderColor: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Sparkles size={16} /> Re-Optimize Route
            </button>
          </div>
        </div>
      </div>

      {/* Depot & Hub Selection Card */}
      <div className="card" style={{ padding: '20px' }}>
        <h2 style={{ margin: '0 0 16px', font: '800 16px Manrope', color: '#1e293b' }}>
          1. Select Origin Depot & Target Collection Hubs
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
              DEPARTURE DEPOT / MUNICIPAL YARD
            </label>
            <select
              className="select"
              value={selectedDepot.id}
              onChange={(e) => setSelectedDepot(DEFAULT_DEPOTS.find(d => d.id === e.target.value))}
              style={{ width: '100%', padding: '10px 14px' }}
            >
              {DEFAULT_DEPOTS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.district})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
              GPS: {selectedDepot.latitude}° N, {selectedDepot.longitude}° E
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
              SELECTED HUBS TO COLLECT ({selectedHubIds.length} of {availableHubs.length})
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableHubs.map(hub => {
                const isSelected = selectedHubIds.includes(hub.id);
                return (
                  <button
                    key={hub.id}
                    type="button"
                    onClick={() => handleToggleHub(hub.id)}
                    style={{
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                      border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                      color: isSelected ? '#1d4ed8' : '#64748b',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '} {hub.point_name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Optimized Route Sequence & Live Action Cards */}
      {activeRoute ? (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, font: '800 18px Manrope', color: '#1e293b' }}>
                  Optimized Stop Sequence ({activeRoute.totalStopsCount} Stops)
                </h2>
                <span style={{ background: activeRoute.status === 'completed' ? '#dcfce7' : '#dbeafe', color: activeRoute.status === 'completed' ? '#15803d' : '#1e40af', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                  {activeRoute.status ? activeRoute.status.toUpperCase() : 'ASSIGNED'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                Origin: <b>{activeRoute.startDepot.name}</b> • Total Distance: <b>{activeRoute.totalDistanceKm} km</b> • Est. Duration: <b>{activeRoute.formattedDuration}</b>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Transit Energy Efficiency</div>
                <b style={{ color: '#059669', fontSize: '14px' }}>-28% Diesel Savings</b>
              </div>
            </div>
          </div>

          {/* Ordered Stops List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeRoute.orderedStops.map((stop) => {
              const isDone = stop.status === 'collected';
              const isSkipped = stop.status === 'skipped';
              return (
                <div
                  key={stop.sequenceNumber}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: isDone ? '1px solid #86efac' : isSkipped ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                    background: isDone ? '#f0fdf4' : isSkipped ? '#fef2f2' : '#ffffff',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isDone ? '#15803d' : isSkipped ? '#dc2626' : '#2563eb',
                        color: '#ffffff',
                        display: 'grid',
                        placeItems: 'center',
                        font: '800 14px Manrope',
                        flexShrink: 0
                      }}
                    >
                      {isDone ? '✓' : stop.sequenceNumber}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <b style={{ font: '800 14px Manrope', color: '#1e293b' }}>{stop.point_name}</b>
                        <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                          {stop.point_code}
                        </span>
                        {stop.priority === 'urgent' && (
                          <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                            URGENT PICKUP
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Leg Distance: <b>{stop.legDistanceKm} km</b> • Approx. <b>{stop.legDurationMins} mins</b> • Address: {stop.address || 'Coimbatore'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude || 11.0168},${stop.longitude || 76.9558}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{ fontSize: '11px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ExternalLink size={12} /> GPS Navigate
                    </a>

                    {isDone ? (
                      <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={16} /> Collected ({stop.collected_weight_kg || '25'} kg)
                      </span>
                    ) : isSkipped ? (
                      <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 800 }}>
                        Skipped
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setActiveStopModal(stop)}
                        style={{ fontSize: '11px', padding: '6px 12px' }}
                      >
                        Complete Stop
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Truck size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#475569' }}>No Active Route Generated</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
            Select target hubs and click "Run Optimization" above to dispatch the vehicle.
          </p>
        </div>
      )}

      {/* Stop Completion Modal */}
      {activeStopModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '420px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px', font: '800 18px Manrope', color: '#1e293b' }}>
              Confirm Collection Stop #{activeStopModal.sequenceNumber}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              <b>{activeStopModal.point_name}</b> ({activeStopModal.point_code})
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Total Verified Weight Collected (kg):
              </label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={collectedWeightInput}
                onChange={(e) => setCollectedWeightInput(e.target.value)}
                placeholder="e.g. 34.5"
                style={{ width: '100%', padding: '10px 14px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleStopCompletion(activeStopModal.sequenceNumber, 'skipped')}
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              >
                Skip Stop
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleStopCompletion(activeStopModal.sequenceNumber, 'collected')}
              >
                Save & Mark Collected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
