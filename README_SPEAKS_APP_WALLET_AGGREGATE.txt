SPEAKS APP UPDATE

Included in this package:
- wallet_transactions now aggregates repeated purchases per account instead of creating a new row every time
- buy_coins stays in one row per account
- purchase_hint stays in one row per account per hint type
- purchase_premium stays in one row per account per premium tier
- Player 1 leaderboard is active
- Player 2 leaderboard says Coming Soon
- Player 3 leaderboard removed

Database:
- MongoDB Atlas database (example name: speaks_app)
- No SQL file is required for this version.

Then start:
- backend: set MONGODB_URI and MONGODB_DB_NAME, then run node server.js
- frontend: npm run dev
