const { parseDateInput } = require('../utils/date');

function validateBookingPayload(payload) {
  const errors = [];

  if (!payload.guest_name || typeof payload.guest_name !== 'string' || !payload.guest_name.trim()) {
    errors.push('guest_name is required');
  }

  if (!payload.source || typeof payload.source !== 'string' || !payload.source.trim()) {
    errors.push('source is required');
  }

  if (!Number.isInteger(Number(payload.room_id))) {
    errors.push('room_id must be a number');
  }

  const checkIn = parseDateInput(payload.check_in);
  const checkOut = parseDateInput(payload.check_out);

  if (!checkIn) {
    errors.push('check_in must be YYYY-MM-DD');
  }

  if (!checkOut) {
    errors.push('check_out must be YYYY-MM-DD');
  }

  if (checkIn && checkOut && checkOut <= checkIn) {
    errors.push('check_out must be later than check_in');
  }

  const allowedStatuses = ['confirmed', 'ota', 'blocked'];
  if (!payload.status || !allowedStatuses.includes(payload.status)) {
    errors.push(`status must be one of: ${allowedStatuses.join(', ')}`);
  }

  return {
    errors,
    data: {
      guest_name: String(payload.guest_name || '').trim(),
      source: String(payload.source || '').trim(),
      room_id: Number(payload.room_id),
      check_in: checkIn,
      check_out: checkOut,
      status: payload.status,
      note: String(payload.note || '').trim(),
    },
  };
}

module.exports = {
  validateBookingPayload,
};
