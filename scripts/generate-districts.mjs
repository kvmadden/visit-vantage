/**
 * Generate district boundary GeoJSON from store coordinates.
 * Creates padded, heavily smoothed blob shapes for each Rx district.
 */
import { readFileSync, writeFileSync } from 'fs';

const stores = JSON.parse(readFileSync('src/data/stores.json', 'utf-8'));

const RX_COLORS = {
  20: '#4A9EFF',
  21: '#3D9A6D',
  22: '#f59e0b',
  23: '#ef4444',
  24: '#8b5cf6',
  25: '#F472B6',
  26: '#06b6d4',
  27: '#fb923c',
};

// Cross product of vectors OA and OB where O is origin
function cross(O, A, B) {
  return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
}

// Andrew's monotone chain convex hull algorithm
function convexHull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length <= 1) return pts;

  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }

  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

// Pad hull outward from centroid — generous padding so hearts fit inside
function padHull(hull, padDeg = 0.06) {
  const cx = hull.reduce((s, p) => s + p[0], 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p[1], 0) / hull.length;

  return hull.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return [
      x + (dx / dist) * padDeg,
      y + (dy / dist) * padDeg,
    ];
  });
}

// Chaikin corner-cutting subdivision — more iterations = smoother blob
function chaikinSmooth(hull, iterations = 4) {
  let pts = hull;
  for (let iter = 0; iter < iterations; iter++) {
    const smoothed = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      smoothed.push([
        a[0] * 0.75 + b[0] * 0.25,
        a[1] * 0.75 + b[1] * 0.25,
      ]);
      smoothed.push([
        a[0] * 0.25 + b[0] * 0.75,
        a[1] * 0.25 + b[1] * 0.75,
      ]);
    }
    pts = smoothed;
  }
  return pts;
}

// Insert midpoints between hull vertices to give Chaikin more material
function densifyHull(hull) {
  const result = [];
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    result.push(a);
    result.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
  }
  return result;
}

// Group stores by Rx district
const districts = {};
stores.forEach((s) => {
  const d = s.rxDistrict;
  if (!d) return;
  if (!districts[d]) districts[d] = [];
  districts[d].push([s.lng, s.lat]); // GeoJSON uses [lng, lat]
});

const features = Object.entries(districts).map(([district, points]) => {
  let hull = convexHull(points);

  // Pad outward generously so all markers (hearts) fit inside
  hull = padHull(hull, 0.07);

  // Densify — add midpoints so Chaikin has more vertices to work with
  hull = densifyHull(hull);

  // Heavy Chaikin smoothing — 4 iterations produces very smooth blobs
  const smooth = chaikinSmooth(hull, 4);

  // Close the ring
  const ring = [...smooth, smooth[0]];

  return {
    type: 'Feature',
    properties: {
      district: Number(district),
      color: RX_COLORS[district] || '#888',
      label: `D${district}`,
      storeCount: points.length,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [ring],
    },
  };
});

const geojson = {
  type: 'FeatureCollection',
  features,
};

writeFileSync('src/data/districts.json', JSON.stringify(geojson));
console.log(`Generated ${features.length} district boundaries`);
