const express = require('express');
const router = express.Router();
// Admin dashboard summary route
router.get('/dashboard', (req, res) => {
  res.json({ message: "Admin dashboard data" });
});
module.exports = router;
