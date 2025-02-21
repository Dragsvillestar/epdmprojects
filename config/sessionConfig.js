const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionStore = MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI, 
    collectionName: 'sessions',
    ttl: 3600, 
    touchAfter: 24 * 3600, 
    stringify: false
  });
  
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, 
    store: sessionStore,
    name: 'express.sid',
    cookie: { secure: false, httpOnly: true, maxAge: 1800000 },
    rolling:true
  });

  module.exports = sessionMiddleware;