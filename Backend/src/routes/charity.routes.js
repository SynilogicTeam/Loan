import express from "express";
import protect from "../middelware/auth.js";
import isAdmin from "../middelware/isAdmin.js";
import checkPermission from "../middelware/checkPermission.js";

const router = express.Router();

/* MEMBER CHARITY DONATION REQUEST */
router.post("/donate", protect, async (req, res) => {
  try {
    console.log("💝 CHARITY DONATION REQUEST:", {
      memberId: req.user.id,
      body: req.body
    });

    const Charity = (await import("../models/Charity.js")).default;
    const Member = (await import("../models/Member.js")).default;
    const Contribution = (await import("../models/Contribution.js")).default;
    const Session = (await import("../models/Session.js")).default;

    const {
      amount,
      charityName,
      charityDescription,
      recipientDetails,
      donationMethod,
      memberRemarks
    } = req.body;

    // Get member details
    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Get active session
    const session = await Session.findOne({ 
      communityId: member.communityId, 
      isActive: true 
    });
    if (!session) {
      return res.status(404).json({ message: "No active session found" });
    }

    // Calculate member's total contributions
    const totalContributions = await Contribution.aggregate([
      {
        $match: {
          memberId: member._id,
          communityId: member.communityId,
          status: "PAID"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const contributionAmount = totalContributions[0]?.total || 0;
    const maxDonation = Math.floor(contributionAmount * 0.3); // 30% of contributions

    // Validate donation amount
    if (amount > maxDonation) {
      return res.status(400).json({ 
        message: `Maximum donation allowed: ₹${maxDonation} (30% of your contributions: ₹${contributionAmount})` 
      });
    }

    if (amount < 100) {
      return res.status(400).json({ message: "Minimum donation amount is ₹100" });
    }

    // Create charity donation request
    const charity = await Charity.create({
      memberId: member._id,
      communityId: member.communityId,
      sessionId: session._id,
      amount,
      charityName,
      charityDescription,
      recipientDetails,
      donationMethod: donationMethod || "community_fund",
      memberRemarks: memberRemarks || "",
      status: "PENDING"
    });

    console.log("✅ CHARITY DONATION CREATED:", charity._id);

    res.json({
      message: "Charity donation request submitted successfully",
      charity,
      donationId: `CD-${charity._id.toString().slice(-6).toUpperCase()}`,
      maxDonationAllowed: maxDonation,
      totalContributions: contributionAmount
    });

  } catch (error) {
    console.error("❌ CHARITY DONATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET MEMBER'S CHARITY DONATIONS */
router.get("/my-donations", protect, async (req, res) => {
  try {
    const Charity = (await import("../models/Charity.js")).default;
    
    const donations = await Charity.find({ memberId: req.user.id })
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error("Member donations error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET ALL CHARITY DONATIONS (ADMIN) - Multiple endpoints for compatibility */
router.get("/", protect, isAdmin, checkPermission('manage_members'), async (req, res) => {
  try {
    console.log("🔍 ADMIN CHARITY DONATIONS:", {
      adminId: req.user.id,
      role: req.user.role
    });

    const Charity = (await import("../models/Charity.js")).default;
    const Admin = (await import("../models/Admin.js")).default;
    
    // Get admin's community
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Get all charity donations for admin's community
    const donations = await Charity.find({ 
      communityId: admin.communityId 
    })
    .populate('memberId', 'name phone email')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });

    console.log("✅ CHARITY DONATIONS FOUND:", donations.length);

    res.json(donations);
  } catch (error) {
    console.error("❌ ADMIN CHARITY DONATIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET ALL CHARITY DONATIONS (ADMIN) - Alternative endpoint for mobile */
router.get("/admin/requests", protect, isAdmin, checkPermission('manage_members'), async (req, res) => {
  try {
    console.log("🔍 ADMIN CHARITY REQUESTS (MOBILE):", {
      adminId: req.user.id,
      role: req.user.role
    });

    const Charity = (await import("../models/Charity.js")).default;
    const Admin = (await import("../models/Admin.js")).default;
    
    // Get admin's community
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Get all charity donations for admin's community
    const donations = await Charity.find({ 
      communityId: admin.communityId 
    })
    .populate('memberId', 'name phone email')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });

    console.log("✅ CHARITY REQUESTS FOUND:", donations.length);

    res.json(donations);
  } catch (error) {
    console.error("❌ ADMIN CHARITY REQUESTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* APPROVE CHARITY DONATION */
router.put("/:donationId/approve", protect, isAdmin, checkPermission('manage_members'), async (req, res) => {
  try {
    console.log("✅ APPROVE CHARITY DONATION:", {
      donationId: req.params.donationId,
      adminId: req.user.id,
      body: req.body
    });

    const Charity = (await import("../models/Charity.js")).default;
    const mongoose = (await import("mongoose")).default;
    const { adminRemarks, receiptNumber } = req.body;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.donationId)) {
      return res.status(400).json({ message: "Invalid donation ID format" });
    }
    
    const donation = await Charity.findById(req.params.donationId);
    if (!donation) {
      return res.status(404).json({ message: "Charity donation not found" });
    }
    
    if (donation.status !== "PENDING") {
      return res.status(400).json({ message: "Donation is not pending" });
    }
    
    // Update donation status
    donation.status = "APPROVED";
    donation.approvedAt = new Date();
    donation.approvedBy = req.user.id;
    donation.adminRemarks = adminRemarks || "Approved by admin";
    donation.receiptNumber = receiptNumber || `RCP-${Date.now()}`;
    
    await donation.save();
    
    console.log("✅ CHARITY DONATION APPROVED:", donation._id);
    
    res.json({
      message: "Charity donation approved successfully",
      donation
    });
    
  } catch (error) {
    console.error("❌ APPROVE CHARITY DONATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* REJECT CHARITY DONATION */
router.put("/:donationId/reject", protect, isAdmin, checkPermission('manage_members'), async (req, res) => {
  try {
    console.log("❌ REJECT CHARITY DONATION:", {
      donationId: req.params.donationId,
      adminId: req.user.id,
      body: req.body
    });

    const Charity = (await import("../models/Charity.js")).default;
    const mongoose = (await import("mongoose")).default;
    const { adminRemarks } = req.body;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.donationId)) {
      return res.status(400).json({ message: "Invalid donation ID format" });
    }
    
    const donation = await Charity.findById(req.params.donationId);
    if (!donation) {
      return res.status(404).json({ message: "Charity donation not found" });
    }
    
    if (donation.status !== "PENDING") {
      return res.status(400).json({ message: "Donation is not pending" });
    }
    
    // Update donation status
    donation.status = "REJECTED";
    donation.approvedBy = req.user.id;
    donation.approvedAt = new Date();
    donation.adminRemarks = adminRemarks || "Rejected by admin";
    
    await donation.save();
    
    console.log("❌ CHARITY DONATION REJECTED:", donation._id);
    
    res.json({
      message: "Charity donation rejected",
      donation
    });
    
  } catch (error) {
    console.error("❌ REJECT CHARITY DONATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* DISBURSE CHARITY DONATION */
router.put("/:donationId/disburse", protect, isAdmin, checkPermission('manage_members'), async (req, res) => {
  try {
    console.log("💰 DISBURSE CHARITY DONATION:", {
      donationId: req.params.donationId,
      adminId: req.user.id,
      body: req.body
    });

    const Charity = (await import("../models/Charity.js")).default;
    const mongoose = (await import("mongoose")).default;
    const { transactionId, adminRemarks } = req.body;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.donationId)) {
      return res.status(400).json({ message: "Invalid donation ID format" });
    }
    
    const donation = await Charity.findById(req.params.donationId);
    if (!donation) {
      return res.status(404).json({ message: "Charity donation not found" });
    }
    
    if (donation.status !== "APPROVED") {
      return res.status(400).json({ message: "Donation is not approved" });
    }
    
    // Update donation status
    donation.status = "DISBURSED";
    donation.disbursedAt = new Date();
    donation.transactionId = transactionId || `TXN-${Date.now()}`;
    donation.adminRemarks = adminRemarks || "Amount disbursed to charity";
    
    await donation.save();
    
    // Create ledger entry for charity donation
    const Ledger = (await import("../models/Ledger.js")).default;
    const Session = (await import("../models/Session.js")).default;
    
    const session = await Session.findById(donation.sessionId);
    if (session) {
      const newBalance = session.closingBalance - donation.amount;
      
      await Ledger.create({
        communityId: donation.communityId,
        sessionId: session._id,
        memberId: donation.memberId,
        type: "DEBIT",
        category: "CHARITY",
        amount: donation.amount,
        description: `Charity donation - ${donation.charityName.replace(/_/g, " ")} - ${donation.charityDescription}`,
        balance: newBalance
      });
      
      session.closingBalance = newBalance;
      await session.save();
      
      console.log("✅ LEDGER ENTRY CREATED AND SESSION UPDATED:", {
        newBalance,
        donationAmount: donation.amount
      });
    }
    
    console.log("💰 CHARITY DONATION DISBURSED:", donation._id);
    
    res.json({
      message: "Charity donation disbursed successfully",
      donation
    });
    
  } catch (error) {
    console.error("❌ DISBURSE CHARITY DONATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET CHARITY STATISTICS */
router.get("/stats", protect, isAdmin, async (req, res) => {
  try {
    const Charity = (await import("../models/Charity.js")).default;
    const Admin = (await import("../models/Admin.js")).default;
    
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const stats = await Charity.aggregate([
      { $match: { communityId: admin.communityId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const charityByType = await Charity.aggregate([
      { $match: { communityId: admin.communityId } },
      {
        $group: {
          _id: "$charityName",
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

    res.json({
      statusStats: formattedStats,
      charityTypes: charityByType
    });
  } catch (error) {
    console.error("Charity stats error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET CHARITY STATISTICS - Alternative endpoint for mobile */
router.get("/admin/stats", protect, isAdmin, async (req, res) => {
  try {
    const Charity = (await import("../models/Charity.js")).default;
    const Admin = (await import("../models/Admin.js")).default;
    
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const stats = await Charity.aggregate([
      { $match: { communityId: admin.communityId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const charityByType = await Charity.aggregate([
      { $match: { communityId: admin.communityId } },
      {
        $group: {
          _id: "$charityName",
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
    console.error("Charity admin stats error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;