import { readFileSync, writeFileSync } from 'fs';

const stores = JSON.parse(readFileSync('src/data/stores.json', 'utf8'));

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocodeAddress(address, city, zip) {
  const query = `${address}, ${city}, FL ${zip}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=us`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'StoreSprint-Geocoder/1.0' },
  });

  if (!res.ok) {
    console.warn(`HTTP ${res.status} for "${query}"`);
    return null;
  }

  const data = await res.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }

  // Fallback: try just city + state + zip
  const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${city}, FL ${zip}`)}&limit=1&countrycodes=us`;
  await delay(1100);
  const res2 = await fetch(fallbackUrl, {
    headers: { 'User-Agent': 'StoreSprint-Geocoder/1.0' },
  });
  if (res2.ok) {
    const data2 = await res2.json();
    if (data2.length > 0) {
      return { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) };
    }
  }

  return null;
}

let success = 0;
let failed = 0;

for (let i = 0; i < stores.length; i++) {
  const s = stores[i];
  const coords = await geocodeAddress(s.address, s.city, s.zip);

  if (coords) {
    s.lat = Number(coords.lat.toFixed(6));
    s.lng = Number(coords.lng.toFixed(6));
    success++;
    console.log(`[${i + 1}/${stores.length}] #${s.store} ${s.address}, ${s.city} → ${s.lat}, ${s.lng}`);
  } else {
    failed++;
    console.warn(`[${i + 1}/${stores.length}] #${s.store} FAILED — keeping ZIP centroid`);
  }

  // Nominatim rate limit: 1 req/sec
  await delay(1100);
}

writeFileSync('src/data/stores.json', JSON.stringify(stores, null, 2));
console.log(`\nDone: ${success} geocoded, ${failed} kept ZIP centroids`);
