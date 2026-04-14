# SPEAKS - English Game

SPEAKS is an interactive English game to build pronunciation, spelling, and vocabulary skills with friendly feedback and simple English-only prompts.

## Features
- Gradient landing page with arcade-style title
- **Game Flow:** Landing → Login → Mode Selection → Game Menu → Individual Games
- **Game Modes:** One Player or Two Player
- **Available Games:**
  - 🎤 Pronunciation Practice - Voice recognition feedback
  - ✏️ Spelling Challenge - Unscramble words
  - 📖 Vocabulary Builder - Image-based clues
  - 🎭 **Movie Lines Challenge** - Perform Filipino movie lines in English with emotion!
- Progress dashboard with scores, badges, and streaks
- React Router navigation across game pages
- TailwindCSS with forms + typography plugins

## Game Flow
1. **Landing Page** - Welcome and overview
2. **Login** - Enter your name
3. **Mode Selection** - Choose One Player or Two Player
4. **Game Menu** - Select which game to play
5. **Individual Games** - Play and practice
6. **Progress Tracking** - View your stats and achievements

## Project Structure
```
src/
├── pages/           # Main pages (Landing, Login, Mode Selection, Game Menu)
├── modules/         # Reusable learning modules (Pronunciation, Spelling, Vocabulary)
├── games/           # Standalone games (MovieLines)
├── components/      # Reusable UI (Button, Card, Navbar, Footer)
├── layouts/         # Page layouts (LandingLayout, GameLayout)
├── context/         # Global state (UserContext)
├── hooks/           # Custom hooks (useSpeechRecognition)
├── utils/           # Helper functions (scoring.js)
```

## Getting Started
1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`

## New Feature: Movie Lines Challenge 🎭
A standalone game where students:
- Pronounce famous Filipino movie lines translated to English
- Perform with the correct emotion (angry, romantic, sad, confident, happy, dramatic)
- Get feedback on pronunciation accuracy
- Earn points for emotional delivery

## Roadmap
- ✅ Phase 1: Setup project structure + Tailwind config
- ✅ Phase 2: Build Landing Page + Navbar/Footer
- ✅ Phase 3: Implement Pronunciation, Spelling, Vocabulary modules
- ✅ Phase 4: Add scoring + progress tracking
- ✅ Phase 5: Add Movie Lines Challenge game
- 🔜 Phase 6: Add difficulty levels and advanced emotion detection

## Notes
- `public/logo.png` is a placeholder. Replace it with your final logo asset.
- Speech recognition requires HTTPS in production (works on localhost for development)
