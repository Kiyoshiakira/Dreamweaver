# 🔧 API & Configuration

This guide covers API setup, configuration options, and technical integration details for Dreamweaver.

---

## 📋 Table of Contents

1. [API Setup](#api-setup)
2. [Configuration Reference](#configuration-reference)
3. [Development Setup](#development-setup)
4. [Customization Guide](#customization-guide)
5. [Troubleshooting](#troubleshooting)

---

## 🔑 API Setup

### Required APIs

Dreamweaver requires the following Google Cloud APIs:

| API | Purpose | Cost |
|-----|---------|------|
| **Google Gemini API** | Story generation, TTS & image generation | Usage-based |
| **Firebase** (Optional) | User management | Free tier available |

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"**
3. Enter project name (e.g., "Dreamweaver-App")
4. Click **"Create"**

### Step 2: Enable Required APIs

#### Enable Gemini API

1. Navigate to **"APIs & Services" → "Library"**
2. Search for **"Generative Language API"**
3. Click **"Enable"**

### Step 3: Generate API Key

1. Go to **"APIs & Services" → "Credentials"**
2. Click **"Create Credentials" → "API Key"**
3. Copy the generated key
4. **Recommended**: Click **"Restrict Key"** and limit to:
   - Generative Language API
   - HTTP referrers (your domain)

### Step 4: Configure Dreamweaver

Open `dreamweaver.html` and locate line 173:

```javascript
const apiKey = "";
```

Replace with your API key:

```javascript
const apiKey = "YOUR_API_KEY_HERE";
```

### Step 5: (Optional) Configure Firebase

If using Firebase for user management:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Get your config object from **Project Settings**
3. Update the placeholder in `dreamweaver.html`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
```

### Step 6: (Optional) Configure Spotify Integration

For personalized music selection with Spotify:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **"Create App"**
3. Fill in app details:
   - App name: "Dreamweaver" (or your choice)
   - App description: "AI storytelling with music"
   - Redirect URI: Your app URL (e.g., `http://localhost:8000/dreamweaver.html`)
4. Click **"Save"**
5. Copy the **Client ID** from your app settings
6. Update `dreamweaver.html` (around line 75):

```javascript
const SPOTIFY_CLIENT_ID = "YOUR_SPOTIFY_CLIENT_ID";
```

**Important Notes**:
- Spotify integration requires HTTPS in production environments
- The Spotify Web Playback SDK requires `'unsafe-eval'` in the Content Security Policy
- The HTML file includes a CSP meta tag with this directive
- If hosting on a platform with server-side CSP headers, ensure those headers also include `'unsafe-eval'` in the `script-src` directive

**Local Development**:
- Use `http://localhost:8000/dreamweaver.html` as redirect URI for testing
- Serve via local HTTP server (see Development Setup below)
- Do NOT use `file://` protocol (OAuth won't work)

---

## ⚙️ Configuration Reference

### Constants & Tunable Parameters

Located in the `<script>` section of `dreamweaver.html`:

#### API Configuration

```javascript
const apiKey = "";  // Your Google API key
const DEFAULT_ACCENT = 'American';  // Fallback accent
```

#### Music Intelligence

```javascript
const MUSIC_SELECTION_MIN_SCORE = 2;
// Minimum keyword matches required for intelligent music selection
// Higher = more conservative, Lower = more responsive
// Range: 1-5, Default: 2
```

#### Image Generation

```javascript
const IMAGE_QUEUE_DELAY_MS = 1000;
// Delay between background image generations (milliseconds)
// Prevents API rate limiting
// Range: 500-5000, Default: 1000
```

#### Performance Tuning

```javascript
state.estimatedSecondsPerSentence = 8;
// Average narration time per sentence
// Used for chapter timing calculations
// Range: 6-12, Default: 8

state.averageSentencesPerChapter = 12;
// Target sentences per chapter (~400 words)
// Affects pacing and generation frequency
// Range: 8-16, Default: 12

state.minTimeBufferRatio = 0.5;
// Fraction of chapter duration required before generating next
// Higher = more conservative, Lower = more aggressive
// Range: 0.3-0.8, Default: 0.5

state.retryDelayMs = 5000;
// Wait time before retry after failed generation
// Prevents rapid retry loops
// Range: 3000-10000, Default: 5000
```

### Voice Configuration

Add or modify voices in the `VOICES` object:

```javascript
const VOICES = {
    'Display Name - Voice (Style)': { 
        name: 'APIVoiceName',  // Exact name from Gemini API
        accent: 'AccentType'    // American, British, Australian, Indian
    }
    // Add more voices here...
};
```

**Example - Adding a New Voice**:
```javascript
'American - Nova (Warm)': { 
    name: 'Nova', 
    accent: 'American' 
}
```

### Music Library Configuration

Modify the `SCORE_LIBRARY` object:

```javascript
const SCORE_LIBRARY = {
    trackKey: { 
        name: "Display Name",        // Shown in UI
        icon: "🎵",                   // Emoji icon
        url: 'https://...mp3',       // Audio file URL
        keywords: [                   // Keywords for intelligent matching
            'keyword1', 
            'keyword2', 
            // ...
        ]
    }
};
```

**Example - Adding a New Track**:
```javascript
romantic: { 
    name: "Romantic Melody", 
    icon: "💖", 
    url: 'https://example.com/romantic.mp3',
    keywords: ['love', 'romance', 'heart', 'kiss', 'embrace', 'tender']
}
```

### Audio Configuration

```javascript
// Volume limits
const DEFAULT_VOLUME = 0.15;  // 15%
const MAX_VOLUME = 0.5;       // 50%

// Audio format
const SAMPLE_RATE = 24000;    // Hz (TTS output)
```

### Music Source Configuration

```javascript
// Spotify Configuration
const SPOTIFY_CLIENT_ID = "YOUR_CLIENT_ID";  // From Spotify Developer Dashboard

// Music source options (no configuration needed)
// - Local Files: Browser file input API
// - YouTube: YouTube IFrame API (loaded automatically)
// - Default Library: Built-in tracks (no setup required)
```

**Music Source Notes**:
- **Spotify**: Requires client ID and user OAuth authentication
- **Local Files**: Works out of the box, no configuration needed
- **YouTube**: Auto-loads IFrame API, may show ads
- **Default Library**: Always available as fallback

---

## 🛠️ Development Setup

## 🛠️ Development Setup

### Local Development

**⚠️ Important**: Always serve the application using a local HTTP server rather than opening the HTML file directly (`file://`). This is essential for:
- Cross-origin requests for SDK scripts (Spotify, YouTube)
- IFrame postMessage functionality
- OAuth redirect URIs (Spotify login)
- Modern browser security policies

#### Option 1: Python HTTP Server

```bash
cd /path/to/Dreamweaver
python -m http.server 8000
```

Then open `http://localhost:8000/dreamweaver.html`

#### Option 2: Node.js HTTP Server

```bash
cd /path/to/Dreamweaver
npx http-server -p 8000
```

Then open `http://localhost:8000/dreamweaver.html`

#### Option 3: VS Code Live Server

1. Install [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `dreamweaver.html`
3. Select **"Open with Live Server"**

### Browser Requirements

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| **Chrome** | 90+ | Recommended |
| **Firefox** | 88+ | Full support |
| **Safari** | 14+ | iOS 14+ for mobile |
| **Edge** | 90+ | Chromium-based |

**Required Features**:
- ES6+ JavaScript support
- Fetch API
- Web Audio API
- CSS Grid & Flexbox

### Development Tools

**Recommended Extensions**:
- **VS Code**: Prettier, ESLint, Live Server
- **Chrome DevTools**: Network tab for API debugging
- **Postman**: For testing API calls independently

**Debugging Tips**:
```javascript
// Enable verbose logging
console.log('Chapter generation started:', state);

// Monitor API calls in Network tab
// Filter by "generativelanguage.googleapis.com"

// Inspect state at any time
console.table(state);
console.log('Image Cache:', state.imageCache);
console.log('Audio Buffer:', state.audioBuffer);
```

---

## 🎨 Customization Guide

### Changing Visual Theme

#### Update Color Scheme

Modify CSS variables in `<style>` section:

```css
:root {
    --bg-deep: #020617;      /* Main background */
    --accent: #6366f1;        /* Primary accent color */
    --text-main: #e2e8f0;    /* Main text color */
}
```

**Example - Dark Purple Theme**:
```css
:root {
    --bg-deep: #1a0b2e;
    --accent: #9d4edd;
    --text-main: #e0aaff;
}
```

#### Update Fonts

Replace Google Fonts import (line 8):

```html
<link href="https://fonts.googleapis.com/css2?family=YourFont&display=swap" rel="stylesheet">
```

Update font families:
```css
body { font-family: 'YourSansFont', sans-serif; }
.novel-font { font-family: 'YourSerifFont', serif; }
```

### Adding Session Duration Options

Modify the duration select (lines 80-85):

```html
<select id="length-select">
    <option value="5">5 Minutes</option>
    <option value="10">10 Minutes</option>  <!-- NEW -->
    <option value="30">30 Minutes</option>
    <option value="45">45 Minutes</option>  <!-- NEW -->
    <option value="60">1 Hour</option>
    <option value="90">1.5 Hours</option>   <!-- NEW -->
    <option value="120">2 Hours</option>
</select>
```

### Adding Genre Options

Add to genre select (lines 90-96):

```html
<select id="genre-select">
    <option value="Fantasy">Fantasy</option>
    <option value="Sci-Fi">Sci-Fi</option>
    <option value="Mystery">Mystery</option>
    <option value="Horror">Horror</option>
    <option value="Drama">Historical Drama</option>
    <option value="Romance">Romance</option>  <!-- NEW -->
    <option value="Thriller">Thriller</option> <!-- NEW -->
</select>
```

### Modifying Story Generation

#### Change Chapter Length

```javascript
// In generateNextChapter() system prompt (line 267)
const sys = `You are a professional novelist writing a ${state.genre} story. 
Output JSON: { "title": "Chapter Title", "prose": "About 600 words of story", ... }`;
// Change "About 400 words" to "About 600 words"

// Update state average
state.averageSentencesPerChapter = 18;  // Increase from 12
```

#### Customize AI Instructions

Modify the system prompt in `generateNextChapter()`:

```javascript
const sys = `You are a professional novelist writing a ${state.genre} story.
The session has ${Math.ceil(state.timeLeftSeconds / 60)} minutes remaining.

ADDITIONAL INSTRUCTIONS:
- Use vivid sensory details
- Create compelling dialogue
- Build suspense gradually
- End chapters on cliffhangers

Output JSON: { "title": "Chapter Title", "prose": "About 400 words of story", ...}`;
```

### Customizing Image Generation

#### Change Image Style

Modify prompt in `generateAndCacheImage()` (line 650):

```javascript
// Original
prompt: `Cinematic professional fantasy art, atmospheric, ${state.genre} style: ${promptText}`

// Anime style
prompt: `Anime illustration, vibrant colors, ${state.genre} theme: ${promptText}`

// Photorealistic
prompt: `Photorealistic, 4K quality, ${state.genre} setting: ${promptText}`

// Oil painting
prompt: `Oil painting, impressionist style, ${state.genre} scene: ${promptText}`
```

#### Adjust Image Frequency

```javascript
// In playCycle() (line 369)
if (sentencesIntoChapter % 4 === 0) {  // Every 4 sentences
    // Display image
}

// Change to every 6 sentences for fewer images
if (sentencesIntoChapter % 6 === 0) {
    // Display image
}
```

### Customizing Music Selection

#### Adjust Keyword Sensitivity

```javascript
// More conservative (require 3 matches)
const MUSIC_SELECTION_MIN_SCORE = 3;

// More responsive (require 1 match)
const MUSIC_SELECTION_MIN_SCORE = 1;
```

#### Add More Keywords

```javascript
const SCORE_LIBRARY = {
    epic: {
        // ... existing config ...
        keywords: [
            'battle', 'war', 'hero', 'quest',
            'champion', 'victory', 'courage',  // NEW
            'legend', 'valor', 'fortress'      // NEW
        ]
    }
};
```

---

## 🐛 Troubleshooting

### Common Issues

#### "Invalid API key" Error

**Symptoms**: Story doesn't generate, console shows 403 error

**Solutions**:
1. Verify API key is correct (no extra spaces)
2. Check API is enabled in Google Cloud Console
3. Check API key restrictions don't block your domain

#### No Audio Playback

**Symptoms**: Timer counts down, but no sound

**Solutions**:
1. Check browser allows autoplay (may require user interaction first)
2. Verify volume isn't muted (both app and system)
3. Check Network tab for TTS API failures
4. Try different browser (Chrome recommended)

#### Images Not Loading

**Symptoms**: Loading spinner persists, no images appear

**Solutions**:
1. Verify Generative Language API is enabled
2. Check console for API errors
3. Check API key has proper permissions
4. Test with longer initial wait time
5. Check internet connection speed

#### Music Doesn't Change

**Symptoms**: Same track plays entire session

**Solutions**:
1. Verify `MUSIC_SELECTION_MIN_SCORE` isn't too high
2. Check if story contains relevant keywords
3. Use more descriptive prompts with mood words
4. Lower score sensitivity threshold

#### Slow Performance

**Symptoms**: Lag between sentences, delayed images

**Solutions**:
1. Close other browser tabs
2. Reduce image generation frequency (every 6 sentences instead of 4)
3. Increase `IMAGE_QUEUE_DELAY_MS` to 2000
4. Use faster internet connection
5. Disable image generation temporarily (comment out calls)

#### Spotify Connection Issues

**Symptoms**: "Connect Spotify" button doesn't work or authentication fails

**Solutions**:
1. Verify `SPOTIFY_CLIENT_ID` is correctly set in code
2. Check redirect URI matches in Spotify Developer Dashboard
3. Use HTTP server (not `file://` protocol)
4. Enable HTTPS for production deployments
5. Check browser console for authentication errors
6. Try logging out and back in
7. Verify Spotify account is active

#### Local Files Not Playing

**Symptoms**: Uploaded files don't play or no sound

**Solutions**:
1. Check file format is supported (MP3, OGG, WAV recommended)
2. Verify files aren't corrupted (try playing in media player)
3. Check browser console for file loading errors
4. Ensure volume slider isn't at zero
5. Try different browser (Chrome recommended)

#### YouTube Playback Issues

**Symptoms**: Video won't load or audio doesn't play

**Solutions**:
1. Verify URL format is correct (full URL or video ID)
2. Check video isn't region-restricted or private
3. Allow ads to complete if shown
4. Click play button after loading (autoplay may be blocked)
5. Try different video (some videos restrict embedding)
6. Check browser console for IFrame API errors

### Debug Mode

Add console logging to troubleshoot:

```javascript
// At start of initiateSession()
console.log('=== SESSION START ===');
console.log('Voice:', state.voice);
console.log('Accent:', state.accent);
console.log('Genre:', state.genre);
console.log('Duration:', state.timeLeftSeconds);

// In generateNextChapter()
console.log('Generating chapter...');
console.log('Response:', result);

// In playCycle()
console.log('Playing sentence:', state.currentIndex);
console.log('Audio buffer size:', state.audioBuffer.size);
console.log('Image cache size:', state.imageCache.size);
```

### API Rate Limits

Google APIs have usage quotas. If you hit limits:

**Gemini API**:
- Limit: Varies by region and account
- Solution: Increase `state.retryDelayMs`, reduce chapter frequency

**Gemini Image API**:
- Limit: ~10-20 images/minute (typical)
- Solution: Increase `IMAGE_QUEUE_DELAY_MS` to 3000-5000

### Browser Console Errors

#### "Quota exceeded" Error
- **Cause**: API rate limit hit
- **Fix**: Wait a few minutes, reduce generation frequency

#### "CORS" Error
- **Cause**: Loading from file:// instead of http://
- **Fix**: Use local web server (see Development Setup)

#### "Failed to fetch" Error
- **Cause**: Network issue or API endpoint down
- **Fix**: Check internet connection, verify API endpoints are correct

---

## 📊 Performance Benchmarks

### Typical API Latencies

| Operation | Average Time | Notes |
|-----------|-------------|-------|
| Story Generation | 3-5 seconds | Per chapter (~400 words) |
| TTS Generation | 2-3 seconds | Per sentence |
| Image Generation | 5-8 seconds | Per image |
| Music Loading | 1-2 seconds | Per track (first load) |

### Optimization Recommendations

**For Best Performance**:
1. Use Google Chrome (fastest Fetch API)
2. Stable connection (5+ Mbps recommended)
3. Enable browser caching
4. Close background apps consuming bandwidth
5. Use desktop for best experience

**For Reduced API Costs**:
1. Increase `IMAGE_QUEUE_DELAY_MS` to reduce image generation
2. Use shorter session durations for testing
3. Disable images for audio-only experience
4. Cache story content for repeated playthroughs

---

## 🔒 Security Best Practices

### API Key Protection

**Never commit API keys to public repositories!**

**Recommended Approach**:
1. Store API key in environment variable or config file
2. Add config file to `.gitignore`
3. Use Firebase Cloud Functions for server-side API calls
4. Restrict API key by domain/IP in Google Cloud Console

**Example - Environment Variable Pattern**:
```javascript
// Config file (not committed)
const CONFIG = {
    apiKey: process.env.GEMINI_API_KEY
};

// Main file
const apiKey = CONFIG.apiKey;
```

### Input Sanitization

Current implementation includes:
- Regex special character escaping in keyword matching
- API response validation before accessing nested properties

**Future Enhancements**:
- Prompt length limits
- Profanity filtering
- Content moderation via API

---

## 📚 Additional Resources

### Official Documentation
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

### Community Resources
- [GitHub Repository](https://github.com/Kiyoshiakira/Dreamweaver)
- [GitHub Issues](https://github.com/Kiyoshiakira/Dreamweaver/issues)
- [GitHub Discussions](https://github.com/Kiyoshiakira/Dreamweaver/discussions)

---

**For more information, see**: [Architecture](Architecture.md) | [Features](Features.md) | [User Guide](User-Guide.md)
