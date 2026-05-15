const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  availability: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
