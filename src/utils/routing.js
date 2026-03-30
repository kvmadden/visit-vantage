export function haversine(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth radius in miles
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function optimizeRoute(stores, startPosition) {
  if (stores.length <= 1) return [...stores];

  const remaining = [...stores];
  const ordered = [];

  let currentLat = startPosition?.lat ?? remaining[0].lat;
  let currentLng = startPosition?.lng ?? remaining[0].lng;

  // If no startPosition, pull the first store out as starting point
  if (!startPosition) {
    ordered.push(remaining.shift());
    currentLat = ordered[0].lat;
    currentLng = ordered[0].lng;
  }

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversine(currentLat, currentLng, remaining[i].lat, remaining[i].lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const nearest = remaining.splice(nearestIdx, 1)[0];
    ordered.push(nearest);
    currentLat = nearest.lat;
    currentLng = nearest.lng;
  }

  return ordered;
}

export function getRouteStats(orderedStores, startPosition) {
  if (orderedStores.length === 0) return { totalDistance: 0, estimatedTime: 0 };

  let totalDistance = 0;

  // Distance from startPosition to first store
  if (startPosition) {
    totalDistance += haversine(
      startPosition.lat,
      startPosition.lng,
      orderedStores[0].lat,
      orderedStores[0].lng
    );
  }

  // Distance between consecutive stores
  for (let i = 0; i < orderedStores.length - 1; i++) {
    totalDistance += haversine(
      orderedStores[i].lat,
      orderedStores[i].lng,
      orderedStores[i + 1].lat,
      orderedStores[i + 1].lng
    );
  }

  // 25 mph average + 5 min per stop
  const estimatedTime = (totalDistance / 25) * 60 + orderedStores.length * 5;

  return { totalDistance, estimatedTime };
}

export function buildMapsUrl(orderedStores, startPosition) {
  const WAYPOINT_LIMIT = 25;

  let stops = orderedStores;

  // Sample if too many stops
  if (stops.length > WAYPOINT_LIMIT) {
    const step = Math.ceil(stops.length / WAYPOINT_LIMIT);
    const sampled = [];
    for (let i = 0; i < stops.length; i += step) {
      sampled.push(stops[i]);
    }
    // Always include the last stop
    if (sampled[sampled.length - 1] !== stops[stops.length - 1]) {
      sampled.push(stops[stops.length - 1]);
    }
    stops = sampled;
  }

  let url = 'https://www.google.com/maps/dir/';

  if (startPosition) {
    url += `${startPosition.lat},${startPosition.lng}/`;
  }

  url += stops.map((s) => `${s.lat},${s.lng}`).join('/');

  return url;
}
