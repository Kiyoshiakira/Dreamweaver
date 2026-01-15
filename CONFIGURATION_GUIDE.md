# Quick Configuration Guide

## Stop Seeing Configuration Errors

If you're seeing Firebase configuration errors, follow these simple steps:

### Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **dreamweaver-10d8e**
3. Click the gear icon ⚙️ (Project Settings)
4. Scroll down to "Your apps" section
5. Click on your web app or create one if it doesn't exist
6. Under "SDK setup and configuration", select "Config"
7. Copy the `firebaseConfig` object

### Step 2: Update public/index.html

Open `public/index.html` and find line ~288. Replace the empty strings with your Firebase config:

```javascript
const __firebase_config = JSON.stringify({
    apiKey: "AIzaSy...",  // Paste your actual API key here
    authDomain: "dreamweaver-10d8e.firebaseapp.com",  // Your actual domain
    projectId: "dreamweaver-10d8e",  // Your actual project ID
    storageBucket: "dreamweaver-10d8e.firebasestorage.app",
    messagingSenderId: "123456789",  // Your actual sender ID
    appId: "1:123456789:web:abc123",  // Your actual app ID
    measurementId: "G-XXXXXXXXXX"  // Your actual measurement ID (optional)
});
```

### Step 3: Get Your reCAPTCHA Site Key

1. Go to [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. If you don't have a site key, create one:
   - Label: "Dreamweaver"
   - reCAPTCHA type: **v3**
   - Domains: Add your domains (e.g., `localhost`, `dreamweaver-10d8e.web.app`)
3. Copy the site key

### Step 4: Update reCAPTCHA Key in public/index.html

Find line ~301 and paste your reCAPTCHA site key:

```javascript
const __recaptcha_site_key = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";  // Your actual key here
```

### Step 5: Verify Your Gemini API Key is Set

Make sure you've already set your Gemini API key in Firebase Functions:

```bash
# Check if it's set
firebase functions:config:get

# If not set, set it now
firebase functions:config:set genai.key="YOUR_GOOGLE_GEMINI_API_KEY"

# Deploy functions with the new config
firebase deploy --only functions
```

### Step 6: Deploy

```bash
# Deploy everything
firebase deploy

# Or deploy just hosting if functions are already deployed
firebase deploy --only hosting
```

### Step 7: Test

1. Visit your deployed site (e.g., `https://dreamweaver-10d8e.web.app`)
2. You should **NOT** see any Firebase configuration errors
3. Click "Begin Story" to test that everything works

## What Changed?

### Before
- Placeholder values like `"YOUR_FIREBASE_API_KEY"` triggered warnings
- Error messages were generic and unhelpful

### After  
- Empty strings `""` by default (no false warnings)
- Helpful error messages with exact file locations
- Clear instructions on where to get configuration values

## Still Seeing Errors?

If you still see configuration errors after following these steps:

1. **Check Browser Console** - Look for specific error messages
2. **Verify API Key** - Make sure Gemini API key is set: `firebase functions:config:get`
3. **Check Deployed Functions** - Verify all 3 functions are deployed in Firebase Console
4. **Test Locally First** - Run `firebase serve` to test before deploying
5. **Clear Browser Cache** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Expected Result

After proper configuration:
- ✅ No Firebase configuration warnings
- ✅ No App Check warnings
- ✅ Story generation works
- ✅ Text-to-speech works
- ✅ Image generation works

## Questions?

Check these files for more details:
- `server/README.md` - Complete Firebase Functions setup guide
- `FIREBASE_DEPLOYMENT_GUIDE.md` - Deployment instructions
- `FIREBASE_CLEANUP_SUMMARY.md` - Summary of recent changes
