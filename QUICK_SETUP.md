# Quick Setup Guide: GitHub Actions Deployment

This guide will help you set up automated deployment from GitHub to Firebase.

## What We've Done

✅ All Firebase configuration files point to **dreamweaver-10d8e**
✅ Created GitHub Actions workflows for automated deployment
✅ Created verification script to check configuration

## What You Need to Do

### Step 1: Set up GitHub Actions Secret

To enable automated deployment, you need to add a Firebase service account key to GitHub Secrets.

**Option A: Automatic Setup (Recommended)**

Run this command in your project directory:

```bash
firebase init hosting:github
```

This will:
1. Generate a Firebase service account key
2. Automatically add it to your GitHub repository secrets
3. Set up the workflows (already done for you)

**Option B: Manual Setup**

1. Generate a service account key:
   - Go to [Firebase Console → Service Accounts](https://console.firebase.google.com/project/dreamweaver-10d8e/settings/serviceaccounts/adminsdk)
   - Click "Generate New Private Key"
   - Save the JSON file

2. Add it to GitHub Secrets:
   - Go to your GitHub repository
   - Click Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT_DREAMWEAVER_10D8E`
   - Value: Paste the entire JSON content
   - Click "Add secret"

### Step 2: Verify Configuration

Run the verification script to ensure everything is set up correctly:

```bash
./verify-firebase-config.sh
```

This will check:
- Firebase project configuration
- GitHub Actions workflows
- Public directory and files
- Server functions

### Step 3: Deploy!

Now you have two ways to deploy:

**Method 1: Automated Deployment (via GitHub Actions)**

Simply push to the main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

GitHub Actions will automatically deploy to https://dreamweaver-10d8e.web.app/

**Method 2: Manual Deployment (via Firebase CLI)**

```bash
# Make sure you're using the correct project
firebase use dreamweaver-10d8e

# Deploy everything
firebase deploy

# Or deploy just hosting
firebase deploy --only hosting
```

## Verification Checklist

Before deploying, make sure:

- [ ] GitHub Secret `FIREBASE_SERVICE_ACCOUNT_DREAMWEAVER_10D8E` is set up
- [ ] Firebase CLI is installed: `npm install -g firebase-tools`
- [ ] You're logged in to Firebase: `firebase login`
- [ ] Verification script passes: `./verify-firebase-config.sh`
- [ ] You're on the correct project: `firebase use dreamweaver-10d8e`

## What Happens on Deployment

### On Push to Main Branch:
1. GitHub Actions workflow triggers
2. Checks out your code
3. Deploys to Firebase Hosting
4. Updates https://dreamweaver-10d8e.web.app/

### On Pull Request:
1. GitHub Actions workflow triggers
2. Creates a preview deployment
3. Adds a comment to the PR with the preview URL
4. You can test changes before merging

## Troubleshooting

### "Updates not showing on website"

1. **Clear browser cache**: Hard refresh with `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. **Check deployment status**: Go to [Firebase Console → Hosting](https://console.firebase.google.com/project/dreamweaver-10d8e/hosting)
3. **Verify files were updated**: Check the deployment timestamp

### "GitHub Actions workflow failing"

1. **Check workflow logs**: Go to GitHub → Actions tab → Click on the failed workflow
2. **Verify secret is set**: GitHub → Settings → Secrets and variables → Actions
3. **Regenerate service account**: If needed, create a new key and update the secret

### "Deploying to wrong project"

Run these commands:

```bash
# Check current project
firebase use

# Should output: dreamweaver-10d8e

# If not, switch to correct project
firebase use dreamweaver-10d8e
```

## Additional Resources

- 📖 [Full Deployment Guide](FIREBASE_DEPLOYMENT_GUIDE.md)
- 🔧 [Firebase Functions Setup](server/README.md)
- 🌐 [Firebase Console](https://console.firebase.google.com/project/dreamweaver-10d8e/overview)
- 📊 [GitHub Actions](https://github.com/Kiyoshiakira/Dreamweaver/actions)

## Summary

**Your Firebase project is correctly configured!**

✅ Project ID: `dreamweaver-10d8e`
✅ Hosting URL: https://dreamweaver-10d8e.web.app/
✅ Configuration files: All correct
✅ GitHub Actions workflows: Created and ready

**Next step**: Set up the GitHub secret (Step 1 above) and you're ready to deploy!

---

**Need help?** See [FIREBASE_DEPLOYMENT_GUIDE.md](FIREBASE_DEPLOYMENT_GUIDE.md) for detailed troubleshooting.
