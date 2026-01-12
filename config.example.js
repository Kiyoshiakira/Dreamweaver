/**
 * Configuration Template for Dreamweaver
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to a new file (e.g., config.js or config.local.js)
 * 2. Add your file to .gitignore to prevent committing secrets
 * 3. Fill in your actual API keys and configuration
 * 4. Import this config in your index.html or reference the variables
 * 
 * SECURITY NOTE:
 * Never commit API keys to version control!
 * For production deployments, use the Firebase Cloud Function proxy
 * to keep keys server-side (see server/README.md)
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
const recaptchaSiteKey = "YOUR_RECAPTCHA_V3_SITE_KEY";

// Google Generative Language API Key
// Get from: https://aistudio.google.com/app/apikey
// 
// IMPORTANT: Only use this for local development/testing
// For production, use the Firebase Cloud Function proxy (see server/README.md)
const genAIApiKey = "YOUR_GOOGLE_GENERATIVE_LANGUAGE_API_KEY";

// Spotify Client ID (optional - for music integration)
// Get from: https://developer.spotify.com/dashboard
const spotifyClientId = "YOUR_SPOTIFY_CLIENT_ID";

// Export configuration (if using as a module)
// Uncomment if using ES6 modules
// export { firebaseConfig, recaptchaSiteKey, genAIApiKey, spotifyClientId };

// For inline script usage in HTML:
// Copy the values above into the appropriate places in index.html
// Or include this file with <script src="config.js"></script> before the main script
