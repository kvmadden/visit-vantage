import { useState, useEffect, useRef } from 'react';

const LAYERS = {
  tier1: {
    label: 'Default',
    items: [
      { key: 'food', label: 'Food & Drink', icon: '🍽' },
      { key: 'sports', label: 'Sports & Entertainment', icon: '⚽' },
      { key: 'culture', label: 'Culture & Landmarks', icon: '🏛' },
    ],
  },
  tier2: {
    label: 'More',
    items: [
      { key: 'beaches', label: 'Beaches', icon: '🏖' },
      { key: 'outdoors', label: 'Outdoors & Nature', icon: '🌿' },
      { key: 'hotels', label: 'Hotels & Stays', icon: '🏨' },
    ],
  },
  tier3: {
    label: 'Extra',
    items: [
      { key: 'shopping', label: 'Shopping & Districts', icon: '🛍' },
      { key: 'nightlife', label: 'Nightlife', icon: '🌙' },
      { key: 'education', label: 'Universities & Medical', icon: '🎓' },
    ],
  },
  other: {
    label: 'Overlays',
    items: [
      { key: 'competitors', label: 'Competitors', icon: '🔴' },
      { key: 'districts', label: 'District Clouds', icon: '☁' },
    ],
  },
};

const LS_KEY = 'visitvantage-layers';

function getDefaultLayers() {
  return {
    food: true,
    sports: true,
    culture: true,
    beaches: false,
    outdoors: false,
    hotels: false,
    shopping: false,
    nightlife: false,
    education: false,
    competitors: false,
    districts: true,
  };
}

function loadLayers() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return { ...getDefaultLayers(), ...JSON.parse(saved) };
  } catch {}
  return getDefaultLayers();
}

export default function LayerPanel({ onLayerChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTier3, setShowTier3] = useState(false);
  const [layers, setLayers] = useState(() => loadLayers());

  const mountedRef = useRef(false);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(layers));
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    onLayerChange?.(layers);
  }, [layers, onLayerChange]);

  const toggle = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) {
    return (
      <button
        className="layer-toggle-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open layers"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </button>
    );
  }

  return (
    <div className="layer-panel fade-in">
      <div className="layer-panel-header">
        <span style={{ fontWeight: 600, fontSize: 14 }}>Layers</span>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 14,
            padding: 4,
          }}
          aria-label="Close layers"
        >
          ✕
        </button>
      </div>

      {[LAYERS.tier1, LAYERS.tier2].map((tier) => (
        <div key={tier.label} className="layer-group">
          {tier.items.map((item) => (
            <label key={item.key} className="layer-item">
              <input
                type="checkbox"
                checked={layers[item.key]}
                onChange={() => toggle(item.key)}
              />
              <span className="layer-item-label">
                <span className="layer-item-icon">{item.icon}</span>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      ))}

      {!showTier3 ? (
        <button
          className="layer-more-btn"
          onClick={() => setShowTier3(true)}
        >
          More layers...
        </button>
      ) : (
        <div className="layer-group">
          {LAYERS.tier3.items.map((item) => (
            <label key={item.key} className="layer-item">
              <input
                type="checkbox"
                checked={layers[item.key]}
                onChange={() => toggle(item.key)}
              />
              <span className="layer-item-label">
                <span className="layer-item-icon">{item.icon}</span>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="layer-group" style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        {LAYERS.other.items.map((item) => (
          <label key={item.key} className="layer-item">
            <input
              type="checkbox"
              checked={layers[item.key]}
              onChange={() => toggle(item.key)}
            />
            <span className="layer-item-label">
              <span className="layer-item-icon">{item.icon}</span>
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
