const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Fallback securely if env isn't fully set for some reason
    const rzpId = process.env.RAZORPAY_KEY_ID || 'rzp_test_fallback123';
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET || 'secretfallback';
    
    const instance = new Razorpay({
      key_id: rzpId,
      key_secret: rzpSecret,
    });

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET || 'secretfallback';

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", rzpSecret)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      res.json({ message: "Payment verified successfully", success: true });
    } else {
      res.status(400).json({ message: "Invalid signature", success: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
