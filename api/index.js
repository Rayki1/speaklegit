import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { app, ensureDatabaseInitialized } = require("../backend/server");

let readyPromise;
const hasMongoUri = Boolean((process.env.MONGODB_URI || "").trim());

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
    if (hasMongoUri) {
      readyPromise = readyPromise || ensureDatabaseInitialized();
      await readyPromise;
    }

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
