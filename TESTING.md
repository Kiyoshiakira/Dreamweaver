# Testing Guide for Firebase Proxy Integration

This document describes how to test the Firebase-based API proxy for the Generative Language API.

## Test Scenarios

### Scenario 1: Default Behavior (No Firebase Configuration)

**Purpose**: Verify that the app works without Firebase and falls back to direct API calls.

**Steps**:
1. Serve the app: `python -m http.server 8000`
2. Open `http://localhost:8000/dreamweaver.html`
3. Open browser Developer Tools (F12) → Console
4. Fill in a story prompt and click "Begin Story"

**Expected Behavior**:
- Console shows: `Firebase configuration not provided - running without Firebase backend`
- Console shows: `Using direct API call to Generative Language API`
- Story generates successfully using the client-side API key
- No proxy-related errors appear

**Pass Criteria**: ✅ Story generates and plays without proxy, using fallback

---

### Scenario 2: Firebase Configured, But No App Check

**Purpose**: Verify that the app falls back when Firebase is configured but App Check is not initialized.

**Steps**:
1. Add Firebase configuration to `dreamweaver.html`:
   ```javascript
   <script>
   const __firebase_config = JSON.stringify({
       apiKey: "YOUR_FIREBASE_API_KEY",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abc123"
   });
   </script>
   ```
2. Do NOT set `__recaptcha_site_key`
3. Serve and open the app
4. Check console and generate a story

**Expected Behavior**:
- Console shows: `reCAPTCHA site key not provided - App Check disabled`
- Console shows: `To enable proxy: Set __recaptcha_site_key variable with your reCAPTCHA v3 site key`
- Console shows: `Using direct API call to Generative Language API`
- Story generates using fallback direct API

**Pass Criteria**: ✅ App gracefully falls back when App Check is not configured

---

### Scenario 3: Full Proxy Setup (Local Development with Emulator)

**Purpose**: Test the complete proxy flow using Firebase Functions Emulator.

**Prerequisites**:
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created
- Google Generative Language API key

**Steps**:

1. **Set up Firebase Functions locally**:
   ```bash
   cd server/functions
   npm install
   cp .env.example .env
   # Edit .env and add your API key: GEN_API_KEY=your_key_here
   ```

2. **Start Firebase Emulators**:
   ```bash
   cd /path/to/Dreamweaver
   firebase emulators:start --only functions
   ```
   
   Note the emulator URL, typically: `http://localhost:5001/YOUR_PROJECT_ID/us-central1/generateStory`

3. **Configure the client**:
   Add to `dreamweaver.html` (before the main script):
   ```javascript
   <script>
   const __firebase_config = JSON.stringify({
       apiKey: "YOUR_FIREBASE_API_KEY",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abc123"
   });
   
   const __recaptcha_site_key = "YOUR_RECAPTCHA_V3_SITE_KEY";
   
   const __proxy_url = "http://localhost:5001/YOUR_PROJECT_ID/us-central1/generateStory";
   </script>
   ```

4. **Serve the app**: `python -m http.server 8000`

5. **Open and test**:
   - Open `http://localhost:8000/dreamweaver.html`
   - Open Developer Tools → Console
   - Fill in prompt and click "Begin Story"

**Expected Behavior**:
- Console shows: `Firebase App Check initialized successfully`
- Console shows: `Attempting to use Firebase proxy for story generation`
- Console shows: `Calling proxy endpoint with App Check token`
- Console shows: `Successfully received response from proxy`
- Console shows: `✓ Successfully used Firebase proxy`
- Story generates successfully via the proxy

**Pass Criteria**: ✅ Proxy is used for story generation, App Check token is verified

---

### Scenario 4: Proxy Configured But Function Not Deployed

**Purpose**: Verify graceful fallback when proxy endpoint is not available.

**Steps**:
1. Configure Firebase and App Check as in Scenario 3
2. Do NOT start the emulator or deploy the function
3. Set `__proxy_url` to a non-existent endpoint
4. Generate a story

**Expected Behavior**:
- Console shows: `Attempting to use Firebase proxy for story generation`
- Console warns: `Proxy request failed, falling back to direct API: PROXY_REQUEST_FAILED...`
- Console shows: `Using direct API call to Generative Language API`
- Yellow warning banner appears briefly
- Story generates using fallback API

**Pass Criteria**: ✅ App falls back to direct API when proxy is unreachable

---

### Scenario 5: App Check Verification Failure

**Purpose**: Test behavior when App Check token verification fails.

**Steps**:
1. Deploy the function with App Check enforcement enabled
2. Provide an invalid or expired reCAPTCHA site key
3. Try to generate a story

**Expected Behavior**:
- Console shows: `Attempting to use Firebase proxy for story generation`
- Console shows App Check token acquisition failure or 403 error
- Console warns: `Proxy request failed, falling back to direct API`
- Yellow banner shows: "App Check verification failed..."
- Story generates using fallback API

**Pass Criteria**: ✅ App handles App Check failures gracefully with fallback

---

### Scenario 6: Production Deployment

**Purpose**: Test the complete production setup with deployed Firebase Function.

**Prerequisites**:
- Firebase project with billing enabled
- Cloud Functions deployed
- Firebase Hosting configured (optional)

**Steps**:

1. **Deploy the function**:
   ```bash
   firebase functions:config:set genai.key="YOUR_API_KEY"
   firebase deploy --only functions
   ```

