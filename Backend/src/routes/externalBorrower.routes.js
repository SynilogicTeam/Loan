import express from "express";
import {
  createExternalBorrower,
  getExternalBorrowers,
  getExternalBorrower,
  updateExternalBorrower,
  verifyExternalBorrower,
  deleteExternalBorrower,
  getBorrowerStatistics
} from "../controllers/externalBorrower.controller.js";
import protect from "../middelware/auth.js";
import isAdmin from "../middelware/isAdmin.js";
import isSuperAdmin from "../middelware/isSuperAdmin.js";

const router = express.Router();

/* ======================
   ADMIN ROUTES
====================== */
router.post("/", protect, isAdmin, createExternalBorrower);
router.get("/", protect, isAdmin, getExternalBorrowers);
router.get("/statistics", protect, isAdmin, getBorrowerStatistics);
router.get("/:id", protect, isAdmin, getExternalBorrower);
router.put("/:id", protect, isAdmin, updateExternalBorrower);
router.put("/:id/verify", protect, isAdmin, verifyExternalBorrower);
router.delete("/:id", protect, isAdmin, deleteExternalBorrower);

export default router;