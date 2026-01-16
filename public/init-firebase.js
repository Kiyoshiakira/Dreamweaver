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
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app-check.js";

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
                    // List of known placeholder values
                    const RECAPTCHA_PLACEHOLDERS = [
                        'YOUR_RECAPTCHA_ENTERPRISE_SITE_KEY',
                        'YOUR_RECAPTCHA_KEY',
                        'YOUR_RECAPTCHA_V3_SITE_KEY'
                    ];
                    
                    const hasRecaptchaPlaceholder = RECAPTCHA_PLACEHOLDERS.includes(window.__recaptcha_site_key);
                    const hasInvalidRecaptcha = (!window.__recaptcha_site_key || window.__recaptcha_site_key.trim() === '');
                    
                    if (typeof window.__recaptcha_site_key === 'undefined' || hasInvalidRecaptcha) {
                        console.info('ℹ️ App Check initialization skipped: reCAPTCHA Enterprise site key not configured');
                        console.info('To enable App Check with reCAPTCHA Enterprise:');
                        console.info('  • Firebase Console > Build > App Check');
                        console.info('  • Or update window.__recaptcha_site_key in index.html');
                        firebaseInitError = null; // Don't treat missing key as error - just informational
                    } else if (hasRecaptchaPlaceholder) {
                        console.warn('⚠️ reCAPTCHA site key contains placeholder value');
                        console.info('Update window.__recaptcha_site_key in index.html with your actual key');
                        firebaseInitError = null; // Don't treat placeholder as error - just informational
                    } else {
                        // Initialize App Check - wait for grecaptcha.enterprise to be ready
                        // This ensures the reCAPTCHA Enterprise script is loaded before App Check initialization
                        const initializeAppCheckWhenReady = async () => {
                            // Configuration constants
                            const RECAPTCHA_WAIT_TIMEOUT_MS = 10000; // 10 seconds
                            
                            try {
                                console.log('⏳ Waiting for reCAPTCHA Enterprise API to be ready...');
                                
                                // Use the helper function from index.html
                                const isReady = await window.__waitForReCaptchaEnterprise(RECAPTCHA_WAIT_TIMEOUT_MS);
                                
                                if (!isReady) {
                                    throw new Error('reCAPTCHA Enterprise API failed to load within timeout period');
                                }
                                
                                console.log('✓ reCAPTCHA Enterprise API is ready');
                                
                                // Now initialize App Check with ReCaptchaEnterpriseProvider
                                appCheck = initializeAppCheck(app, {
                                    provider: new ReCaptchaEnterpriseProvider(window.__recaptcha_site_key),
                                    isTokenAutoRefreshEnabled: true
                                });
                                
                                console.log('✓ Firebase App Check initialized successfully with ReCaptchaEnterpriseProvider');
                                
                                // Clear error since both Firebase and App Check are working
                                firebaseInitError = null;
                                
                                // Update window.fb to reflect successful initialization
                                window.fb.appCheck = appCheck;
                                window.fb.firebaseInitError = null;
                                
                            } catch (appCheckError) {
                                console.error('❌ App Check initialization failed:', appCheckError.message);
                                
                                // Provide helpful diagnostic hints
                                console.error('');
                                console.error('🔍 Troubleshooting App Check Initialization Failure:');
                                console.error('');
                                
                                // Check for specific error patterns and provide targeted guidance
                                if (appCheckError.message.includes('timeout') || appCheckError.message.includes('failed to load')) {
                                    console.error('Issue: reCAPTCHA Enterprise script did not load');
                                    console.error('  ✓ Check: Is the site key valid?');
                                    console.error('  ✓ Check: Is the domain authorized in reCAPTCHA Enterprise console?');
                                    console.error('  ✓ Check: Network connectivity and CSP settings');
                                } else if (appCheckError.message.includes('400') || appCheckError.message.includes('Bad Request')) {
                                    console.error('Issue: Token exchange failed (400 Bad Request)');
                                    console.error('  ✓ Check: Domain authorized in Google Cloud Console > Security > reCAPTCHA Enterprise');
                                    console.error('  ✓ Check: reCAPTCHA Enterprise API enabled in APIs & Services');
                                    console.error('  ✓ Check: Billing enabled (reCAPTCHA Enterprise requires billing)');
                                    console.error('  ✓ Check: Firebase Console > App Check provider configuration');
                                } else {
                                    console.error('Issue: Unexpected initialization error');
                                    console.error('  ✓ Check: All troubleshooting steps above');
                                }
                                
                                console.error('');
                                console.error('Key propagation note: After creating/updating a reCAPTCHA key,');
                                console.error('it may take a few minutes to propagate across Google systems.');
                                console.error('');
                                console.error('Detailed error:', appCheckError);
                                
                                // Don't set firebaseInitError or rethrow - allow Firebase to continue
                                // App Check is optional for initialization to proceed
                                console.warn('⚠️ Continuing without App Check. Cloud Functions may reject requests.');
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
