# API Connection Guide

## Overview

**IMPORTANT:** Dreamweaver is architected to ensure AI API keys are **NEVER exposed to the client**. All AI requests go through secure Firebase Functions that read the API key from the `.env` file or Firebase configuration.

## How It Works

### Secure Proxy Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                          │
│                   (public/index.html)                    │
│                                                          │
│  • NO direct API calls to Google AI                     │
│  • NO API keys in the code                              │
│  • Only calls Firebase Functions                        │
└──────────────────┬───────────────────────────────────────┘
                   │
                   │ HTTP POST requests
                   │ (/generateStory, /generateTTS, /generateImage)
                   ↓
┌─────────────────────────────────────────────────────────┐
│                   Firebase Functions                     │
│              (server/functions/index.js)                 │
│                                                          │
│  • Verifies App Check token                             │
│  • Reads API key from .env or Firebase config           │
│  • Makes authenticated requests to Google AI            │
│  • Returns sanitized responses                          │
└──────────────────┬───────────────────────────────────────┘
                   │
                   │ API key from .env file:
                   │ DREAMWEAVER_APIKEY=your_key
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│          Google Generative Language API                  │
│       (generativelanguage.googleapis.com)                │
└─────────────────────────────────────────────────────────┘
```

## Setup Instructions

### Step 1: Get Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (starts with `AIza...`)

### Step 2: Configure for Local Development

```bash
# Navigate to the functions directory
cd server/functions

# Copy the example file
cp .env.example .env

# Edit the .env file and add your API key
# Replace "your_api_key_here" with your actual key
nano .env  # or use your preferred editor
```

Your `.env` file should look like:
```env
DREAMWEAVER_APIKEY=AIzaSy...your_actual_key_here
```

### Step 3: Configure for Production Deployment

**RECOMMENDED:** For production, use Firebase Functions configuration instead of the `.env` file:

```bash
# Set the API key in Firebase config
firebase functions:config:set genai.key="AIzaSy...your_actual_key_here"

# Verify it was set correctly
firebase functions:config:get

# Deploy the functions with the configuration
firebase deploy --only functions
```

## Deployment Workflow

### Using Firebase Deploy (Terminal)

```bash
# 1. Ensure API key is configured (choose ONE):
#    Option A: For production (recommended)
firebase functions:config:set genai.key="YOUR_API_KEY"

#    Option B: For local development
#    Create server/functions/.env with DREAMWEAVER_APIKEY=YOUR_API_KEY

# 2. Deploy to Firebase
firebase deploy

# This deploys:
# - Firebase Functions (with API key)
# - Firebase Hosting (frontend)
# - Firestore rules
# - Storage rules
```

### Using Git Pull to Update

```bash
# 1. Pull latest changes
git pull origin main

# 2. If there are changes to dependencies
cd server/functions
npm install

# 3. Deploy updated code
cd ../..
firebase deploy

# Note: API key remains secure in Firebase config
# Git Pull does NOT expose or change your API key
```

## Security Verification

### ✅ What IS Secure

- ✅ API key stored in `.env` file (ignored by git)
- ✅ API key stored in Firebase Functions config
- ✅ Frontend only calls Firebase Functions
- ✅ App Check verifies legitimate requests
- ✅ CORS protection on Firebase Functions
- ✅ API key never exposed to the browser
- ✅ API key never in version control

### ❌ What to AVOID

- ❌ Never put API keys directly in HTML/JavaScript files
- ❌ Never commit `.env` file to git (it's in `.gitignore`)
- ❌ Never share your API key publicly
- ❌ Never make direct API calls from the frontend
- ❌ Never bypass the Firebase Functions proxy

## Verifying Your Configuration

### Check 1: Verify .env is NOT Committed

```bash
# This should show that .env is ignored
git status

# .env should NOT appear in the list of tracked files
```

### Check 2: Verify API Key is Set

```bash
# For Firebase config
firebase functions:config:get

# Should show:
# {
#   "genai": {
#     "key": "AIzaSy..."
#   }
# }

# For local .env
cat server/functions/.env

# Should show:
# DREAMWEAVER_APIKEY=AIzaSy...
```

### Check 3: Test the Functions

```bash
# Start local emulator
firebase emulators:start --only functions

# In another terminal, test the endpoint
curl -X POST http://localhost:5001/YOUR_PROJECT_ID/us-central1/generateStory \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Tell me a short story"}'
```

### Check 4: Verify No Direct API Calls

```bash
# Search for any direct API calls (should find none)
grep -r "generativelanguage.googleapis.com" public/*.js | grep -v "CSP\|connect-src"

# This should return no results (except CSP headers)
```

## API Key Priority Order

The Firebase Functions check for API keys in this order:

1. **Firebase Functions config** (highest priority)
   - Set with: `firebase functions:config:set genai.key="..."`
   - Best for production

2. **DREAMWEAVER_APIKEY** environment variable
   - Set in: `server/functions/.env`
   - Best for local development

3. **GEN_API_KEY** environment variable
   - Backward compatibility

4. **GENAI_KEY** environment variable
   - Alternate name

## Troubleshooting

### Error: "API key not configured"

**Cause:** Firebase Functions cannot find the API key.

**Solution:**
```bash
# Check Firebase config
firebase functions:config:get

# If empty, set it
firebase functions:config:set genai.key="YOUR_API_KEY"

# Redeploy
firebase deploy --only functions
```

### Error: "App Check verification failed"

**Cause:** Frontend cannot verify with App Check.

**Solution:** Configure reCAPTCHA site key in `public/index.html`:
```javascript
window.__recaptcha_site_key = "YOUR_RECAPTCHA_SITE_KEY";
```

### API Key Appears in Browser DevTools

**This is a problem!** The API key should NEVER appear in the browser.

**Solution:** Verify you're using the proxy pattern:
- Check that frontend calls `/generateStory` (not `generativelanguage.googleapis.com`)
- Verify `server/functions/index.js` is the one making API calls
- Never put API keys in `public/index.html`

## Best Practices

1. **Use Firebase Functions config for production**
   ```bash
   firebase functions:config:set genai.key="YOUR_KEY"
   ```

2. **Use .env file for local development**
   ```bash
   cp server/functions/.env.example server/functions/.env
   # Edit and add your key
   ```

3. **Never commit secrets**
   - `.env` is in `.gitignore`
   - Verify with `git status`

4. **Rotate keys periodically**
   - Generate new keys at [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Update Firebase config
   - Redeploy functions

5. **Monitor usage**
   - Check Firebase Functions logs
   - Monitor Google AI Studio quota
   - Set up billing alerts

## Summary

✅ **Your application is secure!**

- Frontend NEVER has access to the API key
- All AI requests go through Firebase Functions
- API key is stored in `.env` file or Firebase config
- You can safely use `firebase deploy` and `git pull`
- Your secrets remain secure

For more information:
- [Firebase Functions Documentation](server/README.md)
- [Configuration Guide](CONFIGURATION_GUIDE.md)
- [Firebase Deployment Guide](FIREBASE_DEPLOYMENT_GUIDE.md)
