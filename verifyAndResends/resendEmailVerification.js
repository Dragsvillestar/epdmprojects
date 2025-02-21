const express = require('express');
const Logger = require('../models/logger'); 
const router = express.Router();
const { sendVerificationEmail, transporter } = require('../controllers/emailverification');
const crypto = require("crypto");

router.post('/', async (req, res) => {
    const { username } = req.body;  
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
  
    try {
      const user = await Logger.findOne({ username });
  
      if (!user) {
        return res.status(400).json({ message: "Username not registered" });
      }
  
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }
  
      const now = await Logger.aggregate([{ $project: { currentTime: "$$NOW" } }]);  
      const currentTime =  now[0]?.currentTime || new Date();
      const lastRequestTime = user.lastVerificationRequest || new Date(0); 
      const cooldown = 30 * 1000;
  
      console.log(`Now: ${currentTime}, Last Request: ${lastRequestTime}`);
      
      if (currentTime - lastRequestTime < cooldown) {
        let timeLeft = Math.ceil((cooldown - (currentTime - lastRequestTime)) / 1000);
        
        console.log(timeLeft);
        return res.status(429).json({ message: `Wait ${timeLeft}s before resending`, timeLeft });
      }
      
  
      if (currentTime - lastRequestTime > cooldown) {
        user.lastVerificationRequest = currentTime;
  
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiry = new Date(Date.now() + 3600000); 
    
        user.verificationToken = verificationToken;
        user.verificationTokenExpiry = verificationTokenExpiry;
        await user.save();
    
        sendVerificationEmail(user.email, verificationToken);
    
        return res.json({ message: "A new verification email has been sent" });
      }
     
   } catch (error) {
      console.error("Error resending verification email:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  module.exports = router;