2. **Update client configuration** in `dreamweaver.html`:
   ```javascript
   <script>
   const __firebase_config = JSON.stringify({
       apiKey: "YOUR_FIREBASE_API_KEY",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abc123"
   });
   
   const __recaptcha_site_key = "YOUR_RECAPTCHA_V3_SITE_KEY";
   
   // If using Firebase Hosting with rewrites, use relative path:
   // const __proxy_url = "/generateStory";
   
   // Otherwise, use the full Cloud Function URL:
   const __proxy_url = "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/generateStory";
   </script>
   ```

3. **Deploy to Firebase Hosting** (optional):
   ```bash
   firebase deploy --only hosting
   ```

4. **Test in production**:
   - Visit your deployed URL
   - Open Developer Tools → Console → Network tab
   - Generate a story
   - Monitor console logs and network requests

**Expected Behavior**:
- Console shows: `Firebase App Check initialized successfully`
- Console shows: `✓ Successfully used Firebase proxy`
- Network tab shows POST to `/generateStory` or Cloud Function URL
- Request has `X-Firebase-AppCheck` header
- Response is 200 OK
- Story generates successfully

**Pass Criteria**: ✅ Production proxy works end-to-end with App Check verification

---

## Manual Testing Checklist

Use this checklist to verify all functionality:

### Basic Functionality
- [ ] App loads without errors
- [ ] Story generates without Firebase configuration (Scenario 1)
- [ ] Firebase config loads without App Check (Scenario 2)
- [ ] All UI elements render correctly
- [ ] Music and narration play as expected

### Proxy Functionality
- [ ] App Check initializes when configured (Scenario 3)
- [ ] Proxy endpoint is called when available (Scenario 3)
- [ ] App Check token is sent in request header
- [ ] Firebase Function receives and validates token
- [ ] Function forwards request to Generative Language API
- [ ] Response is properly returned to client

### Error Handling
- [ ] Graceful fallback when proxy not configured (Scenario 2)
- [ ] Graceful fallback when proxy unreachable (Scenario 4)
- [ ] Graceful fallback when App Check fails (Scenario 5)
- [ ] User-friendly error messages displayed
- [ ] Transient banners appear for proxy errors
- [ ] No JavaScript errors in console
- [ ] Story continues with fallback API

### Security
- [ ] No API keys exposed in client code (except fallback)
- [ ] App Check token is generated and sent
- [ ] Server-side API key is never sent to client
- [ ] .env files are gitignored
- [ ] No secrets in git history

### Production
- [ ] Function deploys successfully (Scenario 6)
- [ ] Hosting deploys successfully (if used)
- [ ] App Check works in production
- [ ] Proxy handles production traffic
- [ ] Firebase Console shows function invocations
- [ ] Logs show successful App Check verifications

---

## Automated Testing (Future)

For future implementation, consider:

1. **Unit Tests** for proxy helper functions:
   - `callGenerateProxy()` with mocked fetch
   - `showTransientBanner()` DOM manipulation
   - App Check token acquisition

2. **Integration Tests** for Firebase Functions:
   - Test with valid App Check token
   - Test with invalid/expired token
   - Test with missing token
   - Test upstream API errors
   - Test rate limiting (when implemented)

3. **End-to-End Tests** using Playwright or Cypress:
   - Test complete story generation flow
   - Test fallback scenarios
   - Test error recovery
   - Test production deployment

---

## Troubleshooting

### Common Issues

**Issue**: `TypeError: Cannot read property 'appCheck' of undefined`
- **Cause**: Firebase not properly initialized
- **Fix**: Ensure `__firebase_config` is set before the main script

**Issue**: `Failed to load reCAPTCHA script`
- **Cause**: CSP blocking Google domains or network issue
- **Fix**: Check CSP headers, verify internet connection

**Issue**: `403 App Check verification failed`
- **Cause**: Invalid site key, wrong domain, or token expired
- **Fix**: Verify reCAPTCHA site key, check allowed domains

**Issue**: `502 Upstream API error`
- **Cause**: Invalid server-side API key or API quota exceeded
- **Fix**: Check Firebase Functions config, verify API key, check quotas

**Issue**: Function always uses fallback, never proxy
- **Cause**: `PROXY_GENERATE` set to false, or App Check not initialized
- **Fix**: Check configuration variables, ensure App Check is set up

---

## Monitoring and Debugging

### Client-Side Debugging

**Console Logging**:
The implementation includes extensive logging. Filter console by:
- "proxy" - Shows proxy-related logs
- "Firebase" - Shows Firebase initialization
- "App Check" - Shows App Check status

**Network Tab**:
- Check for POST requests to `/generateStory` or Cloud Function URL
- Verify `X-Firebase-AppCheck` header is present
- Check response status and timing

### Server-Side Debugging

**Firebase Functions Logs**:
```bash
# Stream real-time logs
firebase functions:log --only generateStory

# View in Firebase Console
# Navigate to Functions → generateStory → Logs
```

**Common Log Messages**:
- `App Check verification successful` - Token validated
- `App Check verification failed` - Invalid token
- `Forwarding request to Generative Language API` - Calling upstream
- `Successfully proxied request` - Complete success
- `Upstream API error` - Generative API returned error

---

## Performance Testing

To test performance and scaling:

1. **Measure latency**:
   - Direct API call latency
   - Proxy call latency (adds ~200-500ms overhead)
   - App Check token generation time

2. **Load testing**:
   - Use tools like Artillery or k6
   - Test concurrent requests
   - Monitor Firebase Functions quotas
   - Check for cold start delays

3. **Cost analysis**:
   - Monitor Firebase Functions invocations
   - Track Generative API usage
   - Compare costs: direct vs. proxied requests

---

## Support

For issues:
- Check [server/README.md](server/README.md) for deployment help
- Review Firebase Console logs
- Check Firebase Status Dashboard
- Open an issue on GitHub

---

**Happy Testing! 🎉**
