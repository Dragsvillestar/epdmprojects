const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const path = require('path');
const Admin = require('../models/admin'); 

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index3.html'));
});

router.post('/login', (req, res, next) => {
  passport.authenticate('admin-local', (err, admin, info) => {
    if (err) {
      return next(err);
    }
    if (!admin) {
      return res.status(401).json({ error: info ? info.message : 'Username or password incorrect' });
    }
    console.log("Login Successful");
      return res.json({ success: 'Login Successful' });
  })(req, res, next);
});

router.post('/register', async (req, res, next) => {
    try {
      const { username, password } = req.body;
  
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
  
      // Check if an admin with the same username already exists
      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin) {
        return res.status(400).json({ error: 'Username already exists' });
      }
  
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const newAdmin = new Admin({
        username,
        password: hashedPassword
      });
  
      await newAdmin.save();
  
      return res.status(201).json({ message: 'Admin registered successfully' });
    } catch (err) {
      next(err);
    }
  });
  
module.exports = router;
