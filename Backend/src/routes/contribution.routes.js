import express from "express";
import {
  createContribution,
  payContribution,
  getMemberContributions,
} from "../controllers/contribution.controller.js";
import protect from "../middelware/auth.js";
import isAdmin from "../middelware/isAdmin.js";
import checkPermission from "../middelware/checkPermission.js";

const router = express.Router();

/* Admin creates contribution - Requires 'manage_contributions' permission */
router.post("/", protect, isAdmin, checkPermission('manage_contributions'), createContribution);

/* Pay contribution */
router.put("/pay/:id", protect, payContribution);

/* Member views contributions */
router.get("/my", protect, getMemberContributions);

/* Admin gets all community contributions - Requires 'manage_contributions' permission */
router.get("/", protect, isAdmin, checkPermission('manage_contributions'), async (req, res) => {
  try {
    const Contribution = (await import("../models/Contribution.js")).default;
    const Member = (await import("../models/Member.js")).default;
    
    let query = {};
    
    // Admin sees only their community contributions
    if (req.user.role === "ADMIN") {
      query.communityId = req.user.communityId;
    }
    // Super Admin sees all contributions (no filter)
    
    const contributions = await Contribution.find(query)
      .populate('memberId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
