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

- 🤖 **AI Story Generation**: Powered by Google's Gemini 3 Flash for dynamic narrative creation
- 🎙️ **Text-to-Speech Narration**: Multiple voice options with accent support
- 🎨 **AI Image Generation**: Imagen 4.0 creates cinematic visuals synchronized with the story
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
- **🎵 Spotify Integration**: Connect your Spotify account for personalized music selection
  - Log in with your Spotify account to access millions of tracks
  - AI intelligently selects tracks based on story mood and genre
  - Change songs on-the-fly while maintaining the same mood/genre
  - Seamlessly fallback to default music library when not logged in

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Google Gemini API key (for story generation and TTS)
- Firebase configuration (optional, for user management)
- Spotify Developer account (optional, for Spotify integration)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Kiyoshiakira/Dreamweaver.git
   cd Dreamweaver
   ```

2. **Configure API Keys**:
   Open `dreamweaver.html` and update the following:
   ```javascript
   const apiKey = "YOUR_GOOGLE_GEMINI_API_KEY";
   const firebaseConfig = JSON.parse(__firebase_config);
   const SPOTIFY_CLIENT_ID = "YOUR_SPOTIFY_CLIENT_ID"; // Optional
   ```

3. **Set up Spotify Integration (Optional)**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add your app's redirect URI (e.g., `http://localhost:8000/dreamweaver.html`)
   - Copy the Client ID and paste it into `SPOTIFY_CLIENT_ID` in `dreamweaver.html`
   - Note: Spotify integration requires HTTPS in production environments
   - **Important**: The Spotify Web Playback SDK requires `'unsafe-eval'` in the Content Security Policy. The HTML file includes a CSP meta tag with this directive. If you're hosting on a platform that sets server-side CSP headers, ensure those headers also include `'unsafe-eval'` in the `script-src` directive.

4. **Run the Application**:
   Simply open `dreamweaver.html` in your web browser, or serve it using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

5. **Access the App**:
   Navigate to `http://localhost:8000` (or open the HTML file directly)

---

## 📖 Usage

### Starting a Story Session

1. **Select Your Narrator**: Choose from 8 different voice personas with varied accents
2. **Set Session Duration**: Pick how long you want the story to continue (5 min - 2 hours)
3. **Choose a Genre**: Select Fantasy, Sci-Fi, Mystery, Horror, or Historical Drama
4. **Adjust Score Dynamics**: Control how dynamically the music changes (1-5 scale)
5. **Connect Spotify (Optional)**: Click "Connect Spotify" to link your account for personalized music
6. **Enter Your Prompt**: Describe the story you want to hear in the text area
7. **Click "Begin Story"**: Sit back and enjoy your personalized narrative experience

### During Playback

- **Play/Pause**: Use the large circular button at the bottom center
- **Change Song**: Click the "Change Song" button in the music panel to switch to a different track while keeping the same mood/genre
- **Volume Control**: Adjust music volume with the slider in the right panel
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
  - Google Gemini 3 Flash (story generation & TTS)
  - Google Imagen 4.0 (image generation)
- **Music Integration**:
  - Spotify Web API (personalized music selection)
  - Spotify Web Playback SDK
  - OAuth 2.0 with PKCE for secure authentication
- **Fonts**: Crimson Pro (novel text), Inter (UI)
- **Audio**: Web Audio API, HTML5 Audio
- **Backend**: Firebase (optional, for user management)

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

- Google Generative AI for Gemini and Imagen APIs
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

## 🗺️ Roadmap

- [x] Spotify integration for personalized music selection
- [x] Change song feature to switch tracks while maintaining mood
- [ ] Expand default music library with more genre-specific tracks
- [ ] Full Spotify Web Playback SDK integration for complete track playback
- [ ] Add user story saving/loading functionality
- [ ] Implement story branching and user choices
- [ ] Support for custom voice training
- [ ] Mobile app versions (iOS/Android)
- [ ] Collaborative story creation features

---

**Made with ❤️ for dreamers and story lovers everywhere**
