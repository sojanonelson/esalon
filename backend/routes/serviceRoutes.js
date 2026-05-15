const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

router.get('/', async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

router.post('/', async (req, res) => {
  const service = new Service(req.body);
  await service.save();
  res.status(201).json(service);
});

module.exports = router;
