const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const Logger = require('../models/logger');

passport.use('logger-local', new LocalStrategy(async (username, password, done) => {
    try {
      const user = await Logger.findOne({ username: username });
      if (!user) return done(null, false, { message: 'Incorrect username.' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
  
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Logger.findById(id);
      done(null, user); 
    } catch (err) {
      done(err); // Pass error if findById fails
    }
  });

  module.exports = passport;