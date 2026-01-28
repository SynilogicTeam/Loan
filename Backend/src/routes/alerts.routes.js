import express from "express";
import {
  getOverdueAlertsController,
  updateLateFees,
  getDashboardAlertsSummary,
  runScheduledUpdate
} from "../controllers/alerts.controller.js";
import protect from "../middelware/auth.js";
import isAdmin from "../middelware/isAdmin.js";
import isSuperAdmin from "../middelware/isSuperAdmin.js";

const router = express.Router();

/* ======================
   ADMIN ROUTES
====================== */
router.get("/overdue", protect, isAdmin, getOverdueAlertsController);
router.get("/dashboard-summary", protect, isAdmin, getDashboardAlertsSummary);
router.post("/update-late-fees", protect, isAdmin, updateLateFees);

/* ======================
   SUPER ADMIN ROUTES
====================== */
router.post("/run-scheduled-update", protect, isSuperAdmin, runScheduledUpdate);

export default router;