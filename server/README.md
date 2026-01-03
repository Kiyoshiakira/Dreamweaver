# Firebase Functions Setup and Deployment Guide

This directory contains Firebase Cloud Functions that provide a secure proxy for the Google Generative Language API. The proxy keeps your API key on the server side and verifies requests using Firebase App Check.

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

**Option A: Using Firebase Functions Config (Recommended for production)**

```bash
firebase functions:config:set genai.key="YOUR_GOOGLE_API_KEY"
```

**Option B: Using Environment Variables (For local development)**

```bash
cd server/functions
cp .env.example .env
# Edit .env and add your API key
```

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

```bash
# Deploy only functions
firebase deploy --only functions

# Or deploy everything (functions + hosting)
firebase deploy
```

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

- Verify API key is set: `firebase functions:config:get`
- Ensure key is set correctly: `firebase functions:config:set genai.key="YOUR_KEY"`
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
