function parseDateInput(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const match = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!match) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return value;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

module.exports = {
  addDays,
  parseDateInput,
};
