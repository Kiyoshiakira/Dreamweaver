/**
 * Firebase Functions for Dreamweaver
 * Secure proxy for Google Generative Language API
 * Supports story generation, text-to-speech, and image generation
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Helper function to get API key from multiple sources
 * Priority order:
 * 1. functions.config().genai.key
 * 2. process.env.DREAMWEAVER_APIKEY
 * 3. process.env.GEN_API_KEY
 * 4. process.env.GENAI_KEY
 */
function getApiKey() {
  // Check Firebase Functions config first (recommended for production)
  const configKey = functions.config()?.genai?.key;
  
  // Fallback to environment variables
  return configKey || process.env.DREAMWEAVER_APIKEY || process.env.GEN_API_KEY || process.env.GENAI_KEY;
}

/**
 * Helper function to verify App Check token
 * Returns true if verification succeeds, throws error otherwise
 */
async function verifyAppCheck(req) {
  const appCheckToken = req.get('X-Firebase-AppCheck');
  
  if (!appCheckToken) {
    console.warn('Request missing App Check token');
    throw new Error('APP_CHECK_MISSING');
  }
  
  try {
    await admin.appCheck().verifyToken(appCheckToken);
    console.log('App Check verification successful');
    return true;
  } catch (err) {
    console.error('App Check verification failed:', err.message);
    throw new Error(`APP_CHECK_FAILED: ${err.message}`);
  }
}

/**
 * Helper function to handle CORS and common request validation
 */
function handleCORS(req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Firebase-AppCheck');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true;
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return true;
  }
  
  return false;
}

/**
 * HTTPS Cloud Function: generateStory
 * 
 * Securely proxies story generation requests to the Google Generative Language API
 * 
 * Request body:
 *   - prompt: string - The story prompt or continuation instruction
 *   - systemInstruction: string (optional) - System instruction for the AI
 * 
 * Deploy:
 *   firebase deploy --only functions:generateStory
 */
exports.generateStory = functions.https.onRequest(async (req, res) => {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  try {
    // Verify App Check token
    await verifyAppCheck(req);
    
    // Get API key
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('API key not configured in any expected location');
      console.error('Checked: functions.config().genai.key, DREAMWEAVER_APIKEY, GEN_API_KEY, GENAI_KEY');
      res.status(500).json({ 
        error: 'Server configuration error',
        details: 'API key not configured. Please set via: firebase functions:config:set genai.key="YOUR_KEY"'
      });
      return;
    }
    
    console.log('Configuration loaded successfully');
    
    // Validate and sanitize input
    const { prompt, systemInstruction } = req.body;
    
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
    
    console.log('Forwarding story generation request to Generative Language API');
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
    
    console.log('Successfully proxied story generation request');
    res.status(200).json(responseData);
    
  } catch (error) {
    if (error.message === 'APP_CHECK_MISSING') {
      res.status(403).json({ 
        error: 'App Check verification required',
        details: 'Missing App Check token'
      });
    } else if (error.message.startsWith('APP_CHECK_FAILED')) {
      res.status(403).json({ 
        error: 'App Check verification failed',
        details: error.message.replace('APP_CHECK_FAILED: ', '')
      });
    } else {
      console.error('Unexpected error in generateStory function:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message
      });
    }
  }
});

/**
 * HTTPS Cloud Function: generateTTS
 * 
 * Securely proxies text-to-speech requests to the Google Generative Language API
 * 
 * Request body:
 *   - text: string - The text to convert to speech
 *   - voice: string (optional) - Voice name (e.g., "Kore", "Zephyr")
 *   - accent: string (optional) - Accent to use (e.g., "American", "British")
 * 
 * Deploy:
 *   firebase deploy --only functions:generateTTS
 */
