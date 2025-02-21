const dns = require("dns").promises;

async function checkEmailExists(email) {
    const domain = email.split("@")[1];
  
    try {
      const mxRecords = await dns.resolveMx(domain);
  
      if (!mxRecords.length) {
        return { exists: false, message: "Invalid email domain. No mail server found." };
      }
  
      return { exists: false, message: "" };
  
    } catch (error) {
      console.error("Error verifying email domain:", error);
      return { exists: false, message: "Error verifying email domain" };
    }
  }
  
  module.exports = checkEmailExists;