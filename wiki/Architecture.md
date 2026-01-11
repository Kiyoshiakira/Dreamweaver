# 🏗️ Architecture

This page provides a deep dive into Dreamweaver's technical architecture, design patterns, and implementation details.

---

## 📐 System Overview

Dreamweaver is built as a **single-page application (SPA)** using vanilla JavaScript, HTML5, and Tailwind CSS. The architecture emphasizes:

- **Simplicity**: Single HTML file for easy deployment
- **Performance**: Asynchronous operations and smart caching
- **Responsiveness**: Event-driven architecture with state management
- **Scalability**: Modular design patterns despite single-file structure

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (HTML + Tailwind CSS + Interactive Controls)               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application State                         │
│  (Global state object managing playback, audio, images)     │
└───┬───────────┬───────────┬──────────┬────────────┬─────────┘
    │           │           │          │            │
    ▼           ▼           ▼          ▼            ▼
┌────────┐ ┌─────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│ Story  │ │  Audio  │ │ Image  │ │ Music  │ │  Timer   │
│ Engine │ │ Manager │ │ Engine │ │ Engine │ │ Manager  │
└───┬────┘ └────┬────┘ └───┬────┘ └───┬────┘ └────┬─────┘
    │           │           │          │           │
    └───────────┴───────────┴──────────┴───────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    External APIs                             │
│  • Google Gemini 3 Flash Preview (Story)                    │
│  • Google Gemini 2.5 Flash Preview TTS (TTS)                │
│  • Google Gemini 2.5 Flash Image (Images)                   │
│  • Firebase (Optional User Management)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Core Components

### 1. State Management

The global `state` object manages all application data:

```javascript
const state = {
    // Playback Control
    isPlaying: false,
    currentIndex: 0,
    
    // Content
    sentences: [],
    history: [],
    
    // Configuration
    voice: 'Kore',
    accent: 'American',
    genre: '',
    timeLeftSeconds: 0,
    
    // Caching & Buffers
    audioBuffer: new Map(),
    imageCache: new Map(),
    imageQueue: [],
    
    // Generation Flags
    isGeneratingChapter: false,
    isGeneratingVisual: false,
    isProcessingImageQueue: false,
    nextChapterTriggered: false,
    
    // Timing & Pacing
    estimatedSecondsPerSentence: 8,
    averageSentencesPerChapter: 12,
    minTimeBufferRatio: 0.5,
    retryDelayMs: 5000,
    
    // Music Intelligence
    currentMood: null,
    lastProseContent: ''
};
```

**Design Rationale**:
- Centralized state prevents prop drilling and simplifies debugging
- Map structures for efficient O(1) cache lookups
- Boolean flags prevent race conditions in async operations
- Timing constants enable tunable performance

### 2. Story Generation Pipeline

**Flow Diagram**:
```
User Prompt
    │
    ▼
┌─────────────────────────┐
│ generateNextChapter()   │ ─────┐
└──────────┬──────────────┘      │
           │                      │
           ▼                      │ Background
  Gemini API Request              │ Generation
           │                      │ (2nd+ chapters)
           ▼                      │
  JSON Response Parsing    ───────┘
           │
           ├─────────────────┬──────────────┬─────────────┐
           ▼                 ▼              ▼             ▼
    Story Content      Title Update    Music Selection  Image Queue
           │                                              
           ▼                                              
    Split Sentences                                      
           │                                              
           ▼                                              
    Append to State                                      
```

**Key Features**:

1. **Parallel First Chapter Load**:
   ```javascript
   // Pre-buffer first 3 sentences for instant playback
   const preloadPromises = [];
   for (let i = 0; i < Math.min(3, state.sentences.length); i++) {
       preloadPromises.push(preloadAudio(i));
   }
   await Promise.all(preloadPromises);
   ```

2. **Background Chapter Generation**:
   - Triggers at 50% chapter completion
   - Uses `nextChapterTriggered` flag to prevent duplicates
   - Non-blocking async call allows continued reading

