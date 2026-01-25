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

// Configuration constants
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  timeoutMs: 30000, // 30 second timeout
};

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
 * Helper function to determine if an error is retryable
 * @param {number} statusCode - HTTP status code
 * @param {object} error - Error object
 * @returns {boolean} - True if error is retryable
 */
function isRetryableError(statusCode, error) {
  // Retry on rate limits, server errors, and network issues
  const retryableStatusCodes = [429, 500, 502, 503, 504];
  
  // Also retry on network/timeout errors
  const networkErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'];
  const isNetworkError = error && networkErrors.includes(error.code);
  
  return retryableStatusCodes.includes(statusCode) || isNetworkError;
}

/**
 * Sleep helper for delays
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout support
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Retry wrapper with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {string} operationName - Name of operation for logging
 * @returns {Promise<any>} - Result of successful operation
 */
async function retryWithBackoff(fn, operationName) {
  let lastError;
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      const statusCode = error.statusCode || error.response?.status;
      const shouldRetry = isRetryableError(statusCode, error);
      
      if (!shouldRetry || attempt === RETRY_CONFIG.maxRetries) {
        console.error(`${operationName} failed after ${attempt + 1} attempts:`, error.message);
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        RETRY_CONFIG.initialDelayMs * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelayMs
      );
      
      console.warn(
        `${operationName} attempt ${attempt + 1} failed (${error.message}). ` +
        `Retrying in ${delay}ms...`
      );
      
      await sleep(delay);
    }
  }
  
  throw lastError;
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
    
    // Forward request to Google Generative Language API with retry logic
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    
    console.log('Forwarding story generation request to Generative Language API');
    
    const responseData = await retryWithBackoff(async () => {
      const apiResponse = await fetchWithTimeout(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }, RETRY_CONFIG.timeoutMs);
      
      // Check if API request was successful
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error(`Upstream API error (${apiResponse.status}):`, errorText);
        
        const error = new Error(`API returned ${apiResponse.status}`);
        error.statusCode = apiResponse.status;
        error.details = errorText;
        throw error;
      }
      
      // Parse response
      const data = await apiResponse.json();
      
      // Validate response structure
      if (!data || !data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
        console.error('Invalid response from upstream API:', data);
        const error = new Error('API response missing expected data');
        error.statusCode = 502;
        throw error;
      }
      
      // Additional validation: check if content exists
      if (!data.candidates[0].content || !data.candidates[0].content.parts) {
        console.error('Invalid response structure from upstream API:', data);
        const error = new Error('API response missing content parts');
        error.statusCode = 502;
        throw error;
      }
      
      return data;
    }, 'Story Generation');
    
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
    } else if (error.statusCode) {
      // Error with specific status code from upstream API
      res.status(error.statusCode >= 500 ? 502 : error.statusCode).json({ 
        error: 'Upstream API error',
        details: error.message,
        statusCode: error.statusCode,
        retryable: isRetryableError(error.statusCode, error)
      });
    } else if (error.message === 'Request timeout') {
      res.status(504).json({ 
        error: 'Request timeout',
        details: 'The API request took too long to respond',
        retryable: true
      });
    } else {
      console.error('Unexpected error in generateStory function:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message,
        retryable: false
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
    
    // Forward request to Google Generative Language API with retry logic
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    
    console.log('Forwarding TTS request to Generative Language API');
    
    const responseData = await retryWithBackoff(async () => {
      const apiResponse = await fetchWithTimeout(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }, RETRY_CONFIG.timeoutMs);
      
      // Check if API request was successful
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error(`Upstream TTS API error (${apiResponse.status}):`, errorText);
        
        const error = new Error(`TTS API returned ${apiResponse.status}`);
        error.statusCode = apiResponse.status;
        error.details = errorText;
        throw error;
      }
      
      // Parse response
      const data = await apiResponse.json();
      
      // Validate response structure
      if (!data || !data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
        console.error('Invalid response from upstream TTS API:', data);
        const error = new Error('TTS API response missing expected data');
        error.statusCode = 502;
        throw error;
      }
      
      // Additional validation: check if audio data exists
      if (!data.candidates[0].content || !data.candidates[0].content.parts || 
          !data.candidates[0].content.parts[0].inlineData) {
        console.error('Invalid response structure from upstream TTS API:', data);
        const error = new Error('TTS API response missing audio data');
        error.statusCode = 502;
        throw error;
      }
      
      return data;
    }, 'TTS Generation');
    
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
    } else if (error.statusCode) {
      // Error with specific status code from upstream API
      res.status(error.statusCode >= 500 ? 502 : error.statusCode).json({ 
        error: 'Upstream API error',
        details: error.message,
        statusCode: error.statusCode,
        retryable: isRetryableError(error.statusCode, error)
      });
    } else if (error.message === 'Request timeout') {
      res.status(504).json({ 
        error: 'Request timeout',
        details: 'The TTS API request took too long to respond',
        retryable: true
      });
    } else {
      console.error('Unexpected error in generateTTS function:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message,
        retryable: false
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
    
    // Forward request to Google Generative Language API with retry logic
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
    
    console.log('Forwarding image generation request to Generative Language API');
    
    const responseData = await retryWithBackoff(async () => {
      const apiResponse = await fetchWithTimeout(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }, RETRY_CONFIG.timeoutMs);
      
      // Check if API request was successful
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error(`Upstream Image API error (${apiResponse.status}):`, errorText);
        
        const error = new Error(`Image API returned ${apiResponse.status}`);
        error.statusCode = apiResponse.status;
        error.details = errorText;
        throw error;
      }
      
      // Parse response
      const data = await apiResponse.json();
      
      // Validate response structure
      if (!data || !data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
        console.error('Invalid response from upstream Image API:', data);
        const error = new Error('Image API response missing expected data');
        error.statusCode = 502;
        throw error;
      }
      
      // Additional validation: check if image data exists
      if (!data.candidates[0].content || !data.candidates[0].content.parts || 
          !data.candidates[0].content.parts[0].inlineData) {
        console.error('Invalid response structure from upstream Image API:', data);
        const error = new Error('Image API response missing image data');
        error.statusCode = 502;
        throw error;
      }
      
      return data;
    }, 'Image Generation');
    
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
    } else if (error.statusCode) {
      // Error with specific status code from upstream API
      res.status(error.statusCode >= 500 ? 502 : error.statusCode).json({ 
        error: 'Upstream API error',
        details: error.message,
        statusCode: error.statusCode,
        retryable: isRetryableError(error.statusCode, error)
      });
    } else if (error.message === 'Request timeout') {
      res.status(504).json({ 
        error: 'Request timeout',
        details: 'The Image API request took too long to respond',
        retryable: true
      });
    } else {
      console.error('Unexpected error in generateImage function:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message,
        retryable: false
      });
    }
  }
});
