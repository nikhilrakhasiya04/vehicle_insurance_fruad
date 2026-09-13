"use strict";

/**
 * Global error handler middleware.
 * Must be registered LAST in the Express app.
 */
const errorHandler = (err, req, res, next) => {
  // Log in development
  if (process.env.NODE_ENV !== "production") {
    console.error("[ERROR]", err.stack || err.message);
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      error:   "Validation error",
      details,
    });
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      success: false,
      error:   "Invalid ID format",
    });
  }

  // Custom status codes attached to errors
  const status  = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    success: false,
    error:   message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
