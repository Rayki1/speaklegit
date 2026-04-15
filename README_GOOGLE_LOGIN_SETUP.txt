SPEAKS GOOGLE LOGIN SETUP

1. FRONTEND .env (inside the main project folder)
   VITE_GOOGLE_CLIENT_ID=396029785270-sggplv0ucu9mhteqa9446ck1q5ls34st.apps.googleusercontent.com

2. BACKEND .env (inside backend folder)
   GOOGLE_CLIENT_ID=396029785270-sggplv0ucu9mhteqa9446ck1q5ls34st.apps.googleusercontent.com
   JWT_SECRET=your_secret_here
   MONGODB_URI=your_atlas_connection_string
   MONGODB_DB_NAME=speaks_app

3. GOOGLE CLOUD
   - Create OAuth Client ID
   - Add Authorized JavaScript Origin:
     http://localhost:5173

4. DATABASE
   This update stores users in MongoDB Atlas.
   The app will save:
   - gmail
   - username
   - password (auto-generated internally for Google users)
   - coins
   - score

5. START
   Frontend:
   npm run dev

   Backend:
   cd backend
   node server.js
