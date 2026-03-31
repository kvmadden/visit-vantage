/**
 * Generate district boundary GeoJSON from store coordinates.
 * Creates smooth, shape-preserving territory outlines for each Rx district.
 *
 * Approach: convex hull → pad along edge normals → densify edges →
 * heavy Chaikin smoothing. This preserves natural corridor/elongated shapes
 * while producing smooth, non-angular curves.
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

function cross(O, A, B) {
  return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
}

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

// Pad hull outward along edge normals (uniform buffer that preserves shape)
function padHullNormals(hull, padDeg) {
  const n = hull.length;
  const result = [];

  for (let i = 0; i < n; i++) {
    const prev = hull[(i - 1 + n) % n];
    const curr = hull[i];
    const next = hull[(i + 1) % n];

    // Edge normals
    const dx1 = curr[0] - prev[0], dy1 = curr[1] - prev[1];
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
    const dx2 = next[0] - curr[0], dy2 = next[1] - curr[1];
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;

    // Average outward normal at vertex
    let nx = -(dy1 / len1 + dy2 / len2) / 2;
    let ny = (dx1 / len1 + dx2 / len2) / 2;
    const nlen = Math.sqrt(nx * nx + ny * ny) || 1;
    nx /= nlen;
    ny /= nlen;

    result.push([curr[0] + nx * padDeg, curr[1] + ny * padDeg]);
  }

  // Verify winding — if we expanded inward, flip
  let area = 0;
  for (let i = 0; i < result.length; i++) {
    const j = (i + 1) % result.length;
    area += result[i][0] * result[j][1] - result[j][0] * result[i][1];
  }
  if (area > 0) {
    // Flip normals
    const flipped = [];
    for (let i = 0; i < n; i++) {
      const prev = hull[(i - 1 + n) % n];
      const curr = hull[i];
      const next = hull[(i + 1) % n];
      const dx1 = curr[0] - prev[0], dy1 = curr[1] - prev[1];
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
      const dx2 = next[0] - curr[0], dy2 = next[1] - curr[1];
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
      let nx = (dy1 / len1 + dy2 / len2) / 2;
      let ny = -(dx1 / len1 + dx2 / len2) / 2;
      const nlen = Math.sqrt(nx * nx + ny * ny) || 1;
      nx /= nlen; ny /= nlen;
      flipped.push([curr[0] + nx * padDeg, curr[1] + ny * padDeg]);
    }
    return flipped;
  }
  return result;
}

// Densify: add evenly-spaced midpoints along each edge
function densify(hull, maxSegLen = 0.03) {
  const result = [];
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    const segs = Math.max(1, Math.ceil(len / maxSegLen));
    for (let s = 0; s < segs; s++) {
      const t = s / segs;
      result.push([a[0] + dx * t, a[1] + dy * t]);
    }
  }
  return result;
}

// Laplacian smoothing: average each vertex with its neighbors (circular)
// This irons out wobbles while preserving the overall shape
function laplacianSmooth(points, passes = 4, weight = 0.5) {
  let pts = points.map(p => [...p]);
  const n = pts.length;
  for (let pass = 0; pass < passes; pass++) {
    const next = [];
    for (let i = 0; i < n; i++) {
      const prev = pts[(i - 1 + n) % n];
      const curr = pts[i];
      const nxt = pts[(i + 1) % n];
      const avgX = (prev[0] + nxt[0]) / 2;
      const avgY = (prev[1] + nxt[1]) / 2;
      next.push([
        curr[0] + (avgX - curr[0]) * weight,
        curr[1] + (avgY - curr[1]) * weight,
      ]);
    }
    pts = next;
  }
  return pts;
}

// Chaikin corner-cutting subdivision
function chaikinSmooth(points, iterations = 5) {
  let pts = points;
  for (let iter = 0; iter < iterations; iter++) {
    const smoothed = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      smoothed.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      smoothed.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    pts = smoothed;
  }
  return pts;
}

// Check if point is inside polygon (ray casting)
function pointInPolygon(point, polygon) {
  let inside = false;
  const [x, y] = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// ---- Main ----

const districts = {};
stores.forEach((s) => {
  const d = s.rxDistrict;
  if (!d) return;
  if (!districts[d]) districts[d] = [];
  districts[d].push([s.lng, s.lat]);
});

const features = Object.entries(districts).map(([district, points]) => {
  let hull = convexHull(points);

  if (hull.length < 3) {
    // Degenerate — make a small ellipse
    const cx = points.reduce((s, p) => s + p[0], 0) / points.length;
    const cy = points.reduce((s, p) => s + p[1], 0) / points.length;
    hull = Array.from({ length: 12 }, (_, i) => {
      const a = (2 * Math.PI * i) / 12;
      return [cx + 0.04 * Math.cos(a), cy + 0.04 * Math.sin(a)];
    });
  }

  // Pad outward along edge normals — preserves shape proportions
  // Try progressively larger padding until all stores are contained
  let padded;
  for (const pad of [0.065, 0.085, 0.11, 0.14]) {
    padded = padHullNormals(hull, pad);
    const outside = points.filter(p => !pointInPolygon(p, padded));
    if (outside.length === 0) break;
    if (pad === 0.14) {
      console.warn(`D${district}: ${outside.length} stores still outside at max padding`);
    }
  }

  // Densify long edges so smoothing has enough vertices to work with
  const dense = densify(padded, 0.03);

  // Laplacian smoothing irons out wobbles/sharp angles
  const ironed = laplacianSmooth(dense, 4, 0.5);

  // Chaikin corner-cutting rounds remaining corners into curves
  const smooth = chaikinSmooth(ironed, 5);

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

const geojson = { type: 'FeatureCollection', features };
writeFileSync('src/data/districts.json', JSON.stringify(geojson));

// Verify containment
let allGood = true;
features.forEach(f => {
  const d = f.properties.district;
  const ring = f.geometry.coordinates[0];
  const pts = districts[d];
  const out = pts.filter(p => !pointInPolygon(p, ring));
  if (out.length > 0) {
    console.warn(`D${d}: ${out.length} stores outside!`);
    allGood = false;
  }
});

console.log(`Generated ${features.length} district boundaries${allGood ? ' — all stores contained' : ''}`);