3. **Smart Chapter Timing**:
   ```javascript
   function shouldGenerateNextChapter() {
       if (state.isGeneratingChapter) return false;
       if (state.timeLeftSeconds <= 0) return false;
       
       const estimatedDuration = 
           state.averageSentencesPerChapter * 
           state.estimatedSecondsPerSentence;
       
       return state.timeLeftSeconds >= 
           (estimatedDuration * state.minTimeBufferRatio);
   }
   ```

### 3. Audio Management

**TTS Processing**:
```javascript
async function fetchTTS(text) {
    // Add accent instruction
    const accentPrompt = state.accent !== DEFAULT_ACCENT 
        ? ` Speak with a ${state.accent} accent.` 
        : '';
    const fullText = text + accentPrompt;
    
    // Call Gemini Audio API
    const res = await fetch(/* Gemini API endpoint */, {
        generationConfig: { 
            responseModalities: ["AUDIO"], 
            speechConfig: { 
                voiceConfig: { 
                    prebuiltVoiceConfig: { 
                        voiceName: state.voice 
                    } 
                } 
            } 
        }
    });
    
    // Convert base64 to WAV
    const data = await res.json();
    return base64ToWav(
        data.candidates[0].content.parts[0].inlineData.data, 
        24000
    );
}
```

**Audio Buffer Strategy**:
- Uses `Map<index, Blob>` for O(1) retrieval
- Pre-buffers next 2 sentences during playback
- Releases blob URLs after playback to prevent memory leaks
- Handles playback events (ended, loadedmetadata) for seamless transitions

### 4. Image Generation Engine

**Architecture**:
```
Chapter Data
    │
    ▼
Key Visual Moments Identified (AI)
    │
    ├─────────────────┬──────────────┬─────────────┐
    │                 │              │             │
    ▼                 ▼              ▼             ▼
Image 0          Image 1       Image 2        Image 3
(Generate Now)   (Queue)       (Queue)        (Queue)
    │                 │              │             │
    └─────────────────┴──────────────┴─────────────┘
                      │
                      ▼
            Background Queue Processor
                      │
                      ▼
               imageCache Map
                      │
                      ▼
            Display on 4-sentence intervals
```

**Pre-Generation Strategy**:

1. **Immediate First Image**:
   ```javascript
   await generateAndCacheImage(startIdx, visualMoments[0]);
   if (state.imageCache.has(startIdx)) {
       displayCachedImage(startIdx);
   }
   ```

2. **Background Queue Processing**:
   ```javascript
   async function processImageQueue() {
       if (state.isProcessingImageQueue) return; // Prevent concurrent processing
       state.isProcessingImageQueue = true;
       
       while (state.imageQueue.length > 0) {
           const { index, prompt } = state.imageQueue.shift();
           await generateAndCacheImage(index, prompt);
           
           // Delay to avoid API overload
           await new Promise(resolve => 
               setTimeout(resolve, IMAGE_QUEUE_DELAY_MS)
           );
       }
       
       state.isProcessingImageQueue = false;
   }
   ```

3. **Cache-First Display**:
   ```javascript
   if (sentencesIntoChapter % 4 === 0) {
       if (state.imageCache.has(state.currentIndex)) {
           displayCachedImage(state.currentIndex); // Instant
       } else {
           updateVisual(state.currentIndex); // Fallback
       }
   }
   ```

**Benefits**:
- Zero narration interruption
- Smooth visual transitions
- API rate limiting compliance
- Graceful fallback on cache misses

### 5. Music Intelligence System

**Keyword-Based Scoring Algorithm**:

