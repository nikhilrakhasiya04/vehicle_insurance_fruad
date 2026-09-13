"use strict";

/**
 * Standard API response helpers.
 */

const success = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const error = (res, message = "Error", statusCode = 500, details = null) => {
  const body = { success: false, error: message };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
};

module.exports = { success, error };
