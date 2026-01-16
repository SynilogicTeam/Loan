import express from "express";
import {
  createSocialFund,
  getAllSocialFunds,
  getSocialFund,
  updateSocialFund,
  contributeToSocialFund,
  addExpense,
  getSocialFundStats,
  getAllSocialFundsForSuperAdmin,
  getPlatformSocialFundStats,
} from "../controllers/socialfund.controller.js";
import protect from "../middelware/auth.js";
import checkPermission from "../middelware/checkPermission.js";
import isSuperAdmin from "../middelware/isSuperAdmin.js";

const router = express.Router();

/* ======================
   ADMIN ROUTES
====================== */
router.post("/", protect, checkPermission('manage_social_funds'), createSocialFund);
router.get("/", protect, checkPermission('view_social_funds'), getAllSocialFunds);
router.get("/stats", protect, checkPermission('view_reports'), getSocialFundStats);
router.get("/:id", protect, checkPermission('view_social_funds'), getSocialFund);
router.put("/:id", protect, checkPermission('manage_social_funds'), updateSocialFund);
router.post("/:id/contribute", protect, checkPermission('manage_social_funds'), contributeToSocialFund);
router.post("/:id/expense", protect, checkPermission('manage_social_funds'), addExpense);

/* ======================
   SUPER ADMIN ROUTES
====================== */
router.get("/platform/all", protect, isSuperAdmin, getAllSocialFundsForSuperAdmin);
router.get("/platform/stats", protect, isSuperAdmin, getPlatformSocialFundStats);

export default router;