const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// We wrap routes so they don't break if not created yet
try {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/services', require('./routes/serviceRoutes'));
  app.use('/api/staff', require('./routes/staffRoutes'));
  app.use('/api/appointments', require('./routes/appointmentRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use('/api/payment', require('./routes/paymentRoutes'));
} catch (e) {
  console.log("Routes not fully implemented yet, skipping some...");
}

app.get('/', (req, res) => res.send('E-Salon API Running'));

// Connect DB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
