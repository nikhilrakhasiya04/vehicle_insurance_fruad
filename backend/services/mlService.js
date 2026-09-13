"use strict";

const axios  = require("axios");
const config = require("../config/mlService");

const isConnectionError = (err) => {
  return (
    err.code === "ECONNREFUSED" ||
    err.code === "ENOTFOUND" ||
    (err.message && err.message.includes("ECONNREFUSED")) ||
    (err.name === "AggregateError" && err.errors?.some((e) => e.code === "ECONNREFUSED"))
  );
};

/**
 * Calls the Python Flask ML service to get a fraud prediction.
 *
 * @param {Object} featureData - Cleaned feature object
 * @returns {Promise<Object>} - Prediction result from Flask
 */
const getPrediction = async (featureData) => {
  const url = `${config.baseUrl}${config.predictPath}`;

  try {
    const response = await axios.post(url, featureData, {
      headers:        { "Content-Type": "application/json" },
      timeout:        config.timeoutMs,
    });

    if (!response.data.success) {
      throw Object.assign(new Error(response.data.error || "ML service returned an error."), {
        statusCode: 502,
      });
    }

    return response.data.data;
  } catch (err) {
    if (isConnectionError(err)) {
      throw Object.assign(
        new Error(
          "ML service is unavailable. Please ensure the Flask server is running on port 5001 (run 'npm run dev:all' or 'npm run dev:ml')."
        ),
        { statusCode: 503 }
      );
    }
    if (err.response) {
      throw Object.assign(
        new Error(
          err.response.data?.error || `ML service error: ${err.response.status}`
        ),
        { statusCode: err.response.status || 502 }
      );
    }
    throw err;
  }
};

/**
 * Fetches health status of the ML service.
 */
const checkMLHealth = async () => {
  const url = `${config.baseUrl}${config.healthPath}`;
  try {
    const response = await axios.get(url, { timeout: 5000 });
    return response.data;
  } catch (err) {
    return {
      status: "unavailable",
      message: "Flask ML service is not running on port 5001.",
    };
  }
};

/**
 * Fetches model performance metrics from the ML service.
 */
const getModelInfo = async () => {
  const url = `${config.baseUrl}${config.modelInfoPath}`;
  try {
    const response = await axios.get(url, { timeout: 10000 });
    if (!response.data.success) {
      throw Object.assign(new Error(response.data.error || "Failed to fetch model info."), {
        statusCode: 502,
      });
    }
    return response.data.data;
  } catch (err) {
    if (isConnectionError(err)) {
      throw Object.assign(
        new Error(
          "ML service is unavailable. Please ensure the Flask server is running on port 5001."
        ),
        { statusCode: 503 }
      );
    }
    throw err;
  }
};

module.exports = { getPrediction, checkMLHealth, getModelInfo };
