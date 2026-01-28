import express from "express";
import {
  createMember,
  loginMember,
  getMembers,
  registerMember,
} from "../controllers/member.controller.js";

import protect from "../middelware/auth.js";
import isAdmin from "../middelware/isAdmin.js";
import checkPermission from "../middelware/checkPermission.js";

const router = express.Router();

/* GET ALL MEMBERS (ADMIN PANEL) - Requires 'manage_members' permission */
router.get("/", protect, isAdmin, checkPermission('manage_members'), getMembers);

/* CREATE MEMBER - Requires 'manage_members' permission */
router.post("/", protect, isAdmin, checkPermission('manage_members'), createMember);

/* MEMBER LOGIN */
router.post("/login", loginMember);

/* MEMBER REGISTRATION */
router.post("/register", registerMember);

/* GET MEMBER CONTRIBUTIONS */
router.get("/contributions", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("💰 MEMBER CONTRIBUTIONS REQUEST:", { memberId: req.user.id });

    const Contribution = (await import("../models/Contribution.js")).default;
    
    // Get member contributions
    const contributions = await Contribution.find({ memberId: req.user.id })
      .populate('sessionId', 'name startDate endDate')
      .sort({ createdAt: -1 });

    console.log("✅ MEMBER CONTRIBUTIONS FOUND:", contributions.length);

    res.json(contributions);
  } catch (error) {
    console.error("❌ MEMBER CONTRIBUTIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/contribution-status", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const Member = (await import("../models/Member.js")).default;
    const Community = (await import("../models/Community.js")).default;
    const Contribution = (await import("../models/Contribution.js")).default;

    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const community = await Community.findById(member.communityId);

    const now = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const currentMonthName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    const paidContribution = await Contribution.findOne({
      memberId: req.user.id,
      month: currentMonthName,
      status: "PAID",
    });

    const fixedSettings = community?.settings?.contributions || {};
    const fixedEnabled = !!fixedSettings.fixedEnabled;
    const fixedAmount = fixedSettings.fixedAmount || 0;
    const fixedDueDay = fixedSettings.fixedDueDay || null;

    let overdue = false;
    if (fixedEnabled && !paidContribution && fixedDueDay) {
      const todayDay = now.getDate();
      if (todayDay > fixedDueDay) {
        overdue = true;
      }
    }

    res.json({
      fixedContributionEnabled: fixedEnabled,
      fixedContributionAmount: fixedAmount,
      fixedContributionDueDay: fixedDueDay,
      isPaidForCurrentMonth: !!paidContribution,
      isOverdue: overdue,
      currentMonth: currentMonthName,
    });
  } catch (error) {
    console.error("Member contribution status error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET MEMBER LOANS */
router.get("/loans", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("🏦 MEMBER LOANS REQUEST:", { memberId: req.user.id });

    const Loan = (await import("../models/Loan.js")).default;
    
    // Get member loans
    const loans = await Loan.find({ memberId: req.user.id })
      .sort({ createdAt: -1 });

    console.log("✅ MEMBER LOANS FOUND:", loans.length);

    res.json(loans);
  } catch (error) {
    console.error("❌ MEMBER LOANS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET MEMBER PROFILE */
router.get("/profile", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("👤 MEMBER PROFILE REQUEST:", { memberId: req.user.id });

    const Member = (await import("../models/Member.js")).default;
    const Contribution = (await import("../models/Contribution.js")).default;
    const Session = (await import("../models/Session.js")).default;
    
    // Get member details
    const member = await Member.findById(req.user.id).select('-password');
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Get active session for balance calculation
    const session = await Session.findOne({
      communityId: member.communityId,
      isActive: true
    });

    // Calculate total contributions and count
    const contributionStats = await Contribution.aggregate([
      {
        $match: {
          memberId: member._id,
          status: "PAID"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const contributionAmount = contributionStats[0]?.total || 0;
    const contributionCount = contributionStats[0]?.count || 0;
    
    // Calculate trust score based on contributions and activity
    let trustScore = 50; // Base score
    if (contributionAmount > 0) trustScore += 20;
    if (contributionAmount > 10000) trustScore += 15;
    if (contributionAmount > 25000) trustScore += 15;
    trustScore = Math.min(trustScore, 100);

    const profileData = {
      _id: member._id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      memberId: `MEM-${member._id.toString().slice(-6).toUpperCase()}`,
      balance: contributionAmount,
      trustScore: trustScore,
      communityId: member.communityId,
      joinedAt: member.createdAt,
      totalContributions: contributionAmount,
      contributionCount: contributionCount,
      isActive: member.isActive || true
    };

    console.log("✅ MEMBER PROFILE LOADED:", profileData.name);

    res.json(profileData);

  } catch (error) {
    console.error("❌ MEMBER PROFILE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* UPDATE MEMBER PROFILE */
router.put("/profile", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    console.log('🔄 Member profile update request:', req.user.id);
    console.log('📝 Update data:', req.body);

    const { name, email, phone, currentPassword, newPassword } = req.body;
    
    const Member = (await import("../models/Member.js")).default;
    
    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // If email is being changed, check if it already exists
    if (email && email !== member.email) {
      const emailExists = await Member.findOne({ 
        email, 
        _id: { $ne: req.user.id } 
      });
      if (emailExists) {
        return res.status(400).json({ 
          message: "A member with this email already exists" 
        });
      }
    }

    // If password is being changed, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          message: "Current password is required to change password" 
        });
      }

      const passwordMatch = await member.matchPassword(currentPassword);
      if (!passwordMatch) {
        return res.status(400).json({ 
          message: "Current password is incorrect" 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          message: "New password must be at least 6 characters long" 
        });
      }
    }

    // Update fields
    if (name) member.name = name;
    if (email) member.email = email;
    if (phone) member.phone = phone;
    if (newPassword) member.password = newPassword;

    await member.save();

    console.log('✅ Member profile updated successfully:', member.email);

    // Return updated profile without password
    const updatedMember = await Member.findById(req.user.id).select("-password");

    res.json({
      message: "Profile updated successfully",
      member: updatedMember
    });

  } catch (error) {
    console.error("Update member profile error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ 
        message: "A member with this email already exists" 
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});

/* PROFILE UPDATE REQUEST */
router.post("/profile-update-request", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, phone, reason } = req.body;
    
    if (!reason || (!name && !phone)) {
      return res.status(400).json({ message: "Reason and at least one field to update are required" });
    }

    console.log("Profile update request:", {
      memberId: req.user.id,
      currentData: { name, phone },
      reason,
      requestedAt: new Date()
    });

    res.json({ 
      message: "Profile update request submitted successfully. Admin will review and approve.",
      requestId: `REQ-${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* MAKE CONTRIBUTION */
router.post("/contribution", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("🔍 CONTRIBUTION REQUEST BODY:", req.body);
    console.log("🔍 USER INFO:", { id: req.user.id, role: req.user.role });

    const { amount, month, paymentMethod, remarks, paymentId, orderId, signature } = req.body;
    
    if (!amount || !month || !paymentMethod) {
      console.log("❌ VALIDATION FAILED:", { amount: !!amount, month: !!month, paymentMethod: !!paymentMethod });
      return res.status(400).json({ message: "Amount, month, and payment method are required" });
    }

    const Contribution = (await import("../models/Contribution.js")).default;
    const Session = (await import("../models/Session.js")).default;
    
    // Get member's community
    const Member = (await import("../models/Member.js")).default;
    const member = await Member.findById(req.user.id);
    
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    console.log("✅ MEMBER FOUND:", { name: member.name, communityId: member.communityId });

    // Get active session for the community
    const session = await Session.findOne({
      communityId: member.communityId,
      isActive: true
    });

    if (!session) {
      return res.status(400).json({ message: "No active session found for your community" });
    }

    console.log("✅ SESSION FOUND:", { name: session.name, balance: session.closingBalance });

    // Convert YYYY-MM format to readable month name
    let monthName = month;
    if (month.includes('-')) {
      const [year, monthNum] = month.split('-');
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      monthName = `${monthNames[parseInt(monthNum) - 1]} ${year}`;
    }

    console.log("📅 MONTH CONVERSION:", { original: month, converted: monthName });

    // Check if contribution already exists for this month
    const existingContribution = await Contribution.findOne({
      memberId: req.user.id,
      sessionId: session._id,
      month: monthName
    });

    if (existingContribution) {
      return res.status(400).json({ message: "Contribution for this month already exists" });
    }

    // Determine contribution status based on payment method
    let contributionStatus = "PAID";
    let paidAt = new Date();
    
    if (paymentMethod === "online") {
      // For online payments, verify if payment details are provided
      if (paymentId && orderId) {
        contributionStatus = "PAID";
        console.log("💳 Online payment details:", { paymentId, orderId });
      } else {
        contributionStatus = "PENDING";
        paidAt = null;
        console.log("⏳ Online payment pending verification");
      }
    }

    // Create contribution record
    const contribution = await Contribution.create({
      memberId: req.user.id,
      communityId: member.communityId,
      sessionId: session._id,
      amount: parseFloat(amount),
      month: monthName,
      paymentMethod: paymentMethod,
      remarks: remarks || "",
      status: contributionStatus,
      paidAt: paidAt,
      // Payment details for online payments
      paymentId: paymentId || null,
      orderId: orderId || null,
      signature: signature || null
    });

    console.log("✅ CONTRIBUTION CREATED:", contribution._id);

    // Create ledger entry and update session balance only for PAID contributions
    if (contributionStatus === "PAID") {
      const Ledger = (await import("../models/Ledger.js")).default;
      const newBalance = session.closingBalance + parseFloat(amount);
      
      await Ledger.create({
        communityId: member.communityId,
        sessionId: session._id,
        memberId: req.user.id,
        type: "CREDIT",
        category: "CONTRIBUTION",
        amount: parseFloat(amount),
        description: `Monthly contribution - ${monthName} (${paymentMethod})`,
        balance: newBalance
      });

      console.log("✅ LEDGER ENTRY CREATED");

      // Update session balance
      session.closingBalance = newBalance;
      await session.save();

      console.log("✅ SESSION BALANCE UPDATED:", newBalance);
    }

    res.status(201).json({
      message: "Contribution recorded successfully",
      contribution,
      paymentStatus: contributionStatus === "PAID" ? "Payment confirmed" : "Payment verification pending"
    });

  } catch (error) {
    console.error("❌ CONTRIBUTION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* APPLY FOR LOAN */
router.post("/loan-application", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("🔍 LOAN APPLICATION REQUEST BODY:", req.body);
    console.log("🔍 USER INFO:", { id: req.user.id, role: req.user.role });

    const { amount, purpose, duration, guarantor1, guarantor2, monthlyIncome, remarks } = req.body;
    
    if (!amount || !purpose || !duration || !guarantor1 || !guarantor2 || !monthlyIncome) {
      console.log("❌ LOAN VALIDATION FAILED:", { 
        amount: !!amount, 
        purpose: !!purpose, 
        duration: !!duration, 
        guarantor1: !!guarantor1, 
        guarantor2: !!guarantor2, 
        monthlyIncome: !!monthlyIncome 
      });
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const Loan = (await import("../models/Loan.js")).default;
    const Session = (await import("../models/Session.js")).default;
    const Member = (await import("../models/Member.js")).default;
    
    // Get member's community
    const member = await Member.findById(req.user.id);
    
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    console.log("✅ MEMBER FOUND:", { name: member.name, communityId: member.communityId });

    // Get active session
    const session = await Session.findOne({
      communityId: member.communityId,
      isActive: true
    });

    if (!session) {
      return res.status(400).json({ message: "No active session found for your community" });
    }

    console.log("✅ SESSION FOUND:", { name: session.name });

    // Check if member has any pending loan applications
    const pendingLoan = await Loan.findOne({
      memberId: req.user.id,
      status: { $in: ["PENDING", "ACTIVE"] }
    });

    if (pendingLoan) {
      return res.status(400).json({ message: "You already have a pending or active loan" });
    }

    // Calculate EMI
    const principal = parseFloat(amount);
    const rate = 12 / 100 / 12; // 12% annual rate
    const months = parseInt(duration);
    const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalAmount = Math.round(emi * months);

    console.log("💰 LOAN CALCULATIONS:", { principal, months, emi: Math.round(emi), totalAmount });

    // Create loan application
    const loan = await Loan.create({
      memberId: req.user.id,
      communityId: member.communityId,
      sessionId: session._id,
      principalAmount: principal,
      interestRate: 12,
      duration: months,
      monthlyEMI: Math.round(emi),
      totalAmount: totalAmount,
      purpose: purpose,
      guarantor1: guarantor1,
      guarantor2: guarantor2,
      monthlyIncome: parseFloat(monthlyIncome),
      remarks: remarks || "",
      status: "PENDING",
      appliedAt: new Date(),
      outstandingAmount: principal
    });

    console.log("✅ LOAN APPLICATION CREATED:", loan._id);

    res.status(201).json({
      message: "Loan application submitted successfully",
      loan,
      emi: Math.round(emi),
      totalAmount: totalAmount
    });

  } catch (error) {
    console.error("❌ LOAN APPLICATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET MEMBER TRANSACTIONS */
router.get("/transactions", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { from, to, type } = req.query;
    
    const Contribution = (await import("../models/Contribution.js")).default;
    const Loan = (await import("../models/Loan.js")).default;
    const EMI = (await import("../models/EMI.js")).default;

    let transactions = [];

    // Get contributions - only if they exist
    let contributionQuery = { memberId: req.user.id };
    if (from && to) {
      contributionQuery.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to + "T23:59:59.999Z")
      };
    }

    const contributions = await Contribution.find(contributionQuery).sort({ createdAt: -1 });
    contributions.forEach(contrib => {
      if (!type || type === "all" || type === "CONTRIBUTION") {
        transactions.push({
          id: contrib._id,
          date: contrib.createdAt,
          type: "CONTRIBUTION",
          description: `Monthly Contribution - ${contrib.month}`,
          amount: contrib.amount,
          status: contrib.status,
          method: contrib.paymentMethod
        });
      }
    });

    // Get loans - only if they exist
    const loans = await Loan.find({ memberId: req.user.id }).sort({ createdAt: -1 });
    loans.forEach(loan => {
      if (loan.status === "ACTIVE" && (!type || type === "all" || type === "LOAN_DISBURSED")) {
        transactions.push({
          id: loan._id,
          date: loan.disbursedAt || loan.createdAt,
          type: "LOAN_DISBURSED",
          description: `Loan Disbursement - ${loan.purpose}`,
          amount: -loan.principalAmount,
          status: loan.status
        });
      }
    });

    // Get EMI payments - only if they exist
    const emis = await EMI.find({ memberId: req.user.id }).sort({ createdAt: -1 });
    emis.forEach(emi => {
      if (emi.status === "PAID" && (!type || type === "all" || type === "EMI_PAYMENT")) {
        transactions.push({
          id: emi._id,
          date: emi.paidDate,
          type: "EMI_PAYMENT",
          description: `Loan EMI Payment`,
          amount: emi.amount,
          status: emi.status
        });
      }
    });

    // Sort by date
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Return empty array for new members - no demo data
    res.json(transactions);

  } catch (error) {
    console.error("Transactions error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* CONTACT ADMIN */
router.post("/contact-admin", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { subject, category, message, priority } = req.body;
    
    if (!subject || !category || !message) {
      return res.status(400).json({ message: "Subject, category, and message are required" });
    }

    console.log("Support ticket created:", {
      memberId: req.user.id,
      subject,
      category,
      message,
      priority: priority || "normal",
      createdAt: new Date()
    });

    res.json({
      message: "Message sent successfully. Admin will respond within 24 hours.",
      ticketId: `TICKET-${Date.now()}`
    });

  } catch (error) {
    console.error("Contact admin error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* REQUEST WITHDRAWAL */
router.post("/withdrawal-request", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("🔍 WITHDRAWAL REQUEST BODY:", req.body);
    console.log("🔍 USER INFO:", { id: req.user.id, role: req.user.role });

    const { amount, reason, urgency, guarantor, repaymentPlan, remarks } = req.body;
    
    if (!amount || !reason || !urgency || !guarantor || !repaymentPlan) {
      console.log("❌ WITHDRAWAL VALIDATION FAILED:", { 
        amount: !!amount, 
        reason: !!reason, 
        urgency: !!urgency, 
        guarantor: !!guarantor, 
        repaymentPlan: !!repaymentPlan 
      });
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const Withdrawal = (await import("../models/Withdrawal.js")).default;
    const Member = (await import("../models/Member.js")).default;
    const Contribution = (await import("../models/Contribution.js")).default;
    const Session = (await import("../models/Session.js")).default;
    
    // Get member's community and contribution history
    const member = await Member.findById(req.user.id);
    
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    console.log("✅ MEMBER FOUND:", { name: member.name, communityId: member.communityId });

    // Get active session
    const session = await Session.findOne({
      communityId: member.communityId,
      isActive: true
    });

    if (!session) {
      return res.status(400).json({ message: "No active session found for your community" });
    }

    // Calculate member's total contributions
    const totalContributions = await Contribution.aggregate([
      {
        $match: {
          memberId: req.user.id,
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
    const maxWithdrawal = Math.floor(contributionAmount * 0.8); // 80% of contributions

    console.log("💰 CONTRIBUTION CALCULATION:", { contributionAmount, maxWithdrawal, requestedAmount: parseFloat(amount) });

    if (parseFloat(amount) > maxWithdrawal) {
      return res.status(400).json({ 
        message: `Withdrawal amount exceeds limit. Maximum allowed: ₹${maxWithdrawal} (80% of your contributions: ₹${contributionAmount})` 
      });
    }

    // Check if member has any pending withdrawal requests
    const pendingWithdrawal = await Withdrawal.findOne({
      memberId: req.user.id,
      status: { $in: ["PENDING", "APPROVED"] }
    });

    if (pendingWithdrawal) {
      return res.status(400).json({ message: "You already have a pending withdrawal request" });
    }

    // Calculate processing fee for emergency requests
    let processingFee = 0;
    if (urgency === "emergency") {
      processingFee = Math.round(parseFloat(amount) * 0.01); // 1% processing fee
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      memberId: req.user.id,
      communityId: member.communityId,
      sessionId: session._id,
      amount: parseFloat(amount),
      reason: reason,
      urgency: urgency,
      guarantor: guarantor,
      repaymentPlan: repaymentPlan,
      remarks: remarks || "",
      processingFee: processingFee,
      status: "PENDING",
      requestDate: new Date(),
      eligibleAmount: maxWithdrawal,
      contributionHistory: contributionAmount
    });

    console.log("✅ WITHDRAWAL REQUEST CREATED:", withdrawal._id);

    res.status(201).json({
      message: "Withdrawal request submitted successfully",
      withdrawal,
      requestId: `WD-${withdrawal._id.toString().slice(-6).toUpperCase()}`,
      processingFee: processingFee
    });

  } catch (error) {
    console.error("❌ WITHDRAWAL REQUEST ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET MEMBER WITHDRAWALS */
router.get("/withdrawals", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const Withdrawal = (await import("../models/Withdrawal.js")).default;
    
    const withdrawals = await Withdrawal.find({ memberId: req.user.id })
      .sort({ requestDate: -1 });
    
    res.json(withdrawals);
  } catch (error) {
    console.error("Member withdrawals error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET MEMBER EMIS */
router.get("/emis", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("📋 MEMBER EMIS REQUEST:", { memberId: req.user.id });

    const EMI = (await import("../models/EMI.js")).default;
    
    const emis = await EMI.find({ memberId: req.user.id })
      .sort({ month: 1 }); // Sort by month ascending
    
    // Calculate late fees for overdue EMIs
    const today = new Date();
    const updatedEmis = await Promise.all(emis.map(async (emi) => {
      if (emi.status === "PENDING" && emi.dueDate < today) {
        // Calculate late fee: ₹100 per day after due date
        const daysLate = Math.floor((today - emi.dueDate) / (1000 * 60 * 60 * 24));
        const lateFee = daysLate * 100;
        
        // Update EMI with late fee and overdue status
        emi.lateFee = lateFee;
        emi.status = "OVERDUE";
        await emi.save();
        
        console.log(`⚠️ EMI ${emi._id} marked overdue with ₹${lateFee} late fee (${daysLate} days)`);
      }
      return emi;
    }));
    
    console.log(`✅ MEMBER EMIS FOUND: ${updatedEmis.length}`);
    
    res.json(updatedEmis);
  } catch (error) {
    console.error("❌ MEMBER EMIS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* PAY EMI */
router.post("/pay-emi/:emiId", protect, async (req, res) => {
  try {
    console.log("💳 EMI PAYMENT REQUEST:", {
      emiId: req.params.emiId,
      userId: req.user.id,
      body: req.body
    });

    if (req.user.role !== "MEMBER") {
      console.log("❌ EMI PAYMENT: Access denied - not a member");
      return res.status(403).json({ message: "Access denied" });
    }

    const EMI = (await import("../models/EMI.js")).default;
    const { paymentMethod, paymentId, orderId } = req.body;
    
    const emi = await EMI.findById(req.params.emiId);
    if (!emi) {
      console.log("❌ EMI PAYMENT: EMI not found");
      return res.status(404).json({ message: "EMI not found" });
    }
    
    console.log("✅ EMI FOUND:", {
      emiId: emi._id,
      memberId: emi.memberId,
      currentStatus: emi.status,
      amount: emi.amount
    });
    
    if (emi.memberId.toString() !== req.user.id.toString()) {
      console.log("❌ EMI PAYMENT: Member ID mismatch", {
        emiMemberId: emi.memberId.toString(),
        requestUserId: req.user.id.toString()
      });
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (emi.status === "PAID") {
      console.log("❌ EMI PAYMENT: Already paid");
      return res.status(400).json({ message: "EMI already paid" });
    }
    
    // Calculate total amount including late fees
    const totalAmount = emi.amount + (emi.lateFee || 0);
    console.log("💰 PAYMENT CALCULATION:", {
      emiAmount: emi.amount,
      lateFee: emi.lateFee || 0,
      totalAmount
    });
    
    // Update EMI status
    emi.status = "PAID";
    emi.paidDate = new Date();
    emi.paymentMethod = paymentMethod || "online";
    emi.paymentId = paymentId;
    emi.orderId = orderId;
    await emi.save();
    
    console.log("✅ EMI STATUS UPDATED TO PAID");
    
    // Create ledger entry
    const Ledger = (await import("../models/Ledger.js")).default;
    const Session = (await import("../models/Session.js")).default;
    const Member = (await import("../models/Member.js")).default;
    
    const member = await Member.findById(req.user.id);
    const session = await Session.findById(emi.sessionId);
    
    if (member && session) {
      const newBalance = session.closingBalance + totalAmount;
      
      await Ledger.create({
        communityId: member.communityId,
        sessionId: session._id,
        memberId: member._id,
        type: "CREDIT",
        category: "EMI",
        amount: totalAmount,
        description: `EMI Payment - Month ${emi.month}${emi.lateFee > 0 ? ` (includes ₹${emi.lateFee} late fee)` : ''}`,
        balance: newBalance
      });
      
      session.closingBalance = newBalance;
      await session.save();
      
      console.log("✅ LEDGER ENTRY CREATED AND SESSION UPDATED:", {
        newBalance,
        ledgerAmount: totalAmount
      });
    }
    
    console.log("✅ EMI PAYMENT COMPLETED SUCCESSFULLY");
    
    res.json({
      message: "EMI paid successfully",
      emi,
      totalAmountPaid: totalAmount
    });
    
  } catch (error) {
    console.error("❌ EMI PAYMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* PAY FULL LOAN (PREPAYMENT) */
router.post("/pay-full-loan/:loanId", protect, async (req, res) => {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const Loan = (await import("../models/Loan.js")).default;
    const EMI = (await import("../models/EMI.js")).default;
    const { paymentMethod, paymentId, orderId } = req.body;
    
    const loan = await Loan.findById(req.params.loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    
    if (loan.memberId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (loan.status !== "APPROVED" && loan.status !== "ACTIVE") {
      return res.status(400).json({ message: "Loan is not active" });
    }
    
    // Calculate prepayment amount (remaining principal + 2% prepayment charge)
    const remainingAmount = loan.outstandingAmount;
    const prepaymentCharge = Math.round(remainingAmount * 0.02);
    const totalPrepayment = remainingAmount + prepaymentCharge;
    
    // Mark loan as completed
    loan.status = "COMPLETED";
    loan.completedAt = new Date();
    loan.outstandingAmount = 0;
    loan.prepaymentAmount = totalPrepayment;
    loan.prepaymentCharge = prepaymentCharge;
    await loan.save();
    
    // Mark all pending EMIs as cancelled
    await EMI.updateMany(
      { loanId: loan._id, status: { $in: ["PENDING", "OVERDUE"] } },
      { status: "CANCELLED", cancelledAt: new Date() }
    );
    
    // Create ledger entry
    const Ledger = (await import("../models/Ledger.js")).default;
    const Session = (await import("../models/Session.js")).default;
    const Member = (await import("../models/Member.js")).default;
    
    const member = await Member.findById(req.user.id);
    const session = await Session.findById(loan.sessionId);
    
    if (member && session) {
      const newBalance = session.closingBalance + totalPrepayment;
      
      await Ledger.create({
        communityId: member.communityId,
        sessionId: session._id,
        memberId: member._id,
        type: "CREDIT",
        category: "LOAN",
        amount: totalPrepayment,
        description: `Full loan prepayment (Principal: ₹${remainingAmount}, Charge: ₹${prepaymentCharge})`,
        balance: newBalance
      });
      
      session.closingBalance = newBalance;
      await session.save();
    }
    
    res.json({
      message: "Loan paid in full successfully",
      loan,
      prepaymentDetails: {
        remainingAmount,
        prepaymentCharge,
        totalPrepayment
      }
    });
    
  } catch (error) {
    console.error("Full loan payment error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
