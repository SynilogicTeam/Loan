import express from "express";
import {
  createSession,
  getActiveSession,
  closeSession,
  getSessionActivities,
  getSessionStats,
  getAllSessions,
  createSessionForCommunity,
} from "../controllers/session.controller.js";
import protect from "../middelware/auth.js";
import checkPermission from "../middelware/checkPermission.js";

const router = express.Router();

/* ADMIN + SUPER ADMIN */
router.post("/", protect, checkPermission('manage_sessions'), createSession);
router.get("/", protect, checkPermission('view_reports'), async (req, res) => {
  try {
    const Session = (await import("../models/Session.js")).default;
    let query = {};

    // For regular admin, filter by communityId
    if (req.user.role === "ADMIN") {
      if (!req.user.communityId) {
        // Admin has no community assigned - return empty array
        return res.json([]);
      }
      query.communityId = req.user.communityId;
    }

    const sessions = await Session.find(query)
      .populate('communityId', 'name')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ message: error.message });
  }
});
router.get("/active", protect, checkPermission('manage_sessions'), getActiveSession);
router.get("/activities", protect, checkPermission('view_reports'), getSessionActivities);
router.get("/stats", protect, checkPermission('view_reports'), getSessionStats);

/* SUPER ADMIN ONLY */
router.get("/all", protect, getAllSessions);
router.post("/create-for-community", protect, createSessionForCommunity);

/* ======================
   PLATFORM ROUTES FOR SUPER ADMIN
====================== */
router.get("/platform/all", protect, async (req, res) => {
  try {
    const Session = (await import("../models/Session.js")).default;

    const sessions = await Session.find()
      .populate('communityId', 'name')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error("Get platform sessions error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/platform/stats", protect, async (req, res) => {
  try {
    const Session = (await import("../models/Session.js")).default;

    const totalSessions = await Session.countDocuments();
    const activeSessions = await Session.countDocuments({ isActive: true });
    const closedSessions = await Session.countDocuments({ isActive: false });

    // Calculate total balance across all sessions
    const allSessions = await Session.find();
    const totalBalance = allSessions.reduce((sum, session) => sum + (session.closingBalance || 0), 0);

    res.json({
      totalSessions,
      activeSessions,
      closedSessions,
      totalBalance
    });
  } catch (error) {
    console.error("Get platform session stats error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/close/:id", protect, checkPermission('manage_sessions'), closeSession);

/* ======================
   CREATE SESSION FOR COMMUNITY (SUPER ADMIN)
====================== */
router.post("/create-for-community", protect, async (req, res) => {
  try {
    const { name, startDate, openingBalance, communityId } = req.body;

    if (!name || !startDate || !communityId) {
      return res.status(400).json({ message: "Name, start date, and community are required" });
    }

    const Session = (await import("../models/Session.js")).default;
    const Community = (await import("../models/Community.js")).default;

    // Verify community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if there's already an active session for this community
    const existingActive = await Session.findOne({
      communityId,
      isActive: true
    });

    if (existingActive) {
      return res.status(400).json({
        message: "Community already has an active session"
      });
    }

    const session = await Session.create({
      name,
      startDate: new Date(startDate),
      openingBalance: Number(openingBalance || 0),
      closingBalance: Number(openingBalance || 0),
      communityId,
      isActive: true
    });

    res.status(201).json({
      message: "Session created successfully",
      session
    });

  } catch (error) {
    console.error("Create session for community error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
