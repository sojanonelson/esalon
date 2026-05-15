const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

router.post('/', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const appointments = await Appointment.find().populate('user').populate('service').populate('staff');
  res.json(appointments);
});

router.get('/user/:userId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.params.userId })
      .populate('service')
      .populate('staff');
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
