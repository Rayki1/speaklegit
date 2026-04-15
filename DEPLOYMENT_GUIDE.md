# Deploy SPEAKS

## Frontend on Vercel
1. Import the root project folder into Vercel.
2. Framework preset: Vite.
3. Build command: npm run build
4. Output directory: dist
5. Add environment variable:
   - VITE_API_URL=https://YOUR-VERCEL-DOMAIN.vercel.app/api (optional, defaults to /api)
6. Deploy.

## Backend API on Vercel (Serverless)
1. Keep backend code in `backend/` and serverless entrypoint in `api/index.js`.
2. Ensure `vercel.json` rewrites `/api` and `/api/*` to `api/index`.
3. Add environment variables in Vercel:
   - JWT_SECRET=your-long-random-secret
   - MONGODB_URI=your-mongodb-atlas-connection-string
   - MONGODB_DB_NAME=your-database-name
   - FRONTEND_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
   - GOOGLE_CLIENT_ID=... (if Google login enabled)
   - EMAIL_USER=... and EMAIL_PASS=... (if reset/contact email enabled)

## Database
- Create a MongoDB Atlas cluster and database.
- Add a database user and whitelist Vercel egress in Atlas Network Access.
- Put the Atlas connection string into `MONGODB_URI`.

## Local testing
Frontend .env
- VITE_API_URL=http://localhost:5000

Backend .env
- set your local MongoDB Atlas values (MONGODB_URI, MONGODB_DB_NAME)
- FRONTEND_URL=http://localhost:5173
