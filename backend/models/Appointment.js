const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userText: { type: String },
  email: { type: String },
  phone: { type: String },
  amount: { type: Number, default: 500 },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  serviceText: { type: String },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
