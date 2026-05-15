const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

router.get('/', async (req, res) => {
  const staff = await Staff.find();
  res.json(staff);
});

router.post('/', async (req, res) => {
  const staff = new Staff(req.body);
  await staff.save();
  res.status(201).json(staff);
});

module.exports = router;
