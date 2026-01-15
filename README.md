# 🌙 Dreamweaver

**An AI-powered interactive storytelling experience that generates, narrates, and visualizes stories in real-time.**

Dreamweaver transforms your story ideas into immersive audiovisual experiences. Simply describe what you want to hear, and let AI weave a tale complete with professional narration, dynamic visuals, and adaptive background music—perfect for relaxation, sleep, or creative inspiration.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Overview

Dreamweaver is a single-page web application that combines multiple AI technologies to create a unique storytelling experience:

- 🤖 **AI Story Generation**: Powered by Google's Gemini 3 Flash Preview for dynamic narrative creation
- 🎙️ **Text-to-Speech Narration**: Multiple voice options with accent support
- 🎨 **AI Image Generation**: Gemini 2.5 Flash Image creates cinematic visuals synchronized with the story
- 🎵 **Adaptive Music**: Intelligent score selection based on story content analysis
- ⏱️ **Session Management**: Configurable story duration with countdown timer
- 📖 **Interactive Reading**: Real-time word highlighting and visual sentence tracking

---

## 🎯 Key Features

### 🖼️ Intelligent Image Generation
- **Pre-generation**: Images are generated before chapters are read, ensuring smooth visual transitions
- **Smart Timing**: Images are timed to match sentence and paragraph flow every 4 sentences
- **Background Processing**: Chapter images are queued and generated in the background while reading continues
- **Caching System**: Generated images are cached for instant display without interrupting narration
- **Key Visual Moments**: AI identifies important scenes and generates targeted visuals

### 🎵 Intelligent Music Selection
- **Content Analysis**: AI scans story prose content for keywords and themes
- **Keyword Matching**: Each music track has associated keywords (e.g., 'battle', 'mystery', 'horror')
- **Smart Scoring**: Music selection compares keyword frequencies across all tracks
- **Best Fit Selection**: System automatically selects music that best matches the story's current mood
- **Fallback System**: Uses AI-suggested genre if content analysis is inconclusive
- **Dynamic Transitions**: Music adapts as the story evolves

### 📚 Seamless Reading Experience
- **Continuous Narration**: No interruptions during playback
- **Pre-buffered Audio**: Next sentences are preloaded for seamless transitions
- **Background Generation**: Next chapters generate while current chapter plays
- **Smart Pacing**: Automatic chapter generation based on remaining time
- **Visual Feedback**: Word-by-word highlighting synchronized with audio
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 🎭 Customization Options
- **8 Voice Personas**: Choose from American, British, Australian, and Indian accents
- **5 Genres**: Fantasy, Sci-Fi, Mystery, Horror, and Historical Drama
- **Session Duration**: 5 minutes to 2 hours of continuous storytelling
- **Score Dynamics**: Adjustable music sensitivity (static to fluid)
- **Volume Control**: Independent music volume adjustment
- **🎵 Multiple Music Sources**:
  - **Spotify Integration**: Connect your Spotify account for personalized music selection
    - Log in with your Spotify account to access millions of tracks
    - AI intelligently selects tracks based on story mood and genre
    - Change songs on-the-fly while maintaining the same mood/genre
    - Seamlessly fallback to default music library when not logged in
  - **Local Files**: Upload your own audio files (MP3, OGG, etc.)
    - Select multiple audio files from your device
    - Files play in sequence with automatic progression
    - **Note**: Local files are not persisted across browser sessions
    - Supports Web Audio API for enhanced volume control and crossfade
  - **YouTube**: Play audio from YouTube videos
    - Paste a YouTube URL or video ID
    - Background audio playback via YouTube IFrame API
    - **Note**: YouTube may show ads; requires user gesture for autoplay

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Google Gemini API key (for story generation and TTS)
- Firebase configuration (optional, for secure API proxy and user management)
- Spotify Developer account (optional, for Spotify integration)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Kiyoshiakira/Dreamweaver.git
   cd Dreamweaver
   ```

2. **Configure API Keys** (⚠️ IMPORTANT - Security First!):
   
   **⚠️ SECURITY WARNING**: Never commit API keys to version control!
   
   **Option A: Firebase Proxy Setup (Recommended for ALL deployments)**
   
   This method keeps your API key secure on the server side:
   
   1. Follow the [Firebase Proxy Setup Guide](server/README.md)
   2. Configure Firebase Cloud Functions with your API key:
      ```bash
      firebase functions:config:set genai.key="YOUR_GOOGLE_GEMINI_API_KEY"
      ```
   3. Update Firebase config in `public/index.html` (lines 226-248):
      ```javascript
      const __firebase_config = JSON.stringify({
          apiKey: "YOUR_FIREBASE_API_KEY",
          authDomain: "your-project.firebaseapp.com",
          projectId: "your-project-id",
          // ... other Firebase config
      });
      const __recaptcha_site_key = "YOUR_RECAPTCHA_V3_SITE_KEY";
      ```
   
   **IMPORTANT**: Firebase Cloud Functions setup is REQUIRED. The application does not support direct API calls for security reasons.
   
   All API calls (story generation, text-to-speech, image generation) are routed through secure Firebase Cloud Functions.

3. **Set up Spotify Integration (Optional)**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add your app's redirect URI (e.g., `http://localhost:8000/public/index.html`)
   - Copy the Client ID and update line 96 in `public/index.html`:
     ```javascript
     const SPOTIFY_CLIENT_ID = "YOUR_SPOTIFY_CLIENT_ID";
     ```
   - Note: Spotify integration requires HTTPS in production environments
   - **Important**: The Spotify Web Playback SDK requires `'unsafe-eval'` in the Content Security Policy. The HTML file includes a CSP meta tag with this directive. If you're hosting on a platform that sets server-side CSP headers, ensure those headers also include `'unsafe-eval'` in the `script-src` directive.

