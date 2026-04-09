const bookingRepository = require('../repositories/bookingRepository');
const roomRepository = require('../repositories/roomRepository');
const HttpError = require('../utils/httpError');
const { addDays, parseDateInput } = require('../utils/date');

async function getBookings(startDate, endDate) {
  const parsedStartDate = parseDateInput(startDate);
  const parsedEndDate = parseDateInput(endDate);

  if (!parsedStartDate || !parsedEndDate) {
    throw new HttpError(400, 'start_date and end_date are required');
  }

  if (parsedEndDate <= parsedStartDate) {
    throw new HttpError(400, 'end_date must be later than start_date');
  }

  return bookingRepository.findByDateRange(parsedStartDate, parsedEndDate);
}

async function ensureRoomExists(roomId) {
  const room = await roomRepository.findById(roomId);
  if (!room) {
    throw new HttpError(404, `Room ${roomId} was not found`);
  }
  return room;
}

async function ensureNoConflicts({ room_id, check_in, check_out, excludeId = null }) {
  const conflicts = await bookingRepository.findConflicts({
    roomId: room_id,
    checkIn: check_in,
    checkOut: check_out,
    excludeId,
  });

  if (conflicts.length) {
    throw new HttpError(409, 'Booking conflict detected', { conflicts });
  }
}

async function createBooking(payload) {
  await ensureRoomExists(payload.room_id);
  await ensureNoConflicts(payload);
  return bookingRepository.create(payload);
}

async function updateBooking(id, payload) {
  const existing = await bookingRepository.findById(id);
  if (!existing) {
    throw new HttpError(404, `Booking ${id} was not found`);
  }

  await ensureRoomExists(payload.room_id);
  await ensureNoConflicts({ ...payload, excludeId: id });

  const updated = await bookingRepository.update(id, payload);
  return updated;
}

async function deleteBooking(id) {
  const removed = await bookingRepository.remove(id);
  if (!removed) {
    throw new HttpError(404, `Booking ${id} was not found`);
  }
}

async function extendStay(id, nights = 1) {
  const existing = await bookingRepository.findById(id);
  if (!existing) {
    throw new HttpError(404, `Booking ${id} was not found`);
  }

  const updatedPayload = {
    guest_name: existing.guest_name,
    source: existing.source,
    room_id: existing.room_id,
    check_in: existing.check_in,
    check_out: addDays(existing.check_out, nights),
    status: existing.status,
    note: existing.note,
  };

  return updateBooking(id, updatedPayload);
}

module.exports = {
  createBooking,
  deleteBooking,
  extendStay,
  getBookings,
  updateBooking,
};
