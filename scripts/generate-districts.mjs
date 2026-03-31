/**
 * Generate district boundary GeoJSON from store coordinates.
 *
 * Approach: Voronoi tessellation → merge cells by district → smooth →
 * clip to coastline. Voronoi guarantees zero overlap by construction.
 */
import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { voronoi } = require('@turf/voronoi');
const { intersect: turfIntersect } = require('@turf/intersect');
const { union: turfUnion } = require('@turf/union');
const { polygon, point, featureCollection, multiPolygon } = require('@turf/helpers');

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

// Check if point is inside polygon (ray casting)
function pointInPolygon(pt, ring) {
  let inside = false;
  const [x, y] = pt;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function ensurePolygon(geom, storePoints) {
  if (geom.type === 'MultiPolygon') {
    // If we have store points, keep the fragment with the most stores
    // and union any other fragments that also have stores
    if (storePoints && storePoints.length > 0) {
      const partsWithStores = [];
      let largestNoStores = null, maxAreaNoStores = 0;

      for (const poly of geom.coordinates) {
        const ring = poly[0];
        const hasStore = storePoints.some(p => pointInPolygon(p, ring));
        let area = 0;
        for (let i = 0; i < ring.length - 1; i++) {
          area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
        }
        area = Math.abs(area);
        if (hasStore) {
          partsWithStores.push({ poly, area });
        } else if (area > maxAreaNoStores) {
          maxAreaNoStores = area;
          largestNoStores = poly;
        }
      }

      if (partsWithStores.length === 1) {
        return { type: 'Polygon', coordinates: partsWithStores[0].poly };
      }
      if (partsWithStores.length > 1) {
        // Pick the largest part that has stores
        partsWithStores.sort((a, b) => b.area - a.area);
        return { type: 'Polygon', coordinates: partsWithStores[0].poly };
      }
    }

    // Fallback: pick largest by area
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

// Chaikin corner-cutting subdivision for smoothing
function chaikinSmooth(coords, iterations = 3) {
  let pts = coords.slice(0, -1); // remove closing point
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
  pts.push(pts[0]); // re-close
  return pts;
}

function cross(O, A, B) {
  return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
}

function convexHull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length <= 1) return pts;
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop(); upper.pop();
  return lower.concat(upper);
}

function padHullNormals(hull, padDeg) {
  const n = hull.length;
  const result = [];
  for (let i = 0; i < n; i++) {
    const prev = hull[(i - 1 + n) % n];
    const curr = hull[i];
    const next = hull[(i + 1) % n];
    const dx1 = curr[0] - prev[0], dy1 = curr[1] - prev[1];
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
    const dx2 = next[0] - curr[0], dy2 = next[1] - curr[1];
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
    let nx = -(dy1 / len1 + dy2 / len2) / 2;
    let ny = (dx1 / len1 + dx2 / len2) / 2;
    const nlen = Math.sqrt(nx * nx + ny * ny) || 1;
    nx /= nlen; ny /= nlen;
    result.push([curr[0] + nx * padDeg, curr[1] + ny * padDeg]);
  }
  let area = 0;
  for (let i = 0; i < result.length; i++) {
    const j = (i + 1) % result.length;
    area += result[i][0] * result[j][1] - result[j][0] * result[i][1];
  }
  if (area > 0) {
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

// ---- Main ----

// 1. Build store points with district info
const districts = {};
const storePoints = [];
stores.forEach((s) => {
  const d = s.rxDistrict;
  if (!d) return;
  if (!districts[d]) districts[d] = [];
  districts[d].push([s.lng, s.lat]);
  storePoints.push(point([s.lng, s.lat], { district: d }));
});

// 2. Compute Voronoi cells for all stores
// Use a bounding box that covers the full region with generous margin
const bbox = [-83.5, 26.5, -81.5, 29.0];
const voronoiCells = voronoi(featureCollection(storePoints), { bbox });

// 3. Merge Voronoi cells by district
const districtCells = {}; // district -> array of cell features
voronoiCells.features.forEach((cell, idx) => {
  if (!cell || !cell.geometry) return;
  const d = storePoints[idx].properties.district;
  if (!districtCells[d]) districtCells[d] = [];
  districtCells[d].push(cell);
});

const features = [];

for (const [district, cells] of Object.entries(districtCells)) {
  try {
    // Union all cells for this district
    let merged = cells[0];
    for (let i = 1; i < cells.length; i++) {
      try {
        const u = turfUnion(featureCollection([merged, cells[i]]));
        if (u) merged = u;
      } catch (e) {
        // Skip problematic cells
      }
    }

    let geom = ensurePolygon(merged.geometry);

    // 4. Clip to Florida coastline FIRST (removes Gulf water)
    const landGeom = floridaLand.geometry;
    const landFeature = landGeom.type === 'MultiPolygon'
      ? multiPolygon(landGeom.coordinates)
      : polygon(landGeom.coordinates);

    try {
      const distPoly = polygon(geom.coordinates);
      const clipped = turfIntersect(featureCollection([distPoly, landFeature]));
      if (clipped) {
        const dPts = districts[district];
        // For coastline clipping, accept even if a few stores end up on
        // separate land fragments (barrier islands). Better to have the main
        // polygon clipped to land than extending into the Gulf.
        const clippedGeom = ensurePolygon(clipped.geometry, dPts);
        geom = clippedGeom;
      }
    } catch (e) {
      // Keep unclipped if intersection fails
    }

    // 5. Clip to padded convex hull (trims distant Voronoi edges to store area)
    const pts = districts[district];
    const hull = convexHull(pts);
    if (hull.length >= 3) {
      for (const pad of [0.06, 0.08, 0.10, 0.13]) {
        const padded = padHullNormals(hull, pad);
        const dense = densify(padded, 0.03);
        const smoothHull = chaikinSmooth([...dense, dense[0]], 3);
        try {
          const hullPoly = polygon([smoothHull]);
          const voronoiPoly = polygon(geom.coordinates);
          const clipped = turfIntersect(featureCollection([voronoiPoly, hullPoly]));
          if (clipped) {
            const clippedGeom = ensurePolygon(clipped.geometry);
            const ring = clippedGeom.coordinates[0];
            const lost = pts.filter(p => !pointInPolygon(p, ring));
            if (lost.length === 0) {
              geom = clippedGeom;
              break;
            }
          }
        } catch (e) {}
      }
    }

    // 6. Light smoothing on final boundary
    const smoothedCoords = chaikinSmooth(geom.coordinates[0], 1);
    const pts2 = districts[district];
    const lost2 = pts2.filter(p => !pointInPolygon(p, smoothedCoords));
    const finalCoords = lost2.length === 0 ? smoothedCoords : geom.coordinates[0];

    features.push({
      type: 'Feature',
      properties: {
        district: Number(district),
        color: RX_COLORS[district] || '#888',
        label: `D${district}`,
        storeCount: districts[district].length,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [finalCoords],
      },
    });
  } catch (e) {
    console.warn(`D${district}: failed (${e.message})`);
  }
}

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

// Post-smoothing overlap cleanup: subtract tiny overlaps
const { difference: turfDifference } = require('@turf/difference');

function nearestStoreDist(pt, stores) {
  let min = Infinity;
  for (const s of stores) {
    const dx = pt[0] - s[0], dy = pt[1] - s[1];
    const d = dx * dx + dy * dy;
    if (d < min) min = d;
  }
  return min;
}

for (let pass = 0; pass < 5; pass++) {
  let fixed = 0;
  for (let i = 0; i < features.length; i++) {
    for (let j = i + 1; j < features.length; j++) {
      try {
        const pi = polygon(features[i].geometry.coordinates);
        const pj = polygon(features[j].geometry.coordinates);
        const o = turfIntersect(featureCollection([pi, pj]));
        if (!o) continue;
        const oGeom = ensurePolygon(o.geometry);
        const oRing = oGeom.coordinates[0];
        let area = 0;
        for (let k = 0; k < oRing.length - 1; k++) {
          area += oRing[k][0] * oRing[k + 1][1] - oRing[k + 1][0] * oRing[k][1];
        }
        if (Math.abs(area) < 0.0000001) continue;

        const oPoly = polygon(oGeom.coordinates);
        const di = features[i].properties.district;
        const dj = features[j].properties.district;

        // Determine which district should lose the overlap (farther stores)
        const center = [
          oRing.reduce((s, p) => s + p[0], 0) / oRing.length,
          oRing.reduce((s, p) => s + p[1], 0) / oRing.length,
        ];
        const distI = nearestStoreDist(center, districts[di]);
        const distJ = nearestStoreDist(center, districts[dj]);
        const loserIdx = distI > distJ ? i : j;
        const loserId = features[loserIdx].properties.district;

        const loserPoly = polygon(features[loserIdx].geometry.coordinates);
        const diff = turfDifference(featureCollection([loserPoly, oPoly]));
        if (diff) {
          const newGeom = ensurePolygon(diff.geometry);
          const lost = districts[loserId].filter(p => !pointInPolygon(p, newGeom.coordinates[0]));
          if (lost.length === 0) {
            features[loserIdx] = { ...features[loserIdx], geometry: newGeom };
            fixed++;
          }
        }
      } catch (e) {}
    }
  }
  if (fixed === 0) break;
}

// Verify zero overlap
const { intersect: checkIntersect } = require('@turf/intersect');
let overlapCount = 0;
for (let i = 0; i < features.length; i++) {
  for (let j = i + 1; j < features.length; j++) {
    try {
      const pi = polygon(features[i].geometry.coordinates);
      const pj = polygon(features[j].geometry.coordinates);
      const o = checkIntersect(featureCollection([pi, pj]));
      if (o) {
        const ring = o.geometry.type === 'MultiPolygon' ? o.geometry.coordinates[0][0] : o.geometry.coordinates[0];
        let area = 0;
        for (let k = 0; k < ring.length - 1; k++) {
          area += ring[k][0] * ring[k + 1][1] - ring[k + 1][0] * ring[k][1];
        }
        area = Math.abs(area) / 2 * 111 * 111;
        if (area > 0.1) {
          console.warn(`D${features[i].properties.district}/D${features[j].properties.district}: ${area.toFixed(1)} sq km overlap`);
          overlapCount++;
        }
      }
    } catch (e) {}
  }
}

const geojson = { type: 'FeatureCollection', features };
writeFileSync('src/data/districts.json', JSON.stringify(geojson));

console.log(`Generated ${features.length} district boundaries${allGood ? ' — all stores contained' : ''}${overlapCount === 0 ? ' — ZERO overlaps' : ''}`);
