import express from "express";
import {
  exportMemberLedger,
  exportSessionSummary,
  exportInterestIncomeReport,
  exportExternalBorrowerLedger
} from "../controllers/export.controller.js";
import protect from "../middelware/auth.js";
import isAdmin from "../middelware/isAdmin.js";

const router = express.Router();

/* ======================
   EXPORT ROUTES
====================== */
router.get("/member-ledger/:memberId/:format", protect, isAdmin, exportMemberLedger);
router.get("/session-summary/:sessionId/:format", protect, isAdmin, exportSessionSummary);
router.get("/interest-income-report/:format", protect, isAdmin, exportInterestIncomeReport);
router.get("/external-borrower-ledger/:borrowerId/:format", protect, isAdmin, exportExternalBorrowerLedger);

export default router;