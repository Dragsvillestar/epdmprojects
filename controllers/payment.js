const express = require('express');
const axios = require('axios');
const Logger = require('../models/logger');
const moment = require("moment-timezone");

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const amount = 100; // Fixed amount
        const email = req.user.email;
        const name = req.user.username; // Assuming username is stored in req.user

        const paymentData = {
            tx_ref: "test_" + Date.now(),
            amount,
            currency: "NGN",
            redirect_url: "http://localhost:3000/api/initiate-payment/payment-success",
            payment_options: "card, banktransfer", // Payment methods supported
            customer: { email, name }
        };

        const response = await axios.post('https://api.flutterwave.com/v3/payments', paymentData, {
            headers: { 'Authorization': `Bearer ${process.env.FW_SECRET}`, 'Content-Type': 'application/json' }
        });

        res.json({ paymentLink: response.data.data.link }); // Send payment link to frontend
    } catch (error) {
        console.error("Payment Error:", error.response?.data || error.message);
        res.status(500).json({ error: 'Payment failed' });
    }
});

router.post('/flutterwave-webhook', async (req, res) => {
    const payload = req.body;

    console.log("Webhook received:", payload);

    // Verify Flutterwave Signature
    const secretHash = process.env.FLW_SECRET_HASH;
    const flutterwaveSignature = req.headers["verif-hash"];

    if (!flutterwaveSignature || flutterwaveSignature !== secretHash) {
        return res.status(403).json({ error: "Invalid signature" });
    }

    // Process Payment Success
    if (payload.status === "successful") {
        const email = payload.customer.email;
        const name = payload.customer.name || "Unknown User"; 
        const amount = payload.amount;  
        const transactionId = payload.transaction_id || payload.tx_ref; 

        try {
            const user = await Logger.findOne({ email });

            if (user) {
                user.subscribed = true;
                const timezone = "Africa/Lagos"; // Change this to your timezone

            if (user.subscriptionExpiry && user.subscriptionExpiry > Date.now()) {
                // Extend existing subscription
                user.subscriptionExpiry = moment(user.subscriptionExpiry)
                    .tz(timezone)
                    .add(30, "days")
                    .toDate();
            } else {
                // Start new subscription if expired or null
                user.subscriptionExpiry = moment().tz(timezone).add(30, "days").toDate();
            }
                await user.save();

                console.log(`✅ Subscription activated for ${user.username}`);

                // Manually update session if the user is logged in
                if (req.user && req.user.email === email) {
                    req.user.subscribed = true;
                    req.user.subscriptionExpiry = user.subscriptionExpiry;
                }
            } else {
                console.error("❌ User not found for email:", email);
            }
        } catch (error) {
            console.error("❌ Error updating user subscription:", error.message);
        }
    } else {
        console.log("❌ Payment was not successful:", payload.status);
    }

    res.sendStatus(200);
});

// Payment success route
router.get("/payment-success", (req, res) => {
    res.render("paymentSuccess");
});

module.exports = router;
