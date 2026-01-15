# Firebase Deployment Configuration Guide

This document ensures that your Dreamweaver application is properly configured to deploy to the correct Firebase project.

## ✅ Current Configuration Status

### Firebase Project Configuration

**Project ID**: `dreamweaver-10d8e`
**Hosting URL**: https://dreamweaver-10d8e.web.app/
**Firebase Console**: https://console.firebase.google.com/u/0/project/dreamweaver-10d8e/overview

### Configuration Files

All configuration files in this repository are correctly set up to deploy to **dreamweaver-10d8e**:

1. **`.firebaserc`** - Specifies the default Firebase project
   ```json
   {
     "projects": {
       "default": "dreamweaver-10d8e"
     }
   }
   ```

2. **`firebase.json`** - Configures Firebase Hosting, Functions, Firestore, and Storage
   - Hosting: Serves files from `public/` directory
   - Functions: Located in `server/functions/`
   - Firestore: Rules in `firestore.rules`
   - Storage: Rules in `storage.rules`

3. **GitHub Actions Workflows** - Automated deployment
   - `.github/workflows/firebase-hosting-merge.yml` - Deploys to production on merge to main
   - `.github/workflows/firebase-hosting-pull-request.yml` - Creates preview deployments for PRs

---

## 🚀 Deployment Methods

### Method 1: Manual Deployment (Firebase CLI)

Use this method for quick deployments from your local machine:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify you're deploying to the correct project
firebase projects:list
firebase use dreamweaver-10d8e

# Deploy everything
firebase deploy

# Or deploy specific components:
firebase deploy --only hosting      # Deploy static files only
firebase deploy --only functions    # Deploy Cloud Functions only
firebase deploy --only firestore    # Deploy Firestore rules only
```

### Method 2: Automated Deployment (GitHub Actions)

GitHub Actions automatically deploys your app when you push to the main branch.

#### Setup Instructions:

1. **Generate Firebase Service Account Key**:
   ```bash
   # This command will generate a service account key and add it to GitHub Secrets
   firebase init hosting:github
   ```

   Or manually:
   - Go to [Firebase Console](https://console.firebase.google.com/project/dreamweaver-10d8e/settings/serviceaccounts/adminsdk)
   - Click "Generate New Private Key"
   - Save the JSON file securely

2. **Add Secret to GitHub**:
   - Go to your GitHub repository settings
   - Navigate to Secrets and Variables > Actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT_DREAMWEAVER_10D8E`
   - Value: Paste the entire JSON content from the service account key

3. **Automatic Deployment**:
   - Push to `main` branch → Deploys to production
   - Create a PR → Creates a preview deployment
   - Merge PR → Automatically deploys to production

---

## 🔍 Verification Checklist

Use this checklist to verify everything is configured correctly:

- [ ] `.firebaserc` contains `"default": "dreamweaver-10d8e"`
- [ ] `firebase.json` exists and has correct hosting/functions configuration
- [ ] Firebase CLI is logged in: `firebase login`
- [ ] Correct project is selected: `firebase use dreamweaver-10d8e`
- [ ] GitHub Actions workflows exist in `.github/workflows/`
- [ ] GitHub Secret `FIREBASE_SERVICE_ACCOUNT_DREAMWEAVER_10D8E` is configured
- [ ] Test deployment works: `firebase deploy --only hosting`
- [ ] Live site is accessible at: https://dreamweaver-10d8e.web.app/

---

## 🐛 Troubleshooting

### Issue: Updates not showing on website

**Symptoms**: You deploy but don't see changes at https://dreamweaver-10d8e.web.app/

**Solutions**:

1. **Clear browser cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or clear cache in browser settings

2. **Verify deployment succeeded**:
   ```bash
   firebase hosting:channel:list
   ```
   Check the deployment timestamp

3. **Check Firebase Console**:
   - Go to https://console.firebase.google.com/project/dreamweaver-10d8e/hosting
   - Verify the deployment timestamp matches your latest deployment
   - Check for any error messages

4. **Verify files were uploaded**:
   ```bash
   firebase deploy --only hosting --debug
   ```
   Look for any errors in the output

### Issue: Deploying to wrong project

**Symptoms**: Changes appear on a different Firebase project

**Solutions**:

1. **Check current project**:
   ```bash
   firebase projects:list
   firebase use
   ```

2. **Switch to correct project**:
   ```bash
   firebase use dreamweaver-10d8e
   ```

3. **Verify `.firebaserc`**:
   Ensure it contains:
   ```json
   {
     "projects": {
       "default": "dreamweaver-10d8e"
     }
   }
   ```

### Issue: GitHub Actions deployment failing

**Symptoms**: GitHub Actions workflow fails or deploys to wrong project

**Solutions**:

1. **Verify GitHub Secret**:
   - Check that `FIREBASE_SERVICE_ACCOUNT_DREAMWEAVER_10D8E` exists in repository secrets
   - Regenerate service account key if needed

2. **Check workflow configuration**:
   - Open `.github/workflows/firebase-hosting-merge.yml`
   - Verify `projectId: dreamweaver-10d8e` is correct

3. **Review workflow logs**:
   - Go to GitHub Actions tab in your repository
   - Click on the failed workflow
   - Review the error messages

### Issue: Functions not updating

**Symptoms**: Cloud Functions show old code after deployment

**Solutions**:

1. **Deploy functions explicitly**:
   ```bash
   firebase deploy --only functions
   ```

2. **Check function logs**:
   ```bash
   firebase functions:log
   ```

3. **Verify functions configuration**:
   - Check `server/functions/index.js` is correct
   - Ensure API keys are set: `firebase functions:config:get`

---

## 📋 Common Commands

```bash
# View current project
firebase use

# Switch project (if you have multiple)
firebase use dreamweaver-10d8e

# List all your Firebase projects
firebase projects:list

# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# View hosting deployments
firebase hosting:channel:list

# Open Firebase Console
firebase open hosting

# Test locally before deploying
firebase emulators:start

# View function logs
firebase functions:log
```

---

## 🔐 Security Notes

1. **Never commit service account keys** to version control
2. **Use GitHub Secrets** for sensitive credentials
3. **API keys** should be configured in Firebase Functions config, not in frontend code
4. **Review** `.gitignore` to ensure secrets are excluded

---

## 📞 Support

If you continue to experience issues:

1. Check the [Firebase Status Page](https://status.firebase.google.com/)
2. Review [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
3. Check [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## 📝 Notes

- This configuration was verified on: **2026-01-15**
- Firebase Project: **dreamweaver-10d8e**
- Deployment URL: **https://dreamweaver-10d8e.web.app/**
- GitHub Repository: **Kiyoshiakira/Dreamweaver**
