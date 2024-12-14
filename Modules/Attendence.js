const mongoose = require('mongoose');

// Define the schema
const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: 'YYYY-MM-DD'
  checkIn: { type: Date }, // Use Date object for timestamps
  checkOut: { type: Date }, // Use Date object for timestamps
  workingHours: { type: Number }, // Calculated in hours
  totalWorkingDays: { type: Number, default: 0 }, // Track total working days
});

// Middleware to calculate working hours before saving
attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    // Calculate the difference in milliseconds
    const timeDifferenceMs = this.checkOut - this.checkIn;

    // Convert milliseconds to hours
    const workingHours = timeDifferenceMs / (1000 * 60 * 60);

    // Ensure non-negative working hours
    this.workingHours = Math.max(0, workingHours);

    // Update total working days if working hours are valid
    if (this.workingHours > 0) {
      this.totalWorkingDays = (this.totalWorkingDays || 0) + 1;
    }
  }
  next();
});

// Create the model
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
