const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const roomsController = require('../controllers/roomsController');

const router = express.Router();

router.get('/', asyncHandler(roomsController.getRooms));

module.exports = router;
