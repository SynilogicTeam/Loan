import express from "express";
import protect from "../middelware/auth.js";
import { getAdminDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

/* ADMIN / SUPER ADMIN DASHBOARD */
router.get("/", protect, getAdminDashboard);

/* 🔥 SUPER ADMIN COMMUNITY STATS (MISSING) */
router.get("/community-stats", protect, async (req, res) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const Community = (await import("../models/Community.js")).default;
    const Member = (await import("../models/Member.js")).default;
    const Loan = (await import("../models/Loan.js")).default;
    const Contribution = (await import("../models/Contribution.js")).default;

    // Get all communities with aggregated data
    const communities = await Community.find();
    
    const communityStats = await Promise.all(
      communities.map(async (community) => {
        const totalMembers = await Member.countDocuments({ communityId: community._id });
        
        const totalContributions = await Contribution.aggregate([
          { $match: { communityId: community._id, status: "PAID" } },
          { $group: { _id: null, amount: { $sum: "$amount" } } }
        ]);

        const totalLoans = await Loan.aggregate([
          { $match: { communityId: community._id } },
          { $group: { _id: null, amount: { $sum: "$principalAmount" } } }
        ]);

        return {
          _id: community._id,
          name: community.name,
          totalMembers,
          totalContributions: totalContributions[0]?.amount || 0,
          totalLoans: totalLoans[0]?.amount || 0
        };
      })
    );

    res.json(communityStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
