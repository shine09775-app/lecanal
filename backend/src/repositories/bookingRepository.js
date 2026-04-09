const db = require('../config/db');

async function findByDateRange(startDate, endDate) {
  const query = `
    SELECT
      b.id,
      b.guest_name,
      b.source,
      b.room_id,
      b.check_in,
      b.check_out,
      b.status,
      b.note,
      r.name AS room_name,
      r.type AS room_type,
      r.floor AS room_floor
    FROM bookings b
    INNER JOIN rooms r ON r.id = b.room_id
    WHERE b.check_in < $2
      AND b.check_out > $1
    ORDER BY
      r.floor ASC,
      CASE r.type
        WHEN 'Deluxe Double' THEN 1
        WHEN 'Deluxe Twin' THEN 2
        WHEN 'Superior Double' THEN 3
        WHEN 'Honeymoon Suite' THEN 4
        ELSE 99
      END ASC,
      CASE
        WHEN regexp_replace(r.name, '\\D', '', 'g') = '' THEN 999
        ELSE regexp_replace(r.name, '\\D', '', 'g')::INTEGER
      END ASC,
      b.check_in ASC;
  `;

  const result = await db.query(query, [startDate, endDate]);
  return result.rows;
}

async function findById(id) {
  const query = `
    SELECT
      b.id,
      b.guest_name,
      b.source,
      b.room_id,
      b.check_in,
      b.check_out,
      b.status,
      b.note,
      r.name AS room_name,
      r.type AS room_type,
      r.floor AS room_floor
    FROM bookings b
    INNER JOIN rooms r ON r.id = b.room_id
    WHERE b.id = $1
    LIMIT 1;
  `;

  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}

async function findConflicts({ roomId, checkIn, checkOut, excludeId = null }) {
  const params = [roomId, checkIn, checkOut];
  const excludeClause = excludeId ? `AND b.id <> $4` : '';
  if (excludeId) {
    params.push(excludeId);
  }

  const query = `
    SELECT
      b.id,
      b.guest_name,
      b.check_in,
      b.check_out,
      b.status,
      b.source
    FROM bookings b
    WHERE b.room_id = $1
      AND b.check_in < $3
      AND b.check_out > $2
      ${excludeClause}
    ORDER BY b.check_in ASC;
  `;

  const result = await db.query(query, params);
  return result.rows;
}

async function create(booking) {
  const query = `
    INSERT INTO bookings (guest_name, source, room_id, check_in, check_out, status, note)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id;
  `;
  const params = [
    booking.guest_name,
    booking.source,
    booking.room_id,
    booking.check_in,
    booking.check_out,
    booking.status,
    booking.note,
  ];

  const result = await db.query(query, params);
  return findById(result.rows[0].id);
}

async function update(id, booking) {
  const query = `
    UPDATE bookings
    SET guest_name = $2,
        source = $3,
        room_id = $4,
        check_in = $5,
        check_out = $6,
        status = $7,
        note = $8
    WHERE id = $1
    RETURNING id;
  `;
  const params = [
    id,
    booking.guest_name,
    booking.source,
    booking.room_id,
    booking.check_in,
    booking.check_out,
    booking.status,
    booking.note,
  ];

  const result = await db.query(query, params);
  if (!result.rows[0]) {
    return null;
  }

  return findById(result.rows[0].id);
}

async function remove(id) {
  const result = await db.query('DELETE FROM bookings WHERE id = $1 RETURNING id;', [id]);
  return Boolean(result.rows[0]);
}

module.exports = {
  create,
  findByDateRange,
  findById,
  findConflicts,
  remove,
  update,
};
