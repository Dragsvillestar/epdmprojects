require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dns = require("dns").promises;
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const axios = require("axios");
const moment = require('moment');
const Logger = require('./models/logger');
const { sendVerificationEmail, transporter } = require('./controllers/emailverification');
const passport = require('./config/passportConfig-logger');
const adminPassport = require('./config/passportConfig-admin');
const sessionMiddleware = require('./config/sessionConfig');
const phoneVerificationRoute = require('./regCheck/phoneCheck');
const usernameVerificationRoute = require('./regCheck/usernameCheck');
const emailVerificationRoute = require('./regCheck/emailCheck');
const registerRoute = require('./regCheck/register'); 
const verifyEmailRoute = require('./verifyAndResends/verify-email');
const resendEmailVerificationRoute = require('./verifyAndResends/resendEmailVerification');
const Project = require('./models/project');
const newProjectRoute = require("./project/newProject");
const adminRoute = require("./project/adminlogin");
const paymentRoute = require("./controllers/payment");
const zohoRoute = require("./controllers/zoho");


const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'pug');
app.set('views', './views/pug');
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use("/phone", phoneVerificationRoute);
app.use("/username", usernameVerificationRoute);
app.use("/email", emailVerificationRoute);
app.use('/register', registerRoute);
app.use("/verify-email", verifyEmailRoute);
app.use("/resend-email-verification", resendEmailVerificationRoute);
app.use("/new-project", newProjectRoute);
app.use("/admin", adminRoute);
app.use("/api/initiate-payment", paymentRoute);
app.use("/api/zoho", zohoRoute);

app.use((req, res, next) => {
  console.log('Session Data:', req.session);
  console.log("Current Time:", new Date());
  console.log("Session Expiration:", req.session.cookie.expires);

  next(); // Proceed to the next middleware/route handler
});

// Home Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/login', (req, res, next) => {
  passport.authenticate('logger-local', (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.json({ error:'Username or password incorrect' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: "Please verify your email first." });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ redirectTo: "/home" });
    });    
  })(req, res, next);
});

app.get('/home', (req, res) => {
  if (!req.isAuthenticated()) {
      return res.redirect('/');
  }

  // Set headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.render("homepage", {username: req.user.username});
});

app.get("/epdmxapi/profile", (req, res) => {
  if (req.isAuthenticated()) { 
    res.json(req.user); 
  } else {
    res.status(401).json({ message: "User not logged in" });
  }
});

app.patch("/profile/update", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const updateData = req.body;
     
      const updatedUser = await Logger.findOneAndUpdate(
        { _id: req.user._id },      
        { $set: updateData },       
        { new: true }            
      );
     
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  } else {
    res.status(401).json({ message: "User not logged in" });
  }
});

app.get("/forgot-password", (req, res) => {
  res.render("forgotPassword");
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await Logger.findOne({ email });

  if (!user) {
      return res.status(400).json({ message: "Email not found" });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 3600000; // 1-hour expiration
  await user.save();

  const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

  try {
      const info = await transporter.sendMail({
          to: email,
          subject: "Password Reset",
          text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
          html: `
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <p><a href="${resetLink}" style="background-color:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
          `,
      });    

      res.json({ message: "Reset email sent" });
      console.log("✅ Email sent: " + info.response);
  } catch (error) {
      res.json({ message: "Error sending email" });
      console.error("Error sending email:", error);
  }
});

app.get("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const user = await Logger.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

  if (!user) {
      return res.status(400).send("Invalid or expired token");
  }

  res.render("resetPassword", { token });
});

app.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Find user with the reset token that is not expired
        let user = await Logger.findOne({ 
            resetToken: token, 
            resetTokenExpiry: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10); 

        // Update user with the new password and clear reset token
        user = await Logger.findOneAndUpdate(
            { 
                resetToken: token, 
                resetTokenExpiry: { $gt: Date.now() } 
            },
            { 
                password: hashedPassword, 
                resetToken: undefined, 
                resetTokenExpiry: undefined 
            },
            { new: true } // Return the updated document
        );
        
        res.json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "An error occurred while resetting the password" });
    }
});

app.get('/projects', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const hasActiveSubscription = req.user.subscribed && req.user.subscriptionExpiry && req.user.subscriptionExpiry > Date.now();
    
    if (!hasActiveSubscription) {
      return res.json({ subscription: false });
    }

    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/logout', (req, res) => {
  req.logout((err) => {
      if (err) {
          return res.status(500).send("Logout failed");
      }

      req.session.destroy((err) => {
          if (err) {
              return res.status(500).send("Session destruction failed");
          }

          // Redirect to login page
          res.redirect('/');
      });
  });
});


// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
