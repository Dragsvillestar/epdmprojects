const express = require('express');
const Logger = require('../models/logger'); 
const router = express.Router();
const checkEmailExists = require('../controllers/checkmailexists');

router.get("/", async (req, res) => {
    const { email } = req.query;
  
    if (!email || !email.includes("@")) {
        return res.json({ exists: false, message: "Invalid email format" });
    }
  
    try {
        const existingUser = await Logger.findOne({ email });
  
        if (existingUser) {
            return res.json({ exists: true, message: "Email already registered" });
        }
  
        const result = await checkEmailExists(email);
        res.json(result);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
  });

  module.exports = router;
  