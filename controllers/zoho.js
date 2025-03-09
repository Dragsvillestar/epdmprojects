const express = require("express");
const router = express.Router();
const axios = require("axios");
const Token = require("../models/zohotoken");
const { saveInitialZohoToken, getZohoAccessToken, sendZohoInvoice } = require("../controllers/zohoinvoice");

router.get("/callback", async (req, res) => {
    const authCode = req.query.code;
    if (!authCode) return res.status(400).json({ error: "Authorization code is missing" });

    try {
        const response = await axios.post("https://accounts.zoho.com/oauth/v2/token", null, {
            params: {
                grant_type: "authorization_code",
                client_id: process.env.ZOHO_CLIENT_ID,
                client_secret: process.env.ZOHO_CLIENT_SECRET,
                redirect_uri: process.env.ZOHO_REDIRECT_URI,
                code: authCode,
            },
        });

        const { access_token, refresh_token, expires_in } = response.data;
        const expires_at = new Date(Date.now() + expires_in * 1000); // Convert to expiration timestamp

        // Store or update the token in the database
        await Token.findOneAndUpdate(
            { service: "zoho" },
            { access_token, refresh_token, expires_at },
            { upsert: true, new: true }
        );

        res.send("✅ Authorization successful! Tokens saved in the database.");
    } catch (error) {
        console.error("❌ Error exchanging authCode for token:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to get access token" });
    }
});

router.get("/invoice", async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const email = req.user.email;
        const name = req.user.username || "Customer";
        const amount = 100; // Replace with actual amount
        const transactionId = "INV_" + Date.now(); // Unique invoice ID

        // Call function to create & send invoice via Zoho
        const invoiceResponse = await sendZohoInvoice(email, name, amount, transactionId);

        res.json({ success: true, invoice: invoiceResponse });
    } catch (error) {
        console.error("❌ Error generating invoice:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
