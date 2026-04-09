const bookingService = require('../services/bookingService');
const { validateBookingPayload } = require('../validators/bookingValidator');
const HttpError = require('../utils/httpError');

function parseId(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new HttpError(400, `${label} must be an integer`);
  }
  return parsed;
}

async function getBookings(req, res) {
  const data = await bookingService.getBookings(req.query.start_date, req.query.end_date);
  res.json({ data });
}

async function createBooking(req, res) {
  const { errors, data } = validateBookingPayload(req.body);
  if (errors.length) {
    throw new HttpError(400, 'Invalid booking payload', { errors });
  }

  const booking = await bookingService.createBooking(data);
  res.status(201).json({ data: booking });
}

async function updateBooking(req, res) {
  const { errors, data } = validateBookingPayload(req.body);
  if (errors.length) {
    throw new HttpError(400, 'Invalid booking payload', { errors });
  }

  const booking = await bookingService.updateBooking(parseId(req.params.id, 'booking id'), data);
  res.json({ data: booking });
}

async function deleteBooking(req, res) {
  await bookingService.deleteBooking(parseId(req.params.id, 'booking id'));
  res.status(204).send();
}

async function extendStay(req, res) {
  const nights = Number(req.body?.nights || 1);
  if (!Number.isInteger(nights) || nights < 1) {
    throw new HttpError(400, 'nights must be a positive integer');
  }

  const booking = await bookingService.extendStay(parseId(req.params.id, 'booking id'), nights);
  res.json({ data: booking });
}

module.exports = {
  createBooking,
  deleteBooking,
  extendStay,
  getBookings,
  updateBooking,
};
