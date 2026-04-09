const express = require('express');
const roomsRoutes = require('./roomsRoutes');
const bookingsRoutes = require('./bookingsRoutes');
const { syncCalendar } = require('../services/otaService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/rooms', roomsRoutes);
router.use('/bookings', bookingsRoutes);

router.post(
  '/ota/sync',
  asyncHandler(async (req, res) => {
    const result = await syncCalendar();
    res.json({ data: result });
  })
);

module.exports = router;
