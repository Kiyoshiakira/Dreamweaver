# Security Policy

## 🔒 API Key Security

### ⚠️ CRITICAL: Never Commit API Keys

**DO NOT** commit API keys, tokens, or credentials to version control. This includes:

- Google Generative Language API keys
- Firebase API keys
- Spotify Client IDs and secrets
- reCAPTCHA site keys (though less sensitive, still avoid)
- Any other authentication tokens

### Why This Matters

When API keys are committed to a public repository:
1. **Financial Risk**: Unauthorized users can use your API quota, leading to unexpected charges
2. **Security Risk**: Keys can be used to access your resources and data
3. **Compliance Risk**: Violates terms of service for most API providers
4. **Reputation Risk**: Exposes your project to security vulnerabilities

## ✅ Recommended Practices

### 1. Use the Firebase Cloud Function Proxy (Recommended)

The most secure approach is to use the Firebase Cloud Function proxy:

```bash
# Set API key server-side
firebase functions:config:set genai.key="YOUR_API_KEY"

# Deploy the function
firebase deploy --only functions
```

**Benefits**:
- ✅ API key never exposed in client-side code
- ✅ Protected by Firebase App Check
- ✅ Can implement rate limiting
- ✅ Easier to rotate keys without client updates

See [server/README.md](server/README.md) for detailed setup instructions.

### 2. Use Environment Variables (Local Development)

For local development:

```bash
# Copy the template
cp server/functions/.env.example server/functions/.env

# Add your key
echo "DREAMWEAVER_APIKEY=your_api_key_here" > server/functions/.env
```

The `.env` file is already in `.gitignore` and won't be committed.

### 3. Use Configuration Files (Alternative)

For local testing without Firebase:

```bash
# Copy the template
cp config.example.js config.local.js

# Edit config.local.js and add your keys
# This file is already in .gitignore
```

Reference it in your HTML:
```html
<script src="config.local.js"></script>
```

### 4. API Key Restrictions

Always restrict your API keys in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your API key
4. Under **Application restrictions**:
   - Set HTTP referrers (websites) for web apps
   - Limit to your domain (e.g., `https://yourdomain.com/*`)
5. Under **API restrictions**:
   - Select "Restrict key"
   - Only enable Generative Language API

## 🚨 What to Do If You Accidentally Commit a Key

If you accidentally commit an API key:

### Immediate Actions

1. **Revoke the key immediately**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Delete or regenerate the compromised key
   - The old key is now useless to anyone who finds it

2. **Create a new key**:
   - Generate a new API key with proper restrictions
   - Configure it using secure methods (Firebase config, env vars)

3. **Remove from Git history** (if the commit was recent):
   ```bash
   # If you haven't pushed yet
   git reset HEAD~1
   git add <files>
   git commit -m "Remove API keys"
   
   # If you already pushed (more complex - be careful)
   # Consider tools like git-filter-branch or BFG Repo-Cleaner
   # Or simply create a new repository if history is short
   ```

4. **Update your `.gitignore`**:
   - Ensure all config files are properly ignored
   - This repository's `.gitignore` already includes common patterns

### Prevention

- **Use pre-commit hooks**: Install tools like [git-secrets](https://github.com/awslabs/git-secrets) to scan for secrets
- **Code review**: Always review your commits before pushing
- **CI/CD scanning**: Use tools like [Trufflehog](https://github.com/trufflesecurity/trufflehog) in your CI pipeline

## 📋 Files That Should NEVER Be Committed

The following files are already in `.gitignore`, but double-check before committing:

```
# Environment variables
.env
.env.local
.env.*.local
server/functions/.env

# Local configuration
config.js
config.local.js
config.*.js

# Firebase runtime config
.runtimeconfig.json

# Any file containing "key", "secret", or "token" in the name
*secret*
*key*
*token*
*.credentials
```

## 🔍 How to Check for Exposed Keys

### Before Committing

```bash
# Check what you're about to commit
git diff --staged

# Search for potential API keys in staged files
git diff --staged | grep -i "apikey\|api_key\|secret"
```

### After Committing (Local)

```bash
# Search your entire repository history
git log -S "AIzaSy" --source --all
```

### Automated Scanning

Consider using:
- [GitGuardian](https://www.gitguardian.com/) - Monitors GitHub repositories
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning) - Built into GitHub
- [git-secrets](https://github.com/awslabs/git-secrets) - Pre-commit hook

## 📞 Reporting Security Issues

If you discover a security vulnerability in this project:

1. **DO NOT** create a public GitHub issue
2. Email the maintainer directly (see GitHub profile)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We take security seriously and will respond promptly.

## 🔐 Additional Security Measures

### Firebase App Check

Enable Firebase App Check to protect your Cloud Functions:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **App Check**
4. Register your web app
5. Enable reCAPTCHA v3
6. Enforce App Check for Cloud Functions

### Rate Limiting

Implement rate limiting in your Cloud Functions to prevent abuse:

```javascript
// Example in server/functions/index.js
// Track requests per IP or user
// Limit to N requests per time window
```

See [server/README.md](server/README.md) for rate limiting recommendations.

### Content Security Policy

The app includes a Content Security Policy (CSP) header to prevent XSS attacks. Ensure your hosting platform doesn't override it.

### HTTPS

Always use HTTPS in production:
- Required for Spotify OAuth
- Protects API calls from interception
- Enables modern browser features

Firebase Hosting provides free HTTPS automatically.

## 📚 Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

---

**Last Updated**: January 2025

For questions or concerns, please open a GitHub Discussion or contact the maintainer.
