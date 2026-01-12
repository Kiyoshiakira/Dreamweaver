# Firebase Functions Setup and Deployment Guide

This directory contains Firebase Cloud Functions that provide a secure proxy for the Google Generative Language API. The proxy keeps your API key on the server side and verifies requests using Firebase App Check.

## Quick Start (For Experienced Users)

If you already have Firebase set up and just need to configure the API key:

```bash
# 1. Set your API key (choose ONE method):

# Method A (Recommended for production):
firebase functions:config:set genai.key="YOUR_GOOGLE_API_KEY"

# Method B (For local development):
cd server/functions
echo "DREAMWEAVER_APIKEY=YOUR_GOOGLE_API_KEY" > .env

# 2. Deploy (if using Method A):
firebase deploy --only functions

# 3. Or run locally (if using Method B):
firebase emulators:start --only functions
```

**That's it!** The function will automatically find your API key. If you get "API key not configured" errors, see the [Troubleshooting](#troubleshooting) section below.

---

## Overview

The `generateStory` function:
- Accepts story generation requests from the client
- Verifies App Check tokens to prevent unauthorized access
- Forwards requests to Google's Generative Language API using a server-side key
- Returns sanitized responses to the client

## Prerequisites

1. **Node.js 18+** - Required for Firebase Functions
2. **Firebase CLI** - Install with `npm install -g firebase-tools`
3. **Firebase Project** - Create at [Firebase Console](https://console.firebase.google.com/)
4. **Google Generative Language API Key** - Get from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Initial Setup

### 1. Initialize Firebase in your project

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
cd /path/to/Dreamweaver
firebase init

# Select the following options:
# - Functions: Configure Cloud Functions
# - Hosting: Configure hosting (optional but recommended)
# Use existing project or create a new one
# Choose JavaScript or TypeScript (JavaScript recommended)
# Install dependencies: Yes
```

### 2. Configure the API Key

The Cloud Function checks for API keys in this priority order:
1. `functions.config().genai.key` (Firebase Functions config - recommended for production)
2. `process.env.DREAMWEAVER_APIKEY` (environment variable)
3. `process.env.GEN_API_KEY` (environment variable - backward compatibility)
4. `process.env.GENAI_KEY` (environment variable - alternate name)

**Option A: Using Firebase Functions Config (Recommended for production)**

```bash
firebase functions:config:set genai.key="YOUR_GOOGLE_API_KEY"

# Verify the configuration was set correctly
firebase functions:config:get
```

**Option B: Using Environment Variables (For local development)**

```bash
cd server/functions
cp .env.example .env
# Edit .env and set DREAMWEAVER_APIKEY=your_api_key_here
```

**Troubleshooting**: If you see "API key not configured" errors, check:
1. Run `firebase functions:config:get` to verify your config
2. Check if `.env` file exists in `server/functions/` directory
3. Ensure the API key has no quotes or extra spaces
4. Redeploy functions after changing config: `firebase deploy --only functions`

### 3. Set up Firebase App Check

App Check protects your function from abuse by verifying that requests come from your app.

#### For Web (Development - reCAPTCHA v3):

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **App Check** in the left sidebar
4. Click **Get started**
5. Register your web app
6. For **reCAPTCHA v3**:
   - Get a site key from [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
   - Add your domain(s) (including `localhost` for development)
   - Copy the site key
7. Enable enforcement for Cloud Functions (optional but recommended)

#### Add reCAPTCHA site key to your client:

In `dreamweaver.html`, update the Firebase App Check initialization with your reCAPTCHA site key:

```javascript
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});
```

## Local Development

### 1. Install dependencies

```bash
cd server/functions
npm install
```

### 2. Run Firebase Emulators

```bash
# From project root
firebase emulators:start --only functions

# Or from server/functions directory
npm run serve
```

The function will be available at: `http://localhost:5001/YOUR_PROJECT_ID/us-central1/generateStory`

### 3. Update client to use local emulator

In `dreamweaver.html`, update the proxy URL for local testing:

```javascript
const PROXY_URL = 'http://localhost:5001/YOUR_PROJECT_ID/us-central1/generateStory';
```

## Production Deployment

### 1. Deploy the function

**Important**: Make sure your API key is configured BEFORE deploying!

```bash
# First, set the API key if not already done
firebase functions:config:set genai.key="YOUR_GOOGLE_API_KEY"

# Verify the config was set
firebase functions:config:get

# Deploy only functions
firebase deploy --only functions

# Or deploy everything (functions + hosting)
firebase deploy
```

**Deployment Checklist**:
- [ ] API key is set via `firebase functions:config:set genai.key="..."`
- [ ] Verified config with `firebase functions:config:get`
- [ ] App Check is enabled in Firebase Console
- [ ] reCAPTCHA site key is configured in client code
- [ ] Function deployed successfully (check for errors in output)
- [ ] Test the function after deployment (see Testing section)

### 2. Configure Firebase Hosting (Recommended)

Add a rewrite rule in `firebase.json` to make the function accessible at a clean URL:

```json
{
  "hosting": {
    "public": ".",
    "rewrites": [
      {
        "source": "/generateStory",
        "function": "generateStory"
      }
    ]
  }
}
```

This allows the client to call `/generateStory` instead of the full function URL.

### 3. Update client configuration

In `dreamweaver.html`, ensure Firebase config is set:

```javascript
// Option 1: Inline config (not recommended for production)
const __firebase_config = JSON.stringify({
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
});

// Option 2: Use hosting environment variables (recommended)
// Set via Firebase Console or firebase.json
```

