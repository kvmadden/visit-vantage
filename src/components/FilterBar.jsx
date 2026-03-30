import React from 'react';
import { RX_COLORS } from '../utils/colors';

const DISTRICTS = [20, 21, 22, 23, 24, 25, 26, 27];

const FLAG_LABELS = {
  fs24: 'FS 24hr',
  rx24: 'Rx 24hr',
  ymas: 'Y M\u00e1s',
  target: 'Target',
};

const FLAG_KEYS = ['fs24', 'rx24', 'ymas', 'target'];

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    padding: '8px 12px',
    scrollbarWidth: 'none',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#3f3f46',
    color: '#fafafa',
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  pillBase: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    padding: '4px 14px',
    borderRadius: 9999,
    border: '1.5px solid',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
    userSelect: 'none',
  },
  inactive: {
    backgroundColor: '#18181b',
    borderColor: '#3f3f46',
    color: '#a1a1aa',
  },
  activeFlag: {
    backgroundColor: '#3f3f46',
    borderColor: '#3f3f46',
    color: '#fafafa',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#3f3f46',
    flexShrink: 0,
  },
  districtViewActive: {
    backgroundColor: '#3f3f46',
    borderColor: '#a1a1aa',
    color: '#fafafa',
  },
};

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function FilterBar({
  activeDistrict,
  onDistrictChange,
  flags,
  onFlagToggle,
  storeCount,
  districtView,
  onDistrictViewToggle,
}) {
  const districtPillStyle = (district) => {
    const isActive = activeDistrict === district;
    const color = RX_COLORS[district];
    if (isActive) {
      return {
        ...styles.pillBase,
        backgroundColor: hexToRgba(color, 0.1),
        borderColor: color,
        color: color,
      };
    }
    return { ...styles.pillBase, ...styles.inactive };
  };

  const allActive = activeDistrict === null;

  return (
    <div className="filter-bar" style={styles.container}>
      {/* Store count badge */}
      <span style={styles.badge}>{storeCount}</span>

      {/* "All" pill */}
      <button
        className={`filter-pill${allActive ? ' active' : ''}`}
        style={
          allActive
            ? { ...styles.pillBase, ...styles.activeFlag }
            : { ...styles.pillBase, ...styles.inactive }
        }
        onClick={() => onDistrictChange(null)}
      >
        All
      </button>

      {/* District pills D20-D27 */}
      {DISTRICTS.map((d) => (
        <button
          key={d}
          className={`filter-pill${activeDistrict === d ? ' active' : ''}`}
          style={districtPillStyle(d)}
          onClick={() => onDistrictChange(d)}
        >
          D{d}
        </button>
      ))}

      {/* Divider */}
      <span style={styles.divider} aria-hidden="true" />

      {/* Flag toggles */}
      {FLAG_KEYS.map((key) => {
        const isActive = flags[key];
        return (
          <button
            key={key}
            className={`filter-pill${isActive ? ' active' : ''}`}
            style={
              isActive
                ? { ...styles.pillBase, ...styles.activeFlag }
                : { ...styles.pillBase, ...styles.inactive }
            }
            onClick={() => onFlagToggle(key)}
          >
            {FLAG_LABELS[key]}
          </button>
        );
      })}

      {/* Divider */}
      <span style={styles.divider} aria-hidden="true" />

      {/* District View toggle */}
      <button
        className={`filter-pill${districtView ? ' active' : ''}`}
        style={
          districtView
            ? { ...styles.pillBase, ...styles.districtViewActive }
            : { ...styles.pillBase, ...styles.inactive }
        }
        onClick={onDistrictViewToggle}
      >
        District View
      </button>
    </div>
  );
}

export default FilterBar;
