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
    const connectWithOptions = (extraOptions = {}) =>
      mongoose.connect(uri, {
        dbName: dbName || undefined,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
        socketTimeoutMS: 15000,
        retryWrites: true,
        w: "majority",
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
        ...extraOptions,
      });

    globalForMongo.__mongooseConnectionPromise = connectWithOptions()
      .then((conn) => {
        const dbLabel = conn.connection.name || dbName || "default";
        console.log(`Connected to MongoDB database: ${dbLabel}`);
        return conn;
      })
      .catch(async (error) => {
        const errorText = String(error?.message || error || "");
        const looksLikeTlsError = /SSL|TLS|tls|certificate|handshake|alert/i.test(errorText);

        if (!looksLikeTlsError) {
          console.error("MongoDB connection failed:", errorText);
          globalForMongo.__mongooseConnectionPromise = null;
          throw error;
        }

        console.warn("MongoDB TLS connection failed, retrying with insecure TLS fallback.");

        try {
          const conn = await connectWithOptions({
            tlsInsecure: true,
            tlsAllowInvalidCertificates: true,
            tlsAllowInvalidHostnames: true,
          });
          const dbLabel = conn.connection.name || dbName || "default";
          console.log(`Connected to MongoDB database with TLS fallback: ${dbLabel}`);
          return conn;
        } catch (retryError) {
          console.error("MongoDB connection failed:", retryError?.message || retryError);
          globalForMongo.__mongooseConnectionPromise = null;
          throw retryError;
        }
      });
  }

  return globalForMongo.__mongooseConnectionPromise;
}

module.exports = {
  mongoose,
  initializeDatabase,
};
