const express = require('express');
const Leave = require('../Modules/Leave');
const router = express.Router();

// Apply for leave
router.post('/apply', async (req, res) => {
  const { userId, startDate, endDate, reason } = req.body;

  // Convert date strings to Date objects if they are not already
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check if the provided dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  // Check if startDate is before endDate
  if (start >= end) {
    return res.status(400).json({ error: 'Start date must be before end date' });
  }

  try {
    const leave = new Leave({ userId, startDate: start, endDate: end, reason });
    await leave.save();

    res.status(201).json({ message: 'Leave applied successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View leave status
router.get('/user/:userId', async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.params.userId });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve leave
router.put('/approve/:leaveId', async (req, res) => {
  const { leaveId } = req.params;

  try {
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    leave.status = 'approved'; // Update status to 'Approved'
    await leave.save();

    res.json({ message: 'Leave approved successfully', leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject leave
router.put('/reject/:leaveId', async (req, res) => {
  const { leaveId } = req.params;

  try {
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    leave.status = 'rejected'; // Update status to 'Rejected'
    await leave.save();

    res.json({ message: 'Leave rejected successfully', leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
