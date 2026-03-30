import React from "react";

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    background: "white",
    borderBottom: "1px solid #e2e8f0",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    whiteSpace: "nowrap",
  },
  storeCount: {
    fontSize: 13,
    color: "#718096",
    marginRight: 4,
    flexShrink: 0,
  },
  pillBase: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    padding: "6px 14px",
    fontSize: 13,
    minHeight: 36,
    border: "none",
    cursor: "pointer",
    flexShrink: 0,
    lineHeight: 1,
    transition: "background 0.15s, color 0.15s",
  },
  pillInactive: {
    background: "#e2e8f0",
    color: "#4a5568",
  },
  pillActive: {
    background: "#4a5568",
    color: "white",
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    background: "#cbd5e0",
    flexShrink: 0,
    margin: "0 4px",
  },
  clearButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    padding: "6px 14px",
    fontSize: 13,
    minHeight: 36,
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#e53e3e",
    cursor: "pointer",
    flexShrink: 0,
    lineHeight: 1,
  },
};

// Hide scrollbar via a <style> tag injected once
const scrollbarCSS = `
.filter-bar::-webkit-scrollbar { display: none; }
.filter-bar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FilterBar({
  chains = [],
  districts = [],
  districtNames = {},
  activeChains = new Set(),
  activeDistricts = new Set(),
  onToggleChain,
  onToggleDistrict,
  onClearFilters,
  storeCount = 0,
  totalCount = 0,
}) {
  const hasActiveFilters = activeChains.size > 0 || activeDistricts.size > 0;

  const pillStyle = (isActive) => ({
    ...styles.pillBase,
    ...(isActive ? styles.pillActive : styles.pillInactive),
  });

  return (
    <>
      <style>{scrollbarCSS}</style>
      <div className="filter-bar" style={styles.container}>
        {/* Store count label */}
        <span style={styles.storeCount}>
          {storeCount} of {totalCount} stores
        </span>

        {/* Chain pills */}
        {chains.map((chain) => {
          const isActive = activeChains.has(chain);
          return (
            <button
              key={`chain-${chain}`}
              className={`filter-pill${isActive ? " active" : ""}`}
              style={pillStyle(isActive)}
              onClick={() => onToggleChain(chain)}
              type="button"
            >
              {chain}
            </button>
          );
        })}

        {/* Divider between chains and districts */}
        {chains.length > 0 && districts.length > 0 && (
          <div style={styles.divider} />
        )}

        {/* District pills */}
        {districts.map((district) => {
          const isActive = activeDistricts.has(district);
          const label = districtNames[district]
            ? districtNames[district]
            : `District ${district}`;
          return (
            <button
              key={`district-${district}`}
              className={`filter-pill${isActive ? " active" : ""}`}
              style={pillStyle(isActive)}
              onClick={() => onToggleDistrict(district)}
              type="button"
            >
              {label}
            </button>
          );
        })}

        {/* Clear button */}
        {hasActiveFilters && (
          <button
            style={styles.clearButton}
            onClick={onClearFilters}
            type="button"
          >
            Clear
          </button>
        )}
      </div>
    </>
  );
}
