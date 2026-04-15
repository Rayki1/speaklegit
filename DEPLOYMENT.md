# Deploy Guide

## Frontend (Vercel)
1. Import the project to Vercel.
2. Root directory: project root.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables:
   - `VITE_API_URL=https://your-vercel-domain.vercel.app/api` (optional; default is `/api`)
   - `VITE_GOOGLE_CLIENT_ID=your_google_client_id`

## Backend API (Vercel Serverless)
1. Keep backend code in `backend/` and serverless entry at `api/index.js`.
2. Vercel rewrites `/api/*` to `api/index`.
3. Add environment variables in Vercel project settings:
   - `MONGODB_URI=your-mongodb-atlas-connection-string`
   - `MONGODB_DB_NAME=speaks_app`
   - `JWT_SECRET=your-long-random-secret`
   - `FRONTEND_URL=https://your-vercel-domain.vercel.app`
   - `GOOGLE_CLIENT_ID=...` (if using Google login)
   - `EMAIL_USER=...` and `EMAIL_PASS=...` (for password reset/contact email)

## Notes
- React Router refreshes work because `vercel.json` rewrites all routes to `index.html`.
- Frontend API calls use `/api` in production by default.
- MongoDB Atlas replaces MySQL in this deployment flow.
