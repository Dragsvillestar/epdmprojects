const mongoose = require('mongoose');

const loggerSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    position: String,
    email: { type: String, required: true },
    phone: String,
    address: String,
    nature: String,
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpiry: { type: Date, default: null },
    resetToken: { type: String, default: null }, 
    resetTokenExpiry: { type: Date, default: null },
    lastVerificationRequest: { type: Date, default: null },
    subscribed: { type: Boolean, default: false },
    subscriptionExpiry: { type: Date, default: null },
  });
  
  
  const Logger = mongoose.model("Logger", loggerSchema);
  module.exports = Logger;