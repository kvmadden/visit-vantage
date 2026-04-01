import React, { useMemo } from 'react';
import { getPharmacyStatus, hasWeekendDifference } from '../utils/storeHours';

const CHIPS = [
  { key: 'openNow', label: 'Open now', filter: (s, now) => getPharmacyStatus(s, now) === 'open' },
  { key: 'closingSoon', label: 'Closing soon', filter: (s, now) => getPharmacyStatus(s, now) === 'closing' },
  { key: 'rx24', label: '24hr Rx', filter: (s) => s.rx24 === 'Yes' },
  { key: 'target', label: 'Target', filter: (s) => s.target === true },
  { key: 'minuteClinic', label: 'MinuteClinic', filter: (s) => s.minuteClinic === 'Yes' },
  { key: 'driveThru', label: 'Drive-Thru', filter: (s) => s.driveThru === 'Yes' },
  { key: 'ymas', label: 'y más', filter: (s) => s.ymas === 'Yes' },
  { key: 'weekendHours', label: 'Wknd diff', filter: (s) => hasWeekendDifference(s) },
];

export default function QuickFilterChips({ stores, activeChips, onToggleChip }) {
  const now = useMemo(() => new Date(), []);

  const chipCounts = useMemo(() => {
    const counts = {};
    CHIPS.forEach((chip) => {
      counts[chip.key] = stores.filter((s) => chip.filter(s, now)).length;
    });
    return counts;
  }, [stores, now]);

  return (
    <div className="quick-filter-row">
      {CHIPS.map((chip) => {
        const count = chipCounts[chip.key];
        const isActive = activeChips.includes(chip.key);
        const isDisabled = count === 0 && !isActive;

        return (
          <button
            key={chip.key}
            className={`quick-chip${isActive ? ' quick-chip-active' : ''}${isDisabled ? ' quick-chip-disabled' : ''}`}
            onClick={() => !isDisabled && onToggleChip(chip.key)}
            disabled={isDisabled}
          >
            {chip.label}
            {!isActive && <span className="quick-chip-count">({count})</span>}
          </button>
        );
      })}
    </div>
  );
}

// Export CHIPS for use in filtering logic
export { CHIPS };
