import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { app, ensureDatabaseInitialized } = require("../backend/server");

let readyPromise;

export default async function handler(req, res) {
  try {
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        message: "Server initialization failed",
        detail: "MONGODB_URI is missing in Vercel environment variables",
      });
    }

    readyPromise = readyPromise || ensureDatabaseInitialized();
    await readyPromise;

    if (req.url === "/api") {
      req.url = "/";
    } else if (req.url.startsWith("/api/")) {
      req.url = req.url.slice(4);
    }

    return app(req, res);
  } catch (error) {
    console.error("VERCEL API INITIALIZATION ERROR:", error);
    return res.status(500).json({
      message: "Server initialization failed",
      detail: error.message || "Unknown error",
    });
  }
}
