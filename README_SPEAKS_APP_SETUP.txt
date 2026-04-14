DATABASE NAME: speaks_app

1. Open phpMyAdmin or MySQL.
2. Run backend/speaks_app_database.sql
3. Check backend/db.js:
   database: "speaks_app"
4. Start backend:
   cd backend
   node server.js
5. Start frontend:
   npm run dev

What is saved per account now:
- coins
- hint purchases
- premium status
- premium tier
- premium expiry
- profile picture
- full name
- score

Premium behavior:
- ads are hidden while premium is active
- when premium_expiry is reached, premium is auto-removed on next account fetch/login
