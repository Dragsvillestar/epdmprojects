const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const Admin = require('../models/admin');

passport.use('admin-local', new LocalStrategy(async (username, password, done) => {
    try {
      const admin = await Admin.findOne({ username });
      if (!admin) return done(null, false, { message: 'Incorrect username.' });
  
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
  
      return done(null, admin);
    } catch (err) {
      return done(err);
    }
  }));
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      let user = await Admin.findById(id);
      if (user) return done(null, user);
      
      user = await Logger.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  module.exports = passport;
  