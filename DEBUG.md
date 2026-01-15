# 🔧 Dreamweaver Debug & Testing Area

## Overview

The Debug & Testing Area is a specialized interface for developers and testers to test AI functionality, inspect API calls, and debug configurations. This area provides tools to validate that all components of Dreamweaver are working correctly.

## Access

### For Developers/Testers

1. **Direct Access**: Navigate to `debug.html` in your browser
   - Example: `http://localhost:8000/debug.html`

2. **Via Debug Mode**: Add `?debug=true` to the main page URL to see a debug link in the navigation
   - Example: `http://localhost:8000/index.html?debug=true`
   - Click the "🔧 Debug" button in the top-right corner

3. **Role-Based Access**: Configure user roles in Firestore for production access control

### Setting Up User Roles (Production)

To restrict access to authorized users only, set up user roles in Firestore:

1. Create a `users` collection in Firestore
2. Add a document with the user's UID as the document ID
3. Set the `role` field to one of:
   - `admin` - Full access to all features
   - `developer` - Access to debug and testing tools
   - `tester` - Access to testing tools
   - `user` - Standard user (no debug access)

Example Firestore document structure:
```json
{
  "role": "developer",
  "email": "dev@example.com",
  "createdAt": "2026-01-15T12:00:00Z"
}
```

## Features

### 1. Configuration Status Panel

Displays the current state of all configurations:
- **Firebase Initialized**: Shows if Firebase SDK is loaded
- **App Check Active**: Indicates if Firebase App Check is enabled
- **Authentication**: Shows current authentication method
- **User Role**: Displays the current user's role

### 2. AI Function Testers

#### Story Generation Test
- Test the story generation API endpoint
- Input custom prompts and system instructions
- View response time and output
- Verify JSON structure and content quality

**Example Usage:**
```
Prompt: "A wizard discovers a mysterious ancient book in a hidden library."
System Instruction: "You are a creative storyteller. Generate engaging narratives."
```

#### Text-to-Speech Test
- Test TTS generation with different voices and accents
- Available voices: Kore, Zephyr, Puck, Charon
- Available accents: American, British, Australian, Indian
- Play generated audio directly in the browser
- Monitor response times

**Example Usage:**
```
Text: "Hello, this is a test of the text to speech system."
Voice: Kore
Accent: British
```

#### Image Generation Test
- Test image generation API endpoint
- Input descriptive prompts
- Preview generated images inline
- Monitor generation time

**Example Usage:**
```
Prompt: "A mystical wizard standing in an ancient library filled with glowing magical books."
```

### 3. Request Inspector

Monitor all API requests in real-time:
- **Log Toggle**: Enable/disable request logging
- **Request Details**: View full request/response data
- **Timing Information**: See how long each request takes
- **Error Tracking**: Identify failed requests
- **Export**: Download logs as JSON for analysis

### 4. Debug Console

Advanced debugging tools:
- **Verbose Logging**: Toggle detailed console output
- **Real-time Logs**: See all system events as they happen
- **Error Testing**: Trigger test errors to verify error handling
- **Log Export**: Save console output for later review

## Configuration

The debug page requires the same Firebase configuration as the main application:

1. Open `public/debug.html`
2. Update the Firebase configuration (lines ~500-510):
   ```javascript
   const __firebase_config = JSON.stringify({
       apiKey: "YOUR_FIREBASE_API_KEY",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       // ... other config
   });
   
   const __recaptcha_site_key = "YOUR_RECAPTCHA_V3_SITE_KEY";
   ```

## Usage Examples

### Testing Story Generation

1. Navigate to the debug page
2. Locate the "Story Generation Test" panel
3. Enter a story prompt
4. Optionally add system instructions
5. Click "Generate Story"
6. Review the response and timing metrics

### Monitoring API Performance

1. Enable "Log All Requests" in the Request Inspector
2. Run multiple tests across different panels
3. Review timing metrics for each endpoint
4. Export logs for performance analysis

### Debugging Configuration Issues

1. Check the Configuration Status panel
2. Verify all checkmarks are green (✅)
3. If any are red (❌), review the console log
4. Update Firebase configuration as needed

### Testing Error Handling

1. Click "Test Error" in the Debug Console
2. Verify error appears in console log
3. Check that error styling is correct
4. Confirm error doesn't break the interface

## Security Considerations

⚠️ **Important Security Notes:**

1. **Production Access**: Implement proper role-based access control in Firestore
2. **API Keys**: Never expose API keys in client-side code (use Firebase Functions proxy)
3. **App Check**: Always enable Firebase App Check for production deployments
4. **Rate Limiting**: Consider implementing rate limits for test endpoints
5. **Log Data**: Be cautious about logging sensitive information

## Firestore Rules for Production

Update your `firestore.rules` to restrict debug access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /debug_logs/{logId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'developer', 'tester'];
    }
  }
}
```

## Troubleshooting

### Debug Page Won't Load
- Verify Firebase configuration is correct
- Check browser console for errors
- Ensure you're serving over HTTP (not file://)

### API Tests Failing
- Verify Firebase Functions are deployed
- Check App Check token is valid
- Review Firebase Functions logs for errors
- Confirm API keys are configured server-side

### Authorization Issues
- Check user role in Firestore
- Verify Firestore rules are deployed
- Ensure user is authenticated

### No Audio/Images Displaying
- Check response format in output panel
- Verify base64 data is present
- Check browser console for decoding errors

## Best Practices

1. **Regular Testing**: Use the debug area to test changes before deploying
2. **Performance Monitoring**: Track API response times to identify slowdowns
3. **Error Documentation**: Export and save logs when issues occur
4. **Configuration Validation**: Always check configuration status after updates
5. **Role Management**: Keep user roles up to date in Firestore

## Future Enhancements

Potential additions to the debug area:
- [ ] Firestore data browser
- [ ] Real-time performance graphs
- [ ] Automated test suite runner
- [ ] A/B testing tools for prompts
- [ ] Token usage analytics
- [ ] Session replay functionality
- [ ] Batch testing capabilities
- [ ] Configuration import/export

## Support

For issues or feature requests related to the debug area:
1. Check this documentation
2. Review console logs for errors
3. Export and save logs for debugging
4. Report issues with detailed reproduction steps

---

**Made for developers and testers to ensure Dreamweaver works perfectly** 🛠️
