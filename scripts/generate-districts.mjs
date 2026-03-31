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

// --- Zero-overlap partitioning ---
// For each pair of overlapping districts, compute the overlap region,
// determine which district should claim it (nearest store wins),
// and subtract it from the losing district.

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

function dist2(a, b) {
  const dx = a[0] - b[0], dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function nearestStoreDist(point, stores) {
  let min = Infinity;
  for (const s of stores) {
    const d = dist2(point, s);
    if (d < min) min = d;
  }
  return min;
}

// Centroid of a polygon ring
function ringCentroid(ring) {
  let cx = 0, cy = 0, n = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    cx += ring[i][0]; cy += ring[i][1]; n++;
  }
  return [cx / n, cy / n];
}

let partitioned = clippedFeatures.map(f => ({ ...f }));

// Sequential subtraction: each district subtracts all others.
// For each pair, the one whose stores are farther from the overlap loses the overlap.
// Run multiple passes until stable.
for (let pass = 0; pass < 10; pass++) {
  let resolved = 0;
  for (let i = 0; i < partitioned.length; i++) {
    for (let j = i + 1; j < partitioned.length; j++) {
      const di = partitioned[i].properties.district;
      const dj = partitioned[j].properties.district;

      try {
        const polyI = polygon(partitioned[i].geometry.coordinates);
        const polyJ = polygon(partitioned[j].geometry.coordinates);

        const overlap = turfIntersect(featureCollection([polyI, polyJ]));
        if (!overlap) continue;

        const overlapGeom = ensurePolygon(overlap.geometry);
        const overlapRing = overlapGeom.coordinates[0];

        // Skip tiny overlaps
        let area = 0;
        for (let k = 0; k < overlapRing.length - 1; k++) {
          area += overlapRing[k][0] * overlapRing[k + 1][1] - overlapRing[k + 1][0] * overlapRing[k][1];
        }
        if (Math.abs(area) < 0.000001) continue;

        const overlapPoly = polygon(overlapGeom.coordinates);

        // Try subtracting from i
        const diffI = turfDifference(featureCollection([polyI, overlapPoly]));
        const canSubI = diffI ? (() => {
          const g = ensurePolygon(diffI.geometry);
          return districts[di].filter(p => !pointInPolygon(p, g.coordinates[0])).length === 0 ? g : null;
        })() : null;

        // Try subtracting from j
        const diffJ = turfDifference(featureCollection([polyJ, overlapPoly]));
        const canSubJ = diffJ ? (() => {
          const g = ensurePolygon(diffJ.geometry);
          return districts[dj].filter(p => !pointInPolygon(p, g.coordinates[0])).length === 0 ? g : null;
        })() : null;

        if (canSubI && canSubJ) {
          // Both can give up the overlap — give it to whoever has closer stores
          const center = ringCentroid(overlapRing);
          const dI = nearestStoreDist(center, districts[di]);
          const dJ = nearestStoreDist(center, districts[dj]);
          if (dI <= dJ) {
            // i is closer — subtract from j
            partitioned[j] = { ...partitioned[j], geometry: canSubJ };
          } else {
            partitioned[i] = { ...partitioned[i], geometry: canSubI };
          }
          resolved++;
        } else if (canSubI) {
          partitioned[i] = { ...partitioned[i], geometry: canSubI };
          resolved++;
        } else if (canSubJ) {
          partitioned[j] = { ...partitioned[j], geometry: canSubJ };
          resolved++;
        }
        // Neither can give up the full overlap — both have stores there.
        // Split the overlap using nearest-store Voronoi: build a dividing
        // polyline through the overlap based on which district's store is closest.
        const overlapPoly2 = polygon(overlapGeom.coordinates);
        try {
          // Use the actual stores in the overlap to compute the split line
          const storesInI = districts[di].filter(p => pointInPolygon(p, overlapRing));
          const storesInJ = districts[dj].filter(p => pointInPolygon(p, overlapRing));

          if (storesInI.length > 0 && storesInJ.length > 0) {
            // Centroid of each district's stores in the overlap
            const ciX = storesInI.reduce((s, p) => s + p[0], 0) / storesInI.length;
            const ciY = storesInI.reduce((s, p) => s + p[1], 0) / storesInI.length;
            const cjX = storesInJ.reduce((s, p) => s + p[0], 0) / storesInJ.length;
            const cjY = storesInJ.reduce((s, p) => s + p[1], 0) / storesInJ.length;

            // Build half-plane between these two centers, shifted so both
            // sets of stores stay on their correct side
            const dx = cjX - ciX, dy = cjY - ciY;
            const dlen = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux = dx / dlen, uy = dy / dlen;

            // Project stores onto this axis to find the safe gap
            let maxProjI = -Infinity, minProjJ = Infinity;
            for (const p of storesInI) {
              const proj = (p[0] - ciX) * ux + (p[1] - ciY) * uy;
              if (proj > maxProjI) maxProjI = proj;
            }
            for (const p of storesInJ) {
              const proj = (p[0] - ciX) * ux + (p[1] - ciY) * uy;
              if (proj < minProjJ) minProjJ = proj;
            }
            // Place in the gap (or midpoint if interleaved)
            const bisProj = (maxProjI + minProjJ) / 2;
            const mx = ciX + ux * bisProj;
            const my = ciY + uy * bisProj;
            const sz = 5;
            const tx = -uy, ty = ux;
            const nnx = -ux, nny = -uy;
            const p1 = [mx + tx * sz, my + ty * sz];
            const p2 = [mx - tx * sz, my - ty * sz];
            const p3 = [mx - tx * sz + nnx * sz, my - ty * sz + nny * sz];
            const p4 = [mx + tx * sz + nnx * sz, my + ty * sz + nny * sz];
            const hp = polygon([[p1, p2, p3, p4, p1]]);

            // i gets overlap ∩ half-plane-toward-i; j loses that part
            // j gets overlap ∩ half-plane-toward-j; i loses that part
            const overlapForI = turfIntersect(featureCollection([overlapPoly2, hp]));
            if (overlapForI) {
              const removeFromJ = ensurePolygon(overlapForI.geometry);
              const remPoly = polygon(removeFromJ.coordinates);
              const newJ = turfDifference(featureCollection([polyJ, remPoly]));
              if (newJ) {
                const gJ = ensurePolygon(newJ.geometry);
                const lostJ = districts[dj].filter(p => !pointInPolygon(p, gJ.coordinates[0]));
                if (lostJ.length === 0) {
                  partitioned[j] = { ...partitioned[j], geometry: gJ };
                  resolved++;
                }
              }
            }

            const overlapForJ = turfDifference(featureCollection([overlapPoly2, hp]));
            if (overlapForJ) {
              const removeFromI = ensurePolygon(overlapForJ.geometry);
              const remPoly = polygon(removeFromI.coordinates);
              const newI = turfDifference(featureCollection([polyI, remPoly]));
              if (newI) {
                const gI = ensurePolygon(newI.geometry);
                const lostI = districts[di].filter(p => !pointInPolygon(p, gI.coordinates[0]));
                if (lostI.length === 0) {
                  partitioned[i] = { ...partitioned[i], geometry: gI };
                  resolved++;
                }
              }
            }
          }
        } catch (e) {}
      } catch (e) {}
    }
  }
  if (resolved === 0) break;
  console.log(`Pass ${pass + 1}: resolved ${resolved} overlaps`);
}

// Verify containment
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
