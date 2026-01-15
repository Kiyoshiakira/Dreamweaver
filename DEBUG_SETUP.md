# Setting Up Debug Area User Roles

## Quick Setup Guide

### Step 1: Configure Firebase (if not already done)

Follow the main setup instructions in `server/README.md` to configure Firebase.

### Step 2: Create User Roles in Firestore

1. **Via Firebase Console:**
   - Go to Firebase Console → Firestore Database
   - Create a collection named `users`
   - Add a document with the user's UID as the document ID
   - Add field: `role` with value `developer`, `tester`, or `admin`

2. **Example User Document:**
   ```
   Collection: users
   Document ID: abc123xyz (user's Firebase Auth UID)
   Fields:
     - role: "developer"
     - email: "dev@example.com" (optional)
     - createdAt: timestamp (optional)
   ```

### Step 3: Deploy Firestore Rules

Deploy the updated rules that include role-based access control:

```bash
firebase deploy --only firestore:rules
```

### Step 4: Access the Debug Area

**Option 1 - Direct URL:**
```
http://localhost:8000/debug.html
```

**Option 2 - Via Main App:**
```
http://localhost:8000/index.html?debug=true
```
Then click the "🔧 Debug" button in the top-right corner.

## For Development/Testing

During development, the debug page will grant access even without proper role setup to allow testing. For production:

1. Remove the demo access grants in `debug.html`
2. Implement proper authentication flow
3. Ensure all users have appropriate roles in Firestore

## User Roles

- **admin**: Full access to all features and user management
- **developer**: Access to debug tools and testing interfaces
- **tester**: Access to testing interfaces only
- **user**: Standard user, no debug access

## Example: Adding a Developer

Using Firebase Admin SDK or Firestore console:

```javascript
// In Firebase Console or via Admin SDK
{
  "users": {
    "user_uid_here": {
      "role": "developer",
      "email": "developer@example.com",
      "addedAt": "2026-01-15T12:00:00Z"
    }
  }
}
```

## Troubleshooting

**Issue**: Debug page shows "Access Denied"
- **Solution**: Verify user role is set in Firestore users collection

**Issue**: Page shows "Firebase not configured"
- **Solution**: Update Firebase config in both `index.html` and `debug.html`

**Issue**: Can't authenticate
- **Solution**: Ensure Firebase Auth is enabled in Firebase Console

## Security Note

⚠️ In production, always implement proper authentication and authorization. The current setup uses anonymous auth for demonstration purposes.
