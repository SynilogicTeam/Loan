import express from "express";
import Community from "../models/Community.js";   // ✅ MISSING IMPORT
import { createCommunity, createCommunityByAdmin } from "../controllers/community.controller.js";
import protect from "../middelware/auth.js";
import isSuperAdmin from "../middelware/isSuperAdmin.js";
import isAdmin from "../middelware/isAdmin.js";

const router = express.Router();

/* ======================
   SUPER ADMIN → CREATE COMMUNITY
====================== */
router.post("/", protect, isSuperAdmin, createCommunity);

/* ======================
   ADMIN → CREATE COMMUNITY
====================== */
router.post("/create", protect, isAdmin, createCommunityByAdmin);

/* ======================
   SUPER ADMIN → GET ALL COMMUNITIES
====================== */
router.get("/", protect, isSuperAdmin, async (req, res) => {
  try {
    const communities = await Community.find();
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
