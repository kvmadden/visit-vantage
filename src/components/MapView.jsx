import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CHAIN_COLORS = {
  CVS: '#cc0000',
  Walgreens: '#1a7b1a',
  Walmart: '#0071ce',
  Publix: '#4b8f29',
  'Winn-Dixie': '#e31837',
  'Rite Aid': '#1e3c78',
  Target: '#cc0000',
  Costco: '#e31837',
  "Sam's Club": '#0060a9',
  Kroger: '#0062ac',
};

const DEFAULT_CENTER = [27.9506, -82.4572];
const DEFAULT_ZOOM = 10;

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

const ROUTE_LINE_OPTIONS = {
  color: '#4a90d9',
  weight: 3,
  dashArray: '10, 6',
};

function createMarkerIcon(color, isSelected = false, routeNumber = null) {
  const size = isSelected ? 20 : 14;
  const outerSize = isSelected ? 32 : 14;
  const selectedRing = isSelected
    ? `<div class="marker-selected" style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${outerSize}px;
        height: ${outerSize}px;
        border-radius: 50%;
        border: 3px solid ${color};
        opacity: 0.6;
      "></div>`
    : '';

  const routeLabel = routeNumber != null
    ? `<div style="
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4a90d9;
        color: #fff;
        font-size: 11px;
        font-weight: bold;
        width: 20px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      ">${routeNumber}</div>`
    : '';

  const html = `
    <div style="position: relative; width: ${outerSize}px; height: ${outerSize}px;">
      ${selectedRing}
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      "></div>
      ${routeLabel}
    </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [outerSize, outerSize],
    iconAnchor: [outerSize / 2, outerSize / 2],
    popupAnchor: [0, -(outerSize / 2)],
  });
}

function FlyToStore({ selectedStore }) {
  const map = useMap();

  useEffect(() => {
    if (selectedStore && selectedStore.lat && selectedStore.lng) {
      map.flyTo([selectedStore.lat, selectedStore.lng], 14, {
        duration: 1.2,
      });
    }
  }, [selectedStore, map]);

  return null;
}

function MapView({ stores = [], selectedStore = null, onStoreSelect, routeStores = [] }) {
  const routeIndexMap = useMemo(() => {
    const map = new Map();
    routeStores.forEach((store, index) => {
      map.set(store.id, index + 1);
    });
    return map;
  }, [routeStores]);

  const routePositions = useMemo(() => {
    return routeStores
      .filter((s) => s.lat && s.lng)
      .map((s) => [s.lat, s.lng]);
  }, [routeStores]);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <FlyToStore selectedStore={selectedStore} />

      {stores.map((store) => {
        if (!store.lat || !store.lng) return null;

        const isSelected = selectedStore && selectedStore.id === store.id;
        const color = CHAIN_COLORS[store.chain] || '#888888';
        const routeNumber = routeIndexMap.get(store.id) || null;
        const icon = createMarkerIcon(color, isSelected, routeNumber);

        return (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            icon={icon}
            eventHandlers={{
              click: () => {
                if (onStoreSelect) {
                  onStoreSelect(store);
                }
              },
            }}
          >
            <Popup>
              <div>
                <strong>{store.name}</strong>
                <br />
                {store.address}
                <br />
                {store.city}, {store.state} {store.zip}
                <br />
                <em>{store.chain}</em>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {routePositions.length > 1 && (
        <Polyline positions={routePositions} pathOptions={ROUTE_LINE_OPTIONS} />
      )}
    </MapContainer>
  );
}

export default MapView;
