SPEAKS APP UPDATE

Included in this package:
- wallet_transactions now aggregates repeated purchases per account instead of creating a new row every time
- buy_coins stays in one row per account
- purchase_hint stays in one row per account per hint type
- purchase_premium stays in one row per account per premium tier
- Player 1 leaderboard is active
- Player 2 leaderboard says Coming Soon
- Player 3 leaderboard removed

Database name:
- speaks_app

Run this SQL first if your database already exists:
- backend/speaks_app_wallet_leaderboard_update.sql

If you are setting up fresh, run:
- backend/speaks_app_database.sql

Then start:
- backend: node server.js
- frontend: npm run dev