```javascript
async function applyIntelligentScore(proseText, suggestedType) {
    const lowerText = proseText.toLowerCase();
    const scores = {};
    
    // Score each music track
    for (const [key, track] of Object.entries(SCORE_LIBRARY)) {
        let score = 0;
        
        for (const keyword of track.keywords) {
            // Escape regex special chars for safety
            const escapedKeyword = keyword.replace(
                /[.*+?^${}()|[\]\\]/g, 
                '\\$&'
            );
            
            // Match word boundaries for accuracy
            const regex = new RegExp(
                `\\b${escapedKeyword}\\w*\\b`, 
                'gi'
            );
            
            const matches = lowerText.match(regex);
            score += matches ? matches.length : 0;
        }
        
        scores[key] = score;
    }
    
    // Select best match
    let bestMatch = suggestedType;
    let highestScore = scores[suggestedType] || 0;
    
    for (const [key, score] of Object.entries(scores)) {
        if (score > highestScore) {
            highestScore = score;
            bestMatch = key;
        }
    }
    
    // Apply if confident (≥2 matches) or first chapter
    if (highestScore >= MUSIC_SELECTION_MIN_SCORE || 
        state.currentMood === null) {
        state.currentMood = bestMatch;
        applyScore(bestMatch);
    } else {
        // Fallback to AI suggestion
        applyScore(suggestedType);
    }
}
```

**Music Library Structure**:
```javascript
const SCORE_LIBRARY = {
    epic: { 
        name: "High Adventure", 
        icon: "⚔️", 
        url: 'https://...mp3',
        keywords: [
            'battle', 'war', 'hero', 'quest', 
            'adventure', 'fight', 'warrior', 
            'epic', 'glory', 'triumph'
        ]
    },
    // ... more tracks
};
```

---

## 🔄 Data Flow

### Story Initialization Flow

```
User clicks "Begin Story"
    │
    ▼
initiateSession()
    ├─ Extract form values (voice, duration, genre, prompt)
    ├─ Update global state
    ├─ Switch to reader view
    ├─ Start timer countdown
    │
    ▼
generateNextChapter(prompt)
    ├─ Set isGeneratingChapter = true
    ├─ Call Gemini API
    ├─ Parse JSON response
    ├─ Update history
    ├─ Append chapter to DOM
    ├─ Trigger music selection
    ├─ Pre-generate images
    └─ Set isGeneratingChapter = false
    │
    ▼
Preload first 3 sentences (parallel)
    │
    ▼
togglePlayback() → Start narration
```

### Playback Cycle Flow

```
playCycle()
    │
    ├─ Check if should continue
    ├─ Calculate chapter progress
    │
    ├─ If 50% through chapter
    │   └─ Trigger background generateNextChapter()
    │
    ├─ If at 4-sentence interval
    │   └─ Display cached image OR generate on-the-fly
    │
    ├─ Get audio blob (cached or fetch)
    ├─ Preload next 2 sentences
    │
    ▼
Load and play audio
    ├─ Highlight current sentence
    ├─ Animate words in real-time
    │
    └─ On audio ended
        ├─ Increment currentIndex
        └─ Recursive call to playCycle()
```

---

## 🎨 UI Architecture

### Component Structure

```html
<div id="app">
    <nav>
        <!-- Header with logo and timer -->
    </nav>
    
    <!-- Setup Screen -->
    <main id="view-home">
        <select id="voice-select">
        <select id="length-select">
        <select id="genre-select">
        <input id="score-sensitivity">
        <textarea id="prompt-input">
        <button onclick="initiateSession()">
    </main>
    
    <!-- Reader Screen -->
    <main id="view-reader">
        <!-- Left: Story text -->
        <div id="reader-content">
            <span id="s-0" class="sentence-span">
                <span id="s-0-w-0" class="word-token">Word</span>
                ...
            </span>
        </div>
        
        <!-- Right: Image & music controls -->
        <div class="image-container">
            <img id="scene-image">
            <div id="img-overlay">Loading...</div>
        </div>
        <input id="music-vol" type="range">
    </main>
    
    <!-- Control Panel (fixed bottom) -->
    <div id="control-panel">
        <button onclick="togglePlayback()">
        <div id="current-word">Live word</div>
    </div>
</div>
```

### CSS Architecture

**Design System**:
- Custom CSS variables for theming
- Tailwind utility classes for rapid development
- Scoped custom classes for specific behaviors
- Responsive grid system (Tailwind)

**Key Styles**:
```css
/* Theme Variables */
:root {
    --bg-deep: #020617;
    --accent: #6366f1;
    --text-main: #e2e8f0;
}

/* Glass Morphism */
.glass {
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.08);
}

/* Reading Experience */
.sentence-span { 
    opacity: 0.3; 
}
.sentence-active { 
    opacity: 1 !important; 
    font-weight: 500; 
}
.word-active { 
    background-color: #3b82f6; 
    color: white; 
    padding: 2px 4px; 
    border-radius: 4px; 
}
```

