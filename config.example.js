/**
 * Configuration Template for Dreamweaver
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to a new file (e.g., config.js or config.local.js)
 * 2. Add your file to .gitignore to prevent committing secrets
 * 3. Fill in your actual configuration values
 * 4. Update the values in index.html (lines 267-284)
 * 
 * SECURITY NOTE:
 * Never commit API keys or secrets to version control!
 * The Google Generative Language API key must be configured in Firebase Functions,
 * NOT in the frontend code. See server/README.md for setup instructions.
 */

// Firebase Configuration
// Get from: https://console.firebase.google.com/ > Project Settings > Your apps
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
};

// reCAPTCHA v3 Site Key (for Firebase App Check)
// Get from: https://www.google.com/recaptcha/admin
// REQUIRED for security - protects Cloud Functions from abuse
const recaptchaSiteKey = "YOUR_RECAPTCHA_V3_SITE_KEY";

// Spotify Client ID (optional - for music integration)
// Get from: https://developer.spotify.com/dashboard
const spotifyClientId = "YOUR_SPOTIFY_CLIENT_ID";

// IMPORTANT: Google Generative Language API Key Configuration
// ============================================================
// The API key should NEVER be in frontend code for security reasons.
// Configure it in Firebase Functions instead:
//
//   firebase functions:config:set genai.key="YOUR_API_KEY"
//   firebase deploy --only functions
//
// See server/README.md for detailed setup instructions.

// For inline script usage in HTML:
// Copy the Firebase config and reCAPTCHA key into index.html (lines 267-284)
// Or include this file with <script src="config.js"></script> before Firebase initialization
