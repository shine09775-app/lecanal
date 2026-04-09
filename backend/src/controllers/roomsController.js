const roomRepository = require('../repositories/roomRepository');

async function getRooms(req, res) {
  const rooms = await roomRepository.getAll({
    type: req.query.type,
    floor: req.query.floor,
  });

  res.json({ data: rooms });
}

module.exports = {
  getRooms,
};
