import express from "express";
import {
  createExternalLoan,
  getExternalLoans,
  getExternalLoan,
  approveExternalLoan,
  disburseExternalLoan,
  rejectExternalLoan,
  getExternalLoanStatistics
} from "../controllers/externalLoan.controller.js";
import protect from "../middelware/auth.js";
import isAdmin from "../middelware/isAdmin.js";
import isSuperAdmin from "../middelware/isSuperAdmin.js";

const router = express.Router();

/* ======================
   ADMIN ROUTES
====================== */
router.post("/", protect, isAdmin, createExternalLoan);
router.get("/", protect, isAdmin, getExternalLoans);
router.get("/statistics", protect, isAdmin, getExternalLoanStatistics);
router.get("/:id", protect, isAdmin, getExternalLoan);
router.put("/:id/approve", protect, isAdmin, approveExternalLoan);
router.put("/:id/disburse", protect, isAdmin, disburseExternalLoan);
router.put("/:id/reject", protect, isAdmin, rejectExternalLoan);

export default router;