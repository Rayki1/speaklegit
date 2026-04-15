import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { app, ensureDatabaseInitialized } = require("../backend/server");

let readyPromise;

function normalizeRequestUrl(req) {
  const originalUrl = req.url || "/";

  if (originalUrl === "/api" || originalUrl === "/api/") {
    req.url = "/";
    return;
  }

  if (originalUrl.startsWith("/api/")) {
    req.url = originalUrl.slice(4) || "/";
  }
}

export default async function handler(req, res) {
  try {
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        message: "Server initialization failed",
        detail: "MONGODB_URI is missing in Vercel environment variables",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server initialization failed",
        detail: "JWT_SECRET is missing in Vercel environment variables",
      });
    }

    readyPromise = readyPromise || ensureDatabaseInitialized();
    await readyPromise;

    normalizeRequestUrl(req);
    return app(req, res);
  } catch (error) {
    console.error("VERCEL API INITIALIZATION ERROR:", error);
    return res.status(500).json({
      message: "Server initialization failed",
      detail: error.message || "Unknown error",
    });
  }
}
