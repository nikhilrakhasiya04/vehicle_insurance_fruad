"use strict";

const { Router } = require("express");
const controller = require("../controllers/predictionController");
const {
  predictRules,
  historyQueryRules,
  idParamRule,
  validate,
} = require("../validations/predictionValidation");

const router = Router();

// ── Stats (must come before :id to avoid conflict) ───────────────────────────
router.get("/stats/summary",     controller.getStats);
router.get("/model-performance", controller.getModelPerformance);
router.get("/ml-health",         controller.getMLHealth);

// ── Core CRUD ─────────────────────────────────────────────────────────────────
router.post(
  "/predict",
  predictRules,
  validate,
  controller.predict
);

router.get(
  "/history",
  historyQueryRules,
  validate,
  controller.getHistory
);

router.get(
  "/:id",
  idParamRule,
  validate,
  controller.getById
);

router.delete(
  "/:id",
  idParamRule,
  validate,
  controller.deletePrediction
);

module.exports = router;
