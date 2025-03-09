const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
    service: { type: String, default: "zoho", unique: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },
    expires_at: { type: Date, required: true }, // Stores expiration time
});

module.exports = mongoose.model("Token", TokenSchema);
