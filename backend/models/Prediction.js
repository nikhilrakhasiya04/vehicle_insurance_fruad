"use strict";

const mongoose = require("mongoose");

/**
 * Schema for storing each fraud prediction and its inputs.
 */
const predictionSchema = new mongoose.Schema(
  {
    // ── Input Features ────────────────────────────────────────────────────────
    inputData: {
      // Driver info
      age_of_driver:      { type: Number },
      gender:             { type: String, enum: ["M", "F"] },
      marital_status:     { type: Number, enum: [0, 1] },
      high_education:     { type: Number, enum: [0, 1] },
      annual_income:      { type: Number },
      safety_rating:      { type: Number },
      address_change:     { type: Number, enum: [0, 1] },
      property_status:    { type: String, enum: ["Own", "Rent"] },

      // Claim details
      claim_month:        { type: Number },
      claim_year:         { type: Number },
      claim_day_num:      { type: Number },
      claim_day_of_week:  { type: String },
      accident_site:      { type: String },
      past_num_of_claims: { type: Number },
      witness_present:    { type: Number, enum: [0, 1] },
      liab_prct:          { type: Number },
      channel:            { type: String },
      police_report:      { type: Number, enum: [0, 1] },

      // Vehicle info
      age_of_vehicle:     { type: Number },
      vehicle_category:   { type: String },
      vehicle_price:      { type: Number },
      vehicle_color:      { type: String },

      // Financial
      total_claim:        { type: Number },
      injury_claim:       { type: Number },
      policy_deductible:  { type: Number },
      annual_premium:     { type: Number },
      days_open:          { type: Number },
      form_defects:       { type: Number },
    },

    // ── Prediction Result ─────────────────────────────────────────────────────
    result: {
      prediction:             { type: Number, enum: [0, 1], required: true },
      label:                  { type: String, enum: ["Fraud", "Not Fraud"], required: true },
      fraud_probability:      { type: Number, required: true },
      not_fraud_probability:  { type: Number, required: true },
      confidence:             { type: Number, required: true },
      model_used:             { type: String },
    },

    // ── Meta ──────────────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["completed", "failed"],
      default: "completed",
    },
    errorMessage: { type: String },
    ipAddress:    { type: String },
  },
  {
    timestamps: true, // createdAt, updatedAt
    versionKey: false,
  }
);

// Indexes for common queries
predictionSchema.index({ createdAt: -1 });
predictionSchema.index({ "result.prediction": 1 });
predictionSchema.index({ "result.label": 1 });

module.exports = mongoose.model("Prediction", predictionSchema);
