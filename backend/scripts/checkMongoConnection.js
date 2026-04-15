require("dotenv").config();
const { initializeDatabase, mongoose } = require("../db");

(async () => {
  try {
    await initializeDatabase();
    await mongoose.connection.db.command({ ping: 1 });
    console.log("MongoDB Atlas connection OK");
    process.exit(0);
  } catch (error) {
    console.error("MongoDB Atlas connection FAILED:", error.message || error);
    process.exit(1);
  }
})();