exports.generateTTS = functions.https.onRequest(async (req, res) => {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  try {
    // Verify App Check token
    await verifyAppCheck(req);
    
    // Get API key
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('API key not configured');
      res.status(500).json({ 
        error: 'Server configuration error',
        details: 'API key not configured'
      });
      return;
    }
    
    // Validate and sanitize input
    const { text, voice, accent } = req.body;
    
    if (!text || typeof text !== 'string') {
      res.status(400).json({ 
        error: 'Invalid request',
        details: 'Text is required and must be a string'
      });
      return;
    }
    
    // Validate text length (prevent abuse)
    if (text.length > 5000) {
      res.status(400).json({ 
        error: 'Invalid request',
        details: 'Text exceeds maximum length'
      });
      return;
    }
    
    // Build full text with accent if provided
    const accentPrompt = accent && accent !== 'American' ? ` Speak with a ${accent} accent.` : '';
    const fullText = text + accentPrompt;
    
    // Build request body for TTS API
    const requestBody = {
      contents: [{ parts: [{ text: fullText }] }],
      generationConfig: { 
        responseModalities: ["AUDIO"], 
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { 
              voiceName: voice || 'Kore' 
            } 
          } 
        } 
      }
    };
    
    // Forward request to Google Generative Language API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    
    console.log('Forwarding TTS request to Generative Language API');
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    // Check if API request was successful
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`Upstream TTS API error (${apiResponse.status}):`, errorText);
      
      res.status(502).json({ 
        error: 'Upstream API error',
        details: `TTS API returned ${apiResponse.status}`,
        statusCode: apiResponse.status
      });
      return;
    }
    
    // Parse and return response
    const responseData = await apiResponse.json();
    
    // Validate response structure
    if (!responseData || !responseData.candidates) {
      console.error('Invalid response from upstream TTS API:', responseData);
      res.status(502).json({ 
        error: 'Invalid upstream response',
        details: 'TTS API response missing expected data'
      });
      return;
    }
    
    console.log('Successfully proxied TTS request');
    res.status(200).json(responseData);
    
  } catch (error) {
    if (error.message === 'APP_CHECK_MISSING') {
      res.status(403).json({ 
        error: 'App Check verification required',
        details: 'Missing App Check token'
      });
    } else if (error.message.startsWith('APP_CHECK_FAILED')) {
      res.status(403).json({ 
        error: 'App Check verification failed',
        details: error.message.replace('APP_CHECK_FAILED: ', '')
      });
    } else {
      console.error('Unexpected error in generateTTS function:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message
      });
    }
  }
});

/**
 * HTTPS Cloud Function: generateImage
 * 
 * Securely proxies image generation requests to the Google Generative Language API
 * 
 * Request body:
 *   - prompt: string - The image generation prompt
 * 
 * Deploy:
 *   firebase deploy --only functions:generateImage
 */
exports.generateImage = functions.https.onRequest(async (req, res) => {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  try {
    // Verify App Check token
    await verifyAppCheck(req);
    
    // Get API key
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('API key not configured');
      res.status(500).json({ 
        error: 'Server configuration error',
        details: 'API key not configured'
      });
      return;
    }
    
    // Validate and sanitize input
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ 
        error: 'Invalid request',
        details: 'Prompt is required and must be a string'
      });
      return;
    }
    
    // Validate prompt length (prevent abuse)
    if (prompt.length > 2000) {
      res.status(400).json({ 
        error: 'Invalid request',
        details: 'Prompt exceeds maximum length'
      });
      return;
    }
    
    // Build request body for Image API
    const requestBody = {
      contents: [{ 
        parts: [{ text: prompt }] 
      }]
    };
    
    // Forward request to Google Generative Language API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
    
    console.log('Forwarding image generation request to Generative Language API');
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    // Check if API request was successful
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`Upstream Image API error (${apiResponse.status}):`, errorText);
      
      res.status(502).json({ 
        error: 'Upstream API error',
        details: `Image API returned ${apiResponse.status}`,
        statusCode: apiResponse.status
      });
      return;
    }
    
    // Parse and return response
    const responseData = await apiResponse.json();
    
    // Validate response structure
    if (!responseData || !responseData.candidates) {
      console.error('Invalid response from upstream Image API:', responseData);
      res.status(502).json({ 
        error: 'Invalid upstream response',
        details: 'Image API response missing expected data'
      });
      return;
    }
    
    console.log('Successfully proxied image generation request');
    res.status(200).json(responseData);
    
  } catch (error) {
    if (error.message === 'APP_CHECK_MISSING') {
      res.status(403).json({ 
        error: 'App Check verification required',
        details: 'Missing App Check token'
      });
    } else if (error.message.startsWith('APP_CHECK_FAILED')) {
      res.status(403).json({ 
        error: 'App Check verification failed',
        details: error.message.replace('APP_CHECK_FAILED: ', '')
      });
    } else {
      console.error('Unexpected error in generateImage function:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message
      });
    }
  }
});
