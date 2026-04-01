/**
 * Generate district boundary GeoJSON from store coordinates.
 *
 * Generates BOTH Rx district (D20-D27) and FS district (D1-D5) boundaries.
 * Approach: Voronoi tessellation → merge cells by district → smooth →
 * clip to coastline. Voronoi guarantees zero overlap by construction.
 */
import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { voronoi } = require('@turf/voronoi');
const { intersect: turfIntersect } = require('@turf/intersect');
const { union: turfUnion } = require('@turf/union');
const { difference: turfDifference } = require('@turf/difference');
const { polygon, point, featureCollection, multiPolygon } = require('@turf/helpers');

const stores = JSON.parse(readFileSync('src/data/stores.json', 'utf-8'));
const floridaLand = JSON.parse(readFileSync('src/data/florida-land.geojson', 'utf-8'));

const RX_COLORS = {
  20: '#4A9EFF',
  21: '#3D9A6D',
  22: '#f59e0b',
  23: '#e879a8',
  24: '#8b5cf6',
  25: '#F472B6',
  26: '#06b6d4',
  27: '#fb923c',
};

const FS_COLORS = {
  1: '#e04040',
  2: '#2196f3',
  3: '#8bc34a',
  4: '#ff9800',
  5: '#9c27b0',
};

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

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
    if (storePoints && storePoints.length > 0) {
      const partsWithStores = [];
      for (const poly of geom.coordinates) {
        const ring = poly[0];
        const hasStore = storePoints.some(p => pointInPolygon(p, ring));
        let area = 0;
        for (let i = 0; i < ring.length - 1; i++) {
          area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
        }
        area = Math.abs(area);
        if (hasStore) partsWithStores.push({ poly, area });
      }
      if (partsWithStores.length >= 1) {
        partsWithStores.sort((a, b) => b.area - a.area);
        return { type: 'Polygon', coordinates: partsWithStores[0].poly };
      }
    }
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

