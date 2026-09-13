"use strict";

const Prediction = require("../models/Prediction");
const { getPrediction } = require("./mlService");

/**
 * Process a prediction request end-to-end:
 * 1. Call the ML service
 * 2. Persist to MongoDB
 * 3. Return the saved document
 */
const createPrediction = async (inputData, ipAddress) => {
  // Call Flask ML service
  const result = await getPrediction(inputData);

  // Persist to MongoDB
  const doc = await Prediction.create({
    inputData,
    result,
    status:    "completed",
    ipAddress: ipAddress || "unknown",
  });

  return doc;
};

/**
 * Fetch paginated prediction history.
 */
const getPredictionHistory = async ({ page = 1, limit = 10, filter } = {}) => {
  const query = {};

  if (filter === "fraud")     query["result.prediction"] = 1;
  if (filter === "not_fraud") query["result.prediction"] = 0;

  const skip  = (page - 1) * limit;
  const total = await Prediction.countDocuments(query);
  const items = await Prediction.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Fetch a single prediction by ID.
 */
const getPredictionById = async (id) => {
  const doc = await Prediction.findById(id).lean();
  if (!doc) throw Object.assign(new Error("Prediction not found"), { statusCode: 404 });
  return doc;
};

/**
 * Delete a prediction by ID.
 */
const deletePrediction = async (id) => {
  const doc = await Prediction.findByIdAndDelete(id).lean();
  if (!doc) throw Object.assign(new Error("Prediction not found"), { statusCode: 404 });
  return doc;
};

/**
 * Aggregate summary stats for the dashboard.
 */
const getDashboardStats = async () => {
  const [totals, recentTrend, topSites] = await Promise.all([
    // Total counts
    Prediction.aggregate([
      {
        $group: {
          _id: null,
          total:        { $sum: 1 },
          totalFraud:   { $sum: "$result.prediction" },
          avgConfidence:{ $avg: "$result.confidence" },
          avgFraudProb: { $avg: "$result.fraud_probability" },
        },
      },
    ]),

    // Last 30 days — daily fraud counts
    Prediction.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:  "$createdAt" },
            month: { $month: "$createdAt" },
            day:   { $dayOfMonth: "$createdAt" },
          },
          total: { $sum: 1 },
          fraud: { $sum: "$result.prediction" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]),

    // Fraud by accident site
    Prediction.aggregate([
      { $match: { "result.prediction": 1 } },
      {
        $group: {
          _id:   "$inputData.accident_site",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const summary = totals[0] || {
    total: 0, totalFraud: 0, avgConfidence: 0, avgFraudProb: 0,
  };

  return {
    total:           summary.total,
    totalFraud:      summary.totalFraud,
    totalNotFraud:   summary.total - summary.totalFraud,
    fraudRate:       summary.total > 0
      ? parseFloat(((summary.totalFraud / summary.total) * 100).toFixed(1))
      : 0,
    avgConfidence:   parseFloat((summary.avgConfidence * 100).toFixed(1)),
    avgFraudProb:    parseFloat((summary.avgFraudProb * 100).toFixed(1)),
    recentTrend:     recentTrend.map((d) => ({
      date:  `${d._id.year}-${String(d._id.month).padStart(2,"0")}-${String(d._id.day).padStart(2,"0")}`,
      total: d.total,
      fraud: d.fraud,
    })),
    fraudByAccidentSite: topSites.map((s) => ({
      site:  s._id || "Unknown",
      count: s.count,
    })),
  };
};

module.exports = {
  createPrediction,
  getPredictionHistory,
  getPredictionById,
  deletePrediction,
  getDashboardStats,
};
