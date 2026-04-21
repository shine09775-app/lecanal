const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const checkinController = require('../controllers/checkinController');

const router = express.Router();

// GET  /api/checkin/:booking_id  — ดึงข้อมูล booking + checkin ที่มีอยู่
router.get('/:booking_id', asyncHandler(checkinController.getCheckin));

// POST /api/checkin/:booking_id  — บันทึก/อัปเดต check-in data
router.post('/:booking_id', asyncHandler(checkinController.saveCheckin));

module.exports = router;
