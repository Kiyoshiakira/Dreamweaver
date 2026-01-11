# ✨ Features

This page provides comprehensive documentation of all Dreamweaver features, including detailed explanations, use cases, and technical implementation notes.

---

## 📚 Table of Contents

1. [Intelligent Image Generation](#intelligent-image-generation)
2. [Intelligent Music Selection](#intelligent-music-selection)
3. [Narrator Voices](#narrator-voices)
4. [Session Management](#session-management)
5. [Interactive Reading Experience](#interactive-reading-experience)
6. [Genre Selection](#genre-selection)
7. [Customization Options](#customization-options)

---

## 🖼️ Intelligent Image Generation

### Overview

Dreamweaver uses Google's Gemini 2.5 Flash Image to generate cinematic, atmospheric images that accompany your story. The system is designed for **zero interruption** during narration through intelligent pre-generation and caching.

### How It Works

#### 1. **Pre-Generation Strategy**

When a new chapter is generated, the AI identifies **key visual moments**—important scenes that deserve visualization. These are typically:
- Character introductions
- Setting changes
- Action sequences
- Emotional peaks
- Plot revelations

```
Chapter Generated
    ↓
AI Identifies 2-3 Key Visual Moments
    ↓
First Image: Generate Immediately
    ↓
Remaining Images: Queue for Background Processing
    ↓
Images Ready Before Narration Reaches Them
```

#### 2. **Smart Timing**

Images are displayed at **4-sentence intervals** throughout the chapter. This timing balances:
- **Visual engagement**: Frequent enough to maintain interest
- **API efficiency**: Spaced enough to avoid overload
- **Narrative pacing**: Aligns with natural story beats

#### 3. **Background Processing**

The image queue processor runs in the background:
```javascript
processImageQueue() {
    while (queue has images) {
        Generate next image
        Cache result
        Wait 1 second (rate limiting)
    }
}
```

This ensures:
- ✅ Narration never pauses for image generation
- ✅ API rate limits are respected
- ✅ Images are ready when needed

#### 4. **Caching System**

Generated images are stored in a `Map` structure indexed by sentence number:

```javascript
imageCache.set(sentenceIndex, imageDataURL)
```

**Benefits**:
- **O(1) retrieval**: Instant image display
- **Memory efficient**: Only stores images for current session
- **Fallback support**: On-the-fly generation if cache miss occurs

### Display Behavior

#### Cache Hit (Ideal Path)
```
Sentence Index % 4 === 0
    ↓
Check imageCache
    ↓
Image Found
    ↓
Display Instantly (0ms delay)
```

#### Cache Miss (Fallback)
```
Sentence Index % 4 === 0
    ↓
Check imageCache
    ↓
Image Not Found
    ↓
Generate On-The-Fly (~5-8 seconds)
    ↓
Display When Ready
```

### Image Prompt Engineering

Images are generated with carefully crafted prompts:

```
"Cinematic professional fantasy art, atmospheric, 
[GENRE] style: [SCENE DESCRIPTION]"
```

**Components**:
- **"Cinematic professional"**: Ensures high-quality, movie-like aesthetics
- **"fantasy art"**: Art style directive (could be customized per genre)
- **"atmospheric"**: Emphasizes mood and ambiance
- **"[GENRE] style"**: Adapts visual style to story genre (Fantasy, Sci-Fi, Horror, etc.)
- **"[SCENE DESCRIPTION]"**: AI-identified key moment or sentence context

### User Experience

From the user's perspective:
1. 📖 Story begins narrating
2. 🖼️ First image appears immediately
3. 🎨 New images smoothly transition every ~32 seconds (4 sentences × 8 sec/sentence)
4. ✨ No loading delays or interruptions

### Technical Specifications

| Aspect | Value |
|--------|-------|
| **API** | Google Gemini 2.5 Flash Image |
| **Generation Time** | ~5-8 seconds per image |
| **Display Frequency** | Every 4 sentences |
| **Queue Delay** | 1 second between generations |
| **Image Format** | PNG (base64-encoded) |
| **Typical Size** | 2-3MB per image |
| **Cache Structure** | Map<sentenceIndex, dataURL> |

### Best Practices

**For Optimal Image Quality**:
- Use descriptive story prompts with vivid details
- Choose genres that align with visual storytelling (Fantasy, Sci-Fi)
- Longer sessions allow more images to pre-generate

**Troubleshooting**:
- **Blank images**: Check API key validity
- **Slow loading**: Network speed may be limiting
- **No images**: Verify Generative Language API is enabled in Google Cloud

---

## 🎵 Intelligent Music Selection

### Overview

Dreamweaver doesn't just play random background music—it **analyzes your story content** to select the most appropriate soundtrack dynamically. You can choose from multiple music sources including Spotify integration, local files, and YouTube videos.

### Music Sources

Dreamweaver supports three music sources:

#### 🎵 **Spotify Integration** (Recommended)
- Connect your Spotify account for personalized music selection
- Log in with your Spotify account to access millions of tracks
- AI intelligently selects tracks based on story mood and genre
- Change songs on-the-fly while maintaining the same mood/genre
- Seamlessly fallback to default music library when not logged in
- Requires a free or premium Spotify account
- Some tracks may not have preview URLs available for playback

#### 📁 **Local Files**
- Upload your own audio files (MP3, OGG, etc.)
- Select multiple audio files from your device
- Files play in sequence with automatic progression
- **Note**: Local files are not persisted across browser sessions
- Supports Web Audio API for enhanced volume control and crossfade

#### 📺 **YouTube**
- Play audio from YouTube videos
- Paste a YouTube URL or video ID
- Background audio playback via YouTube IFrame API
- **Note**: YouTube may show ads; requires user gesture for autoplay

### Default Music Library

Six carefully curated tracks in the default library, each with associated keywords:

| Track | Icon | Mood | Keywords |
|-------|------|------|----------|
| **Whimsical Fantasy** | 🪄 | Light, magical | magic, wonder, playful, light, fantasy, enchant, fairy, charm |
| **Noir Mystery** | 🕵️ | Mysterious, tense | mystery, detective, shadow, noir, investigate, clue, secret, hidden |
| **High Adventure** | ⚔️ | Epic, heroic | battle, war, hero, quest, adventure, fight, warrior, epic, glory, triumph |
| **Dark Suspense** | 🌑 | Scary, ominous | dark, fear, horror, terror, dread, nightmare, shadow, death, blood, scream |
| **Sci-Fi Ambient** | 🚀 | Futuristic, spacey | space, future, technology, alien, robot, cyber, quantum, science, ship, galaxy |
| **Heavy Drama** | 🎭 | Emotional, tragic | emotion, tragic, sorrow, loss, pain, heart, tear, despair, sacrifice |

### Intelligent Selection Algorithm

#### Step 1: Content Analysis

When a new chapter is generated, the system:
1. Converts prose to lowercase for case-insensitive matching
2. Scans for keyword occurrences using regex word boundaries
3. Counts frequency of each keyword across all music tracks

```javascript
for (keyword in track.keywords) {
    matches = prose.match(/\b{keyword}\w*\b/gi)
    score += matches.length
}
```

**Why word boundaries?**
- Prevents false positives (e.g., "bat" matching "battle")
- Matches word variations (e.g., "dark" matches "darkness")

#### Step 2: Scoring

Each track receives a score based on keyword frequency:

```
Example Prose: "The hero drew his sword for the epic battle 
against the dark warrior."

Scores:
- High Adventure: 4 (hero, sword, epic, battle, warrior)
- Dark Suspense: 1 (dark)
- Whimsical Fantasy: 0
- Noir Mystery: 0
- Sci-Fi Ambient: 0
- Heavy Drama: 0

Winner: High Adventure ⚔️
```

#### Step 3: Confidence Threshold

The system only switches music if:
- **Score ≥ 2** (minimum confidence threshold), OR
- **First chapter** (no prior mood set)

**Rationale**:
- Prevents jarring music changes on weak matches
- Ensures story content genuinely supports the mood
- Falls back to AI-suggested genre if analysis is inconclusive

#### Step 4: Fallback Logic

If keyword analysis is weak:
```
if (highestScore < 2 && currentMood !== null) {
    Use AI-suggested genre instead
}
```

This hybrid approach combines:
- ✅ **Data-driven selection** (keyword matching)
- ✅ **AI intuition** (genre suggestion from Gemini)

### Dynamic Adaptation

Music can **change between chapters** as the story evolves:

**Example Flow**:
```
Chapter 1: "A peaceful village..."
    → Whimsical Fantasy 🪄

Chapter 2: "Suddenly, an army appeared..."
    → High Adventure ⚔️

Chapter 3: "The survivors mourned..."
    → Heavy Drama 🎭
```

### Score Dynamics Control

Users can adjust music sensitivity (1-5 scale):
- **1 (Static)**: Music rarely changes, favors genre consistency
- **3 (Balanced)**: Default behavior described above
- **5 (Fluid)**: More responsive to keyword shifts

*(Note: In current implementation, this control is UI-only; future versions will integrate with threshold logic)*

### User Experience

From the user's perspective:
1. 🎵 Music starts when story begins
2. 🎶 Track seamlessly loops during chapter
3. 🔄 May transition to different mood between chapters
4. 🎚️ Volume adjustable via slider (0-50% range)

### Technical Specifications

| Aspect | Value |
|--------|-------|
| **Tracks** | 6 pre-selected MP3s |
| **Source** | SoundHelix demo tracks |
| **Format** | MP3, streamed via HTTP |
| **Looping** | Yes, seamless repeat |
| **Volume Range** | 0-0.5 (0-50%) |
| **Default Volume** | 0.15 (15%) |
| **Selection Threshold** | ≥2 keyword matches |
| **Update Frequency** | Per chapter generation |

### Best Practices

**For Better Music Matching**:
- Use genre-specific vocabulary in your prompts
- Include mood descriptors (e.g., "tense", "joyful")
- Let the story develop—music improves with longer narratives

**Customization Tips**:
- Lower volume if focusing on narration
- Choose genres that have clear musical associations
- Music is most effective for 30+ minute sessions

---

## 🎙️ Narrator Voices

### Overview

Dreamweaver offers **8 distinct voice personas** across **4 accents**, powered by Google Gemini 2.5 Flash Preview TTS engine.

### Available Voices

| Voice Name | Accent | Personality | Best For |
|------------|--------|-------------|----------|
| **Kore** | American | Firm, authoritative | Epic fantasy, adventure |
| **Zephyr** | American | Bright, energetic | Sci-fi, upbeat stories |
| **Puck** | American | Upbeat, playful | Children's tales, comedy |
| **Enceladus** | British | Breathy, mysterious | Mystery, noir |
| **Charon** | British | Informative, clear | Historical drama, documentary-style |
| **Fenrir** | Australian | Excitable, dynamic | Action, thriller |
| **Despina** | Australian | Smooth, calming | Relaxation, bedtime stories |
| **Algieba** | Indian | Smooth, melodic | Mythology, spiritual tales |

### Voice Selection

Voices are selected via dropdown at session start:
```html
<select id="voice-select">
    <option value="American - Kore (Firm)">
    <option value="British - Enceladus (Breathy)">
    ...
</select>
```

### Accent Implementation

Accents are applied via **instruction prompts** sent to the TTS API:

```javascript
const accentPrompt = accent !== 'American' 
    ? ` Speak with a ${accent} accent.` 
    : '';

const fullText = sentence + accentPrompt;
```

**Examples**:
- "The hero walked forward." → American voice (no modifier)
- "The hero walked forward. Speak with a British accent." → British voice

### Technical Specifications

| Aspect | Value |
|--------|-------|
| **TTS Engine** | Google Gemini 2.5 Flash Preview TTS |
| **Sample Rate** | 24,000 Hz |
| **Format** | 16-bit PCM WAV |
| **Latency** | ~2-3 seconds per sentence |
| **Max Text Length** | ~500 characters per request |

### Audio Processing Pipeline

```
Text Sentence
    ↓
Add Accent Instruction
    ↓
Send to Gemini API
    ↓
Receive Base64 Audio Data
    ↓
Convert to WAV Format
    ↓
Create Blob + Object URL
    ↓
Load into Audio Element
    ↓
Play with Word Highlighting
```

### Best Practices

**Choosing a Voice**:
- Match voice personality to story genre
- Accents add flavor but shouldn't distract
- Test 2-3 voices to find your favorite
- Calmer voices (Despina, Algieba) work best for sleep stories

**Audio Quality**:
- Use headphones for best experience
- Ensure stable internet connection (streaming TTS)
- First sentence may have slight delay (buffering)

---

## ⏱️ Session Management

### Overview

Dreamweaver supports **timed story sessions** from 5 minutes to 2 hours, perfect for bedtime routines, commutes, or relaxation breaks.

### Duration Options

| Duration | Use Case | Chapters Generated |
|----------|----------|-------------------|
| **5 Minutes** | Quick demo, testing | 1-2 chapters |
| **30 Minutes** | Lunch break, short relaxation | 3-4 chapters |
| **1 Hour** | Bedtime story, deep relaxation | 6-8 chapters |
| **2 Hours** | Long commute, extended session | 12-16 chapters |

### Timer Behavior

**Display**:
- Located in top-right corner
- Format: `HH:MM:SS`
- Glowing indigo effect
- Updates every second

**Countdown Logic**:
```javascript
setInterval(() => {
    if (isPlaying) {
        timeLeftSeconds--;
    }
    updateDisplay();
    
    if (timeLeftSeconds <= 0) {
        autoStopPlayback();
    }
}, 1000);
```

**Key Features**:
- ⏸️ **Pauses with playback**: Timer only counts down when narration is playing
- 🛑 **Auto-stop**: Playback halts when timer reaches zero
- 🔄 **Chapter awareness**: Won't start new chapters if insufficient time remains

### Smart Chapter Generation

The system prevents starting chapters that won't have time to complete:

```javascript
shouldGenerateNextChapter() {
    const estimatedChapterDuration = 
        averageSentencesPerChapter (12) × 
        estimatedSecondsPerSentence (8) = 96 seconds
    
    const requiredBuffer = 
        estimatedChapterDuration × 
        minTimeBufferRatio (0.5) = 48 seconds
    
    return timeLeftSeconds >= requiredBuffer;
}
```

**Result**: 
- No abrupt endings mid-chapter
- Natural story conclusions
- Efficient time utilization

### Session Flow

```
Session Start (e.g., 30 minutes)
    ↓
Timer: 30:00
    ↓
Chapter 1 Generated (~400 words, ~96 seconds)
    ↓
Timer: 28:24 (while reading)
    ↓
At 50% through chapter → Generate Chapter 2 in background
    ↓
Timer: 26:48
    ↓
Chapter 2 starts
    ↓
... continues until timer < 48 seconds remaining ...
    ↓
Final chapter completes
    ↓
Timer: 00:00 → Auto-stop
```

### Best Practices

**Choosing Duration**:
- **First time users**: Start with 5-10 minutes to test
- **Bedtime**: 30-60 minutes works well
- **Background ambiance**: 1-2 hours for work/study sessions

**Timer Tips**:
- Use pause to take breaks without wasting time
- Set slightly longer than needed (e.g., 35 min for 30-min bedtime)
- Mobile users: Keep screen on to prevent sleep interruption

---

## 📖 Interactive Reading Experience

### Overview

Dreamweaver provides **real-time visual feedback** synchronized with audio narration, creating an immersive reading experience.

### Word-by-Word Highlighting

#### Visual Behavior

As the narrator reads:
1. **Current word** highlighted in **blue** with rounded background
2. **Live Feed** panel at bottom shows current word in large text
3. **Smooth transitions** between words (150ms CSS transition)

#### Implementation

```javascript
animateWords(sentenceIndex) {
    const words = sentence.split(/\s+/);
    const audioDuration = currentAudio.duration;
    const stepInterval = audioDuration / words.length;
    
    setInterval(() => {
        highlightWord(currentWordIndex);
        updateLiveFeed(word);
        currentWordIndex++;
    }, stepInterval);
}
```

#### Styling

```css
.word-token {
    display: inline;
    transition: all 0.15s ease;
}

.word-active {
    background-color: #3b82f6;
    color: white;
    padding: 2px 4px;
    border-radius: 4px;
}
```

### Sentence Highlighting

#### Visual Behavior

- **Current sentence**: Full opacity (100%), bold weight
- **Other sentences**: Reduced opacity (30%), normal weight
- **Smooth fade**: CSS transitions (300ms)

#### Purpose

- Helps users follow along if reading manually
- Provides context for current narration
- Aesthetic "focus effect"

#### Implementation

```javascript
highlight(sentenceIndex) {
    allSentences.forEach((span, index) => {
        if (index === sentenceIndex) {
            span.classList.add('sentence-active');
        } else {
            span.classList.remove('sentence-active');
        }
    });
}
```

### Live Feed Panel

#### Features

- **Fixed position**: Bottom-center, always visible
- **Glass morphism**: Translucent background with blur effect
- **Large play/pause button**: 64×64px circular control
- **Current word display**: Updates in real-time

#### User Interaction

- Click play/pause button to toggle playback
- Visual feedback on button press (scale animation)
- Smooth transitions between play ▶️ and pause ⏸️ icons

### Reading Layout

#### Desktop (≥1024px)

```
┌─────────────────────────────────────────┐
│  [Story Text]         [Image]           │
│  [Highlighted]        [Music Controls]  │
│                                         │
│                                         │
└─────────────────────────────────────────┘
         [Control Panel - Fixed Bottom]
```

#### Mobile (<1024px)

```
┌─────────────────┐
│  [Story Text]   │
│  [Highlighted]  │
│                 │
│  [Image]        │
│  [Controls]     │
└─────────────────┘
  [Control Panel]
```

### Scroll Behavior

- **No auto-scroll during reading**: Prevents disorientation
- **Initial scroll only**: Smoothly scrolls to first sentence on start
- **User can manually scroll**: Read ahead or review previous text

### Typography

#### Story Text
- **Font**: Crimson Pro (serif, novel-style)
- **Size**: 24-28px (responsive)
- **Line Height**: 1.7 (comfortable reading)
- **Color**: Stone-700 on warm-white background

#### UI Elements
- **Font**: Inter (sans-serif, modern)
- **Tracking**: Wide letter-spacing for labels
- **Uppercase**: Section headers and controls

### Best Practices

**For Best Reading Experience**:
- Use larger screens when possible (desktop/tablet)
- Reduce ambient light for evening sessions
- Follow along with text for better comprehension
- Let highlighting guide your eyes naturally

**Accessibility**:
- High contrast text (WCAG AA compliant)
- Large touch targets (≥44px)
- Smooth animations (can be disabled with `prefers-reduced-motion`)

---

## 🎭 Genre Selection

### Overview

Choose from **5 distinct genres** that shape both the narrative content and overall aesthetic.

### Available Genres

#### 🪄 Fantasy
- **Themes**: Magic, mythical creatures, quests, prophecies
- **Music**: Whimsical Fantasy, High Adventure
- **Visual Style**: Enchanted forests, castles, mystical artifacts
- **Example Prompt**: *"A young mage discovers an ancient spellbook"*

#### 🚀 Sci-Fi
- **Themes**: Space exploration, AI, future technology, alien worlds
- **Music**: Sci-Fi Ambient
- **Visual Style**: Spaceships, futuristic cities, alien landscapes
- **Example Prompt**: *"A crew investigates a derelict station near a black hole"*

#### 🕵️ Mystery
- **Themes**: Detective work, clues, suspects, plot twists
- **Music**: Noir Mystery
- **Visual Style**: Shadowy alleys, crime scenes, foggy streets
- **Example Prompt**: *"A detective investigates disappearances in a coastal town"*

#### 🌑 Horror
- **Themes**: Fear, suspense, supernatural, psychological terror
- **Music**: Dark Suspense
- **Visual Style**: Haunted locations, dark atmospheres, ominous shadows
- **Example Prompt**: *"Explorers find an abandoned asylum with a dark history"*

#### 🏛️ Historical Drama
- **Themes**: Historical events, political intrigue, personal struggles
- **Music**: Heavy Drama
- **Visual Style**: Period-accurate settings, historical figures, dramatic moments
- **Example Prompt**: *"A knight torn between duty and honor during a medieval siege"*

### How Genre Affects Your Story

#### 1. **Narrative Content**

The AI uses genre as a system instruction:
```javascript
systemPrompt = `You are a professional novelist writing a 
${genre} story. Continue based on the prompt and history...`
```

**Impact**:
- Vocabulary and tone match genre conventions
- Plot developments align with genre expectations
- Character archetypes appropriate to genre

#### 2. **Visual Generation**

Image prompts include genre modifier:
```javascript
imagePrompt = `Cinematic professional fantasy art, atmospheric, 
${genre} style: ${sceneDescription}`
```

**Impact**:
- Fantasy → Vibrant, magical aesthetics
- Sci-Fi → Sleek, futuristic designs
- Horror → Dark, ominous tones

#### 3. **Music Selection**

Genre influences:
- Initial music suggestion from AI
- Keyword weighting in intelligent selection
- Overall mood continuity

### Best Practices

**Matching Prompt to Genre**:
- ✅ **Good**: Genre + prompt aligned
  - Fantasy + "A wizard's apprentice..."
  - Sci-Fi + "A Mars colony engineer..."
  
- ❌ **Confusing**: Genre + prompt misaligned
  - Fantasy + "A spaceship captain..." (choose Sci-Fi instead)
  - Horror + "A cheerful village festival..." (lacks horror elements)

**Genre Experimentation**:
- Try different genres with the same core concept
- Mix genre elements in your prompt (e.g., "Fantasy Western")
- Some genres work better for sleep (Fantasy, Drama) vs. engagement (Horror, Mystery)

---

## 🎨 Customization Options

### Voice & Accent

**Options**: 8 voices across 4 accents  
**When to Change**: Session start only  
**Effect**: Changes narrator's speaking style and accent

### Session Duration

**Options**: 5 min, 30 min, 1 hour, 2 hours  
**When to Change**: Session start only  
**Effect**: Controls how long the story continues

### Genre

**Options**: Fantasy, Sci-Fi, Mystery, Horror, Historical Drama  
**When to Change**: Session start only  
**Effect**: Shapes narrative content, visuals, and music

### Score Dynamics

**Options**: Slider from 1 (Static) to 5 (Fluid)  
**When to Change**: Session start only  
**Effect**: Controls music responsiveness *(future implementation)*

### Music Volume

**Options**: Slider from 0% to 50%  
**When to Change**: Anytime during playback  
**Effect**: Adjusts background music volume independently

### Music Source

**Options**: Spotify, Local Files, YouTube  
**When to Change**: Anytime (can switch sources during playback)  
**Effect**: Changes where music is sourced from
- **Spotify**: Personalized track selection based on AI-detected mood
- **Local Files**: Play your own uploaded audio files
- **YouTube**: Stream audio from YouTube videos

### Story Prompt

**Options**: Free text input  
**When to Change**: Session start only  
**Effect**: Primary control over story content and direction

### Customization Tips

**Optimal Settings for Sleep**:
- Voice: Despina or Algieba (calm, smooth)
- Duration: 30-60 minutes
- Genre: Fantasy or Drama
- Music Source: Local Files or Spotify (calm playlists)
- Music Volume: 10-15%

**Optimal Settings for Engagement**:
- Voice: Fenrir or Zephyr (energetic)
- Duration: 5-30 minutes
- Genre: Mystery or Sci-Fi
- Music Source: Spotify or YouTube (dynamic tracks)
- Music Volume: 20-30%

**Optimal Settings for Children**:
- Voice: Puck (playful)
- Duration: 5-15 minutes
- Genre: Fantasy
- Music Source: Local Files (appropriate content)
- Music Volume: 15-20%

---

## 🔮 Upcoming Features

Features planned for future releases:

- [ ] **Custom voice training**: Upload voice samples for personalized narration
- [ ] **Story branching**: Make choices that affect the narrative
- [ ] **Save/load stories**: Resume sessions or replay favorites
- [ ] **Expanded music library**: 20+ tracks with more genres
- [ ] **Full Spotify Web Playback SDK integration**: Complete track playback instead of preview URLs
- [ ] **Multi-language support**: Stories in different languages
- [ ] **Collaborative stories**: Multiple users contribute to one narrative
- [ ] **Export to audio file**: Download stories as MP3s

---

**For more information, see**: [Architecture](Architecture.md) | [API & Configuration](API-and-Configuration.md) | [User Guide](User-Guide.md)
