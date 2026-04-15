# MongoDB Collections

This project uses MongoDB collections instead of SQL tables. Mongoose creates the collections and indexes on startup through the backend bootstrap.

## `counters`
Used for sequence generation.

- `key` string, required, unique
- `seq` number, default `0`

Example:

```json
{ "key": "users", "seq": 12 }
```

## `users`
Primary player accounts.

- `userId` number, required, unique, indexed
- `gmail` string, required, unique, lowercased, trimmed
- `username` string, required, unique, trimmed
- `password` string, required
- `coins` number, default `0`
- `score` number, default `0`
- `profilePicture` string, default `""`
- `fullName` string, default `""`
- `premium` boolean, default `false`
- `premiumTier` string or null
- `premiumExpiry` date or null
- `hints.neonMagnet` number, default `0`
- `hints.shadowLetter` number, default `0`
- `hints.underscoreReveal` number, default `0`
- `hints.firstLetterBloom` number, default `0`
- `createdAt` timestamp
- `updatedAt` timestamp

Example:

```json
{
  "userId": 1,
  "gmail": "player@example.com",
  "username": "player1",
  "password": "$2b$10$hash",
  "coins": 100,
  "score": 250,
  "profilePicture": "",
  "fullName": "Player One",
  "premium": false,
  "premiumTier": null,
  "premiumExpiry": null,
  "hints": {
    "neonMagnet": 0,
    "shadowLetter": 0,
    "underscoreReveal": 0,
    "firstLetterBloom": 0
  }
}
```

## `leaderboards`
Scoreboard rows per user and mode.

- `userId` number, required, indexed
- `username` string, required
- `score` number, default `0`
- `gamesPlayed` number, default `0`
- `wins` number, default `0`
- `mode` string, default `player1`, indexed
- unique index on `userId + mode`

Example:

```json
{ "userId": 1, "username": "player1", "score": 250, "gamesPlayed": 8, "wins": 3, "mode": "player1" }
```

## `wallettransactions`
Aggregated wallet activity per user and transaction bucket.

- `userId` number, required, indexed
- `transactionType` string, required
- `aggregateKey` string, required
- `amount` number, default `0`
- `coinsChange` number, default `0`
- `transactionCount` number, default `1`
- `details` mixed object, default `{}`
- `lastTransactionAt` date
- `createdAt` timestamp
- `updatedAt` timestamp
- unique index on `userId + aggregateKey`

Example:

```json
{
  "userId": 1,
  "transactionType": "buy_coins",
  "aggregateKey": "buy_coins",
  "amount": 500,
  "coinsChange": 500,
  "transactionCount": 2,
  "details": { "pack": "starter" },
  "lastTransactionAt": "2026-04-15T12:00:00.000Z"
}
```

## `coinpurchases`
Purchase history for coin bundles.

- `userId` number, required, indexed
- `coinsBought` number, required
- `amount` number, required
- `createdAt` timestamp
- `updatedAt` not stored

Example:

```json
{ "userId": 1, "coinsBought": 500, "amount": 9.99 }
```

## `premiumpurchases`
Purchase history for premium access.

- `userId` number, required, indexed
- `premiumTier` string, required
- `costCoins` number, required
- `durationDays` number, required
- `bonusCoins` number, default `0`
- `expiresAt` date, required
- `createdAt` timestamp
- `updatedAt` not stored

Example:

```json
{
  "userId": 1,
  "premiumTier": "Monthly Premium",
  "costCoins": 1200,
  "durationDays": 30,
  "bonusCoins": 100,
  "expiresAt": "2026-05-15T00:00:00.000Z"
}
```

## `passwordresets`
Forgot-password reset tokens.

- `userId` number, required, indexed
- `resetToken` string, required, unique
- `expiresAt` date, required, indexed
- `createdAt` timestamp
- `updatedAt` not stored

Example:

```json
{ "userId": 1, "resetToken": "abc123", "expiresAt": "2026-04-15T15:00:00.000Z" }
```

## `contactmessages`
Messages sent from the contact form.

- `name` string, required
- `email` string, required, lowercased, trimmed
- `phone` string, default `""`
- `preferredMethod` string, enum `email` or `phone`, default `email`
- `message` string, required
- `createdAt` timestamp
- `updatedAt` not stored

Example:

```json
{
  "name": "Alex",
  "email": "alex@example.com",
  "phone": "",
  "preferredMethod": "email",
  "message": "I need help with my account."
}
```