4. **Run the Application**:
   **⚠️ Important**: Always serve the application using a local HTTP server rather than opening the HTML file directly (`file://`). This prevents issues with:
   - Cross-origin requests for SDK scripts (Spotify, YouTube)
   - IFrame postMessage restrictions
   - OAuth redirect URIs
   - Modern browser security policies
   
   Serve using one of these methods:
   ```bash
   # Using Python
   cd public
   python -m http.server 8000
   
   # Using Node.js
   cd public
   npx http-server -p 8000
   ```

5. **Access the App**:
   Navigate to `http://localhost:8000/index.html` in your web browser

---

## 📖 Usage

### Starting a Story Session

1. **Select Your Narrator**: Choose from 8 different voice personas with varied accents
2. **Set Session Duration**: Pick how long you want the story to continue (5 min - 2 hours)
3. **Choose a Genre**: Select Fantasy, Sci-Fi, Mystery, Horror, or Historical Drama
4. **Adjust Score Dynamics**: Control how dynamically the music changes (1-5 scale)
5. **Select Music Source**:
   - **Spotify**: Click "Connect Spotify" to link your account for personalized music (optional)
   - **Local Files**: Click on the file input to select audio files from your device
   - **YouTube**: Paste a YouTube URL or video ID and click "Load"
6. **Enter Your Prompt**: Describe the story you want to hear in the text area
7. **Click "Begin Story"**: Sit back and enjoy your personalized narrative experience

### During Playback

- **Play/Pause**: Use the large circular button at the bottom center to control both narration and music playback
- **Change Song**: Click the "Change Song" button in the music panel to switch to a different track (Spotify mode only)
- **Volume Control**: Adjust music volume with the slider in the right panel
- **Switch Music Source**: Change between Spotify, Local Files, and YouTube at any time using the dropdown selector
- **Visual Sync**: Watch as images change every 4 sentences
- **Word Tracking**: Follow along with real-time word highlighting
- **Timer**: Monitor remaining session time in the top-right corner

### Example Prompts

- *"A young wizard discovers a hidden library in an enchanted forest"*
- *"A detective investigating mysterious disappearances in a cyberpunk city"*
- *"A spaceship crew encounters an ancient alien artifact"*
- *"A haunted mansion with secrets dating back centuries"*
- *"A medieval knight on a quest to recover a legendary sword"*

---

## 🏗️ Technology Stack

- **Frontend**: HTML5, JavaScript (ES6+), Tailwind CSS
- **AI Models**: 
  - Google Gemini 3 Flash Preview (story generation)
  - Google Gemini 2.5 Flash Preview TTS (text-to-speech)
  - Google Gemini 2.5 Flash Image (image generation)
- **Music Integration**:
  - Spotify Web API (personalized music selection)
  - Spotify Web Playback SDK
  - OAuth 2.0 with PKCE for secure authentication
- **Fonts**: Crimson Pro (novel text), Inter (UI)
- **Audio**: Web Audio API, HTML5 Audio
- **Backend & Security**:
  - Firebase Cloud Functions (secure API proxy)
  - Firebase App Check (request verification with reCAPTCHA v3)
  - Firebase Auth & Firestore (optional, for user management)

