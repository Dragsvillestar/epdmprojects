const express = require('express');
const Logger = require('../models/logger'); 
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const { sendVerificationEmail, transporter } = require('../controllers/emailverification');

router.post('/', async (req, res, next) => {
    const { username, password, position, email, phone, address, nature } = req.body;
    try {
      const existingUser = await Logger.findOne({ username });
      if (existingUser) {
        return res.status(400).send({ error: 'Username already taken' }); 
      }
  
      const existingUserByEmail = await Logger.findOne({ email });
      if (existingUserByEmail) {
        return res.status(400).send('Email already taken');
      }
  
      const existingUserByPhone = await Logger.findOne({ phone });
      if (existingUserByPhone) {
        return res.status(400).send('Phone number already taken');
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpiry = Date.now() + 3600000;
  
      const newUser = new Logger({
        username,
        password: hashedPassword,
        position,
        email,
        phone,
        address,
        nature,
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
        resetToken: null, 
        resetTokenExpiry: null
      });
  
      await newUser.save();
      console.log('User added');
  
      sendVerificationEmail(email, verificationToken);
  
      return res.redirect('/?verified=false');
  
    } catch (err) {
      console.error(err);
      res.status(500).send('Error registering user');
    }
  });

  module.exports = router;