import express from "express";
import {
  registerSuperAdmin,
  loginSuperAdmin,
  getSuperAdminProfile,
  updateSuperAdminProfile,
  viewAllPasswords,
  resetUserPassword,
} from "../controllers/superAdmin.controller.js";
import protect from "../middelware/auth.js";
import isSuperAdmin from "../middelware/isSuperAdmin.js";

const router = express.Router();

// Public routes
router.post("/register", registerSuperAdmin);
router.post("/login", loginSuperAdmin);

// Protected routes
router.get("/profile", protect, isSuperAdmin, getSuperAdminProfile);
router.put("/profile", protect, isSuperAdmin, updateSuperAdminProfile);

// 🔐 PASSWORD MANAGEMENT ROUTES (SUPER ADMIN ONLY)
router.get("/view-passwords", protect, isSuperAdmin, viewAllPasswords);
router.post("/reset-password", protect, isSuperAdmin, resetUserPassword);

export default router;