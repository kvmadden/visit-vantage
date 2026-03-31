/**
 * Generate district boundary GeoJSON from store coordinates.
 * Creates smooth, blobby territory shapes for each Rx district.
 *
 * Approach: convex hull → pad along normals → convert to polar coords →
 * resample at uniform angles → smooth radii → Chaikin subdivision → blob!
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

// Pad hull outward along edge normals (uniform expansion, not centroid-based)
function padHullNormals(hull, padDeg) {
  const n = hull.length;
  const padded = [];
  for (let i = 0; i < n; i++) {
    const prev = hull[(i - 1 + n) % n];
    const curr = hull[i];
    const next = hull[(i + 1) % n];

    // Normals of the two adjacent edges (outward for CCW winding)
    const dx1 = curr[0] - prev[0], dy1 = curr[1] - prev[1];
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
    const nx1 = -dy1 / len1, ny1 = dx1 / len1;

    const dx2 = next[0] - curr[0], dy2 = next[1] - curr[1];
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
    const nx2 = -dy2 / len2, ny2 = dx2 / len2;

    // Average normal at vertex
    let nx = (nx1 + nx2) / 2, ny = (ny1 + ny2) / 2;
    const nlen = Math.sqrt(nx * nx + ny * ny) || 1;
    nx /= nlen;
    ny /= nlen;

    padded.push([curr[0] + nx * padDeg, curr[1] + ny * padDeg]);
  }

  // Verify winding — if padding inverted the polygon, flip normals
  let area = 0;
  for (let i = 0; i < padded.length; i++) {
    const j = (i + 1) % padded.length;
    area += padded[i][0] * padded[j][1] - padded[j][0] * padded[i][1];
  }
  if (area > 0) {
    // Normals went inward — redo with flipped direction
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
      let ny = (-dx1 / len1 + -dx2 / len2) / 2;
      const nlen = Math.sqrt(nx * nx + ny * ny) || 1;
      nx /= nlen; ny /= nlen;
      flipped.push([curr[0] + nx * padDeg, curr[1] + ny * padDeg]);
    }
    return flipped;
  }
  return padded;
}

// Convert polygon to polar representation around centroid
function toPolar(points, cx, cy) {
  return points.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    return { angle: Math.atan2(dy, dx), radius: Math.sqrt(dx * dx + dy * dy) };
  }).sort((a, b) => a.angle - b.angle);
}

// Resample polar curve at uniform angle intervals
function resamplePolar(polar, numSamples) {
  const result = [];
  for (let i = 0; i < numSamples; i++) {
    const targetAngle = -Math.PI + (2 * Math.PI * i) / numSamples;
    // Find the two polar points that bracket this angle
    let r = interpolateRadius(polar, targetAngle);
    result.push({ angle: targetAngle, radius: r });
  }
  return result;
}

function interpolateRadius(polar, targetAngle) {
  const n = polar.length;
  // Find bracketing points
  let lo = n - 1, hi = 0;
  for (let i = 0; i < n; i++) {
    if (polar[i].angle <= targetAngle) lo = i;
    if (polar[i].angle >= targetAngle && hi === 0) hi = i;
  }
  // Better search
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    let a1 = polar[i].angle, a2 = polar[j].angle;
    // Handle wrap-around
    if (j === 0) a2 = polar[j].angle + 2 * Math.PI;
    if (targetAngle >= a1 && targetAngle <= a2) {
      const t = (a2 - a1) === 0 ? 0 : (targetAngle - a1) / (a2 - a1);
      return polar[i].radius * (1 - t) + polar[j].radius * t;
    }
  }
  // Wrap case: between last and first
  const last = polar[n - 1], first = polar[0];
  let a1 = last.angle, a2 = first.angle + 2 * Math.PI;
  const adjTarget = targetAngle < a1 ? targetAngle + 2 * Math.PI : targetAngle;
  const t = (a2 - a1) === 0 ? 0 : (adjTarget - a1) / (a2 - a1);
  return last.radius * (1 - t) + first.radius * t;
}

// Smooth radius values (circular moving average)
function smoothRadii(polar, passes = 3, windowSize = 5) {
  let radii = polar.map(p => p.radius);
  const n = radii.length;
  for (let pass = 0; pass < passes; pass++) {
    const smoothed = [];
    const half = Math.floor(windowSize / 2);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = -half; j <= half; j++) {
        sum += radii[(i + j + n) % n];
      }
      smoothed.push(sum / windowSize);
    }
    radii = smoothed;
  }
  return polar.map((p, i) => ({ angle: p.angle, radius: radii[i] }));
}

// Convert polar back to cartesian
function toCartesian(polar, cx, cy) {
  return polar.map(p => [
    cx + p.radius * Math.cos(p.angle),
    cy + p.radius * Math.sin(p.angle),
  ]);
}

// Chaikin corner-cutting for final polish
function chaikinSmooth(points, iterations = 3) {
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

// Ensure every store point is inside the polygon with margin
function ensureContainment(blobPoints, storePoints, cx, cy, margin = 0.03) {
  const blobPolar = toPolar(blobPoints, cx, cy);
  const storePolar = storePoints.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    return { angle: Math.atan2(dy, dx), radius: Math.sqrt(dx * dx + dy * dy) };
  });

  // For each store, check if the blob radius at that angle is big enough
  let needsExpand = false;
  const expanded = blobPolar.map(bp => ({ ...bp }));

  for (const sp of storePolar) {
    const requiredRadius = sp.radius + margin;
    // Find the nearest blob point by angle and expand if needed
    let bestIdx = 0, bestDiff = Infinity;
    for (let i = 0; i < expanded.length; i++) {
      let diff = Math.abs(expanded[i].angle - sp.angle);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
    }
    // Expand this point and its neighbors
    const spread = 3;
    for (let d = -spread; d <= spread; d++) {
      const idx = (bestIdx + d + expanded.length) % expanded.length;
      const factor = 1 - Math.abs(d) / (spread + 1); // taper
      const needed = expanded[idx].radius + (requiredRadius - expanded[idx].radius) * factor;
      if (needed > expanded[idx].radius) {
        expanded[idx].radius = needed;
        needsExpand = true;
      }
    }
  }

  if (!needsExpand) return blobPoints;
  return toCartesian(expanded, cx, cy);
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
  // Centroid of all stores in district
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length;
  const cy = points.reduce((s, p) => s + p[1], 0) / points.length;

  // Convex hull
  let hull = convexHull(points);
  if (hull.length < 3) {
    // Degenerate — make a circle
    hull = Array.from({ length: 24 }, (_, i) => {
      const a = (2 * Math.PI * i) / 24;
      return [cx + 0.05 * Math.cos(a), cy + 0.05 * Math.sin(a)];
    });
  }

  // Pad outward along edge normals (uniform buffer)
  const padded = padHullNormals(hull, 0.06);

  // Convert to polar, resample uniformly, smooth radii
  const polar = toPolar(padded, cx, cy);
  const resampled = resamplePolar(polar, 72); // 72 points = every 5°
  const smoothed = smoothRadii(resampled, 5, 7); // 5 passes, window of 7

  // Back to cartesian
  let blob = toCartesian(smoothed, cx, cy);

  // Ensure every store fits inside with margin — run twice for stubborn outliers
  blob = ensureContainment(blob, points, cx, cy, 0.045);
  blob = ensureContainment(blob, points, cx, cy, 0.03);

  // Re-smooth after containment expansion (in polar space)
  const polar2 = toPolar(blob, cx, cy);
  const resampled2 = resamplePolar(polar2, 72);
  const smoothed2 = smoothRadii(resampled2, 3, 5);
  blob = toCartesian(smoothed2, cx, cy);

  // Final Chaikin polish
  blob = chaikinSmooth(blob, 3);

  // Close the ring
  const ring = [...blob, blob[0]];

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
console.log(`Generated ${features.length} district boundaries`);
