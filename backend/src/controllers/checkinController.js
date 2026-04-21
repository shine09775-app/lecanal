const checkinService = require('../services/checkinService');

function parseId(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    const { HttpError } = require('../utils/httpError');
    throw new HttpError(400, 'booking_id must be a positive integer');
  }
  return parsed;
}

async function getCheckin(req, res) {
  const bookingId = parseId(req.params.booking_id);
  const data = await checkinService.getCheckinData(bookingId);
  res.json({ data });
}

async function saveCheckin(req, res) {
  const bookingId = parseId(req.params.booking_id);
  const data = await checkinService.saveCheckin(bookingId, req.body);
  res.json({ data });
}

module.exports = { getCheckin, saveCheckin };
