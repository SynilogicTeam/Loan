import mongoose from "mongoose";
import Member from "../models/Member.js";
import Contribution from "../models/Contribution.js";
import Loan from "../models/Loan.js";
import EMI from "../models/EMI.js";
import Session from "../models/Session.js";

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
        status: "PENDING",
        dueDate: { $lt: new Date() },
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

      return res.json({
        totalMembers,
        totalContributions: totalContributions[0]?.amount || 0,
        totalLoans: totalLoans[0]?.amount || 0,
        outstandingLoans: outstandingLoans[0]?.amount || 0,
        overdueEmis,
        openingBalance: sessionBalances[0]?.totalOpening || 0,
        closingBalance: sessionBalances[0]?.totalClosing || 0,
      });
    }

    /* =========================
       ADMIN DASHBOARD
    ========================= */
    if (!req.user?.communityId) {
      return res.status(401).json({ message: "Community not assigned" });
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
      status: "PENDING",
      dueDate: { $lt: new Date() },
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
    return res.status(500).json({ message: error.message });
  }
};
