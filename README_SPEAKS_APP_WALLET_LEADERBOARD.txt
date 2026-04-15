SPEAKS APP UPDATE

Database: MongoDB Atlas (no SQL migration file needed)

What changed:
- wallet_transactions is now aggregated per account + purchase/use type
- repeated buy coins for the same account updates one row instead of inserting many rows
- repeated premium / hint / exclusive item transactions also aggregate per account and item/tier
- added Player 1 leaderboard
- Player 2 leaderboard now shows Coming Soon
- removed Player 3 option

After setup:
1. cd backend
2. set MONGODB_URI and MONGODB_DB_NAME in backend/.env or Vercel project settings
3. node server.js
4. in project root run npm run dev
