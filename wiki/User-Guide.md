# 📖 User Guide

Complete guide for using Dreamweaver, from first launch to advanced tips and troubleshooting.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Interface Overview](#interface-overview)
3. [Starting a Story Session](#starting-a-story-session)
4. [During Playback](#during-playback)
5. [Best Practices](#best-practices)
6. [Tips & Tricks](#tips--tricks)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## 🚀 Quick Start

### 5-Minute Setup

1. **Get Your API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Create API Key"
   - Copy the key

2. **Configure Dreamweaver**
   - Open `dreamweaver.html` in a text editor
   - Find line 173: `const apiKey = "";`
   - Paste your key: `const apiKey = "YOUR_KEY_HERE";`
   - Save the file

3. **Launch the App**
   - Double-click `dreamweaver.html`, OR
   - Run a local server: `python -m http.server 8000`
   - Navigate to `http://localhost:8000/dreamweaver.html`

4. **Start Your First Story**
   - Select a narrator voice (try "Despina" for calming)
   - Choose duration (start with 5 minutes)
   - Pick a genre (Fantasy is great for first-timers)
   - Enter a prompt: *"A wizard discovers a mysterious portal"*
   - Click "Begin Story"

5. **Enjoy!**
   - Sit back and let AI weave your tale
   - Watch images appear as the story unfolds
   - Music will adapt to the narrative mood

---

## 🖥️ Interface Overview

### Home Screen (Setup)

```
┌──────────────────────────────────────────────┐
│  🌙 Dreamweaver                     [Timer] │
├──────────────────────────────────────────────┤
│                                              │
│  Welcome to Dreamweaver                      │
│  Tell me what story you'd like to hear...   │
│                                              │
│  ┌────────────────┐  ┌─────────────────┐   │
│  │ Narrator Voice │  │ Session Duration│   │
│  └────────────────┘  └─────────────────┘   │
│                                              │
│  ┌────────────────┐  ┌─────────────────┐   │
│  │ Narrative Genre│  │ Score Dynamics  │   │
│  └────────────────┘  └─────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  Story Prompt                        │   │
│  │  [Text area for your prompt...]      │   │
│  └──────────────────────────────────────┘   │
│                                              │
│         [   BEGIN STORY   ]                  │
│                                              │
└──────────────────────────────────────────────┘
```

**Key Elements**:
- **Logo**: Top-left, returns to home (not yet implemented)
- **Timer**: Top-right, shows remaining session time (hidden until story starts)
- **Narrator Voice**: Dropdown with 8 options
- **Session Duration**: 5 min to 2 hours
- **Narrative Genre**: 5 genre options
- **Score Dynamics**: Slider for music sensitivity
- **Story Prompt**: Free-text input for your story idea
- **Begin Story**: Large button to start the session

### Reader Screen (Active Story)

```
┌──────────────────────────────────────────────────────┐
│  🌙 Dreamweaver                         ⏱️ 28:45:12 │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐   │
│  │                     │  │                     │   │
│  │  📄 Story Text      │  │  🖼️ Scene Image     │   │
│  │                     │  │                     │   │
│  │  Chapter title...   │  │  [AI-generated      │   │
│  │                     │  │   illustration]     │   │
│  │  Story sentences    │  │                     │   │
│  │  with highlighted   │  └─────────────────────┘   │
│  │  current sentence.  │                            │
│  │                     │  ┌─────────────────────┐   │
│  │  Word-by-word       │  │ 🎵 Dynamic Score    │   │
│  │  highlighting...    │  │                     │   │
│  │                     │  │ 🎶 Track Name       │   │
│  │                     │  │ [Volume Slider]     │   │
│  └─────────────────────┘  └─────────────────────┘   │
│                                                       │
├──────────────────────────────────────────────────────┤
│         ┌───────────────────────────────┐            │
│         │  ▶️  Current Word Display    │            │
│         └───────────────────────────────┘            │
└──────────────────────────────────────────────────────┘
```

**Key Elements**:
- **Timer**: Top-right, counts down during playback
- **Story Text Panel**: Left side (desktop), scrollable
  - Chapter title at top
  - Sentences with highlighting
  - Word-by-word blue highlight
- **Scene Image**: Right side (desktop), updates every 4 sentences
- **Music Controls**: Below image
  - Track name display
  - Volume slider (0-50%)
- **Control Panel**: Fixed at bottom center
  - Play/Pause button (large circular)
  - Live word feed

---

## 🎬 Starting a Story Session

### Step 1: Choose Your Narrator

**8 voices available**:

| Voice | Best For | Personality |
|-------|----------|-------------|
| **Despina** 🇦🇺 | Bedtime, relaxation | Smooth, calming |
| **Algieba** 🇮🇳 | Meditation, spiritual | Smooth, melodic |
| **Puck** 🇺🇸 | Children's stories | Upbeat, playful |
| **Zephyr** 🇺🇸 | Sci-fi, adventure | Bright, energetic |
| **Kore** 🇺🇸 | Epic fantasy | Firm, authoritative |
| **Fenrir** 🇦🇺 | Action, thriller | Excitable, dynamic |
| **Enceladus** 🇬🇧 | Mystery, noir | Breathy, mysterious |
| **Charon** 🇬🇧 | Historical, educational | Informative, clear |

**Tips**:
- Try 2-3 voices to find your favorite
- Accents add character but shouldn't distract
- Match voice energy to story mood

### Step 2: Set Session Duration

**Options & Use Cases**:

| Duration | Use Case | Expected Chapters |
|----------|----------|------------------|
| **5 Minutes** | Quick test, demo | 1-2 chapters |
| **30 Minutes** | Lunch break, commute | 3-4 chapters |
| **1 Hour** | Bedtime routine | 6-8 chapters |
| **2 Hours** | Extended relaxation | 12-16 chapters |

**Tips**:
- First-time users: Start with 5-10 minutes
- Bedtime: 30-60 minutes ideal
- Timer pauses when you pause, so add buffer time

### Step 3: Select Genre

**5 genres with distinct flavors**:

#### 🪄 **Fantasy**
- Magic, quests, mythical creatures
- **Prompt Ideas**:
  - *"A young mage seeking a legendary artifact"*
  - *"A dragon and a knight form an unlikely alliance"*
  - *"An enchanted forest hiding ancient secrets"*

#### 🚀 **Sci-Fi**
- Space, technology, future worlds
- **Prompt Ideas**:
  - *"A colony ship encounters an alien signal"*
  - *"An AI gains consciousness on a Mars base"*
  - *"Time travelers attempting to prevent a paradox"*

#### 🕵️ **Mystery**
- Detective work, clues, suspense
- **Prompt Ideas**:
  - *"A detective investigating strange disappearances"*
  - *"A journalist uncovers a decades-old conspiracy"*
  - *"A locked room murder with no suspects"*

#### 🌑 **Horror**
- Fear, supernatural, psychological terror
- **Prompt Ideas**:
  - *"A group explores an abandoned asylum"*
  - *"A family moves into a house with a dark history"*
  - *"Strange events at a remote research station"*

#### 🏛️ **Historical Drama**
- Period settings, personal struggles, politics
- **Prompt Ideas**:
  - *"A knight torn between duty and honor"*
  - *"A Renaissance artist facing political intrigue"*
  - *"A World War II codebreaker's secret mission"*

### Step 4: Adjust Score Dynamics

**Slider from 1 (Static) to 5 (Fluid)**:
- **1-2**: Music rarely changes, consistent mood
- **3**: Balanced (recommended)
- **4-5**: Frequently adapts to story shifts

*Note: This feature is UI-only in current version; future updates will fully integrate with music engine.*

### Step 5: Select Music Source (Optional)

**Three music sources available**:

#### 🎵 **Spotify** (Recommended)
- **Setup**: Click "Connect Spotify" button to link your account
- **Benefits**: Access to millions of tracks with AI-powered selection
- **Features**: 
  - Automatically matches tracks to story mood
  - "Change Song" button to switch tracks while keeping the same genre
  - Falls back to default library if not connected
- **Requirements**: Free or premium Spotify account

#### 📁 **Local Files**
- **Setup**: Click on file input to select audio files from your device
- **Formats**: MP3, OGG, WAV, and other browser-supported formats
- **Features**:
  - Upload multiple files that play in sequence
  - Complete control over music selection
  - Enhanced volume control and crossfade
- **Note**: Files are not saved between sessions

#### 📺 **YouTube**
- **Setup**: Paste a YouTube URL or video ID and click "Load"
- **Features**:
  - Stream audio from any YouTube video
  - Background playback via IFrame API
- **Notes**: 
  - May show ads before playback
  - Requires user gesture for autoplay
  - Best used with music videos or ambient sound tracks

**Switching Sources**:
- You can change music sources at any time using the dropdown selector
- Different sources can be used for different moods or preferences

### Step 6: Write Your Prompt

**What makes a good prompt?**

✅ **Good Prompts**:
- Specific characters: *"A young blacksmith named Kael"*
- Clear setting: *"in a floating city above the clouds"*
- Initial conflict: *"discovers his forge can melt time itself"*
- Emotional tone: *"haunted by memories of his past"*

❌ **Weak Prompts**:
- Too vague: *"Tell me a story"*
- Too long: 500+ word prompts (AI will summarize)
- Contradictory: Fantasy + sci-fi in Horror genre

**Example Prompts**:

**Fantasy (Beginner-Friendly)**:
```
A curious apprentice discovers a forbidden spell in her 
master's library. When she casts it, she accidentally 
summons a mischievous spirit who challenges her to a 
magical contest.
```

**Sci-Fi (Action-Oriented)**:
```
Commander Riley's ship is stranded in an asteroid field 
after a sabotage. As oxygen runs low, she must identify 
the traitor among her crew while repairing the engines 
before a hostile fleet arrives.
```

**Mystery (Classic Whodunit)**:
```
Detective Hayes is called to an isolated manor where the 
host has been murdered during a dinner party. All guests 
are suspects, the exits are blocked by a snowstorm, and 
strange clues suggest the supernatural is involved.
```

**Horror (Atmospheric)**:
```
A paranormal investigator spends a night in the Blackwood 
Hotel, closed for 50 years after mysterious disappearances. 
As midnight approaches, she realizes the hotel doesn't want 
her to leave.
```

**Historical Drama (Character-Driven)**:
```
In 1944 London, a war nurse harboring a secret discovers 
a wounded enemy soldier in an abandoned building. She must 
choose between her duty and her conscience as bombers 
circle overhead.
```

### Step 7: Click "Begin Story"

Once you click:
1. ⏳ Screen transitions to reader view
2. 🤖 AI generates first chapter (~3-5 seconds)
3. 🎙️ First 3 sentences buffered for audio
4. 🖼️ First image pre-generated
5. 🎵 Music selected and loaded
6. ▶️ Playback automatically starts

---

## 🎮 During Playback

### Control Panel

**Play/Pause Button**:
- Large white circle at bottom center
- Click to toggle playback
- ▶️ icon when paused, ⏸️ when playing
- Pauses audio, music, and timer simultaneously

**Live Word Feed**:
- Shows current word being narrated
- Updates in real-time
- Large, easy-to-read font
- Useful for following along without looking at main text

### Story Text Panel

**Visual Feedback**:
- **Current sentence**: Full opacity, bold
- **Other sentences**: 30% opacity, normal weight
- **Current word**: Blue highlight with rounded background

**Scroll Behavior**:
- No auto-scroll during reading (prevents disorientation)
- Manually scroll to read ahead or review
- Initial smooth scroll to first sentence only

**Clicking Sentences**:
- Currently not interactive
- Future: Click to jump to specific sentence

### Scene Image Panel

**Image Updates**:
- New image every 4 sentences (~32 seconds)
- Smooth fade transition (1.5 second duration)
- Loading overlay shows during generation
  - Spinning animation
  - "Generating Scene" text

**Image Quality**:
- High-resolution PNG format
- Cinematic, atmospheric style
- Adapts to story genre and content

### Music Controls

**Music Source Selector**:
- Dropdown to switch between Spotify, Local Files, and YouTube
- Can be changed during playback without interruption
- Shows current source (e.g., "Source: Spotify")

**Current Track Display**:
- Shows track name and icon
- Updates when mood shifts (default library) or song changes (Spotify)
- Icon indicates mood (⚔️ epic, 🌑 horror, etc.)

**Change Song Button** (Spotify only):
- Available when using Spotify as music source
- Click to request a different track while maintaining the same mood/genre
- Keeps story immersion while providing variety

**Volume Slider**:
- Range: 0% to 50%
- Default: 15%
- Adjustable during playback without interruption
- Changes take effect immediately

**Track Changes**:
- Music may transition between chapters (default library)
- Smooth fade between tracks
- Spotify searches for new tracks based on detected story mood

### Timer Display

**Location**: Top-right corner

**Format**: `HH:MM:SS`

**Behavior**:
- Counts down only when playing
- Pauses when you pause
- Glowing effect (indigo)
- Automatically stops story at 0:00

---

## 💡 Best Practices

### For Sleep & Relaxation

**Optimal Settings**:
```
Voice:     Despina or Algieba (calm)
Duration:  30-60 minutes
Genre:     Fantasy or Drama
Volume:    10-15%
Prompt:    Gentle, low-stakes scenarios
```

**Prompt Examples**:
- *"A traveler discovers a peaceful valley hidden in the mountains"*
- *"A librarian cataloging magical books in an ancient tower"*
- *"A gardener tending to a garden where plants sing at night"*

**Tips**:
- Use blue light filter on screen
- Position device away from bed (audio-only listening)
- Set duration slightly longer than expected sleep time
- Lower music volume for minimal distraction

### For Engagement & Entertainment

**Optimal Settings**:
```
Voice:     Fenrir, Zephyr, or Enceladus (dynamic)
Duration:  15-30 minutes
Genre:     Mystery, Sci-Fi, or Horror
Volume:    20-30%
Prompt:    Action-oriented, plot-driven
```

**Prompt Examples**:
- *"A heist crew steals a quantum computer from a cyberpunk megacorp"*
- *"A bounty hunter tracks a shapeshifter across alien worlds"*
- *"A puzzle master trapped in an escape room designed by a killer"*

**Tips**:
- Use headphones for immersive experience
- Follow along with text for better comprehension
- Pause to predict what happens next
- Share interesting generations with friends

### For Children

**Optimal Settings**:
```
Voice:     Puck (playful)
Duration:  5-15 minutes
Genre:     Fantasy
Volume:    15-20%
Prompt:    Age-appropriate, positive themes
```

**Prompt Examples**:
- *"A young fox learns to paint rainbows with his tail"*
- *"A robot who wants to be a ballet dancer"*
- *"A princess who befriends a grumpy troll under a bridge"*

**Tips**:
- Screen time: Supervise younger children
- Shorter sessions maintain attention
- Avoid Horror genre
- Pause to discuss story with child

---

## 🎯 Tips & Tricks

### Maximizing Story Quality

1. **Be Specific**: Detailed prompts yield richer narratives
2. **Set the Tone**: Include mood words (e.g., "whimsical", "gritty")
3. **Name Characters**: Named characters feel more real
4. **Establish Conflict**: Give the AI a problem to solve
5. **Match Genre**: Align prompt themes with selected genre

### Getting Better Images

1. **Vivid Descriptions**: Use visual language in prompts
2. **Genre Consistency**: Images improve with clear genre
3. **Patience**: First image may take 5-8 seconds to generate
4. **Network Speed**: Stable connection = faster generation

### Music Mood Matching

1. **Use Keywords**: Include music-related words
   - Epic: "battle", "hero", "quest"
   - Horror: "fear", "dark", "shadow"
   - Mystery: "detective", "clue", "secret"
2. **Consistent Tone**: Sustained mood = consistent music
3. **Genre Alignment**: Music library optimized for current genres

### Troubleshooting During Session

**Audio Gap Between Sentences**:
- Normal: 0.5-1 second buffering
- Long gap (3+ seconds): Network issue, try pausing and resuming

**Image Not Updating**:
- Check if at 4-sentence interval
- Loading indicator should show during generation
- If stuck: May be API rate limit, wait 30 seconds

**Music Not Playing**:
- Check volume slider isn't at zero
- Browser may block autoplay (click play button)
- Try refreshing page and restarting session

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Story doesn't generate"

**Symptoms**: Click "Begin Story", nothing happens

**Solutions**:
1. Open browser console (F12) and check for errors
2. Verify API key is correctly set (line 173)
3. Check internet connection
4. Ensure Gemini API is enabled in Google Cloud
5. Try with different prompt (avoid special characters)

#### Issue: "No audio plays"

**Symptoms**: Timer counts, text highlights, but no sound

**Solutions**:
1. Check system volume and browser volume
2. Click play button again (browser autoplay block)
3. Try different browser (Chrome recommended)
4. Check console for TTS API errors
5. Verify speakers/headphones are connected

#### Issue: "Images show loading forever"

**Symptoms**: Spinner persists, no image appears

**Solutions**:
1. Verify Imagen API is enabled
2. Check billing account is active (Imagen requires billing)
3. Network tab: Look for 403 or 429 errors
4. Wait longer (first image takes 5-8 seconds)
5. Try disabling ad blocker (may interfere with API calls)

#### Issue: "Music doesn't change"

**Symptoms**: Same track plays entire session

**Solutions**:
1. Expected behavior if story mood is consistent
2. Try more dynamic prompts with varied themes
3. Check `MUSIC_SELECTION_MIN_SCORE` setting (default: 2)
4. Music changes between chapters, not mid-chapter

#### Issue: "Timer stops but story continues"

**Symptoms**: Timer reaches 0:00, but narration keeps going

**Solutions**:
1. This is a bug—story should auto-stop
2. Click pause button manually
3. Refresh page to reset

#### Issue: "Performance is slow/laggy"

**Symptoms**: Delays, stuttering, unresponsive UI

**Solutions**:
1. Close other browser tabs and applications
2. Use Chrome or Edge (better performance)
3. Check internet speed (5+ Mbps recommended)
4. Reduce image frequency (edit code: every 6 sentences)
5. Disable images temporarily for audio-only

### Error Messages

#### "Failed to fetch"

**Meaning**: Network request failed

**Causes**:
- No internet connection
- API endpoint is down
- CORS issue (loading from file:// instead of http://)

**Fix**:
- Check internet connection
- Use local web server (not file://)
- Wait and retry (API may be temporarily down)

#### "Quota exceeded"

**Meaning**: Hit API rate limit

**Causes**:
- Too many requests in short time
- Free tier limit reached

**Fix**:
- Wait 5-10 minutes before retrying
- Reduce image generation frequency
- Check Google Cloud quota settings

#### "Invalid response structure"

**Meaning**: API returned unexpected data

**Causes**:
- API changed response format
- Corrupted data transmission
- Wrong API endpoint

**Fix**:
- Refresh page and retry
- Check console for full error details
- Verify API endpoints are current

---

## ❓ FAQ

### General

**Q: Is Dreamweaver free to use?**  
A: The app itself is free and open-source. However, you need a Google Cloud account with Gemini and Imagen APIs enabled. These APIs have usage-based costs (see Google Cloud pricing).

**Q: Do I need an internet connection?**  
A: Yes, Dreamweaver requires internet to call Google's AI APIs for story generation, TTS, and image generation.

**Q: Can I use Dreamweaver offline?**  
A: No, all AI features require API calls. You could theoretically pre-generate and cache content, but this isn't currently implemented.

**Q: Is my story data stored anywhere?**  
A: No, all story content exists only in your browser session. When you close the page, the story is lost (unless you manually save it).

**Q: Can I save my favorite stories?**  
A: Not in the current version. This is a planned feature for future releases.

### Technical

**Q: What browsers are supported?**  
A: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Chrome recommended for best performance.

**Q: Can I run this on mobile?**  
A: Yes, the interface is responsive. However, image generation and audio may be slower on mobile connections.

**Q: How do I update the app?**  
A: Pull the latest version from the GitHub repository. The app is a single HTML file, so replacing it is sufficient.

**Q: Can I host this on a website?**  
A: Yes, upload `dreamweaver.html` to any web host. Ensure API keys are secured (use environment variables or backend proxy).

**Q: Is there a backend server?**  
A: No, Dreamweaver is entirely client-side. Firebase is optional and only used for user authentication.

### API & Costs

**Q: How much does the API cost?**  
A: Varies by usage. Typical 30-minute session:
- Story generation: ~5 API calls (~$0.10)
- TTS: ~50 sentences (~$0.50)
- Images: ~5 images (~$1.50)
- **Total**: ~$2.10 per 30-min session (approximate)

Check [Google Cloud Pricing](https://cloud.google.com/pricing) for current rates.

**Q: Are there free tier limits?**  
A: Gemini has free tier quotas (check Google AI Studio). Imagen typically requires billing from the start.

**Q: Can I use a different AI API?**  
A: Yes, but requires code modifications. The architecture supports swapping providers, but you'll need to update API endpoints and request formats.

### Features

**Q: Can I upload my own music?**  
A: Yes! Use the "Local Files" music source option to upload your own audio files (MP3, OGG, WAV, etc.). Simply select the files from your device and they'll play in sequence. Note that files are not saved between browser sessions.

**Q: Can I use Spotify with Dreamweaver?**  
A: Yes! Click "Connect Spotify" to link your account. The app will intelligently select tracks from Spotify based on your story's mood and genre. You can also use the "Change Song" button to switch tracks while maintaining the same vibe.

**Q: Does Spotify integration require a premium account?**  
A: No, both free and premium Spotify accounts work. However, some tracks may not have preview URLs available.

**Q: Can I use YouTube videos as background music?**  
A: Yes! Select "YouTube" as your music source, paste a video URL or ID, and click "Load". The audio will stream in the background via YouTube's IFrame API.

**Q: Can I train my own voice?**  
A: Not currently. Gemini uses prebuilt voices. Custom voice training would require a different TTS provider.

**Q: Can I adjust story pacing?**  
A: Yes, edit `state.estimatedSecondsPerSentence` to change assumed narration speed.

**Q: Can I skip sentences or chapters?**  
A: Not in the UI currently. You could add buttons to manipulate `state.currentIndex`.

**Q: Can multiple users collaborate on one story?**  
A: No, but this is a planned feature (using Firebase for real-time sync).

---

## 📚 Additional Help

### Resources

- **GitHub Repository**: [Kiyoshiakira/Dreamweaver](https://github.com/Kiyoshiakira/Dreamweaver)
- **Issue Tracker**: [Report bugs or request features](https://github.com/Kiyoshiakira/Dreamweaver/issues)
- **Discussions**: [Community Q&A](https://github.com/Kiyoshiakira/Dreamweaver/discussions)

### Other Wiki Pages

- **[Architecture](Architecture.md)**: Technical deep dive
- **[Features](Features.md)**: Detailed feature documentation
- **[API & Configuration](API-and-Configuration.md)**: Setup and customization

### Getting Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/Kiyoshiakira/Dreamweaver/issues) for similar problems
2. Open a new issue with:
   - Browser and version
   - Console error messages
   - Steps to reproduce
   - Expected vs. actual behavior
3. Join [GitHub Discussions](https://github.com/Kiyoshiakira/Dreamweaver/discussions) for general questions

---

**Happy storytelling! 🌟**
