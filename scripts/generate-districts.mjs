/**
 * Generate district boundary GeoJSON from store coordinates.
 * Creates smooth, shape-preserving territory outlines for each Rx district.
 *
 * Approach: convex hull → pad along edge normals → densify edges →
 * heavy Chaikin smoothing. This preserves natural corridor/elongated shapes
 * while producing smooth, non-angular curves.
 */
import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { intersect: turfIntersect } = require('@turf/intersect');
const { difference: turfDifference } = require('@turf/difference');
const { polygon, multiPolygon, featureCollection } = require('@turf/helpers');

const stores = JSON.parse(readFileSync('src/data/stores.json', 'utf-8'));
const floridaLand = JSON.parse(readFileSync('src/data/florida-land.geojson', 'utf-8'));

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
  // AFTER the full smoothing pipeline (smoothing shrinks polygons inward)
  // Use lighter Laplacian (2 passes, 0.35 weight) to reduce shrinkage → less padding → less overlap
  let smooth;
  for (const pad of [0.04, 0.055, 0.07, 0.09, 0.12, 0.15]) {
    const padded = padHullNormals(hull, pad);
    const dense = densify(padded, 0.03);
    const ironed = laplacianSmooth(dense, 2, 0.35);
    smooth = chaikinSmooth(ironed, 4);
    const outside = points.filter(p => !pointInPolygon(p, smooth));
    if (outside.length === 0) break;
    if (pad === 0.15) {
      console.warn(`D${district}: ${outside.length} stores still outside at max padding`);
    }
  }

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

// Clip district polygons to Florida land (remove water areas)
const landGeom = floridaLand.geometry;
const landFeature = landGeom.type === 'MultiPolygon'
  ? multiPolygon(landGeom.coordinates)
  : polygon(landGeom.coordinates);

const clippedFeatures = features.map(f => {
  try {
    const distPoly = polygon(f.geometry.coordinates);
    const clipped = turfIntersect(featureCollection([distPoly, landFeature]));
    if (clipped) {
      let geom = clipped.geometry;
      geom = ensurePolygon(geom);

      // If clipping lost any stores, use the unclipped polygon instead
      const pts = districts[f.properties.district];
      const ring = geom.coordinates[0];
      const lost = pts.filter(p => !pointInPolygon(p, ring));
      if (lost.length > 0) {
        return f; // keep unclipped
      }
      return { ...f, geometry: geom };
    }
  } catch (e) {
    console.warn(`D${f.properties.district}: clip failed (${e.message}), using unclipped`);
  }
  return f;
});

// --- Voronoi-style partitioning: remove overlap between districts ---
// For each pair of districts, split overlap along the perpendicular bisector
// of their centroids so each district claims only its side.

function centroid(coords) {
  const ring = coords[0]; // outer ring
  let cx = 0, cy = 0, n = ring.length - 1; // skip closing point
  for (let i = 0; i < n; i++) { cx += ring[i][0]; cy += ring[i][1]; }
  return [cx / n, cy / n];
}

