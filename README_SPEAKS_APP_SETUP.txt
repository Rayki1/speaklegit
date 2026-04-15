DATABASE NAME: speaks_app

1. Create a MongoDB Atlas cluster.
2. Create a database user and whitelist your IP (or 0.0.0.0/0 for testing only).
3. Set backend environment variables:
   MONGODB_URI=your_atlas_connection_string
   MONGODB_DB_NAME=speaks_app
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
- when premiumExpiry is reached, premium is auto-removed on next account fetch/login
