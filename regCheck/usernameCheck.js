const express = require('express');
const Logger = require('../models/logger'); 
const router = express.Router();

router.get('/', async (req, res) => {
    const { username } = req.query; 
    try {
      const existingUser = await Logger.findOne({ username });
      if (existingUser) {
        return res.json({ exists: true });
      }
      res.json({ exists: false }); 
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  module.exports = router;