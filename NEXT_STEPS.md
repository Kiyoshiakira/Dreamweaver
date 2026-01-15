# Next Steps: Server-Side Configuration & Testing

This document outlines the remaining steps to complete the Dreamweaver deployment after applying the client-side fixes.

## ⚠️ Immediate Security Action Required

- [ ] **Rotate any exposed API keys immediately**
  - If a generative API key was previously committed to version control, rotate it in the Google Cloud Console
  - Never commit API keys, Firebase secrets, or credentials to source control
  - All server-side API keys must be configured via Firebase Functions config

## 🔧 Server-Side Configuration

### 1. Configure Server-Side API Key

The generative API key must be stored securely in Firebase Functions configuration:

```bash
firebase functions:config:set genai.key="YOUR_SERVER_SIDE_GENERATIVE_API_KEY"
```

**Important:** Replace `YOUR_SERVER_SIDE_GENERATIVE_API_KEY` with your actual Google Generative Language API key. Get one from: https://makersuite.google.com/app/apikey

### 2. Enable Required Google Cloud APIs

Enable all necessary APIs for your Firebase project:

```bash
gcloud services enable generativelanguage.googleapis.com \
  texttospeech.googleapis.com \
  cloudfunctions.googleapis.com \
  storage.googleapis.com \
  firestore.googleapis.com \
  --project=YOUR_FIREBASE_PROJECT_ID
```

**Note:** Replace `YOUR_FIREBASE_PROJECT_ID` with your actual Firebase project ID.

### 3. Deploy Firebase Functions

Deploy the three Cloud Functions that handle API requests securely:

```bash
firebase deploy --only functions:generateStory,functions:generateTTS,functions:generateImage
```

This deploys:
- `generateStory` - Handles story generation via Gemini API
- `generateTTS` - Converts text to speech audio
- `generateImage` - Generates scene images

### 4. Deploy Firebase Hosting

Deploy the updated client with the hosting rewrites:

```bash
firebase deploy --only hosting
```

This ensures the client routes `/generateStory`, `/generateTTS`, and `/generateImage` to the Cloud Functions.

## ✅ Verification & Testing

### Test 1: Verify Functions Deployment

Check that functions are deployed and accessible:

```bash
firebase functions:list
```

Expected output should show `generateStory`, `generateTTS`, and `generateImage` with status `ACTIVE`.

### Test 2: Manual Function Test with App Check

To test a function manually, you need an App Check token. Here's how:

1. **Get an App Check Debug Token (for testing only):**

```bash
# In your browser console on your deployed site:
const { getToken } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app-check.js");
const token = await getToken(window.fb.appCheck, false);
console.log('App Check Token:', token.token);
```

2. **Test the generateTTS function with curl:**

```bash
# Replace {YOUR_REGION} and {YOUR_PROJECT_ID} with your actual values
# Example: us-central1-my-project-id
curl -X POST https://{YOUR_REGION}-{YOUR_PROJECT_ID}.cloudfunctions.net/generateTTS \
  -H "Content-Type: application/json" \
  -H "X-Firebase-AppCheck: YOUR_APP_CHECK_TOKEN_HERE" \
  -d '{
    "text": "Hello from Dreamweaver!",
    "voice": "Kore",
    "accent": "American"
  }'
```

Expected: JSON response with base64-encoded audio in `candidates[0].content.parts[0].inlineData.data`

3. **Test the generateStory function:**

```bash
# Replace {YOUR_REGION} and {YOUR_PROJECT_ID} with your actual values
curl -X POST https://{YOUR_REGION}-{YOUR_PROJECT_ID}.cloudfunctions.net/generateStory \
  -H "Content-Type: application/json" \
  -H "X-Firebase-AppCheck: YOUR_APP_CHECK_TOKEN_HERE" \
  -d '{
    "prompt": "Once upon a time in a magical forest",
    "systemInstruction": "You are a storyteller. Continue the story."
  }'
```

Expected: JSON response with generated story text

### Test 3: End-to-End Client Test

1. Open your deployed Dreamweaver app in a browser
2. Fill in the story prompt and settings
3. Click "Begin Story"
4. Verify:
   - [ ] Firebase initializes without errors (check browser console)
   - [ ] App Check token is acquired successfully
   - [ ] Story generation starts (text appears)
   - [ ] TTS audio plays (narration begins)
   - [ ] Scene images generate and display
   - [ ] No 403 or proxy errors in network tab

## 🔒 Firebase App Check Configuration

### Register App Check for Your App

1. Go to Firebase Console → App Check
2. Register your web app with reCAPTCHA v3
3. Add authorized domains (production domain + localhost for dev)
4. Update `__recaptcha_site_key` in `public/index.html` with your actual reCAPTCHA site key

**Important:** The current reCAPTCHA site key in the code is a placeholder. Replace it with your real key from https://www.google.com/recaptcha/admin

## 📋 Configuration Checklist

Before marking this deployment complete, verify:

- [ ] Server-side generative API key configured via `firebase functions:config:set`
- [ ] All required Google Cloud APIs enabled
- [ ] Firebase Functions deployed successfully
- [ ] Firebase Hosting deployed with updated rewrites
- [ ] reCAPTCHA site key updated in `public/index.html`
- [ ] Firebase config in `public/index.html` points to correct project
- [ ] App Check is properly configured in Firebase Console
- [ ] All three functions return 200 OK (not 403) when called with valid App Check token
- [ ] Client successfully generates story, TTS audio, and images
- [ ] No exposed API keys remain in client-side code or version control

## 🆘 Troubleshooting

### Function returns 403 Forbidden
- **Cause:** App Check token is missing, invalid, or App Check enforcement is enabled but token verification failed
- **Fix:** Ensure App Check is properly initialized in the client and the reCAPTCHA site key is correct

### Function returns 502 Bad Gateway
- **Cause:** Upstream API error (Gemini API or TTS API)
- **Fix:** Check that the server-side API key is correct and the required APIs are enabled

### "PROXY_NOT_CONFIGURED" error in browser
- **Cause:** Firebase or App Check failed to initialize in the client
- **Fix:** Verify Firebase config and reCAPTCHA site key in `public/index.html`

### TTS audio not playing
- **Cause:** Invalid base64 audio data or MIME type mismatch
- **Fix:** Check function logs with `firebase functions:log` and verify TTS API response format

## 📚 Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [Google Generative Language API](https://ai.google.dev/docs)
- [Google Cloud Text-to-Speech API](https://cloud.google.com/text-to-speech/docs)

---

**Status:** Configuration in progress. Complete the checklist above to finish deployment.