function chaikinSmooth(coords, iterations = 3) {
  let pts = coords.slice(0, -1);
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
  pts.push(pts[0]);
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

function nearestStoreDist(pt, stores) {
  let min = Infinity;
  for (const s of stores) {
    const dx = pt[0] - s[0], dy = pt[1] - s[1];
    const d = dx * dx + dy * dy;
    if (d < min) min = d;
  }
  return min;
}

function unionCorridor(feature, corridorCoords) {
  try {
    const distPoly = polygon(feature.geometry.coordinates);
    const corrPoly = polygon([corridorCoords]);
    const merged = turfUnion(featureCollection([distPoly, corrPoly]));
    if (merged) {
      const geom = ensurePolygon(merged.geometry);
      feature.geometry = geom;
      return true;
    }
  } catch (e) {
    console.warn(`  unionCorridor failed: ${e.message}`);
  }
  return false;
}

function reclipToCoast(feature, storePoints) {
  try {
    const landGeom = floridaLand.geometry;
    const landFeature = landGeom.type === 'MultiPolygon'
      ? multiPolygon(landGeom.coordinates)
      : polygon(landGeom.coordinates);
    const distPoly = polygon(feature.geometry.coordinates);
    const clipped = turfIntersect(featureCollection([distPoly, landFeature]));
    if (clipped) {
      const newGeom = ensurePolygon(clipped.geometry, storePoints);
      const lost = storePoints.filter(p => !pointInPolygon(p, newGeom.coordinates[0]));
      if (lost.length === 0) {
        feature.geometry = newGeom;
        return true;
      }
    }
  } catch (e) {}
  return false;
}

function smoothFeature(feature, storePoints, iterations = 1) {
  const smoothed = chaikinSmooth(feature.geometry.coordinates[0], iterations);
  const lost = storePoints.filter(p => !pointInPolygon(p, smoothed));
  if (lost.length === 0) {
    feature.geometry = { type: 'Polygon', coordinates: [smoothed] };
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Water exclusion zones — subtract these from all district boundaries
// to prevent polygons from crossing bays via causeways/bridges
// ---------------------------------------------------------------------------

// Old Tampa Bay (between Pinellas peninsula and Tampa mainland)
// East edge ~-82.52 (just west of D20 store #998 at -82.519)
// West edge ~-82.64 (just east of D22 store #16495 at -82.644)
const OLD_TAMPA_BAY = [
  // Southern narrows (Howard Frankland / Gandy Bridge area)
  [-82.635, 27.79],
  [-82.57, 27.78],
  [-82.54, 27.79],
  // Eastern shore (Tampa side) — north
  [-82.52, 27.82],
  [-82.52, 27.85],
  [-82.52, 27.88],
  [-82.52, 27.91],
  [-82.52, 27.94],
  // Northern narrows (Courtney Campbell Causeway)
  [-82.54, 27.96],
  [-82.57, 27.97],
  [-82.60, 27.97],
  [-82.62, 27.96],
  // Western shore (Pinellas side) — south
  [-82.635, 27.94],
  [-82.635, 27.92],
  [-82.635, 27.90],
  [-82.63, 27.88],
  [-82.62, 27.86],
  [-82.61, 27.84],
  [-82.61, 27.82],
  [-82.62, 27.80],
  [-82.635, 27.79],   // close ring
];

function subtractWaterZones(features, districts) {
  const waterPoly = polygon([OLD_TAMPA_BAY]);
  for (const feature of features) {
    try {
      const distPoly = polygon(feature.geometry.coordinates);
      const diff = turfDifference(featureCollection([distPoly, waterPoly]));
      if (diff) {
        const d = feature.properties.district;
        const pts = districts[d];
        const newGeom = ensurePolygon(diff.geometry, pts);
        const lost = pts.filter(p => !pointInPolygon(p, newGeom.coordinates[0]));
        if (lost.length === 0) {
          feature.geometry = newGeom;
        } else {
          console.warn(`D${d}: water subtraction would lose ${lost.length} stores — skipping`);
        }
      }
    } catch (e) {
      console.warn(`Water subtraction failed for D${feature.properties.district}: ${e.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Core pipeline: Voronoi → merge → clip → trim → smooth → cleanup
// ---------------------------------------------------------------------------

function generateBoundaries(allStores, districtField, colorMap, storeFilter) {
  const districts = {};
  const storePoints = [];
  allStores.forEach((s) => {
    if (storeFilter && !storeFilter(s)) return;
    const d = s[districtField];
    if (!d) return;
    if (!districts[d]) districts[d] = [];
    districts[d].push([s.lng, s.lat]);
    storePoints.push(point([s.lng, s.lat], { district: d }));
  });

  const bbox = [-83.5, 26.5, -81.5, 29.0];
  const voronoiCells = voronoi(featureCollection(storePoints), { bbox });

  const districtCells = {};
  voronoiCells.features.forEach((cell, idx) => {
    if (!cell || !cell.geometry) return;
    const d = storePoints[idx].properties.district;
    if (!districtCells[d]) districtCells[d] = [];
    districtCells[d].push(cell);
  });

  const features = [];

  for (const [district, cells] of Object.entries(districtCells)) {
    try {
      let merged = cells[0];
      for (let i = 1; i < cells.length; i++) {
        try {
          const u = turfUnion(featureCollection([merged, cells[i]]));
          if (u) merged = u;
        } catch (e) {}
      }

      let geom = ensurePolygon(merged.geometry);

      // Clip to Florida coastline
      const landGeom = floridaLand.geometry;
      const landFeature = landGeom.type === 'MultiPolygon'
        ? multiPolygon(landGeom.coordinates)
        : polygon(landGeom.coordinates);

      try {
        const distPoly = polygon(geom.coordinates);
        const clipped = turfIntersect(featureCollection([distPoly, landFeature]));
        if (clipped) {
          const dPts = districts[district];
          const clippedGeom = ensurePolygon(clipped.geometry, dPts);
          geom = clippedGeom;
        }
      } catch (e) {}

      // Clip to padded convex hull
      const pts = districts[district];
      const hull = convexHull(pts);
      if (hull.length >= 3) {
        for (const pad of [0.025, 0.035, 0.05, 0.07]) {
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

      // Light smoothing
      const smoothedCoords = chaikinSmooth(geom.coordinates[0], 1);
      const lost2 = pts.filter(p => !pointInPolygon(p, smoothedCoords));
      const finalCoords = lost2.length === 0 ? smoothedCoords : geom.coordinates[0];

      features.push({
        type: 'Feature',
        properties: {
          district: Number(district),
          color: colorMap[district] || '#888',
          label: `D${district}`,
          storeCount: districts[district].length,
        },
        geometry: { type: 'Polygon', coordinates: [finalCoords] },
      });
    } catch (e) {
      console.warn(`D${district}: failed (${e.message})`);
    }
  }

  // Overlap cleanup (5 passes)
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

  return { features, districts };
}

// ---------------------------------------------------------------------------
// Verification helpers
// ---------------------------------------------------------------------------

function verifyContainment(features, districts, label = '') {
  let allGood = true;
  features.forEach(f => {
    const d = f.properties.district;
    const ring = f.geometry.coordinates[0];
    const pts = districts[d];
    const out = pts.filter(p => !pointInPolygon(p, ring));
    if (out.length > 0) {
      console.warn(`${label}D${d}: ${out.length} stores outside`);
      allGood = false;
    }
  });
  return allGood;
}

function verifyNoOverlap(features, label = '') {
  let overlapCount = 0;
  for (let i = 0; i < features.length; i++) {
    for (let j = i + 1; j < features.length; j++) {
      try {
        const pi = polygon(features[i].geometry.coordinates);
        const pj = polygon(features[j].geometry.coordinates);
        const o = turfIntersect(featureCollection([pi, pj]));
        if (o) {
          const ring = o.geometry.type === 'MultiPolygon' ? o.geometry.coordinates[0][0] : o.geometry.coordinates[0];
          let area = 0;
          for (let k = 0; k < ring.length - 1; k++) {
            area += ring[k][0] * ring[k + 1][1] - ring[k + 1][0] * ring[k][1];
          }
          area = Math.abs(area) / 2 * 111 * 111;
          if (area > 0.1) {
            console.warn(`${label}D${features[i].properties.district}/D${features[j].properties.district}: ${area.toFixed(1)} sq km overlap`);
            overlapCount++;
          }
        }
      } catch (e) {}
    }
  }
  return overlapCount;
}

// ====================================================================
// Generate Rx district boundaries (D20-D27)
// ====================================================================
console.log('--- Rx Districts ---');
const rx = generateBoundaries(stores, 'rxDistrict', RX_COLORS);
const rxFeatures = rx.features;
const rxDistricts = rx.districts;

verifyContainment(rxFeatures, rxDistricts, '[pre-exception] Rx ');

// Rx-specific exceptions
// D23 — Clearwater Beach store 3001 on barrier island
{
  const f23 = rxFeatures.find(f => f.properties.district === 23);
  if (f23) {
    const store3001 = [-82.8268, 27.9810];
    const bridgeStrip = [
      [-82.798, 27.964],
      [-82.835, 27.966],
      [-82.835, 27.993],
      [-82.820, 27.993],
      [-82.820, 27.976],
      [-82.798, 27.974],
      [-82.798, 27.964],
    ];
    if (unionCorridor(f23, bridgeStrip)) {
      if (pointInPolygon(store3001, f23.geometry.coordinates[0])) {
        console.log('Exception D23: causeway bridge to Clearwater Beach — continuous shape');
      } else {
        console.warn('Exception D23: bridge added but store 3001 still outside');
      }
      smoothFeature(f23, rxDistricts[23], 2);
    }
  }
}

// D24 — Port Richey store 3217, coastal corridor west of US-19
{
  const f24 = rxFeatures.find(f => f.properties.district === 24);
  const f21 = rxFeatures.find(f => f.properties.district === 21);
  if (f24) {
    const store3217 = [-82.6985, 28.3308];
    const corridor = [
      [-82.730, 28.210], [-82.730, 28.250], [-82.730, 28.290],
      [-82.710, 28.305], [-82.685, 28.315], [-82.685, 28.345],
      [-82.755, 28.345], [-82.752, 28.320], [-82.750, 28.300],
      [-82.752, 28.275], [-82.755, 28.250], [-82.758, 28.230],
      [-82.760, 28.210], [-82.730, 28.210],
    ];
    if (unionCorridor(f24, corridor)) {
      if (pointInPolygon(store3217, f24.geometry.coordinates[0])) {
        console.log('Exception D24: coastal corridor to Port Richey — continuous shape');
      } else {
        console.warn('Exception D24: corridor added but store 3217 still outside');
      }
      reclipToCoast(f24, rxDistricts[24]);
      smoothFeature(f24, rxDistricts[24], 2);
      if (f21) {
        try {
          const d21Poly = polygon(f21.geometry.coordinates);
          const d24Poly = polygon(f24.geometry.coordinates);
          const diff = turfDifference(featureCollection([d21Poly, d24Poly]));
          if (diff) {
            const newGeom = ensurePolygon(diff.geometry);
            const lost = rxDistricts[21].filter(p => !pointInPolygon(p, newGeom.coordinates[0]));
            if (lost.length === 0) {
              f21.geometry = newGeom;
              console.log('  → D21 trimmed along corridor (no stores lost)');
            } else {
              console.warn(`  → D21 would lose ${lost.length} stores — keeping small overlap`);
            }
          }
        } catch (e) {}
      }
    }
  }
}

subtractWaterZones(rxFeatures, rxDistricts);
const rxContained = verifyContainment(rxFeatures, rxDistricts, 'Rx ');
const rxOverlaps = verifyNoOverlap(rxFeatures, 'Rx ');
const rxGeoJSON = { type: 'FeatureCollection', features: rxFeatures };
writeFileSync('src/data/districts.json', JSON.stringify(rxGeoJSON));
console.log(`Rx: ${rxFeatures.length} districts${rxContained ? ' — all stores contained' : ''}${rxOverlaps === 0 ? ' — ZERO overlaps' : ''}`);

// ====================================================================
// Generate FS district boundaries (D1-D5)
// ====================================================================
console.log('\n--- FS Districts ---');
// Exclude Target stores (fsDistrict 98) from FS boundary generation
const fs = generateBoundaries(stores, 'fsDistrict', FS_COLORS, (s) => s.target !== true);
const fsFeatures = fs.features;
const fsDistricts = fs.districts;

// FS D2 — Clearwater Beach store 3001 on barrier island (same as Rx D23)
{
  const f2 = fsFeatures.find(f => f.properties.district === 2);
  if (f2) {
    const store3001 = [-82.8268, 27.9810];
    const bridgeStrip = [
      [-82.798, 27.964],
      [-82.835, 27.966],
      [-82.835, 27.993],
      [-82.820, 27.993],
      [-82.820, 27.976],
      [-82.798, 27.974],
      [-82.798, 27.964],
    ];
    if (unionCorridor(f2, bridgeStrip)) {
      if (pointInPolygon(store3001, f2.geometry.coordinates[0])) {
        console.log('Exception FS D2: causeway bridge to Clearwater Beach');
      }

      // Re-clip to padded convex hull — the bridge exception fixes the hull
      // check that previously failed (store 3001 was outside after coastline clip)
      const pts = fsDistricts[2];
      const hull = convexHull(pts);
      if (hull.length >= 3) {
        for (const pad of [0.025, 0.035, 0.05, 0.07]) {
          const padded = padHullNormals(hull, pad);
          const dense = densify(padded, 0.03);
          const smoothHull = chaikinSmooth([...dense, dense[0]], 3);
          try {
            const hullPoly = polygon([smoothHull]);
            const distPoly = polygon(f2.geometry.coordinates);
            const clipped = turfIntersect(featureCollection([distPoly, hullPoly]));
            if (clipped) {
              const clippedGeom = ensurePolygon(clipped.geometry);
              const ring = clippedGeom.coordinates[0];
              const lost = pts.filter(p => !pointInPolygon(p, ring));
              if (lost.length === 0) {
                f2.geometry = clippedGeom;
                console.log(`  → D2 re-trimmed to hull (pad=${pad})`);
                break;
              }
            }
          } catch (e) {}
        }
      }

      smoothFeature(f2, fsDistricts[2], 2);
    }
  }
}

subtractWaterZones(fsFeatures, fsDistricts);
const fsContained = verifyContainment(fsFeatures, fsDistricts, 'FS ');
const fsOverlaps = verifyNoOverlap(fsFeatures, 'FS ');
const fsGeoJSON = { type: 'FeatureCollection', features: fsFeatures };
writeFileSync('src/data/fs-districts.json', JSON.stringify(fsGeoJSON));
console.log(`FS: ${fsFeatures.length} districts${fsContained ? ' — all stores contained' : ''}${fsOverlaps === 0 ? ' — ZERO overlaps' : ''}`);
