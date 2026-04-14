# Deploy Guide

## Frontend (Vercel)
1. Import the project to Vercel.
2. Root directory: project root.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables:
   - `VITE_API_URL=https://your-backend-url.onrender.com`
   - `VITE_GOOGLE_CLIENT_ID=your_google_client_id`

## Backend (Render)
1. Create a new Web Service from this repo.
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `backend/.env.example`.
6. Set `FRONTEND_URL` to your Vercel domain.

## Notes
- React Router refreshes work because `vercel.json` rewrites all routes to `index.html`.
- Frontend API calls now use `VITE_API_URL` instead of hardcoded localhost.
