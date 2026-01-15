# Error Handling Fix Documentation

## Problem Statement

The frontend was displaying misleading API key error prompts when encountering any server error. The old error detection logic checked for "403" status codes in error messages, which could match various error types and incorrectly suggest that there was an API key configuration problem.

## What Was Fixed

### 1. Story Generation Error Handling (`initiateSession()` function)

**Before:**
- Checked if error message contained "403" 
- Showed generic "API Key Issue" message
- Could misinterpret proxy errors, App Check failures, or server errors as API key problems

**After:**
- Checks for specific error types from proxy functions:
  - `PROXY_NOT_CONFIGURED` - Firebase/App Check not set up
  - `PROXY_AUTH_FAILED` - App Check verification failed
  - `PROXY_UPSTREAM_ERROR` - Backend cannot reach Google AI API (actual API key issue)
  - `PROXY_SERVER_ERROR` - Internal server error in Cloud Function
  - `PROXY_ERROR` - Generic proxy communication error
  - `PROXY_REQUEST_FAILED` - Network/connectivity issue
- Provides specific guidance for each error type
- Distinguishes between frontend config issues, security verification issues, and backend API issues

### 2. Text-to-Speech Error Handling (`fetchTTS()` function)

**Before:**
- Basic error handling with limited differentiation
- Combined PROXY_NOT_CONFIGURED and Firebase config errors

**After:**
- Separate handling for:
  - `PROXY_NOT_CONFIGURED` - Firebase setup issue
  - `PROXY_AUTH_FAILED` / `APP_CHECK` - App Check verification failure
  - `TTS_PROXY_ERROR` - Backend API issue (API key configuration)
  - Firebase configuration errors
- More helpful error messages with actionable guidance

### 3. Image Generation Error Handling (`generateVisual()` function)

**Before:**
- Generic error handling
- Showed banner for all errors except config errors

**After:**
- Specific handling for:
  - `PROXY_NOT_CONFIGURED` - Firebase setup issue
  - `PROXY_AUTH_FAILED` / `APP_CHECK` - App Check verification failure
  - `IMAGE_PROXY_ERROR` - Backend API issue
  - Firebase configuration errors (silent, as these are shown once during init)
- Clearer distinction between error types

## How It Works

### Error Flow

1. **Frontend calls proxy function** (callGenerateProxy, callTTSProxy, or callImageProxy)
2. **Proxy function checks Firebase App Check** initialization
   - If not configured → throws `PROXY_NOT_CONFIGURED`
3. **Proxy function makes request** to Cloud Function
   - 403 status → throws `PROXY_AUTH_FAILED` (App Check issue)
   - 502 status → throws `PROXY_UPSTREAM_ERROR` (API key/upstream issue)
   - 500 status → throws `PROXY_SERVER_ERROR` (internal server error)
   - Other errors → throws `PROXY_ERROR` or `PROXY_REQUEST_FAILED`
4. **Error handler shows appropriate message** based on error type

### Error Types and User Guidance

| Error Type | What It Means | User Guidance |
|------------|---------------|---------------|
| `PROXY_NOT_CONFIGURED` | Firebase/App Check not set up | Configure Firebase in index.html, set up reCAPTCHA v3 |
| `PROXY_AUTH_FAILED` | App Check verification failed | Check reCAPTCHA site key, verify domain allowlist |
| `PROXY_UPSTREAM_ERROR` | Backend can't reach Google AI API | Configure API key in Firebase Functions, check quota |
| `PROXY_SERVER_ERROR` | Internal error in Cloud Function | Check Firebase Functions logs |
| `PROXY_ERROR` | Generic proxy communication error | Details in error message |
| `PROXY_REQUEST_FAILED` | Network/connectivity issue | Check internet, verify Functions are deployed |

## Testing Recommendations

To verify the fixes work correctly, test the following scenarios:

1. **Firebase Not Configured**
   - Remove or invalidate `__firebase_config`
   - Expected: "Firebase Configuration Issue" message

2. **App Check Not Configured**
   - Remove or invalidate `__recaptcha_site_key`
   - Expected: "App Check Verification Failed" message

3. **API Key Not Configured in Functions**
   - Deploy Functions without setting `genai.key`
   - Expected: "Backend API Issue" message mentioning API key configuration

4. **API Key Invalid**
   - Set invalid API key in Functions config
   - Expected: "Backend API Issue" message about upstream API error

5. **Network Issue**
   - Disable network while running
   - Expected: "Request Failed" message about connectivity

6. **Normal Operation**
   - With all properly configured
   - Expected: Story generation, TTS, and images work correctly

## Files Modified

- `public/index.html` - Updated error handling in three locations:
  1. `initiateSession()` function (story generation errors)
  2. `fetchTTS()` function (text-to-speech errors)
  3. `generateVisual()` function (image generation errors)

## Related Configuration Files

- `firebase.json` - Defines proxy endpoint rewrites (already correct)
- `server/functions/index.js` - Cloud Functions that throw the error types (already correct)

## Benefits

1. **Clearer error messages** - Users know exactly what's wrong
2. **Actionable guidance** - Each error type includes steps to fix it
3. **No misleading prompts** - API key errors only shown for actual API key issues
4. **Better debugging** - Developers can quickly identify the problem source
5. **Consistent handling** - All three API proxy types use the same error patterns
