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
                        // Initialize App Check - wait for grecaptcha.enterprise to be ready
                        // This ensures the reCAPTCHA Enterprise script is loaded before App Check initialization
                        const initializeAppCheckWhenReady = async () => {
                            // Configuration for script loading timeout
                            const SCRIPT_LOAD_TIMEOUT_MS = 10000; // 10 seconds
                            const POLL_INTERVAL_MS = 200; // Check every 200ms
                            const MAX_ATTEMPTS = SCRIPT_LOAD_TIMEOUT_MS / POLL_INTERVAL_MS; // 50 attempts
                            
                            try {
                                // Check if grecaptcha.enterprise is available
                                if (typeof grecaptcha === 'undefined' || typeof grecaptcha.enterprise === 'undefined') {
                                    console.log('⏳ Waiting for reCAPTCHA Enterprise script to load...');
                                    
                                    // Wait up to SCRIPT_LOAD_TIMEOUT_MS for the script to load
                                    let attempts = 0;
                                    
                                    while (attempts < MAX_ATTEMPTS) {
                                        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
                                        
                                        if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.enterprise !== 'undefined') {
                                            console.log('✓ reCAPTCHA Enterprise script is now available');
                                            break;
                                        }
                                        
                                        attempts++;
                                    }
                                    
                                    if (typeof grecaptcha === 'undefined' || typeof grecaptcha.enterprise === 'undefined') {
                                        throw new Error('reCAPTCHA Enterprise script failed to load within timeout period');
                                    }
                                }
                                
                                // Wait for grecaptcha.enterprise.ready
                                if (typeof grecaptcha.enterprise.ready === 'function') {
                                    await new Promise((resolve) => {
                                        grecaptcha.enterprise.ready(resolve);
                                    });
                                    console.log('✓ reCAPTCHA Enterprise is ready');
                                }
                                
                                // Now initialize App Check
                                appCheck = initializeAppCheck(app, {
                                    provider: new ReCaptchaV3Provider(window.__recaptcha_site_key),
                                    isTokenAutoRefreshEnabled: true
                                });
                                
                                console.log('✓ Firebase App Check initialized successfully');
                                
                                // Clear error since both Firebase and App Check are working
                                firebaseInitError = null;
                                
                                // Update window.fb to reflect successful initialization
                                window.fb.appCheck = appCheck;
                                window.fb.firebaseInitError = null;
                                
                            } catch (appCheckError) {
                                console.error('App Check initialization failed:', appCheckError.message);
                                
                                // Enhanced error message with troubleshooting steps
                                let errorDetails = 'App Check Initialization Failed: ' + appCheckError.message;
                                
                                // Check for specific error patterns and provide targeted guidance
                                if (appCheckError.message.includes('400') || appCheckError.message.includes('Bad Request')) {
                                    errorDetails += '\n\n🔍 App Check Token Exchange Failed (400 Bad Request)';
                                    errorDetails += '\n\nCommon causes and fixes:';
                                    errorDetails += '\n  1. Domain not authorized:';
                                    errorDetails += '\n     → Go to Google Cloud Console > Security > reCAPTCHA Enterprise';
                                    errorDetails += '\n     → Add your domain to the "Domains" list (include localhost for dev)';
                                    errorDetails += '\n  2. reCAPTCHA Enterprise API not enabled:';
                                    errorDetails += '\n     → Go to Google Cloud Console > APIs & Services';
                                    errorDetails += '\n     → Enable "reCAPTCHA Enterprise API"';
                                    errorDetails += '\n  3. Billing not enabled:';
                                    errorDetails += '\n     → reCAPTCHA Enterprise requires billing to be enabled on your GCP project';
                                    errorDetails += '\n     → Go to Google Cloud Console > Billing';
                                    errorDetails += '\n  4. App Check provider misconfigured:';
                                    errorDetails += '\n     → Firebase Console > Build > App Check';
                                    errorDetails += '\n     → Verify your web app is registered with the correct provider';
                                    errorDetails += '\n     → Ensure the site key matches your reCAPTCHA Enterprise key';
                                } else if (appCheckError.message.includes('grecaptcha')) {
                                    errorDetails += '\n\n🔍 reCAPTCHA Enterprise Script Issue';
                                    errorDetails += '\n\nPossible causes:';
                                    errorDetails += '\n  - Script failed to load or was blocked';
                                    errorDetails += '\n  - Invalid site key';
                                    errorDetails += '\n  - Network or CSP restrictions';
                                }
                                
                                console.error(errorDetails);
                                firebaseInitError = errorDetails;
                                window.fb.firebaseInitError = errorDetails;
                            }
                        };
                        
                        // Start async initialization
                        initializeAppCheckWhenReady();
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
