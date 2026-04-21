const db = require('../config/db');

async function findByBookingId(bookingId) {
  const result = await db.query(
    `SELECT * FROM check_ins WHERE booking_id = $1 LIMIT 1`,
    [bookingId]
  );
  return result.rows[0] || null;
}

async function upsert({ bookingId, nationality, idType, idNumber, phone, signatureData, photoData }) {
  const result = await db.query(
    `INSERT INTO check_ins
       (booking_id, nationality, id_type, id_number, phone, signature_data, photo_data, checked_in_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (booking_id)
     DO UPDATE SET
       nationality    = EXCLUDED.nationality,
       id_type        = EXCLUDED.id_type,
       id_number      = EXCLUDED.id_number,
       phone          = EXCLUDED.phone,
       signature_data = EXCLUDED.signature_data,
       photo_data     = EXCLUDED.photo_data,
       checked_in_at  = NOW()
     RETURNING *`,
    [bookingId, nationality, idType, idNumber, phone, signatureData, photoData || '']
  );
  return result.rows[0];
}

module.exports = { findByBookingId, upsert };
