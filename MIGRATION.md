# Migration Guide: Direct API to Firebase Proxy

This guide helps you migrate from direct API key usage (if you were using it) to the new Firebase Cloud Functions proxy architecture.

## Why This Change?

The previous approach allowed hardcoding API keys in the client-side code, which:
- ❌ Exposes API keys to anyone viewing the page source
- ❌ Makes keys vulnerable to theft and abuse
- ❌ Can lead to unexpected billing charges
- ❌ Violates security best practices

The new approach:
- ✅ Keeps API keys secure on the server side
- ✅ Uses Firebase App Check to verify legitimate requests
- ✅ Prevents unauthorized API usage
- ✅ Follows industry security best practices

## What Changed?

### Before (Insecure)
```javascript
// Old approach - API key in client code ❌
const apiKey = "YOUR_API_KEY";

// Direct API call from browser
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
    method: 'POST',
    body: JSON.stringify(requestBody)
});
```

### After (Secure)
```javascript
// New approach - API key on server only ✅
// No API key in client code!

// Call Firebase Cloud Function proxy
const data = await callGenerateProxy(prompt, systemInstruction);
```

## Migration Steps

### 1. Remove Any Hardcoded API Keys

If you previously added an API key to `public/index.html`, remove it:

```javascript
// DELETE this line if you added it:
// const apiKey = "YOUR_ACTUAL_API_KEY";
```

The new code no longer has an `apiKey` variable. All API calls must go through Firebase.

### 2. Set Up Firebase (If Not Already Done)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already initialized)
firebase init functions
# Select JavaScript
# Install dependencies: Yes
```

### 3. Configure API Key in Firebase Functions

Store your API key securely on the server:

```bash
# Set the API key in Firebase Functions config
firebase functions:config:set genai.key="YOUR_GOOGLE_API_KEY"

# Verify it was set
firebase functions:config:get
```

### 4. Deploy Cloud Functions

```bash
# Deploy all three functions (generateStory, generateTTS, generateImage)
firebase deploy --only functions
```

### 5. Update Client Configuration

In `public/index.html`, update the Firebase configuration (around line 233):

```javascript
const __firebase_config = JSON.stringify({
    apiKey: "YOUR_FIREBASE_API_KEY",  // This is your Firebase API key, not the Gemini key
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
});
```

Get these values from [Firebase Console](https://console.firebase.google.com/) > Project Settings > Your apps.

### 6. Set Up Firebase App Check

App Check is **required** for security. Without it, the app will not work.

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Register a new site with reCAPTCHA v3
3. Add your domain(s) (include `localhost` for development)
4. Copy the site key

In `public/index.html`, update the reCAPTCHA key (around line 259):

```javascript
const __recaptcha_site_key = "YOUR_RECAPTCHA_V3_SITE_KEY";
```

### 7. Deploy Hosting (Optional)

If using Firebase Hosting:

```bash
firebase deploy --only hosting
```

## Troubleshooting

### Error: "Firebase Configuration Required"

**Cause**: Firebase config not set or still has placeholder values.

**Solution**: Update `__firebase_config` in `public/index.html` with your actual Firebase project details.

### Error: "App Check Configuration Required"

**Cause**: reCAPTCHA site key not set or still has placeholder value.

**Solution**: Update `__recaptcha_site_key` in `public/index.html` with your reCAPTCHA v3 site key.

### Error: "API key not configured"

**Cause**: API key not set in Firebase Functions config.

**Solution**: 
```bash
firebase functions:config:set genai.key="YOUR_GOOGLE_API_KEY"
firebase deploy --only functions
```

### Functions deployed but app says "Firebase not configured"

**Cause**: Client-side Firebase config not updated.

**Solution**: Check that `__firebase_config` and `__recaptcha_site_key` are set correctly in `public/index.html`.

### App Check verification fails

**Possible causes**:
- reCAPTCHA site key is incorrect
- Domain not added to reCAPTCHA allowed domains
- Using wrong reCAPTCHA version (must be v3, not v2)

**Solution**: 
1. Verify site key in [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Ensure domain is in the allowed list
3. Ensure you're using reCAPTCHA v3

## Testing Your Migration

1. Open your app in a browser
2. Open browser Developer Tools (F12) > Console
3. Look for these success messages:
   ```
   ✓ Firebase App Check initialized successfully
   Using Firebase proxy for story generation
   ✓ Successfully used Firebase proxy
   ```
4. Try generating a story
5. If you see errors, check the console for specific error messages

## Benefits After Migration

After completing this migration, you'll have:

- ✅ **Secure API key storage** - Keys are never exposed to clients
- ✅ **Request authentication** - App Check verifies all requests
- ✅ **Cost control** - Only your app can use your API key
- ✅ **Scalability** - Firebase automatically scales your functions
- ✅ **Monitoring** - Track usage in Firebase Console
- ✅ **Rate limiting** (can be added) - Prevent abuse

## Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [Server README](server/README.md) - Detailed setup instructions

## Need Help?

If you encounter issues during migration:

1. Check the [Troubleshooting section](#troubleshooting) above
2. Review `server/README.md` for detailed Firebase setup
3. Check browser console for specific error messages
4. Verify all configuration values are correct (no placeholder text)

## Rollback (Not Recommended)

If you absolutely must rollback (not recommended for security reasons):

1. You would need to revert to an older commit before these changes
2. You would need to hardcode an API key (insecure!)
3. Consider using API key restrictions in Google Cloud Console to limit damage

**We strongly recommend completing the migration instead of rolling back.**
