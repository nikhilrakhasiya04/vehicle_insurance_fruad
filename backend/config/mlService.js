"use strict";

/**
 * Configuration for the Python Flask ML service.
 */
const mlServiceConfig = {
  baseUrl:        process.env.ML_SERVICE_URL || "http://localhost:5001",
  predictPath:    "/predict",
  healthPath:     "/health",
  modelInfoPath:  "/model-info",
  timeoutMs:      30000, // 30 second timeout for predictions
};

module.exports = mlServiceConfig;
