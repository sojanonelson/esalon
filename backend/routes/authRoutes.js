const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const user = new User({ name, email, password, phone }); // Simple unhashed pass for demo
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Quick Demo Admin System
    if(email === 'admin@admin.com' && password === 'admin') {
      return res.json({ message: 'Login successful', user: { name: 'Admin', email: 'admin@admin.com', role: 'admin' } });
    }

    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
