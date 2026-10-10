const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ======================================================
// CORS CONFIGURATION
// ======================================================
// Allow the Vite frontend running on localhost.
// origin: true reflects the requesting origin during
// local development, avoiding port 5173/5174/5175 issues.
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ======================================================
// MIDDLEWARE
// ======================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================================
// HEALTH CHECK
// ======================================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SentinelFlow API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "SentinelFlow API",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/auth", require("./routes/auth"));

app.use("/api/users", require("./routes/users"));

app.use("/api/devices", require("./routes/devices"));

app.use("/api/activities", require("./routes/activities"));

app.use("/api/sessions", require("./routes/sessions"));

app.use(
  "/api/behavior-analysis",
  require("./routes/behavior")
);

app.use(
  "/api/risk-assessments",
  require("./routes/risk")
);

app.use("/api/threats", require("./routes/threats"));

app.use("/api/alerts", require("./routes/alerts"));

app.use(
  "/api/investigations",
  require("./routes/investigations")
);

app.use("/api/reports", require("./routes/reports"));

app.use("/api/audit-logs", require("./routes/audit"));

app.use("/api/dashboard", require("./routes/dashboard"));

app.use("/api/policies", require("./routes/policies"));

// ======================================================
// 404 HANDLER
// ======================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// ======================================================
// START SERVER
// ======================================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("========================================");
  console.log("       SENTINELFLOW API SERVER");
  console.log("========================================");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("CORS: ENABLED");
  console.log("Status: RUNNING");
  console.log("========================================");
});

// ======================================================
// ERROR HANDLING
// ======================================================
process.on("uncaughtException", (error) => {
  console.error("[UNCAUGHT EXCEPTION]", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION]", reason);
});

// ======================================================
// GRACEFUL SHUTDOWN
// ======================================================
process.on("SIGINT", () => {
  console.log("\nShutting down SentinelFlow API...");

  server.close(() => {
    console.log("Server stopped.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\nShutting down SentinelFlow API...");

  server.close(() => {
    console.log("Server stopped.");
    process.exit(0);
  });
});