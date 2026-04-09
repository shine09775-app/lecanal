const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const bookingsController = require('../controllers/bookingsController');

const router = express.Router();

router.get('/', asyncHandler(bookingsController.getBookings));
router.post('/', asyncHandler(bookingsController.createBooking));
router.put('/:id', asyncHandler(bookingsController.updateBooking));
router.delete('/:id', asyncHandler(bookingsController.deleteBooking));
router.post('/:id/extend', asyncHandler(bookingsController.extendStay));

module.exports = router;
