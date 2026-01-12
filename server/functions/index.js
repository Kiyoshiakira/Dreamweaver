/**
 * Firebase Functions for Dreamweaver
 * Secure proxy for Google Generative Language API
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * HTTPS Cloud Function: generateStory
 * 
 * Securely proxies requests to the Google Generative Language API
 * with server-side API key storage and App Check verification.
 * 
 * Request body:
 *   - prompt: string - The story prompt or continuation instruction
 *   - history: string[] (optional) - Array of previous story chapters
 *   - systemInstruction: string (optional) - System instruction for the AI
 * 
 * Security:
 *   - Verifies App Check token from X-Firebase-AppCheck header
 *   - Uses server-side API key (not exposed to client)
 *   - Validates and sanitizes input
 * 
 * API Key Configuration:
 *   The function checks for API keys in priority order:
 *   1. functions.config().genai.key - Set via: firebase functions:config:set genai.key="YOUR_KEY"
 *   2. process.env.DREAMWEAVER_APIKEY - Set in .env file or deployment environment
 *   3. process.env.GEN_API_KEY - Alternative environment variable name
 *   4. process.env.GENAI_KEY - Alternative environment variable name
 * 
 * Rate Limiting:
 *   - TODO: Add rate limiting middleware for production use
 *   - Consider using Firebase Extensions or custom rate limiter
 *   - Recommend per-user limits based on authenticated user or IP
 * 
 * Deploy:
 *   firebase deploy --only functions:generateStory
 */
exports.generateStory = functions.https.onRequest(async (req, res) => {
  // CORS headers for client access
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Firebase-AppCheck');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    // Verify App Check token
    const appCheckToken = req.get('X-Firebase-AppCheck');
    
    if (!appCheckToken) {
      console.warn('Request missing App Check token');
      res.status(403).json({ 
        error: 'App Check verification required',
        details: 'Missing App Check token'
      });
      return;
    }
    
    try {
      await admin.appCheck().verifyToken(appCheckToken);
      console.log('App Check verification successful');
    } catch (err) {
      console.error('App Check verification failed:', err.message);
      res.status(403).json({ 
        error: 'App Check verification failed',
        details: err.message
      });
      return;
    }
    
    // Get API key from multiple possible sources
    // Priority order:
    // 1. Firebase Functions config: firebase functions:config:set genai.key="YOUR_API_KEY"
    // 2. Environment variable: DREAMWEAVER_APIKEY
    // 3. Environment variable: GEN_API_KEY (for backward compatibility)
    // 4. Environment variable: GENAI_KEY
    let apiKey = null;
    
    // Check Firebase Functions config first (recommended for production)
    // Use optional chaining to safely access config without throwing
    apiKey = functions.config()?.genai?.key;
    
    // Fallback to environment variables
    if (!apiKey) {
      apiKey = process.env.DREAMWEAVER_APIKEY || process.env.GEN_API_KEY || process.env.GENAI_KEY;
    }
    
    if (!apiKey) {
      console.error('API key not configured in any expected location');
      console.error('Checked: functions.config().genai.key, DREAMWEAVER_APIKEY, GEN_API_KEY, GENAI_KEY');
      res.status(500).json({ 
        error: 'Server configuration error',
        details: 'API key not configured. Please set via: firebase functions:config:set genai.key="YOUR_KEY" or environment variable DREAMWEAVER_APIKEY'
      });
      return;
    }
    
    console.log('Configuration loaded successfully');
    
    // Validate and sanitize input
    const { prompt, history, systemInstruction } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ 
        error: 'Invalid request',
        details: 'Prompt is required and must be a string'
      });
      return;
    }
    
    // Validate prompt length (prevent abuse)
    if (prompt.length > 10000) {
      res.status(400).json({ 
        error: 'Invalid request',
        details: 'Prompt exceeds maximum length'
      });
      return;
    }
    
    // Validate history if provided
    if (history && !Array.isArray(history)) {
      res.status(400).json({ 
        error: 'Invalid request',
        details: 'History must be an array'
      });
      return;
    }
    
    // Validate systemInstruction if provided
    if (systemInstruction && typeof systemInstruction !== 'string') {
      res.status(400).json({ 
        error: 'Invalid request',
        details: 'System instruction must be a string'
      });
      return;
    }
    
    // Build request body for Generative Language API
    const requestBody = {
      contents: [{ 
        parts: [{ text: prompt }] 
      }],
      generationConfig: { 
        responseMimeType: "application/json" 
      }
    };
    
    // Add system instruction if provided
    if (systemInstruction) {
      requestBody.systemInstruction = { 
        parts: [{ text: systemInstruction }] 
      };
    }
    
    // Forward request to Google Generative Language API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    
    console.log('Forwarding request to Generative Language API');
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    // Check if API request was successful
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`Upstream API error (${apiResponse.status}):`, errorText);
      
      res.status(502).json({ 
        error: 'Upstream API error',
        details: `API returned ${apiResponse.status}`,
        statusCode: apiResponse.status
      });
      return;
    }
    
    // Parse and return response
    const responseData = await apiResponse.json();
    
    // Validate response structure
    if (!responseData || !responseData.candidates) {
      console.error('Invalid response from upstream API:', responseData);
      res.status(502).json({ 
        error: 'Invalid upstream response',
        details: 'API response missing expected data'
      });
      return;
    }
    
    console.log('Successfully proxied request to Generative Language API');
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Unexpected error in generateStory function:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * NOTE: Rate Limiting Recommendations
 * 
 * For production deployment, implement rate limiting to prevent abuse:
 * 
 * 1. Per-user limits (if using Firebase Auth):
 *    - Track requests per authenticated user
 *    - Limit to X requests per minute/hour
 * 
 * 2. IP-based limits (for anonymous users):
 *    - Use req.ip to track requests per IP address
 *    - Store counts in Firebase Realtime Database or Firestore
 * 
 * 3. Consider using Firebase Extensions:
 *    - Limit repeated requests to HTTPS Cloud Functions
 *    - https://extensions.dev/extensions/firebase/firestore-counter
 * 
 * 4. Implement exponential backoff for repeated failures
 * 
 * Example rate limiter (pseudocode):
 * 
 * const rateLimit = require('express-rate-limit');
 * const limiter = rateLimit({
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 100 // limit each IP to 100 requests per windowMs
 * });
 * 
 * exports.generateStory = functions.https.onRequest((req, res) => {
 *   limiter(req, res, async () => {
 *     // ... existing code
 *   });
 * });
 */
