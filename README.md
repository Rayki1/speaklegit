# SPEAKS - English Game

SPEAKS is an interactive English game to build pronunciation, spelling, and vocabulary skills with friendly feedback and simple English-only prompts.

## Database
This version uses **MongoDB Atlas only**.
There is no MySQL database file and no MySQL connection required.
The collection-by-collection schema is documented in [backend/DATABASE_SCHEMA.md](backend/DATABASE_SCHEMA.md).

## Features
- Gradient landing page with arcade-style title
- Landing → Login → Mode Selection → Game Menu → Individual Games
- One Player or Two Player mode
- Pronunciation, spelling, vocabulary, and movie lines activities
- Progress dashboard with scores, badges, and streaks
- Google login, JWT auth, forgot-password email flow
- TailwindCSS frontend and Node/Express backend

## Project Structure
```text
src/
├── pages/
├── modules/
├── games/
├── components/
├── layouts/
├── context/
├── hooks/
└── utils/
```

## Local Setup
### Frontend
1. Install dependencies:
   `npm install`
2. Set root `.env`:
   `VITE_API_URL=http://localhost:5000`
3. Start frontend:
   `npm run dev`

### Backend
1. Go to backend:
   `cd backend`
2. Install dependencies:
   `npm install`
3. Set `backend/.env`:
   - `MONGODB_URI=your_mongodb_atlas_connection_string`
   - `MONGODB_DB_NAME=speaks_app`
   - `JWT_SECRET=your_secret_here`
   - `FRONTEND_URL=http://localhost:5173`
4. Start backend:
   `node server.js`

## Notes
- Speech recognition needs HTTPS in production.
- For Vercel deployment, set the same MongoDB Atlas variables in project environment settings.
