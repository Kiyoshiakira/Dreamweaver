/**
 * Firebase and App Check Initialization Module
 * 
 * This module initializes Firebase app and App Check (reCAPTCHA v3 provider)
 * using configuration values from window.__firebase_config and window.__recaptcha_site_key.
 * 
 * Initialization is defensive: if config values are missing or invalid, the module
 * will log a concise console message and leave existing checks in place rather than throwing.
 * 
 * Side effects:
 * - Sets window.fb with { auth, db, appId, appCheck, firebaseInitError }
 * - Compatible with existing code that expects window.fb and window.fb.appCheck
 * 
 * Usage:
 * Include this script BEFORE any scripts that rely on window.fb:
 *   <script src="/init-firebase.js" type="module"></script>
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app-check.js";

// Default app ID
const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'narrative-engine-infinite';

let auth = null;
let db = null;
let appCheck = null;
let firebaseInitError = null;

try {
    // Check if Firebase config is available
    if (typeof window.__firebase_config === 'undefined') {
        console.warn('Firebase initialization skipped: window.__firebase_config not found');
        firebaseInitError = 'Firebase Not Configured: window.__firebase_config is not defined. ' +
            'Please configure Firebase in your deployment. See server/README.md for instructions.';
    } else {
        // Parse Firebase config
        let firebaseConfig;
        try {
            firebaseConfig = typeof window.__firebase_config === 'string' 
                ? JSON.parse(window.__firebase_config) 
                : window.__firebase_config;
        } catch (parseError) {
            console.error('Failed to parse Firebase config:', parseError.message);
            firebaseInitError = 'Firebase Configuration Error: Invalid JSON in window.__firebase_config. ' +
                'Please check your configuration format.';
            firebaseConfig = null;
        }
        
        if (firebaseConfig) {
            // Check if configuration has been updated from placeholder defaults
            // or if values are empty/invalid
            const hasPlaceholders = (
                firebaseConfig.apiKey === 'YOUR_FIREBASE_API_KEY' || 
                firebaseConfig.projectId === 'your-project-id'
            );
            
            // Check if Firebase config appears to be empty or invalid
            const isInvalid = (
                !firebaseConfig.apiKey || 
                !firebaseConfig.projectId ||
                firebaseConfig.apiKey.trim() === '' ||
                firebaseConfig.projectId.trim() === ''
            );
            
            if (hasPlaceholders || isInvalid) {
                console.warn('Firebase configuration contains placeholder or invalid values.');
                firebaseInitError = 'Firebase Configuration Missing: Please update the __firebase_config in public/index.html with your Firebase project settings. ' +
                    'Get your config from: Firebase Console > Project Settings > Your apps > SDK setup and configuration. ' +
                    'Copy the config object and paste it into index.html at line ~288.';
            } else {
                // Initialize Firebase app
                try {
                    const app = initializeApp(firebaseConfig);
                    auth = getAuth(app);
                    db = getFirestore(app);
                    console.log('✓ Firebase app initialized successfully');
                    
                    // Initialize App Check if reCAPTCHA site key is provided
                    const hasRecaptchaPlaceholder = (window.__recaptcha_site_key === 'YOUR_RECAPTCHA_V3_SITE_KEY');
                    const hasInvalidRecaptcha = (!window.__recaptcha_site_key || window.__recaptcha_site_key.trim() === '');
                    
                    if (typeof window.__recaptcha_site_key === 'undefined' || hasInvalidRecaptcha) {
                        console.warn('App Check initialization skipped: window.__recaptcha_site_key not found');
                        firebaseInitError = 'App Check Configuration Missing: Please update the __recaptcha_site_key in public/index.html. ' +
                            'Get your reCAPTCHA v3 site key from: https://www.google.com/recaptcha/admin ' +
                            'Then add your domain(s) and copy the site key into index.html at line ~301.';
                    } else if (hasRecaptchaPlaceholder) {
                        console.warn('reCAPTCHA site key contains placeholder value. Please update with real key.');
                        firebaseInitError = 'App Check Configuration Missing: Please update the __recaptcha_site_key in public/index.html. ' +
                            'Get your reCAPTCHA v3 site key from: https://www.google.com/recaptcha/admin ' +
                            'Then add your domain(s) and copy the site key into index.html at line ~301.';
                    } else {
                        // Initialize App Check
                        try {
                            appCheck = initializeAppCheck(app, {
                                provider: new ReCaptchaV3Provider(window.__recaptcha_site_key),
                                isTokenAutoRefreshEnabled: true
                            });
                            console.log('✓ Firebase App Check initialized successfully');
                            // Clear error since both Firebase and App Check are working
                            firebaseInitError = null;
                        } catch (appCheckError) {
                            console.error('App Check initialization failed:', appCheckError.message);
                            firebaseInitError = 'App Check Initialization Failed: ' + appCheckError.message + '. ' +
                                'Dreamweaver may not function without App Check. Please verify your reCAPTCHA v3 site key.';
                        }
                    }
                } catch (initError) {
                    console.error('Firebase app initialization failed:', initError.message);
                    firebaseInitError = 'Firebase Initialization Failed: ' + initError.message + '. ' +
                        'Please check your Firebase configuration.';
                }
            }
        }
    }
} catch (error) {
    // Catch any unexpected errors during initialization
    console.error('Unexpected error during Firebase initialization:', error.message);
    firebaseInitError = 'Firebase Initialization Error: ' + error.message;
}

// Always set window.fb, even if initialization failed
// This ensures existing code that checks for window.fb will work
window.fb = {
    auth,
    db,
    appId,
    appCheck,
    firebaseInitError
};

// Log completion status
if (firebaseInitError) {
    console.warn('Firebase initialization completed with errors. Check window.fb.firebaseInitError for details.');
} else {
    console.log('✓ Firebase module initialization complete');
}
