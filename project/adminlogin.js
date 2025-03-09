const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const path = require('path');
const crypto = require('crypto');
const { sendVerificationEmail, transporter } = require('../controllers/emailverification'); 
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

router.post("/register", async (req, res) => {
  try {
    const { newAdminUsername, newAdminPassword, newAdminEmail, currentAdminUsername, currentAdminPassword } = req.body;

    // Check if current admin exists
    const currentAdmin = await Admin.findOne({ username: currentAdminUsername });
    if (!currentAdmin) {
      return res.status(401).json({ error: "Current admin not found." });
    }

    // Verify current admin's password
    const isMatch = await bcrypt.compare(currentAdminPassword, currentAdmin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid current admin credentials." });
    }

    // Check if a new admin with the given username already exists
    const existingNewAdmin = await Admin.findOne({ username: newAdminUsername });
    if (existingNewAdmin) {
      return res.status(400).json({ error: "New admin username already exists." });
    }

    const existingNewAdminEmail = await Admin.findOne({ username: newAdminEmail });
    if (existingNewAdminEmail) {
      return res.status(400).json({ error: "New admin email already exists." });
    }

    // Hash the new admin's password
    const hashedPassword = await bcrypt.hash(newAdminPassword, 10);

    // Create and save the new admin document
    const newAdmin = new Admin({
      username: newAdminUsername,
      password: hashedPassword,
      email: newAdminEmail
    });

    await newAdmin.save();

    res.status(201).json({ success: true, message: "New admin registered successfully." });
  } catch (error) {
    console.error("Error during admin registration:", error);
    res.status(500).json({ error: "Server error during registration." });
  }
});

router.get("/forgot-password", (req, res) => {
  res.render("adminForgotPassword");
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await Admin.findOne({ email });

  if (!user) {
      return res.status(400).json({ message: "Email not found" });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 3600000; // 1-hour expiration
  await user.save();

  const resetLink = `http://localhost:3000/admin/reset-password/${resetToken}`;

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

router.get("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const user = await Admin.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

  if (!user) {
      return res.status(400).send("Invalid or expired token");
  }

  res.render("adminReset", { token });
});

router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Find user with the reset token that is not expired
        let user = await Admin.findOne({ 
            resetToken: token, 
            resetTokenExpiry: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10); 

        // Update user with the new password and clear reset token
        user = await Admin.findOneAndUpdate(
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
  
module.exports = router;
