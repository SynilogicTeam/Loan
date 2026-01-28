import mongoose from "mongoose";
import Member from "../models/Member.js";
import Contribution from "../models/Contribution.js";
import Loan from "../models/Loan.js";
import EMI from "../models/EMI.js";
import Session from "../models/Session.js";
import Community from "../models/Community.js";

export const getAdminDashboard = async (req, res) => {
  try {
    /* =========================
       SUPER ADMIN DASHBOARD
    ========================= */
    if (req.user.role === "SUPER_ADMIN") {
      // Get aggregated data across all communities
      const totalMembers = await Member.countDocuments({});

      const totalContributions = await Contribution.aggregate([
        { $match: { status: "PAID" } },
        { $group: { _id: null, amount: { $sum: "$amount" } } },
      ]);

      const totalLoans = await Loan.aggregate([
        { $group: { _id: null, amount: { $sum: "$principalAmount" } } },
      ]);

      const outstandingLoans = await Loan.aggregate([
        { $match: { status: "ACTIVE" } },
        { $group: { _id: null, amount: { $sum: "$outstandingAmount" } } },
      ]);

      const overdueEmis = await EMI.countDocuments({
        status: "OVERDUE"
      });

      // Get total opening and closing balances from all active sessions
      const sessionBalances = await Session.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalOpening: { $sum: "$openingBalance" },
            totalClosing: { $sum: "$closingBalance" }
          }
        },
      ]);

      // Get community-wise data for the table
      const communities = await Community.aggregate([
        {
          $lookup: {
            from: "members",
            localField: "_id",
            foreignField: "communityId",
            as: "members"
          }
        },
        {
          $lookup: {
            from: "contributions",
            localField: "_id",
            foreignField: "communityId",
            as: "contributions"
          }
        },
        {
          $lookup: {
            from: "loans",
            localField: "_id",
            foreignField: "communityId",
            as: "loans"
          }
        },
        {
          $lookup: {
            from: "sessions",
            localField: "_id",
            foreignField: "communityId",
            as: "sessions"
          }
        },
        {
          $addFields: {
            memberCount: { $size: "$members" },
            totalContributions: {
              $sum: {
                $map: {
                  input: { $filter: { input: "$contributions", cond: { $eq: ["$$this.status", "PAID"] } } },
                  as: "contrib",
                  in: "$$contrib.amount"
                }
              }
            },
            totalLoans: {
              $sum: {
                $map: {
                  input: "$loans",
                  as: "loan",
                  in: "$$loan.principalAmount"
                }
              }
            },
            balance: {
              $sum: {
                $map: {
                  input: { $filter: { input: "$sessions", cond: { $eq: ["$$this.isActive", true] } } },
                  as: "session",
                  in: "$$session.closingBalance"
                }
              }
            }
          }
        },
        {
          $project: {
            name: 1,
            memberCount: 1,
            totalContributions: 1,
            totalLoans: 1,
            balance: 1
          }
        }
      ]);

      return res.json({
        totalMembers,
        totalContributions: totalContributions[0]?.amount || 0,
        totalLoans: totalLoans[0]?.amount || 0,
        outstandingLoans: outstandingLoans[0]?.amount || 0,
        overdueEmis,
        openingBalance: sessionBalances[0]?.totalOpening || 0,
        closingBalance: sessionBalances[0]?.totalClosing || 0,
        communities: communities || []
      });
    }

    /* =========================
       ADMIN DASHBOARD
    ========================= */
    if (!req.user?.communityId) {
      console.log("⚠️ Admin has no community - returning empty dashboard stats");
      // ✅ FIX: Don't return 401, return empty stats so admin can see dashboard and create community
      return res.json({
        totalMembers: 0,
        totalContributions: 0,
        totalLoans: 0,
        outstandingLoans: 0,
        overdueEmis: 0,
        openingBalance: 0,
        closingBalance: 0,
      });
    }

    const communityId = new mongoose.Types.ObjectId(req.user.communityId);

    const session = await Session.findOne({ communityId, isActive: true });
    if (!session) {
      return res.status(200).json({
        totalMembers: 0,
        totalContributions: 0,
        totalLoans: 0,
        outstandingLoans: 0,
        overdueEmis: 0,
        openingBalance: 0,
        closingBalance: 0,
      });
    }

    const totalMembers = await Member.countDocuments({ communityId });

    const totalContributions = await Contribution.aggregate([
      { $match: { communityId, sessionId: session._id, status: "PAID" } },
      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]);

    const totalLoans = await Loan.aggregate([
      { $match: { communityId, sessionId: session._id } },
      { $group: { _id: null, amount: { $sum: "$principalAmount" } } },
    ]);

    const outstandingLoans = await Loan.aggregate([
      { $match: { communityId, status: "ACTIVE" } },
      { $group: { _id: null, amount: { $sum: "$outstandingAmount" } } },
    ]);

    const overdueEmis = await EMI.countDocuments({
      communityId,
      sessionId: session._id,
      status: "OVERDUE"
    });

    return res.json({
      totalMembers,
      totalContributions: totalContributions[0]?.amount || 0,
      totalLoans: totalLoans[0]?.amount || 0,
      outstandingLoans: outstandingLoans[0]?.amount || 0,
      overdueEmis,
      openingBalance: session.openingBalance,
      closingBalance: session.closingBalance,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ message: error.message });
  }
};