---

## ⚡ Performance Optimizations

### 1. Lazy Loading & Caching
- **Audio**: Only generate TTS when needed, cache for reuse
- **Images**: Pre-generate in background, cache by index
- **Music**: Single track loaded at a time, no pre-buffering

### 2. Memory Management
```javascript
// Release audio blob URLs after playback
const audioUrl = URL.createObjectURL(blob);
state.currentAudio.src = audioUrl;

state.currentAudio.addEventListener('ended', () => {
    URL.revokeObjectURL(audioUrl); // Free memory
});
```

### 3. Async/Await Patterns
- Non-blocking chapter generation
- Parallel audio preloading
- Background image queue processing

### 4. Debouncing & Throttling
- Image queue 1-second delay prevents API flooding
- Chapter generation flag prevents duplicate requests
- Retry delay (5s) after failed generation

### 5. DOM Optimization
- Minimal re-renders using classList toggles
- Sentence spans created once, reused with class changes
- Smooth scroll only on initial sentence (avoid thrashing)

---

## 🔒 Security Considerations

### 1. Input Sanitization
```javascript
// Regex special char escaping in music keyword matching
const escapedKeyword = keyword.replace(
    /[.*+?^${}()|[\]\\]/g, 
    '\\$&'
);
```

### 2. API Key Management
- Keys stored in constants (should be moved to environment variables)
- No client-side storage of sensitive data
- Firebase handles authentication if enabled

### 3. Error Handling
```javascript
try {
    const res = await fetch(/* API call */);
    const data = await res.json();
    
    // Validate response structure
    if (!data?.predictions?.[0]?.bytesBase64Encoded) {
        throw new Error('Invalid API response structure');
    }
    
    // Process data...
} catch (err) {
    console.error('Generation error:', err);
    // Fallback behavior...
} finally {
    state.isGenerating = false; // Always cleanup
}
```

### 4. Content Safety
- AI-generated content follows Gemini's safety filters
- No user-generated content stored server-side
- Firebase rules should enforce authentication if used

---

## 🧪 Testing Considerations

### Manual Testing Checklist
- ✅ Voice selection works across all 8 options
- ✅ Session duration countdown accurate
- ✅ Genre affects story generation
- ✅ Music selection matches story mood
- ✅ Images display at 4-sentence intervals
- ✅ Audio preloading prevents gaps
- ✅ Background chapter generation works mid-playback
- ✅ Image caching eliminates generation delays
- ✅ Play/pause toggle works smoothly
- ✅ Word highlighting syncs with audio
- ✅ Mobile responsive design works

### Edge Cases to Test
- Empty prompt handling
- API failure recovery
- Network interruption during playback
- Rapid play/pause toggling
- Session end behavior
- Cache miss scenarios
- Long prompts (>1000 characters)

---

## 🛠️ Code Organization

### Function Categories

**Initialization**:
- `initiateSession()` - Main entry point
- `window.onload` - Setup voice select, volume control

**Content Generation**:
- `generateNextChapter()` - AI story generation
- `appendChapter()` - DOM insertion
- `shouldGenerateNextChapter()` - Timing logic

**Audio Management**:
- `fetchTTS()` - TTS API call
- `base64ToWav()` - Audio format conversion
- `preloadAudio()` - Cache population
- `preloadNextSentences()` - Look-ahead buffering

**Image Processing**:
- `updateVisual()` - On-the-fly generation
- `preGenerateChapterImages()` - Background generation
- `generateAndCacheImage()` - Cache insertion
- `processImageQueue()` - Queue worker
- `displayCachedImage()` - Cache retrieval

**Music Control**:
- `applyScore()` - Load and play track
- `applyIntelligentScore()` - Keyword analysis

**Playback**:
- `playCycle()` - Main playback loop
- `togglePlayback()` - User control
- `highlight()` - Sentence highlighting
- `animateWords()` - Word-by-word animation

