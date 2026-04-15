const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env"), override: true });

const globalForMongo = global;

function getMongoConfig() {
  return {
    uri: (process.env.MONGODB_URI || "").trim(),
    dbName: (process.env.MONGODB_DB_NAME || "").trim(),
  };
}

async function initializeDatabase() {
  const { uri, dbName } = getMongoConfig();

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!uri) {
    throw new Error("MONGODB_URI is missing. Set it in environment variables.");
  }

  if (!globalForMongo.__mongooseConnectionPromise) {
    globalForMongo.__mongooseConnectionPromise = mongoose
      .connect(uri, {
        dbName: dbName || undefined,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
         socketTimeoutMS: 15000,
         retryWrites: true,
         w: "majority",
         ssl: true,
         rejectUnauthorized: false,
      })
      .then((conn) => {
        const dbLabel = conn.connection.name || dbName || "default";
        console.log(`Connected to MongoDB database: ${dbLabel}`);
        return conn;
      })
      .catch((error) => {
         console.error("MongoDB connection failed:", error.message);
        globalForMongo.__mongooseConnectionPromise = null;
        throw error;
      });
  }

  return globalForMongo.__mongooseConnectionPromise;
}

module.exports = {
  mongoose,
  initializeDatabase,
};
