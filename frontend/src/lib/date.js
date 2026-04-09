const DAY_MS = 24 * 60 * 60 * 1000;

export function parseIsoDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function todayIso() {
  const now = new Date();
  return formatIsoDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function addDays(value, days) {
  const date = typeof value === 'string' ? parseIsoDate(value) : new Date(value);
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return typeof value === 'string' ? formatIsoDate(next) : next;
}

export function diffDays(start, end) {
  return Math.round((parseIsoDate(end) - parseIsoDate(start)) / DAY_MS);
}

export function buildDateRange(startDate, length) {
  return Array.from({ length }, (_, index) => addDays(startDate, index));
}

export function formatDayNumber(dateString) {
  return parseIsoDate(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatWeekday(dateString) {
  return parseIsoDate(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  });
}

export function formatMonthLabel(dateString) {
  return parseIsoDate(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatLongDate(dateString) {
  return parseIsoDate(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function isWeekend(dateString) {
  const day = parseIsoDate(dateString).getUTCDay();
  return day === 0 || day === 6;
}

export function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}
