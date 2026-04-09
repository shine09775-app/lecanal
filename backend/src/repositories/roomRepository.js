const db = require('../config/db');

async function getAll(filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.type) {
    params.push(filters.type);
    clauses.push(`type = $${params.length}`);
  }

  if (filters.floor) {
    params.push(Number(filters.floor));
    clauses.push(`floor = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const query = `
    SELECT id, name, type, floor
    FROM rooms
    ${where}
    ORDER BY
      floor ASC,
      CASE type
        WHEN 'Deluxe Double' THEN 1
        WHEN 'Deluxe Twin' THEN 2
        WHEN 'Superior Double' THEN 3
        WHEN 'Honeymoon Suite' THEN 4
        ELSE 99
      END ASC,
      CASE
        WHEN regexp_replace(name, '\\D', '', 'g') = '' THEN 999
        ELSE regexp_replace(name, '\\D', '', 'g')::INTEGER
      END ASC,
      name ASC;
  `;

  const result = await db.query(query, params);
  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    'SELECT id, name, type, floor FROM rooms WHERE id = $1 LIMIT 1;',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  findById,
  getAll,
};
