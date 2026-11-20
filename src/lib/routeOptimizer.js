// ==============================================================================
// CleanTN 360 – Smart Collection Route Optimizer
// Priority-weighted nearest-neighbour heuristic between depots and collection hubs
// ==============================================================================

const FALLBACK_LAT = 11.0168;
const FALLBACK_LNG = 76.9558;
const ROAD_FACTOR = 1.35; // straight-line to road-distance multiplier
const STOP_SERVICE_MINS = 12;

/** Haversine distance in km, scaled to approximate road distance. */
function roadDistanceKm(lat1, lng1, lat2, lng2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const km = 6371 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  return Number((km * ROAD_FACTOR).toFixed(2));
}

export const DEFAULT_DEPOTS = [
  {
    id: 'depot-cbe-01',
    name: 'Coimbatore Municipal Corporation Central Depot (Town Hall)',
    district: 'Coimbatore',
    latitude: 10.9975,
    longitude: 76.9602,
    address: 'Near Big Bazaar Street, Town Hall, Coimbatore'
  },
  {
    id: 'depot-cbe-02',
    name: 'CCMC North Zonal Yard (RS Puram)',
    district: 'Coimbatore',
    latitude: 11.0089,
    longitude: 76.945,
    address: 'Diwan Bahadur Road, RS Puram, Coimbatore'
  },
  {
    id: 'depot-cbe-03',
    name: 'CCMC East Zonal Yard (Singanallur)',
    district: 'Coimbatore',
    latitude: 10.9998,
    longitude: 77.0185,
    address: 'Trichy Road, Singanallur, Coimbatore'
  }
];

export function optimizeRoute({ startDepot, selectedHubs = [], averageSpeedKmh = 22 }) {
  if (!selectedHubs || selectedHubs.length === 0) {
    return { orderedStops: [], totalDistanceKm: 0, totalDurationMins: 0, startDepot };
  }

  const remaining = [...selectedHubs];
  const orderedStops = [];
  let curLat = startDepot.latitude;
  let curLng = startDepot.longitude;
  let totalDistance = 0;
  let sequenceNumber = 1;

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestScore = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const hub = remaining[i];
      const dist = roadDistanceKm(curLat, curLng, hub.latitude || FALLBACK_LAT, hub.longitude || FALLBACK_LNG);
      const weight = hub.priority === 'urgent' ? 0.75 : hub.priority === 'high' ? 0.85 : 1;
      const score = dist * weight;
      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    const next = remaining.splice(bestIndex, 1)[0];
    const nextLat = next.latitude || FALLBACK_LAT;
    const nextLng = next.longitude || FALLBACK_LNG;
    const legDistanceKm = roadDistanceKm(curLat, curLng, nextLat, nextLng);
    totalDistance += legDistanceKm;

    orderedStops.push({
      sequenceNumber: sequenceNumber++,
      ...next,
      legDistanceKm,
      legDurationMins: Math.round((legDistanceKm / averageSpeedKmh) * 60) + STOP_SERVICE_MINS,
      cumulativeDistanceKm: Number(totalDistance.toFixed(2)),
      status: next.status === 'collected' ? 'collected' : 'pending'
    });

    curLat = nextLat;
    curLng = nextLng;
  }

  const returnDistanceKm = roadDistanceKm(curLat, curLng, startDepot.latitude, startDepot.longitude);
  totalDistance += returnDistanceKm;

  const driveMins = Math.round((totalDistance / averageSpeedKmh) * 60);
  const totalDurationMins = driveMins + orderedStops.length * STOP_SERVICE_MINS;

  return {
    startDepot,
    orderedStops,
    totalStopsCount: orderedStops.length,
    totalDistanceKm: Number(totalDistance.toFixed(2)),
    totalDurationMins,
    formattedDuration: `${Math.floor(totalDurationMins / 60)}h ${totalDurationMins % 60}m`,
    returnDistanceKm
  };
}
