const express = require("express");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();
const PORT = 3000;

// ---- OAuth2 Client ----
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// ---- Route 1: Redirect user to Google ----
app.get("/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  res.redirect(url);
});

// ---- Route 2: Google redirects back with ?code= ----
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;

  const { tokens } = await oauth2Client.getToken(code);

  console.log("=== REFRESH TOKEN ===");
  console.log(tokens.refresh_token);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    1
  console.log("=====================");

  res.send(`
    <h2>Success!</h2>
    <p>Copy this REFRESH TOKEN and store it safely:</p>
    <code>${tokens.refresh_token}</code>
  `);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));