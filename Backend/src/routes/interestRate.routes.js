import express from "express";
import {
  createInterestRateConfig,
  getInterestRateConfigs,
  getInterestRateConfig,
  updateInterestRateConfig,
  deleteInterestRateConfig,
  getConfigByType
} from "../controllers/interestRate.controller.js";
import protect from "../middelware/auth.js";
import isAdmin from "../middelware/isAdmin.js";
import isSuperAdmin from "../middelware/isSuperAdmin.js";

const router = express.Router();

/* ======================
   ADMIN ROUTES
====================== */
router.post("/", protect, isAdmin, createInterestRateConfig);
router.get("/", protect, isAdmin, getInterestRateConfigs);
router.get("/:id", protect, isAdmin, getInterestRateConfig);
router.put("/:id", protect, isAdmin, updateInterestRateConfig);
router.delete("/:id", protect, isAdmin, deleteInterestRateConfig);

/* ======================
   PUBLIC ROUTES (for loan calculation)
====================== */
router.get("/community/:communityId/type/:loanType", getConfigByType);

export default router;