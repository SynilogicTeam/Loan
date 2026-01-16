import express from "express";
import { getSessionLedger } from "../controllers/ledger.controller.js";
import protect from "../middelware/auth.js";

const router = express.Router();

/* ADMIN + SUPER ADMIN */
router.get("/", protect, getSessionLedger);

export default router;
