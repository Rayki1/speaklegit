SPEAKS GOOGLE LOGIN SETUP

1. FRONTEND .env (inside the main project folder)
   VITE_GOOGLE_CLIENT_ID=VITE_GOOGLE_CLIENT_ID=396029785270-sggplv0ucu9mhteqa9446ck1q5ls34st.apps.googleusercontent.com

2. BACKEND .env (inside backend folder)
   GOOGLE_CLIENT_ID=VITE_GOOGLE_CLIENT_ID=396029785270-sggplv0ucu9mhteqa9446ck1q5ls34st.apps.googleusercontent.com
   JWT_SECRET=your_secret_here

3. GOOGLE CLOUD
   - Create OAuth Client ID
   - Add Authorized JavaScript Origin:
     http://localhost:5173

4. DATABASE
   This update keeps using your existing users table.
   The app will save:
   - gmail
   - username
   Password is auto-generated internally for Google users so your old table still works.

5. OPTIONAL SQL CHECK
   Make sure users table has these columns:
   - id
   - gmail
   - username
   - password
   - coins
   - score

6. START
   Frontend:
   npm run dev

   Backend:
   cd backend
   node server.js
