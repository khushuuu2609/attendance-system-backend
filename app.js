const express = require('express');
const connectDB = require('./db');
const authRoutes = require('./Routes/authRoutes');
const attendanceRoutes = require('./Routes/attendanceRoutes');
const leaveRoutes = require('./Routes/leaveRoutes');

const app = express();
connectDB();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