## Testing the Function

### 1. Test with curl

```bash
# Get an App Check token (from browser console after initializing App Check)
# Then test the endpoint:

curl -X POST https://YOUR_PROJECT_ID.cloudfunctions.net/generateStory \
  -H "Content-Type: application/json" \
  -H "X-Firebase-AppCheck: YOUR_APP_CHECK_TOKEN" \
  -d '{
    "prompt": "Tell me a short fantasy story",
    "systemInstruction": "You are a professional novelist. Output JSON: {\"title\": \"Story Title\", \"prose\": \"Story content\"}"
  }'
```

### 2. Test from the app

1. Serve the app locally: `python -m http.server 8000`
2. Open `http://localhost:8000/dreamweaver.html`
3. Ensure Firebase config and App Check are initialized
4. Click "Begin Story"
5. Check browser console for proxy usage logs
6. Verify story generation works

## Security Considerations

### Rate Limiting

**⚠️ IMPORTANT:** The current function does not include rate limiting. For production use, implement rate limiting to prevent abuse and control costs.

**Recommended approaches:**

1. **Per-user limits** (if using Firebase Auth):
   ```javascript
   // Track requests per authenticated user
   const userId = req.auth?.uid;
   // Store count in Firestore/Realtime DB
   // Limit to X requests per hour
   ```

2. **IP-based limits** (for anonymous users):
   ```javascript
   const ip = req.ip;
   // Store request counts per IP
   // Use Firebase Realtime Database or Firestore
   ```

3. **Use Firebase Extensions**:
   - Install "Limit repeated requests to HTTPS Cloud Functions"
   - Available at [Firebase Extensions](https://extensions.dev/)

### App Check Enforcement

Enable App Check enforcement in Firebase Console:
1. Go to App Check settings
2. Enable enforcement for Cloud Functions
3. Add your function to the enforced list

### API Key Security

- ✅ **DO**: Store API key in Firebase Functions config or environment variables
- ✅ **DO**: Use App Check to verify client requests
- ✅ **DO**: Implement rate limiting
- ❌ **DON'T**: Commit API keys to version control
- ❌ **DON'T**: Expose function URLs without App Check
- ❌ **DON'T**: Allow unrestricted access

## Monitoring and Logging

### View function logs

```bash
# Stream logs in real-time
firebase functions:log --only generateStory

# View logs in Firebase Console
# Navigate to Functions → generateStory → Logs
```

### Monitor usage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Functions** → **Dashboard**
4. Monitor:
   - Invocations
   - Execution time
   - Memory usage
   - Errors

### Set up alerts

1. In Firebase Console, go to **Functions** → **Health**
2. Set up alerts for:
   - High error rate
   - Slow performance
   - Quota limits

## Troubleshooting

### Function returns 403 "App Check verification required"

- Ensure App Check is properly initialized in the client
- Check that the reCAPTCHA site key is correct
- Verify App Check token is being sent in the request header

### Function returns 500 "API key not configured"

**Cause**: The Cloud Function cannot find the API key in any of the expected locations.

**Solutions**:

1. **Check if config is set** (for production deployments):
   ```bash
   firebase functions:config:get
   ```
   Should show: `{ "genai": { "key": "YOUR_API_KEY" } }`

2. **Set the config** (if not set):
   ```bash
   firebase functions:config:set genai.key="YOUR_GOOGLE_API_KEY"
   ```

3. **Redeploy after setting config**:
   ```bash
   firebase deploy --only functions
   ```

4. **For local development**, create `.env` file:
   ```bash
   cd server/functions
   cp .env.example .env
   # Edit .env and set: DREAMWEAVER_APIKEY=your_api_key_here
   ```

5. **Verify the function can access the key**:
   - Check function logs: `firebase functions:log`
   - Look for "Configuration loaded successfully" message
   - If you see "API key not configured in any expected location", the key isn't accessible

**Common Mistakes**:
- Forgot to redeploy after setting config
- Extra quotes or spaces in the API key
- Using wrong Firebase project (check with `firebase use`)
- API key doesn't have Generative Language API enabled
- Redeploy the function after changing config

### Function returns 502 "Upstream API error"

- Check that your Google API key is valid
- Verify API key has Generative Language API enabled
- Check Google AI Studio for API quota/billing status

### Local emulator not working

- Ensure you have `.env` file with `GEN_API_KEY` set
- Try: `firebase functions:config:get > .runtimeconfig.json`
- Restart emulators: `firebase emulators:start --only functions`

### CORS errors

- Ensure CORS headers are set in the function (already configured)
- For custom domains, update the `Access-Control-Allow-Origin` header

## Cost Optimization

### Firebase Functions Pricing

- First 2 million invocations/month: Free
- Additional invocations: $0.40 per million
- Compute time charged separately

### Google Generative Language API Pricing

- Check current pricing at [Google AI Pricing](https://ai.google.dev/pricing)
- Monitor usage in Google Cloud Console
- Set up budget alerts to avoid surprises

### Tips to reduce costs

1. Implement aggressive rate limiting
2. Cache responses when appropriate
3. Use shorter prompts when possible
4. Monitor and analyze usage patterns
5. Consider implementing request queuing for burst traffic

## Support

For issues or questions:
- Firebase Functions: [Firebase Documentation](https://firebase.google.com/docs/functions)
- App Check: [App Check Documentation](https://firebase.google.com/docs/app-check)
- Google Generative AI: [Google AI Documentation](https://ai.google.dev/docs)

## License

This project is part of Dreamweaver and follows the same MIT License.
