import express from "express";
import { superAdminLogin } from "../controllers/auth.controller.js";

const router = express.Router();

// SUPER ADMIN LOGIN
router.post("/super-admin/login", superAdminLogin);

export default router;
