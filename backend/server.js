"use strict";

require("dotenv").config();
const app        = require("./app");
const connectDB  = require("./config/database");

const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB then start server ──────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("═══════════════════════════════════════════════");
      console.log(`  Insurance Fraud Detection — Backend API`);
      console.log(`  Server running on http://localhost:${PORT}`);
      console.log(`  Environment : ${process.env.NODE_ENV || "development"}`);
      console.log("═══════════════════════════════════════════════");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

// ── Unhandled promise rejections ──────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});
