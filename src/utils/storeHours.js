/**
 * Parse pharmacy hours strings and determine open/closed/closing-soon status.
 *
 * Hours in stores.json are stored as a single string per day type (rxHours / fsHours).
 * Many stores have null hours — we treat those as unknown (not open, not closed).
 *
 * Common formats seen in CVS data:
 *   "Mon-Fri 9:00 AM-9:00 PM, Sat 9:00 AM-6:00 PM, Sun 10:00 AM-5:00 PM"
 *   "Mon-Sun Open 24 Hours"
 *   "Mon-Fri 8:00 AM-10:00 PM, Sat-Sun 9:00 AM-6:00 PM"
 */

const DAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDayRange(dayStr) {
  dayStr = dayStr.trim();
  if (dayStr.includes('-')) {
    const [startDay, endDay] = dayStr.split('-').map((d) => d.trim());
    const start = DAY_MAP[startDay];
    const end = DAY_MAP[endDay];
    if (start == null || end == null) return [];
    const days = [];
    let i = start;
    while (true) {
      days.push(i);
      if (i === end) break;
      i = (i + 1) % 7;
    }
    return days;
  }
  const d = DAY_MAP[dayStr];
  return d != null ? [d] : [];
}

function parseTime(timeStr) {
  timeStr = timeStr.trim().toUpperCase();
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];
  if (period === 'AM' && hours === 12) hours = 0;
  if (period === 'PM' && hours !== 12) hours += 12;
  return hours * 60 + minutes;
}

/**
 * Parse an rxHours or fsHours string into per-day schedule.
 * Returns an object keyed by day index (0=Sun..6=Sat) with { open, close } in minutes from midnight,
 * or { is24: true }, or null if closed.
 */
export function parseHoursString(hoursStr) {
  if (!hoursStr) return null;

  const schedule = {};

  // Split by comma for different day ranges
  const segments = hoursStr.split(',').map((s) => s.trim());

  for (const segment of segments) {
    if (/open\s+24\s+hours/i.test(segment)) {
      // Find which days this applies to
      const dayPart = segment.replace(/open\s+24\s+hours/i, '').trim();
      const days = dayPart ? parseDayRange(dayPart) : [0, 1, 2, 3, 4, 5, 6];
      days.forEach((d) => { schedule[d] = { is24: true }; });
      continue;
    }

    // Pattern: "DayRange HH:MM AM-HH:MM PM"
    const match = segment.match(/^([A-Za-z-]+)\s+(\d{1,2}:\d{2}\s*[APap][Mm])\s*-\s*(\d{1,2}:\d{2}\s*[APap][Mm])$/);
    if (match) {
      const days = parseDayRange(match[1]);
      const open = parseTime(match[2]);
      const close = parseTime(match[3]);
      if (open != null && close != null) {
        days.forEach((d) => { schedule[d] = { open, close }; });
      }
    }
  }

  return Object.keys(schedule).length > 0 ? schedule : null;
}

/**
 * Get pharmacy status for a store at the given time.
 * Returns 'open', 'closed', 'closing' (within 2 hours), or 'unknown'.
 */
export function getPharmacyStatus(store, now) {
  if (store.rx24 === 'Yes') return 'open';

  const schedule = parseHoursString(store.rxHours);
  if (!schedule) return 'unknown';

  const dayOfWeek = now.getDay();
  const daySchedule = schedule[dayOfWeek];
  if (!daySchedule) return 'closed';
  if (daySchedule.is24) return 'open';

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (currentMinutes < daySchedule.open) return 'closed';
  if (currentMinutes >= daySchedule.close) return 'closed';
  if (daySchedule.close - currentMinutes <= 120) return 'closing';
  return 'open';
}

/**
 * Check if a store has significantly different weekend hours vs weekday.
 * Returns true if Saturday or Sunday Rx hours differ meaningfully from Monday.
 */
export function hasWeekendDifference(store) {
  if (store.rx24 === 'Yes') return false;

  const schedule = parseHoursString(store.rxHours);
  if (!schedule) return false;

  const monday = schedule[1]; // Monday
  if (!monday || monday.is24) return false;

  const saturday = schedule[6];
  const sunday = schedule[0];

  // Check Saturday
  if (saturday) {
    if (!saturday.is24) {
      // Close 2+ hours earlier
      if (monday.close - saturday.close >= 120) return true;
      // Open 1+ hour later
      if (saturday.open - monday.open >= 60) return true;
    }
  }

  // Check Sunday
  if (sunday) {
    if (!sunday.is24) {
      if (monday.close - sunday.close >= 120) return true;
      if (sunday.open - monday.open >= 60) return true;
    }
  } else if (monday) {
    // Pharmacy closed on Sunday but open Monday
    return true;
  }

  return false;
}

/**
 * Get formatted hours for each day type for display.
 * Returns { weekday, saturday, sunday } with formatted strings.
 */
export function getFormattedDayHours(store) {
  const schedule = parseHoursString(store.rxHours);
  if (!schedule) return null;

  function formatMinutes(m) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const period = h >= 12 ? 'p' : 'a';
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return min === 0 ? `${displayH}${period}` : `${displayH}:${String(min).padStart(2, '0')}${period}`;
  }

  function formatDaySchedule(dayIdx) {
    const s = schedule[dayIdx];
    if (!s) return 'Closed';
    if (s.is24) return '24hr';
    return `${formatMinutes(s.open)}-${formatMinutes(s.close)}`;
  }

  return {
    weekday: formatDaySchedule(1),  // Monday as representative
    saturday: formatDaySchedule(6),
    sunday: formatDaySchedule(0),
  };
}
