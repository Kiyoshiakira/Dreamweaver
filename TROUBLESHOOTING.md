# Quick Troubleshooting Guide: "API Service Not Working"

If you're seeing an alert that says "API service isn't working" or "cannot generate text", follow this guide to fix it.

## 🔍 Problem: API Key Not Configured

The most common issue is that the API key is not properly configured. The Firebase Cloud Function needs access to your Google Generative Language API key to generate stories.

## ✅ Solution: Configure Your API Key

### Option 1: Firebase Functions Config (Recommended)

This is the **recommended method** for all deployments:

```bash
# 1. Make sure you're logged into Firebase
firebase login

# 2. Set the API key
firebase functions:config:set genai.key="YOUR_GOOGLE_API_KEY"

# 3. Verify it was set
firebase functions:config:get

# 4. Deploy the function
firebase deploy --only functions
```

**How to get your API key:**
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key or use an existing one
3. Copy the key (starts with `AIzaSy...`)

### Option 2: Environment Variable (Local Development)

For local development with Firebase Emulators:

```bash
# 1. Navigate to functions directory
cd server/functions

# 2. Copy the example file
cp .env.example .env

# 3. Edit .env and add your key
echo "DREAMWEAVER_APIKEY=your_api_key_here" > .env

# 4. Start the emulators
cd ../..
firebase emulators:start --only functions
```

## 🧪 Testing Your Configuration

### Method 1: Run the Check Script

```bash
# From the project root
# First, make the script executable (only needed once)
chmod +x check-config.sh

# Then run it
./check-config.sh
```

This script will check all configuration sources and tell you what's missing.

### Method 2: Manual Verification

1. **Check Firebase Functions Config:**
   ```bash
   firebase functions:config:get
   ```
   Should show: `{ "genai": { "key": "AIzaSy..." } }`

2. **Check .env File (if using local development):**
   ```bash
   cat server/functions/.env
   ```
   Should contain: `DREAMWEAVER_APIKEY=AIzaSy...`

3. **Check Function Logs:**
   ```bash
   firebase functions:log
   ```
   Look for "API key found and loaded successfully" or error messages

## 🐛 Common Issues and Fixes

### Issue 1: "API key not configured"

**Symptoms:** Function returns 500 error with "API key not configured" message

**Cause:** The Cloud Function cannot find the API key in any expected location

**Fix:**
1. Verify you set the config: `firebase functions:config:get`
2. If empty, set it: `firebase functions:config:set genai.key="YOUR_KEY"`
3. Redeploy: `firebase deploy --only functions`

### Issue 2: "App Check verification failed"

**Symptoms:** Function returns 403 error about App Check

**Cause:** reCAPTCHA site key not configured or App Check not set up

**Fix:**
1. Go to https://www.google.com/recaptcha/admin
2. Create a reCAPTCHA v3 site key
3. Update `public/index.html` line 237:
   ```javascript
   const __recaptcha_site_key = "YOUR_RECAPTCHA_V3_SITE_KEY";
   ```
4. Enable App Check in Firebase Console

### Issue 3: "Upstream API error"

**Symptoms:** Function returns 502 error

**Cause:** The Google Generative Language API returned an error

**Possible reasons:**
- API key is invalid or expired
- API key doesn't have Generative Language API enabled
- API quota exceeded
- API key restrictions block the request

**Fix:**
1. Verify API key is valid at https://console.cloud.google.com/apis/credentials
2. Check Generative Language API is enabled
3. Check API key restrictions (should allow your domain or Cloud Functions)
4. Check quota at https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

### Issue 4: Changes Don't Take Effect

**Symptoms:** You updated the config but still getting errors

**Cause:** Function needs to be redeployed to pick up config changes

**Fix:**
```bash
firebase deploy --only functions
```

Config changes require redeployment!

### Issue 5: Works Locally But Not in Production

**Symptoms:** Works with emulators but fails when deployed

**Cause:** Different configuration sources (local uses .env, production uses functions.config)

**Fix:**
1. Make sure you set Firebase Functions config (not just .env):
   ```bash
   firebase functions:config:set genai.key="YOUR_KEY"
   firebase deploy --only functions
   ```

## 📋 Configuration Priority Order

The Cloud Function checks for API keys in this order:

1. ✅ `functions.config().genai.key` (Firebase Functions config)
2. ✅ `process.env.DREAMWEAVER_APIKEY` (environment variable)
3. ✅ `process.env.GEN_API_KEY` (environment variable)
4. ✅ `process.env.GENAI_KEY` (environment variable)

**Production:** Always use option 1 (Firebase Functions config)
**Local Dev:** Use option 2-4 (environment variables in .env)

## 🔒 Security Reminder

**NEVER** put API keys directly in `public/index.html` or any file that gets committed to Git!

- ❌ Don't: Hardcode keys in HTML/JavaScript
- ✅ Do: Use Firebase Functions config
- ✅ Do: Use .env files (which are in .gitignore)

## 📚 More Help

If you're still having issues:

1. Check the detailed logs:
   ```bash
   firebase functions:log --only generateStory
   ```

2. Review the full setup guide: [server/README.md](server/README.md)

3. Review security best practices: [SECURITY.md](SECURITY.md)

4. Check GitHub Issues: https://github.com/Kiyoshiakira/Dreamweaver/issues

5. Start a GitHub Discussion: https://github.com/Kiyoshiakira/Dreamweaver/discussions