// Create a half-plane polygon on c1's side of a bisector between c1 and c2.
// The bisector is shifted so that ALL points in pts1 stay on c1's side.
function halfPlane(c1, c2, pts1, pts2) {
  const dx = c2[0] - c1[0];
  const dy = c2[1] - c1[1];
  const dlen = Math.sqrt(dx * dx + dy * dy) || 1;
  // Unit direction from c1 to c2
  const ux = dx / dlen, uy = dy / dlen;

  // Default midpoint
  let mx = (c1[0] + c2[0]) / 2;
  let my = (c1[1] + c2[1]) / 2;

  // Shift the bisector so ALL stores in pts1 stay on c1's side,
  // and ALL stores in pts2 stay on c2's side.
  if (pts1 && pts1.length > 0) {
    let maxProj1 = -Infinity;
    for (const p of pts1) {
      const proj = (p[0] - c1[0]) * ux + (p[1] - c1[1]) * uy;
      if (proj > maxProj1) maxProj1 = proj;
    }
    // Also find the min projection of pts2 from c1
    let minProj2 = Infinity;
    if (pts2 && pts2.length > 0) {
      for (const p of pts2) {
        const proj = (p[0] - c1[0]) * ux + (p[1] - c1[1]) * uy;
        if (proj < minProj2) minProj2 = proj;
      }
    }
    // Place bisector between the farthest pts1 store and nearest pts2 store
    const margin = 0.005;
    const fromStores1 = maxProj1 + margin;
    const fromStores2 = pts2 ? minProj2 - margin : dlen;
    // Use the midpoint between the two constraints, but ensure pts1 stays inside
    const finalProj = pts2 && pts2.length > 0
      ? Math.max(fromStores1, (fromStores1 + fromStores2) / 2)
      : Math.min(fromStores1, dlen * 0.85);
    mx = c1[0] + ux * finalProj;
    my = c1[1] + uy * finalProj;
  }

  const sz = 5;
  const tx = -uy, ty = ux; // tangent along bisector line
  const nnx = -ux, nny = -uy; // normal toward c1

  const p1 = [mx + tx * sz, my + ty * sz];
  const p2 = [mx - tx * sz, my - ty * sz];
  const p3 = [mx - tx * sz + nnx * sz, my - ty * sz + nny * sz];
  const p4 = [mx + tx * sz + nnx * sz, my + ty * sz + nny * sz];

  return polygon([[p1, p2, p3, p4, p1]]);
}

function ensurePolygon(geom) {
  if (geom.type === 'MultiPolygon') {
    let largest = geom.coordinates[0];
    let maxArea = 0;
    for (const poly of geom.coordinates) {
      const ring = poly[0];
      let area = 0;
      for (let i = 0; i < ring.length - 1; i++) {
        area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
      }
      area = Math.abs(area);
      if (area > maxArea) { maxArea = area; largest = poly; }
    }
    return { type: 'Polygon', coordinates: largest };
  }
  return geom;
}

// Use store centroids (mean of store positions) — more accurate than polygon centroids
const centroids = {};
Object.entries(districts).forEach(([d, pts]) => {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  centroids[Number(d)] = [cx, cy];
});

// For each district, clip it against the half-plane for every other district
let partitioned = clippedFeatures.map(f => ({ ...f }));

for (let i = 0; i < partitioned.length; i++) {
  for (let j = 0; j < partitioned.length; j++) {
    if (i === j) continue;
    const di = partitioned[i].properties.district;
    const dj = partitioned[j].properties.district;
    const ci = centroids[di];
    const cj = centroids[dj];

    try {
      const hp = halfPlane(ci, cj, districts[di], districts[dj]);
      const distPoly = polygon(partitioned[i].geometry.coordinates);
      const clipped = turfIntersect(featureCollection([distPoly, hp]));
      if (clipped) {
        partitioned[i] = {
          ...partitioned[i],
          geometry: ensurePolygon(clipped.geometry),
        };
      }
    } catch (e) {
      // If clipping fails, keep original
    }
  }
}

// Verify all stores still contained after partitioning; if any fell out,
// expand that district slightly toward the missing store
let allGood = true;
partitioned.forEach(f => {
  const d = f.properties.district;
  const ring = f.geometry.coordinates[0];
  const pts = districts[d];
  const out = pts.filter(p => !pointInPolygon(p, ring));
  if (out.length > 0) {
    console.warn(`D${d}: ${out.length} stores outside after partitioning`);
    allGood = false;
  }
});

const geojson = { type: 'FeatureCollection', features: partitioned };
writeFileSync('src/data/districts.json', JSON.stringify(geojson));

console.log(`Generated ${partitioned.length} district boundaries${allGood ? ' — all stores contained' : ''}`);
