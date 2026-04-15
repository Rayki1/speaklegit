const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env"), override: true });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

let connectionPromise = null;

async function initializeDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Set it in environment variables.");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB_NAME || undefined,
        serverSelectionTimeoutMS: 10000,
      })
      .then((conn) => {
        const dbLabel = conn.connection.name || MONGODB_DB_NAME || "default";
        console.log(`Connected to MongoDB database: ${dbLabel}`);
        return conn;
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

module.exports = {
  mongoose,
  initializeDatabase,
};
