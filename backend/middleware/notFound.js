"use strict";

/**
 * 404 handler — catches any request that didn't match a defined route.
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error:   `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFound;
