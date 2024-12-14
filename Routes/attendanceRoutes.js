const express = require('express');
const Attendance = require('../Modules/Attendence.js');
const router = express.Router();
const mongoose = require('mongoose');

// Check-in route
router.post('/check-in', async (req, res) => {
  const { userId } = req.body; // Only the userId is required in the request body

  try {
    // Get the current date in 'YYYY-MM-DD' format
    const now = new Date();
    const date = now.toISOString().split('T')[0];

    // Find the user's attendance record for the current day
    let attendance = await Attendance.findOne({ userId, date });

    if (!attendance) {
      // Create a new attendance record if none exists for the day
      attendance = new Attendance({
        userId,
        date,
        checkIn: now,
      });
    } else if (attendance.checkIn) {
      return res.status(400).json({ message: 'User has already checked in for today.' });
    } else {
      // Update check-in if the record exists but is empty
      attendance.checkIn = now;
    }

    await attendance.save();
    res.status(201).json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check-out route
router.post('/check-out', async (req, res) => {
  const { userId } = req.body; // Only the userId is required in the request body

  try {
    // Get the current date in 'YYYY-MM-DD' format
    const now = new Date();
    const date = now.toISOString().split('T')[0];

    // Find the user's attendance record for the current day
    const attendance = await Attendance.findOne({ userId, date });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found for today.' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'User has already checked out for today.' });
    }

    attendance.checkOut = now; // Set check-out time

    await attendance.save();
    res.json({ message: 'Checked out successfully', attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance records by userId
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format.' });
    }

    const attendanceRecords = await Attendance.find({ userId });

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this user.' });
    }

    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get total working days for a specific user
router.get('/total-working-days/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format.' });
    }

    const attendanceRecords = await Attendance.find({ userId });
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this user.' });
    }

    // Sum the total working days
    const totalWorkingDays = attendanceRecords.reduce(
      (total, record) => total + (record.workingHours > 0 ? 1 : 0),
      0
    );

    res.json({ totalWorkingDays });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
