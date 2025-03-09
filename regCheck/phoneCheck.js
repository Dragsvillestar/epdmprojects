const express = require('express');
const Logger = require('../models/logger');  // Importing Logger model
const router = express.Router();

router.get("/", async (req, res) => { 
    const { phone } = req.query; 
  
    
    try {
      const phoneRegex = /^[\+]?[0-9]{0,3}\W?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  
      if (!phoneRegex.test(phone)) { 
        return res.status(400).json({ exists: false, message: "Invalid phone number format" });
      }
      
      const existingUser = await Logger.findOne({ phone });
  
      if (existingUser) {
        return res.json({ exists: true, message: "Phone number already registered" });
      }
  
      return res.json({ exists: false, message: "" });
  
    } catch (error) {
      console.error('Error checking phone number:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  module.exports = router;