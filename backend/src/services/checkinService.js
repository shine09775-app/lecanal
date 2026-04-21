const bookingRepository = require('../repositories/bookingRepository');
const checkinRepository = require('../repositories/checkinRepository');
const HttpError = require('../utils/httpError');

async function getCheckinData(bookingId) {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) {
    throw new HttpError(404, `Booking ${bookingId} was not found`);
  }

  const existing = await checkinRepository.findByBookingId(bookingId);

  return { booking, checkin: existing || null };
}

async function saveCheckin(bookingId, payload) {
  const { nationality, id_type, id_number, phone, signature_data, photo_data } = payload;

  const booking = await bookingRepository.findById(bookingId);
  if (!booking) {
    throw new HttpError(404, `Booking ${bookingId} was not found`);
  }

  if (!nationality || !id_number || !signature_data) {
    throw new HttpError(400, 'nationality, id_number, and signature_data are required');
  }

  if (photo_data && photo_data.length > 700000) {
    throw new HttpError(400, 'Photo is too large. Please retake with lower resolution.');
  }

  const checkin = await checkinRepository.upsert({
    bookingId:     bookingId,
    nationality:   nationality,
    idType:        id_type || 'passport',
    idNumber:      id_number,
    phone:         phone || '',
    signatureData: signature_data,
    photoData:     photo_data || '',
  });

  return { booking, checkin };
}

module.exports = { getCheckinData, saveCheckin };