---

## 🎨 Architecture Highlights

### Story Generation Pipeline
1. User submits prompt → AI generates first chapter (~400 words)
2. Chapter is split into sentences for TTS processing
3. First 3 sentences pre-buffered for immediate playback
4. When halfway through current chapter, next chapter generates in background
5. Images pre-generated for key visual moments before narration

### Image Caching Strategy
- First image generated and displayed immediately
- Remaining chapter images queued for background generation
- 1-second delay between image generations to prevent API overload
- Images cached by sentence index for instant retrieval
- Fallback to on-the-fly generation if cache miss occurs

### Music Intelligence System
1. AI suggests initial music type based on genre
2. System analyzes prose for keywords (battle, mystery, fear, etc.)
3. Each track scored based on keyword frequency matches
4. Highest-scoring track selected if confidence threshold met (≥2 matches)
5. Music transitions smoothly between moods as story evolves
6. **Spotify Integration**: When logged in, searches Spotify for tracks matching the detected mood
7. **Change Song Feature**: Users can request a different song while maintaining the same genre/mood

### Secure API Proxy (Required)
- **Firebase Cloud Functions** proxy for Generative Language API
- **App Check verification** prevents unauthorized access using reCAPTCHA v3
- **Server-side API key** storage keeps credentials secure
- **No direct API calls** - all requests go through secure proxies
- **Rate limiting** recommendations for production deployment
- See [server/README.md](server/README.md) for setup instructions

---

## 📊 Performance Considerations

- **TTS Speed**: ~8 seconds per sentence average
- **Chapter Length**: ~12 sentences (~400 words) for optimal pacing
- **Buffer Strategy**: Pre-generates next chapter at 50% completion point
- **Image Queue**: Processes background images with 1-second intervals
- **Audio Preload**: Buffers next 2 sentences ahead of playback
- **Minimum Session Buffer**: Requires 50% of chapter duration remaining before generating new content

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Guidelines
- Maintain single-file architecture for simplicity
- Test across multiple browsers before submitting PRs
- Document any new configuration options
- Follow existing code style and conventions

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Google Generative AI for Gemini APIs
- Spotify for music streaming and Web API integration
- Firebase for backend infrastructure
- Tailwind CSS for styling framework
- SoundHelix for demo music tracks

---

## 📚 Additional Resources

For more detailed documentation, please visit the [Wiki](../../wiki):
- [Architecture Deep Dive](../../wiki/Architecture)
- [Feature Details](../../wiki/Features)
- [API & Configuration](../../wiki/API-and-Configuration)
- [User Guide](../../wiki/User-Guide)

---

## 🐛 Known Issues

- Requires valid API keys to function
- Image generation may be slow on slower connections
- Some voices may not support all accents perfectly
- Default music library is limited to 6 tracks (Spotify integration provides access to millions of songs)
- Spotify integration requires a free or premium Spotify account
- Some Spotify tracks may not have preview URLs available for playback
- **Content Security Policy**: The Spotify Web Playback SDK requires `'unsafe-eval'` in CSP. If deploying to a hosting platform, ensure server-side CSP headers include this directive to prevent blocking the SDK.

---

## 🔧 Debug & Testing Area

Dreamweaver includes a comprehensive debug and testing area for developers and testers:

- **AI Function Testing**: Test story generation, TTS, and image generation individually
- **Request Inspector**: Monitor API calls with detailed timing and response data
- **Debug Console**: Real-time logging with verbose mode and error tracking
- **Configuration Validator**: Verify Firebase and API key setup

**Access:** Navigate to `debug.html` or add `?debug=true` to the main URL to reveal the debug link.

See [DEBUG.md](DEBUG.md) for complete documentation and setup instructions.

---

## 🗺️ Roadmap

- [x] Spotify integration for personalized music selection
- [x] Change song feature to switch tracks while maintaining mood
- [x] Local file upload for custom audio tracks
- [x] YouTube integration for video audio playback
- [x] Debug & testing area for developers and testers
- [ ] Expand default music library with more genre-specific tracks
- [ ] Full Spotify Web Playback SDK integration for complete track playback
- [ ] Add user story saving/loading functionality
- [ ] Implement story branching and user choices
- [ ] Support for custom voice training
- [ ] Mobile app versions (iOS/Android)
- [ ] Collaborative story creation features

---

**Made with ❤️ for dreamers and story lovers everywhere**
