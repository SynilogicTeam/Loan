import express from "express";
import protect from "../middelware/auth.js";
import isAdmin from "../middelware/isAdmin.js";
import checkPermission from "../middelware/checkPermission.js";

const router = express.Router();

/* GET ALL WITHDRAWAL REQUESTS (ADMIN) */
router.get("/", protect, isAdmin, checkPermission('manage_members'), async (req, res) => {
  try {
    console.log("🔍 ADMIN WITHDRAWAL REQUESTS:", {
      adminId: req.user.id,
      role: req.user.role
    });

    const Withdrawal = (await import("../models/Withdrawal.js")).default;
    const Member = (await import("../models/Member.js")).default;
    
    // Get admin's community
    const Admin = (await import("../models/Admin.js")).default;
    const admin = await Admin.findById(req.user.id);
    
    if (!admin) {
      console.log("❌ Admin not found:", req.user.id);
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.communityId) {
      console.log("❌ Admin has no community assigned:", req.user.id);
      return res.status(400).json({ message: "Admin is not assigned to any community" });
    }

    console.log("✅ Admin community found:", admin.communityId);

    // Get all withdrawal requests for admin's community
    const withdrawals = await Withdrawal.find({ 
      communityId: admin.communityId 
    })
    .populate('memberId', 'name phone email')
    .sort({ requestDate: -1 });

    console.log("✅ WITHDRAWAL REQUESTS FOUND:", withdrawals.length);

    // Filter out withdrawals with null memberId (data integrity issue)
    const validWithdrawals = withdrawals.filter(w => w.memberId);
    
    if (validWithdrawals.length !== withdrawals.length) {
      console.log("⚠️ Filtered out withdrawals with null memberId:", withdrawals.length - validWithdrawals.length);
    }

    res.json(validWithdrawals);
  } catch (error) {
    console.error("❌ ADMIN WITHDRAWAL REQUESTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* APPROVE WITHDRAWAL REQUEST */
router.put("/:withdrawalId/approve", protect, isAdmin, checkPermission('manage_members'), async (req, res) => {
  try {
    console.log("✅ APPROVE WITHDRAWAL REQUEST:", {
      withdrawalId: req.params.withdrawalId,
      adminId: req.user.id,
      body: req.body
    });

    const Withdrawal = (await import("../models/Withdrawal.js")).default;
    const { adminRemarks } = req.body;
    
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }
    
    if (withdrawal.status !== "PENDING") {
      return res.status(400).json({ message: "Withdrawal request is not pending" });
    }
    
    // Update withdrawal status
    withdrawal.status = "APPROVED";
    withdrawal.approvedDate = new Date();
    withdrawal.reviewedBy = req.user.id;
    withdrawal.reviewedDate = new Date();
    withdrawal.adminRemarks = adminRemarks || "Approved by admin";
    
    // Calculate repayment schedule
    withdrawal.calculateRepaymentSchedule();
    
    await withdrawal.save();
    
    console.log("✅ WITHDRAWAL APPROVED:", withdrawal._id);
    
    res.json({
      message: "Withdrawal request approved successfully",
      withdrawal
    });
    
  } catch (error) {
    console.error("❌ APPROVE WITHDRAWAL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* REJECT WITHDRAWAL REQUEST */
router.put("/:withdrawalId/reject", protect, isAdmin, checkPermission('manage_members'), async (req, res) => {
  try {
    console.log("❌ REJECT WITHDRAWAL REQUEST:", {
      withdrawalId: req.params.withdrawalId,
      adminId: req.user.id,
      body: req.body
    });

    const Withdrawal = (await import("../models/Withdrawal.js")).default;
    const { adminRemarks } = req.body;
    
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }
    
    if (withdrawal.status !== "PENDING") {
      return res.status(400).json({ message: "Withdrawal request is not pending" });
    }
    
    // Update withdrawal status
    withdrawal.status = "REJECTED";
    withdrawal.rejectedDate = new Date();
    withdrawal.reviewedBy = req.user.id;
    withdrawal.reviewedDate = new Date();
    withdrawal.adminRemarks = adminRemarks || "Rejected by admin";
    
    await withdrawal.save();
    
    console.log("❌ WITHDRAWAL REJECTED:", withdrawal._id);
    
    res.json({
      message: "Withdrawal request rejected",
      withdrawal
    });
    
  } catch (error) {
    console.error("❌ REJECT WITHDRAWAL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* MARK WITHDRAWAL AS DISBURSED */
router.put("/:withdrawalId/disburse", protect, isAdmin, checkPermission('manage_members'), async (req, res) => {
  try {
    console.log("💰 DISBURSE WITHDRAWAL:", {
      withdrawalId: req.params.withdrawalId,
      adminId: req.user.id,
      body: req.body
    });

    const Withdrawal = (await import("../models/Withdrawal.js")).default;
    const { disbursementMethod, transactionId, adminRemarks } = req.body;
    
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }
    
    if (withdrawal.status !== "APPROVED") {
      return res.status(400).json({ message: "Withdrawal request is not approved" });
    }
    
    // Update withdrawal status
    withdrawal.status = "DISBURSED";
    withdrawal.disbursedDate = new Date();
    withdrawal.disbursementMethod = disbursementMethod || "bank_transfer";
    withdrawal.transactionId = transactionId;
    withdrawal.adminRemarks = adminRemarks || "Amount disbursed successfully";
    
    await withdrawal.save();
    
    // Create ledger entry for disbursement
    const Ledger = (await import("../models/Ledger.js")).default;
    const Session = (await import("../models/Session.js")).default;
    
    const session = await Session.findById(withdrawal.sessionId);
    if (session) {
      const newBalance = session.closingBalance - withdrawal.amount;
      
      await Ledger.create({
        communityId: withdrawal.communityId,
        sessionId: session._id,
        memberId: withdrawal.memberId,
        type: "DEBIT",
        category: "WITHDRAWAL",
        amount: withdrawal.amount,
        description: `Withdrawal disbursed - ${withdrawal.reason.replace(/_/g, " ")}`,
        balance: newBalance
      });
      
      session.closingBalance = newBalance;
      await session.save();
      
      console.log("✅ LEDGER ENTRY CREATED AND SESSION UPDATED:", {
        newBalance,
        withdrawalAmount: withdrawal.amount
      });
    }
    
    console.log("💰 WITHDRAWAL DISBURSED:", withdrawal._id);
    
    res.json({
      message: "Withdrawal disbursed successfully",
      withdrawal
    });
    
  } catch (error) {
    console.error("❌ DISBURSE WITHDRAWAL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET WITHDRAWAL STATISTICS */
router.get("/stats", protect, isAdmin, async (req, res) => {
  try {
    const Withdrawal = (await import("../models/Withdrawal.js")).default;
    const Admin = (await import("../models/Admin.js")).default;
    
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const stats = await Withdrawal.aggregate([
      { $match: { communityId: admin.communityId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const formattedStats = {
      pending: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      disbursed: { count: 0, amount: 0 }
    };

    stats.forEach(stat => {
      const status = stat._id.toLowerCase();
      if (formattedStats[status]) {
        formattedStats[status] = {
          count: stat.count,
          amount: stat.totalAmount
        };
      }
    });

    res.json(formattedStats);
  } catch (error) {
    console.error("Withdrawal stats error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;