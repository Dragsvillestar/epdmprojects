const axios = require("axios");
const moment = require("moment"); 
const Token = require("../models/zohotoken");

async function saveInitialZohoToken(authCode) {
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
        const expires_at = new Date(Date.now() + expires_in * 1000);

        // Save to database
        await Token.create({
            service: "zoho",
            access_token,
            refresh_token,
            expires_at,
        });

        console.log("✅ Zoho token saved successfully!");
    } catch (error) {
        console.error("❌ Error saving Zoho token:", error.response?.data || error.message);
    }
}

async function getZohoAccessToken() {
    // Check if token exists
    const tokenData = await Token.findOne({ service: "zoho" });

    if (!tokenData) throw new Error("Zoho token not found in database!");

    const now = new Date();
    
    // ✅ If token is still valid, return it
    if (tokenData.expires_at > now) {
        console.log("✅ Using stored Zoho access token.");
        return tokenData.access_token;
    }

    console.log("🔄 Token expired! Refreshing...");

    try {
        // 🔄 Request new access token using refresh token
        const response = await axios.post("https://accounts.zoho.com/oauth/v2/token", null, {
            params: {
                grant_type: "refresh_token",
                client_id: process.env.ZOHO_CLIENT_ID,
                client_secret: process.env.ZOHO_CLIENT_SECRET,
                refresh_token: tokenData.refresh_token,
            },
        });

        const { access_token, expires_in } = response.data;
        const expires_at = new Date(Date.now() + expires_in * 1000); // Convert seconds to ms

        // 🔄 Update database with new token
        await Token.findOneAndUpdate(
            { service: "zoho" },
            { access_token, expires_at },
            { new: true }
        );

        console.log("✅ Token refreshed successfully!");
        return access_token;
    } catch (error) {
        console.error("❌ Error refreshing Zoho token:", error.response?.data || error.message);
        throw new Error("Failed to refresh token");
    }
}

async function sendZohoInvoice(email, name, amount, transactionId) {
    try {
        const accessToken = await getZohoAccessToken(); // Get valid Zoho token

        // 🔹 Step 1: Create a new customer in Zoho (if not already created)
        const customerResponse = await axios.post(
            "https://www.zohoapis.com/invoice/v3/customers",
            {
                contact_name: name,
                email,
            },
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        const customerId = customerResponse.data.customer.customer_id;

        // 🔹 Step 2: Create the invoice in Zoho
        const invoiceData = {
            customer_id: customerId,
            line_items: [
                {
                    name: "Subscription Payment",
                    quantity: 1,
                    rate: amount,
                },
            ],
            total: amount,
            due_date: moment().add(7, "days").format("YYYY-MM-DD"), // Invoice due in 7 days
            reference_number: transactionId,
        };

        const invoiceResponse = await axios.post(
            "https://www.zohoapis.com/invoice/v3/invoices",
            invoiceData,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        const invoiceId = invoiceResponse.data.invoice.invoice_id;

        // 🔹 Step 3: Send invoice via email
        await axios.post(
            `https://www.zohoapis.com/invoice/v3/invoices/${invoiceId}/email`,
            {},
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        console.log("✅ Zoho invoice sent successfully:", invoiceResponse.data);
        return invoiceResponse.data;
    } catch (error) {
        console.error("❌ Error sending Zoho invoice:", error.response?.data || error.message);
        throw new Error("Failed to send Zoho invoice");
    }
}
module.exports = { saveInitialZohoToken, getZohoAccessToken, sendZohoInvoice };
