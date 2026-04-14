SPEAKS APP UPDATE

Run this SQL in MySQL first:
backend/speaks_app_wallet_leaderboard_update.sql

What changed:
- wallet_transactions is now aggregated per account + purchase/use type
- repeated buy coins for the same account updates one row instead of inserting many rows
- repeated premium / hint / exclusive item transactions also aggregate per account and item/tier
- added Player 1 leaderboard
- Player 2 leaderboard now shows Coming Soon
- removed Player 3 option

After SQL:
1. cd backend
2. node server.js
3. in project root run npm run dev
