const express = require('express');
const Logger = require('../models/logger'); 
const router = express.Router();

router.get("/", async (req, res) => {
    const { token } = req.query;
  
    if (!token) {
      return res.status(400).json({ message: "Verification token is required." });
    }
  
    try {
      const user = await Logger.findOne({ 
        verificationToken: token, 
        verificationTokenExpiry: { $gt: Date.now() } 
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token." });
      }
  
      user.emailVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpiry = null;
      await user.save();
  
      res.redirect("/?verified=true"); 
      console.log("Email verified successfully!");
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "An error occurred while verifying the email." });
    }
  });
  
  module.exports = router;