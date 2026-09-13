"use strict";

const predictionService = require("../services/predictionService");
const { getModelInfo, checkMLHealth } = require("../services/mlService");
const asyncHandler = require("../utils/asyncHandler");

/**
 * POST /api/predictions/predict
 * Submit a claim for fraud prediction.
 */
const predict = asyncHandler(async (req, res) => {
  const inputData  = req.body;
  const ipAddress  = req.ip || req.connection?.remoteAddress || "unknown";

  const prediction = await predictionService.createPrediction(inputData, ipAddress);

  res.status(201).json({
    success: true,
    message: "Prediction completed successfully",
    data:    prediction,
  });
});

/**
 * GET /api/predictions/history
 * Returns paginated prediction history.
 */
const getHistory = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 10;
  const filter = req.query.filter || null;

  const result = await predictionService.getPredictionHistory({ page, limit, filter });

  res.json({
    success: true,
    data:    result.items,
    pagination: result.pagination,
  });
});

/**
 * GET /api/predictions/stats/summary
 * Returns aggregated dashboard statistics.
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await predictionService.getDashboardStats();

  res.json({
    success: true,
    data:    stats,
  });
});

/**
 * GET /api/predictions/:id
 * Returns a single prediction by ID.
 */
const getById = asyncHandler(async (req, res) => {
  const prediction = await predictionService.getPredictionById(req.params.id);

  res.json({
    success: true,
    data:    prediction,
  });
});

/**
 * DELETE /api/predictions/:id
 * Deletes a prediction by ID.
 */
const deletePrediction = asyncHandler(async (req, res) => {
  await predictionService.deletePrediction(req.params.id);

  res.json({
    success: true,
    message: "Prediction deleted successfully",
  });
});

/**
 * GET /api/predictions/model-performance
 * Proxies model performance metrics from the Flask service.
 */
const getModelPerformance = asyncHandler(async (req, res) => {
  const info = await getModelInfo();

  res.json({
    success: true,
    data:    info,
  });
});

/**
 * GET /api/predictions/ml-health
 * Checks if the Flask ML service is reachable.
 */
const getMLHealth = asyncHandler(async (req, res) => {
  const health = await checkMLHealth();

  res.json({
    success: true,
    data:    health,
  });
});

module.exports = {
  predict,
  getHistory,
  getStats,
  getById,
  deletePrediction,
  getModelPerformance,
  getMLHealth,
};
