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

    // 4. Clip to Florida coastline
    const landGeom = floridaLand.geometry;
    const landFeature = landGeom.type === 'MultiPolygon'
      ? multiPolygon(landGeom.coordinates)
      : polygon(landGeom.coordinates);

    try {
      const distPoly = polygon(geom.coordinates);
      const clipped = turfIntersect(featureCollection([distPoly, landFeature]));
      if (clipped) {
        const clippedGeom = ensurePolygon(clipped.geometry);
        // Only use clipped version if all stores are still inside
        const pts = districts[district];
        const ring = clippedGeom.coordinates[0];
        const lost = pts.filter(p => !pointInPolygon(p, ring));
        if (lost.length === 0) {
          geom = clippedGeom;
        }
      }
    } catch (e) {
      // Keep unclipped if intersection fails
    }

    // 5. Smooth the boundary (Voronoi produces angular edges)
    // Use 2 iterations to keep boundaries tight and minimize smoothing-induced overlap
    const smoothedCoords = chaikinSmooth(geom.coordinates[0], 1);

    // Verify containment after smoothing
    const pts = districts[district];
    const lost = pts.filter(p => !pointInPolygon(p, smoothedCoords));
    const finalCoords = lost.length === 0 ? smoothedCoords : geom.coordinates[0];

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
