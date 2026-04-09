async function importBookingFromOTA(payload) {
  return {
    imported: false,
    message: 'OTA import is prepared but not connected yet.',
    payload,
  };
}

async function syncCalendar() {
  return {
    synced: false,
    message: 'Calendar sync is prepared but no OTA provider is configured yet.',
  };
}

module.exports = {
  importBookingFromOTA,
  syncCalendar,
};
