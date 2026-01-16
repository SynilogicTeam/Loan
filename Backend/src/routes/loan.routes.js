import express from "express";
import { createLoan, payEmi } from "../controllers/loan.controller.js";
import protect from "../middelware/auth.js";
import isAdmin from "../middelware/isAdmin.js";
import checkPermission from "../middelware/checkPermission.js";

const router = express.Router();

/* Admin creates loan - Requires 'manage_loans' permission */
router.post("/", protect, isAdmin, checkPermission('manage_loans'), createLoan);

/* Pay EMI */
router.put("/emi/pay/:id", protect, payEmi);

/* Get all loans (Admin/Super Admin) - Requires 'manage_loans' permission */
router.get("/", protect, isAdmin, checkPermission('manage_loans'), async (req, res) => {
  try {
    const Loan = (await import("../models/Loan.js")).default;
    
    let query = {};
    
    // Admin sees only their community loans
    if (req.user.role === "ADMIN") {
      query.communityId = req.user.communityId;
    }
    // Super Admin sees all loans (no filter)
    
    const loans = await Loan.find(query)
      .populate('memberId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Approve loan */
router.put("/:id/approve", protect, isAdmin, async (req, res) => {
  try {
    const Loan = (await import("../models/Loan.js")).default;
    const EMI = (await import("../models/EMI.js")).default;
    
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    
    // Check if admin can approve this loan
    if (req.user.role === "ADMIN" && loan.communityId.toString() !== req.user.communityId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (loan.status !== "PENDING") {
      return res.status(400).json({ message: "Loan is not in pending status" });
    }
    
    loan.status = "APPROVED";
    loan.approvedAt = new Date();
    loan.approvedBy = req.user.id;
    await loan.save();
    
    // Create EMI schedule when loan is approved
    const startDate = new Date();
    const emiRecords = [];
    
    for (let i = 1; i <= loan.duration; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      emiRecords.push({
        loanId: loan._id,
        memberId: loan.memberId,
        communityId: loan.communityId,
        sessionId: loan.sessionId,
        amount: loan.monthlyEMI,
        dueDate: dueDate,
        month: i,
        status: "PENDING"
      });
    }
    
    // Insert all EMI records
    await EMI.insertMany(emiRecords);
    
    console.log(`✅ Loan approved and ${emiRecords.length} EMI records created`);
    
    res.json({ 
      message: "Loan approved successfully", 
      loan,
      emisCreated: emiRecords.length
    });
  } catch (error) {
    console.error("Loan approval error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* Reject loan */
router.put("/:id/reject", protect, isAdmin, async (req, res) => {
  try {
    const Loan = (await import("../models/Loan.js")).default;
    
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    
    // Check if admin can reject this loan
    if (req.user.role === "ADMIN" && loan.communityId.toString() !== req.user.communityId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (loan.status !== "PENDING") {
      return res.status(400).json({ message: "Loan is not in pending status" });
    }
    
    loan.status = "REJECTED";
    loan.rejectedAt = new Date();
    loan.rejectedBy = req.user.id;
    loan.adminRemarks = req.body.adminRemarks || "Rejected by admin";
    await loan.save();
    
    res.json({ message: "Loan rejected", loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Cancel loan */
router.put("/:id/cancel", protect, isAdmin, checkPermission('manage_loans'), async (req, res) => {
  try {
    const Loan = (await import("../models/Loan.js")).default;
    const EMI = (await import("../models/EMI.js")).default;
    
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    
    // Check if admin can cancel this loan
    if (req.user.role === "ADMIN" && loan.communityId.toString() !== req.user.communityId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (!["APPROVED", "ACTIVE"].includes(loan.status)) {
      return res.status(400).json({ message: "Only approved or active loans can be cancelled" });
    }
    
    // Update loan status
    loan.status = "CANCELLED";
    loan.cancelledAt = new Date();
    loan.cancelledBy = req.user.id;
    loan.adminRemarks = req.body.adminRemarks || "Loan cancelled by admin";
    await loan.save();
    
    // Cancel all pending EMIs
    await EMI.updateMany(
      { loanId: loan._id, status: "PENDING" },
      { 
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: req.user.id
      }
    );
    
    console.log(`✅ Loan cancelled and pending EMIs updated`);
    
    res.json({ 
      message: "Loan cancelled successfully", 
      loan
    });
  } catch (error) {
    console.error("Loan cancellation error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
