"use strict";

const { body, query, param, validationResult } = require("express-validator");

/**
 * Validation rules for the /predict endpoint.
 * All insurance claim features are validated here.
 */
const predictRules = [
  // ── Driver Info ─────────────────────────────────────────────────────────────
  body("age_of_driver")
    .notEmpty().withMessage("age_of_driver is required")
    .isFloat({ min: 16, max: 100 }).withMessage("age_of_driver must be between 16 and 100"),

  body("gender")
    .notEmpty().withMessage("gender is required")
    .isIn(["M", "F"]).withMessage("gender must be M or F"),

  body("marital_status")
    .notEmpty().withMessage("marital_status is required")
    .isIn([0, 1, "0", "1"]).withMessage("marital_status must be 0 or 1"),

  body("high_education")
    .notEmpty().withMessage("high_education is required")
    .isIn([0, 1, "0", "1"]).withMessage("high_education must be 0 or 1"),

  body("annual_income")
    .notEmpty().withMessage("annual_income is required")
    .isFloat({ min: 0 }).withMessage("annual_income must be a non-negative number"),

  body("safety_rating")
    .notEmpty().withMessage("safety_rating is required")
    .isFloat({ min: 0, max: 100 }).withMessage("safety_rating must be between 0 and 100"),

  body("address_change")
    .notEmpty().withMessage("address_change is required")
    .isIn([0, 1]).withMessage("address_change must be 0 or 1"),

  body("property_status")
    .notEmpty().withMessage("property_status is required")
    .isIn(["Own", "Rent"]).withMessage("property_status must be Own or Rent"),

  // ── Claim Details ────────────────────────────────────────────────────────────
  body("claim_month")
    .notEmpty().withMessage("claim_month is required")
    .isInt({ min: 1, max: 12 }).withMessage("claim_month must be between 1 and 12"),

  body("claim_year")
    .notEmpty().withMessage("claim_year is required")
    .isInt({ min: 2000, max: 2030 }).withMessage("claim_year must be a valid year"),

  body("claim_day_num")
    .notEmpty().withMessage("claim_day_num is required")
    .isInt({ min: 1, max: 31 }).withMessage("claim_day_num must be between 1 and 31"),

  body("claim_day_of_week")
    .notEmpty().withMessage("claim_day_of_week is required")
    .isIn(["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"])
    .withMessage("claim_day_of_week must be a valid day name"),

  body("accident_site")
    .notEmpty().withMessage("accident_site is required")
    .isIn(["Highway", "Local", "Parking Lot"])
    .withMessage("accident_site must be Highway, Local, or Parking Lot"),

  body("past_num_of_claims")
    .notEmpty().withMessage("past_num_of_claims is required")
    .isInt({ min: 0 }).withMessage("past_num_of_claims must be a non-negative integer"),

  body("witness_present")
    .notEmpty().withMessage("witness_present is required")
    .isIn([0, 1]).withMessage("witness_present must be 0 or 1"),

  body("liab_prct")
    .notEmpty().withMessage("liab_prct is required")
    .isFloat({ min: 0, max: 100 }).withMessage("liab_prct must be between 0 and 100"),

  body("channel")
    .notEmpty().withMessage("channel is required")
    .isIn(["Phone", "Online", "Broker"])
    .withMessage("channel must be Phone, Online, or Broker"),

  body("police_report")
    .notEmpty().withMessage("police_report is required")
    .isIn([0, 1]).withMessage("police_report must be 0 or 1"),

  // ── Vehicle Info ─────────────────────────────────────────────────────────────
  body("age_of_vehicle")
    .notEmpty().withMessage("age_of_vehicle is required")
    .isInt({ min: 0, max: 30 }).withMessage("age_of_vehicle must be between 0 and 30"),

  body("vehicle_category")
    .notEmpty().withMessage("vehicle_category is required")
    .isIn(["Compact", "Medium", "Large"])
    .withMessage("vehicle_category must be Compact, Medium, or Large"),

  body("vehicle_price")
    .notEmpty().withMessage("vehicle_price is required")
    .isFloat({ min: 0 }).withMessage("vehicle_price must be a non-negative number"),

  body("vehicle_color")
    .notEmpty().withMessage("vehicle_color is required")
    .isIn(["silver", "black", "gray", "red", "white", "blue", "other"])
    .withMessage("vehicle_color must be a valid color"),

  // ── Financial ────────────────────────────────────────────────────────────────
  body("total_claim")
    .notEmpty().withMessage("total_claim is required")
    .isFloat({ min: 0 }).withMessage("total_claim must be a non-negative number"),

  body("injury_claim")
    .notEmpty().withMessage("injury_claim is required")
    .isFloat({ min: 0 }).withMessage("injury_claim must be a non-negative number"),

  body("policy_deductible")
    .notEmpty().withMessage("policy_deductible is required")
    .isIn([500, 1000, 2000]).withMessage("policy_deductible must be 500, 1000, or 2000"),

  body("annual_premium")
    .notEmpty().withMessage("annual_premium is required")
    .isFloat({ min: 0 }).withMessage("annual_premium must be a non-negative number"),

  body("days_open")
    .notEmpty().withMessage("days_open is required")
    .isFloat({ min: 0 }).withMessage("days_open must be a non-negative number"),

  body("form_defects")
    .notEmpty().withMessage("form_defects is required")
    .isInt({ min: 0 }).withMessage("form_defects must be a non-negative integer"),
];

/**
 * Validation rules for pagination query params.
 */
const historyQueryRules = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
  query("filter")
    .optional()
    .isIn(["fraud", "not_fraud"]).withMessage("filter must be fraud or not_fraud"),
];

/**
 * Validation rule for MongoDB ObjectId param.
 */
const idParamRule = [
  param("id")
    .isMongoId().withMessage("Invalid prediction ID format"),
];

/**
 * Middleware: runs after validation rules and returns errors if any.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error:   "Validation failed",
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { predictRules, historyQueryRules, idParamRule, validate };
