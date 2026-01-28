import ExternalLoan from "../models/ExternalLoan.js";
import ExternalBorrower from "../models/ExternalBorrower.js";
import ExternalEMI from "../models/ExternalEMI.js";

/* =========================
   CREATE EXTERNAL LOAN
========================= */
export const createExternalLoan = async (req, res) => {
  try {
    const {
      borrowerId,
      principalAmount,
      interestRate,
      interestType,
      duration,
      purpose,
      collateral,
      processingFee,
      riskAssessment
    } = req.body;

    // Verify borrower exists and is verified
    const borrower = await ExternalBorrower.findById(borrowerId);
    if (!borrower) {
      return res.status(404).json({ message: "Borrower not found" });
    }

    if (!borrower.isVerified) {
      return res.status(400).json({ message: "Borrower must be verified before loan approval" });
    }

    // Calculate EMI and total amount
    const monthlyInterestRate = interestRate / 12 / 100;
    let monthlyEMI;
    let totalAmount;

    if (interestType === 'SIMPLE') {
      const totalInterest = (principalAmount * interestRate * duration) / (12 * 100);
      totalAmount = principalAmount + totalInterest;
      monthlyEMI = totalAmount / duration;
    } else {
      // Compound interest EMI calculation
      monthlyEMI = principalAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, duration) / 
                   (Math.pow(1 + monthlyInterestRate, duration) - 1);
      totalAmount = monthlyEMI * duration;
    }

    const loan = await ExternalLoan.create({
      borrowerId,
      principalAmount,
      interestRate,
      interestType,
      duration,
      monthlyEMI: Math.round(monthlyEMI),
      totalAmount: Math.round(totalAmount),
      outstandingAmount: Math.round(totalAmount),
      purpose,
      collateral,
      processingFee: processingFee || 0,
      riskAssessment,
      approvedBy: req.user.id
    });

    await loan.populate('borrowerId', 'name email phone');
    await loan.populate('approvedBy', 'name');

    res.status(201).json({
      message: "External loan created successfully",
      loan
    });
  } catch (error) {
    console.error("Create external loan error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET ALL EXTERNAL LOANS
========================= */
export const getExternalLoans = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, borrowerId } = req.query;

    let query = {};
    if (status) query.status = status;
    if (borrowerId) query.borrowerId = borrowerId;

    const loans = await ExternalLoan.find(query)
      .populate('borrowerId', 'name email phone creditScore riskCategory')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ExternalLoan.countDocuments(query);

    res.json({
      loans,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get external loans error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET SINGLE LOAN
========================= */
export const getExternalLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await ExternalLoan.findById(id)
      .populate('borrowerId')
      .populate('approvedBy', 'name');

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Get EMI details
    const emis = await ExternalEMI.find({ loanId: id })
      .sort({ emiNumber: 1 });

    res.json({
      loan,
      emis
    });
  } catch (error) {
    console.error("Get external loan error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   APPROVE LOAN
========================= */
export const approveExternalLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminRemarks } = req.body;

    const loan = await ExternalLoan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status !== 'PENDING') {
      return res.status(400).json({ message: "Only pending loans can be approved" });
    }

    // Update loan status
    loan.status = 'APPROVED';
    loan.approvedAt = new Date();
    loan.approvedBy = req.user.id;
    if (adminRemarks) loan.adminRemarks = adminRemarks;

    await loan.save();

    // Generate EMI schedule
    await generateEMISchedule(loan);

    await loan.populate('borrowerId', 'name email phone');
    await loan.populate('approvedBy', 'name');

    res.json({
      message: "Loan approved successfully",
      loan
    });
  } catch (error) {
    console.error("Approve external loan error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DISBURSE LOAN
========================= */
export const disburseExternalLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { disbursementRemarks } = req.body;

    const loan = await ExternalLoan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status !== 'APPROVED') {
      return res.status(400).json({ message: "Only approved loans can be disbursed" });
    }

    loan.status = 'ACTIVE';
    loan.disbursedAt = new Date();
    if (disbursementRemarks) loan.adminRemarks += ` | Disbursement: ${disbursementRemarks}`;

    await loan.save();

    res.json({
      message: "Loan disbursed successfully",
      loan
    });
  } catch (error) {
    console.error("Disburse external loan error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   REJECT LOAN
========================= */
export const rejectExternalLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminRemarks } = req.body;

    const loan = await ExternalLoan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status !== 'PENDING') {
      return res.status(400).json({ message: "Only pending loans can be rejected" });
    }

    loan.status = 'REJECTED';
    loan.adminRemarks = adminRemarks || 'Loan rejected';

    await loan.save();

    res.json({
      message: "Loan rejected successfully",
      loan
    });
  } catch (error) {
    console.error("Reject external loan error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GENERATE EMI SCHEDULE
========================= */
async function generateEMISchedule(loan) {
  try {
    const emis = [];
    const startDate = new Date();
    
    for (let i = 1; i <= loan.duration; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      let principalAmount, interestAmount;

      if (loan.interestType === 'SIMPLE') {
        principalAmount = loan.principalAmount / loan.duration;
        interestAmount = loan.monthlyEMI - principalAmount;
      } else {
        // For compound interest, calculate reducing balance
        const remainingPrincipal = loan.principalAmount * Math.pow(1 + (loan.interestRate / 12 / 100), i - 1);
        interestAmount = remainingPrincipal * (loan.interestRate / 12 / 100);
        principalAmount = loan.monthlyEMI - interestAmount;
      }

      const emi = new ExternalEMI({
        loanId: loan._id,
        borrowerId: loan.borrowerId,
        emiNumber: i,
        principalAmount: Math.round(principalAmount),
        interestAmount: Math.round(interestAmount),
        totalAmount: loan.monthlyEMI,
        dueDate,
        status: 'PENDING'
      });

      emis.push(emi);
    }

    await ExternalEMI.insertMany(emis);
    console.log(`Generated ${emis.length} EMIs for external loan ${loan.loanNumber}`);
  } catch (error) {
    console.error("Generate EMI schedule error:", error);
    throw error;
  }
}

/* =========================
   GET LOAN STATISTICS
========================= */
export const getExternalLoanStatistics = async (req, res) => {
  try {
    const totalLoans = await ExternalLoan.countDocuments();
    const activeLoans = await ExternalLoan.countDocuments({ status: 'ACTIVE' });
    const completedLoans = await ExternalLoan.countDocuments({ status: 'COMPLETED' });
    const defaultedLoans = await ExternalLoan.countDocuments({ status: 'DEFAULTED' });

    // Total amounts
    const totalDisbursed = await ExternalLoan.aggregate([
      { $match: { status: { $in: ['ACTIVE', 'COMPLETED'] } } },
      { $group: { _id: null, total: { $sum: '$principalAmount' } } }
    ]);

    const totalOutstanding = await ExternalLoan.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: null, total: { $sum: '$outstandingAmount' } } }
    ]);

    // Interest income
    const interestIncome = await ExternalEMI.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$interestAmount' } } }
    ]);

    // Late fee income
    const lateFeeIncome = await ExternalEMI.aggregate([
      { $match: { status: 'PAID', lateFee: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$lateFee' } } }
    ]);

    res.json({
      totalLoans,
      activeLoans,
      completedLoans,
      defaultedLoans,
      totalDisbursed: totalDisbursed[0]?.total || 0,
      totalOutstanding: totalOutstanding[0]?.total || 0,
      interestIncome: interestIncome[0]?.total || 0,
      lateFeeIncome: lateFeeIncome[0]?.total || 0
    });
  } catch (error) {
    console.error("Get external loan statistics error:", error);
    res.status(500).json({ message: error.message });
  }
};