**UI Management**:
- `switchView()` - Screen transitions
- `startTimerDisplay()` - Countdown ticker

---

## 📚 Design Patterns

### 1. State Machine Pattern
- `isPlaying`, `isGeneratingChapter`, `isGeneratingVisual` flags
- Prevents invalid state transitions
- Ensures atomic operations

### 2. Observer Pattern
- Audio event listeners (`ended`, `loadedmetadata`)
- DOM event handlers (click, input)
- State changes trigger UI updates

### 3. Queue Pattern
- Image generation queue with sequential processing
- Audio buffer managed as FIFO cache
- Chapter history as append-only log

### 4. Factory Pattern
- `base64ToWav()` creates standardized WAV blobs
- Voice configuration lookup via `VOICES` object
- Music track objects with consistent structure

### 5. Strategy Pattern
- Music selection: keyword-based vs. AI-suggested
- Image display: cached vs. on-the-fly generation
- Chapter generation: immediate vs. background

---

## 🔮 Extensibility Points

### Adding New Features

**New Voice**:
```javascript
const VOICES = {
    'New - VoiceName (Style)': { 
        name: 'VoiceName', 
        accent: 'NewAccent' 
    }
};
```

**New Music Track**:
```javascript
const SCORE_LIBRARY = {
    newMood: { 
        name: "Track Name", 
        icon: "🎵", 
        url: 'https://...mp3',
        keywords: ['keyword1', 'keyword2']
    }
};
```

**New Genre**:
```html
<select id="genre-select">
    <option value="NewGenre">New Genre Name</option>
</select>
```

---

## 📊 Performance Metrics

### Typical Execution Times
- **TTS Generation**: ~2-3 seconds per sentence
- **Story Generation**: ~3-5 seconds per chapter
- **Image Generation**: ~5-8 seconds per image
- **Audio Playback**: ~8 seconds per sentence average
- **Page Load**: <2 seconds (excluding API calls)

### Memory Footprint
- **Audio Buffer**: ~500KB per sentence × buffer size
- **Image Cache**: ~2-3MB per image
- **Total RAM Usage**: ~50-100MB typical session

### Network Usage
- **Story API**: ~5KB per request
- **TTS API**: ~100-200KB per sentence
- **Image API**: ~2-3MB per image
- **Music Streaming**: ~5MB per track

---

## 🔗 Dependencies

### External Services
- **Google Gemini API** (v1beta) - Story, TTS & Image generation
- **Firebase** (11.6.1) - Optional user management
- **Spotify Web API** - Optional music integration
- **Spotify Web Playback SDK** - Optional music playback

### CDN Resources
- **Tailwind CSS** - UI framework
- **Google Fonts** - Crimson Pro, Inter
- **Firebase SDK** - ES modules from gstatic
- **Spotify Web Playback SDK** - Loaded dynamically when needed
- **YouTube IFrame API** - Loaded dynamically for YouTube playback

### Browser APIs
- **Web Audio API** - Audio playback and processing
- **Fetch API** - Network requests
- **URL API** - Blob URL management
- **DOM API** - UI manipulation
- **File API** - Local file handling

---

## 📖 Coding Conventions

### Naming
- **Functions**: camelCase (e.g., `generateNextChapter`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `IMAGE_QUEUE_DELAY_MS`)
- **State**: camelCase properties (e.g., `state.isPlaying`)
- **DOM IDs**: kebab-case (e.g., `scene-image`)

### Async Patterns
```javascript
// Always use async/await
async function fetchData() {
    const res = await fetch(url);
    return await res.json();
}

// Handle errors with try/catch
try {
    await riskyOperation();
} catch (err) {
    console.error('Operation failed:', err);
}

// Use Promise.all for parallel operations
await Promise.all([op1(), op2(), op3()]);
```

### Error Handling
- Log errors with context
- Provide user-friendly fallbacks
- Clean up resources in `finally` blocks
- Validate API responses before accessing nested properties

---

**For more information, see**: [Features](Features.md) | [API & Configuration](API-and-Configuration.md) | [User Guide](User-Guide.md)
