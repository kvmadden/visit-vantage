/**
 * Store status utilities.
 *
 * Hours data is not yet populated in stores.json.
 * Once rxHours / fsHours contain structured data (e.g. "Mon-Fri 8a-9p, Sat 9a-6p, Sun 10a-5p"),
 * parse them here and expose isOpenNow(store).
 *
 * For now this module manages the "viewed" state — stores the user has tapped on
 * during the current session are tracked so the map can render a subtle indicator.
 */

const VIEWED_KEY = 'visitvantage-viewed-stores';

/** @returns {Set<number>} store numbers that have been viewed */
export function getViewedStores() {
  try {
    const raw = sessionStorage.getItem(VIEWED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

/** Mark a store as viewed (persists for the browser session) */
export function markStoreViewed(storeNumber) {
  const viewed = getViewedStores();
  viewed.add(storeNumber);
  try {
    sessionStorage.setItem(VIEWED_KEY, JSON.stringify([...viewed]));
  } catch {
    // sessionStorage full or unavailable — non-critical
  }
}

/**
 * Placeholder for open/closed status.
 * Returns null until hours data is available.
 *
 * @param {object} _store
 * @returns {{ isOpen: boolean, label: string } | null}
 */
export function getStoreStatus(_store) {
  // TODO: implement once rxHours / fsHours are populated with parseable data
  return null;
}
