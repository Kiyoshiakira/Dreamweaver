# Firebase Project Connection Overview

This diagram shows how all components connect to Firebase project **dreamweaver-10d8e**.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                     Firebase Project: dreamweaver-10d8e               │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🌐 Firebase Hosting                                         │   │
│  │  URL: https://dreamweaver-10d8e.web.app/                    │   │
│  │  Serves: public/ directory                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ⚙️  Cloud Functions                                          │   │
│  │  - generateStory                                              │   │
│  │  - generateTTS                                                │   │
│  │  - generateImage                                              │   │
│  │  Location: server/functions/                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🗄️  Firestore Database                                       │   │
│  │  Rules: firestore.rules                                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📦 Cloud Storage                                             │   │
│  │  Rules: storage.rules                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │
                                 │ Deploys to
                                 │
        ┌────────────────────────┴────────────────────────┐
        │                                                  │
        │                                                  │
┌───────▼──────────┐                            ┌─────────▼────────┐
│                  │                            │                  │
│  📁 Local Files  │                            │  🤖 GitHub       │
│                  │                            │     Actions      │
│  .firebaserc     │                            │                  │
│  firebase.json   │                            │  Workflows:      │
│  public/         │                            │  - Merge         │
│  server/         │                            │  - Pull Request  │
│                  │                            │                  │
└──────┬───────────┘                            └──────┬───────────┘
       │                                               │
       │ firebase deploy                               │
       │                                               │
       └───────────────────┬───────────────────────────┘
                           │
                           │
                  Manual or Automated
                      Deployment


Configuration Files:
═══════════════════

📄 .firebaserc
─────────────
{
  "projects": {
    "default": "dreamweaver-10d8e"  ✓ CORRECT
  }
}

📄 firebase.json
─────────────────
{
  "hosting": {
    "public": "public",          ✓ Correct directory
    "rewrites": [...]            ✓ Functions configured
  },
  "functions": {
    "source": "server/functions" ✓ Correct path
  }
}

📄 GitHub Actions Workflows
────────────────────────────
.github/workflows/firebase-hosting-merge.yml
  projectId: dreamweaver-10d8e  ✓ CORRECT

.github/workflows/firebase-hosting-pull-request.yml
  projectId: dreamweaver-10d8e  ✓ CORRECT


Deployment Flow:
════════════════

Method 1: Manual Deployment
────────────────────────────
1. Developer makes changes locally
2. Runs: firebase deploy
3. Firebase CLI reads .firebaserc → dreamweaver-10d8e
4. Deploys to https://dreamweaver-10d8e.web.app/

Method 2: GitHub Actions (Automated)
─────────────────────────────────────
1. Developer pushes to main branch
2. GitHub Actions workflow triggers
3. Workflow uses FIREBASE_SERVICE_ACCOUNT secret
4. Deploys to dreamweaver-10d8e project
5. Updates https://dreamweaver-10d8e.web.app/


Verification:
═════════════

Run: ./verify-firebase-config.sh

This checks:
  ✓ .firebaserc has correct project ID
  ✓ firebase.json exists and is valid
  ✓ GitHub workflows have correct project ID
  ✓ public/ directory exists with index.html
  ✓ server/functions/ exists with index.js


All Systems Check:
══════════════════

✅ Firebase Project:       dreamweaver-10d8e
✅ Live URL:               https://dreamweaver-10d8e.web.app/
✅ Firebase Console:       https://console.firebase.google.com/u/0/project/dreamweaver-10d8e/overview
✅ Configuration Files:    All pointing to dreamweaver-10d8e
✅ GitHub Actions:         Configured and ready
✅ Deployment Ready:       YES

Status: 🟢 READY TO DEPLOY
```

## How to Deploy

### Option 1: Automatic (Recommended)
```bash
# Just push to main
git push origin main
```

### Option 2: Manual
```bash
# Verify project
firebase use dreamweaver-10d8e

# Deploy
firebase deploy
```

## Important URLs

| Service | URL |
|---------|-----|
| **Live Site** | https://dreamweaver-10d8e.web.app/ |
| **Firebase Console** | https://console.firebase.google.com/u/0/project/dreamweaver-10d8e/overview |
| **GitHub Repository** | https://github.com/Kiyoshiakira/Dreamweaver |
| **GitHub Actions** | https://github.com/Kiyoshiakira/Dreamweaver/actions |

## Next Steps

1. ✅ Configuration verified - All files point to correct project
2. ⏳ Set up GitHub Secret (see [QUICK_SETUP.md](QUICK_SETUP.md))
3. ⏳ Deploy your changes
4. ⏳ Verify at https://dreamweaver-10d8e.web.app/

---

**Everything is connected correctly!** 🎉

Your Firebase project, configuration files, and deployment workflows are all aligned to **dreamweaver-10d8e**.
