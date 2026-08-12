import mongoose from "mongoose";

const DB_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

const formatUptime = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `${d}d ${h}h ${m}m ${s}s`;
};

// Lightweight check — no dependencies touched. Good for load balancers.
export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "Server is running",
    uptime: formatUptime(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

// Deep check — pings the database and reports memory usage.
export const getDetailedHealth = async (req, res) => {
  const startedAt = Date.now();

  const database = {
    status: DB_STATES[mongoose.connection.readyState] || "unknown",
    name: mongoose.connection.name || null,
    host: mongoose.connection.host || null,
    responseTime: null,
  };

  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database is not connected");
    }

    const pingStart = Date.now();
    await mongoose.connection.db.admin().ping();
    database.responseTime = `${Date.now() - pingStart}ms`;
  } catch (error) {
    database.error = error.message;

    return res.status(503).json({
      success: false,
      status: "error",
      message: "One or more services are unavailable",
      uptime: formatUptime(process.uptime()),
      responseTime: `${Date.now() - startedAt}ms`,
      timestamp: new Date().toISOString(),
      services: { database },
    });
  }

  const memory = process.memoryUsage();

  res.status(200).json({
    success: true,
    status: "ok",
    message: "All services are healthy",
    uptime: formatUptime(process.uptime()),
    responseTime: `${Date.now() - startedAt}ms`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    services: { database },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: {
        rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
      },
    },
  });
};
