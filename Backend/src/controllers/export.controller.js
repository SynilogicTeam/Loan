import {
  exportMemberLedgerToPDF,
  exportMemberLedgerToExcel,
  exportSessionSummaryToPDF,
  exportSessionSummaryToExcel,
  exportInterestIncomeReportToPDF,
  exportExternalBorrowerLedgerToPDF
} from "../services/exportService.js";

/* =========================
   EXPORT MEMBER LEDGER
========================= */
export const exportMemberLedger = async (req, res) => {
  try {
    const { memberId, format } = req.params;
    const { startDate, endDate } = req.query;

    // Get member data
    const Member = (await import("../models/Member.js")).default;
    const Ledger = (await import("../models/Ledger.js")).default;

    const member = await Member.findById(memberId).populate('communityId', 'name');
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Check access for regular admin
    if (req.user.role === "ADMIN" && req.user.communityId) {
      if (member.communityId._id.toString() !== req.user.communityId.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Get transactions
    let query = { memberId };
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await Ledger.find(query).sort({ createdAt: 1 });

    let exportData;
    let filename;
    let contentType;

    if (format === 'pdf') {
      exportData = await exportMemberLedgerToPDF(member, transactions);
      filename = `member-ledger-${member.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      contentType = 'application/pdf';
    } else if (format === 'excel') {
      exportData = await exportMemberLedgerToExcel(member, transactions);
      filename = `member-ledger-${member.name.replace(/\s+/g, '-')}-${Date.now()}.xlsx`;
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      return res.status(400).json({ message: "Invalid format. Use 'pdf' or 'excel'" });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(exportData));

  } catch (error) {
    console.error("Export member ledger error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   EXPORT SESSION SUMMARY
========================= */
export const exportSessionSummary = async (req, res) => {
  try {
    const { sessionId, format } = req.params;

    // Get session data
    const Session = (await import("../models/Session.js")).default;
    const Contribution = (await import("../models/Contribution.js")).default;
    const Loan = (await import("../models/Loan.js")).default;
    const EMI = (await import("../models/EMI.js")).default;

    const session = await Session.findById(sessionId).populate('communityId', 'name');
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check access for regular admin
    if (req.user.role === "ADMIN" && req.user.communityId) {
      if (session.communityId._id.toString() !== req.user.communityId.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Get session data
    const contributions = await Contribution.find({ sessionId })
      .populate('memberId', 'name')
      .sort({ createdAt: -1 });

    const loans = await Loan.find({ sessionId })
      .populate('memberId', 'name')
      .sort({ createdAt: -1 });

    const emis = await EMI.find({ sessionId, status: 'PAID' });

    // Calculate summary
    const summary = {
      totalContributions: contributions.reduce((sum, c) => sum + c.amount, 0),
      totalLoansDisbursed: loans.filter(l => l.status === 'ACTIVE' || l.status === 'COMPLETED')
        .reduce((sum, l) => sum + l.principalAmount, 0),
      totalEMICollected: emis.reduce((sum, e) => sum + e.amount, 0),
      totalInterestIncome: emis.reduce((sum, e) => sum + (e.interestAmount || 0), 0),
      totalLateFeeIncome: contributions.reduce((sum, c) => sum + (c.lateFee || 0), 0) +
        emis.reduce((sum, e) => sum + (e.lateFee || 0), 0)
    };

    let exportData;
    let filename;
    let contentType;

    if (format === 'pdf') {
      exportData = await exportSessionSummaryToPDF(session, summary);
      filename = `session-summary-${session.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      contentType = 'application/pdf';
    } else if (format === 'excel') {
      exportData = await exportSessionSummaryToExcel(session, summary, contributions, loans);
      filename = `session-summary-${session.name.replace(/\s+/g, '-')}-${Date.now()}.xlsx`;
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      return res.status(400).json({ message: "Invalid format. Use 'pdf' or 'excel'" });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(exportData));

  } catch (error) {
    console.error("Export session summary error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   EXPORT INTEREST INCOME REPORT
========================= */
export const exportInterestIncomeReport = async (req, res) => {
  try {
    const { format } = req.params;
    const { startDate, endDate, communityId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    // Build query
    let query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    // For regular admin, filter by communityId
    if (req.user.role === "ADMIN" && req.user.communityId) {
      query.communityId = req.user.communityId;
    } else if (communityId) {
      query.communityId = communityId;
    }

    // Get data
    const EMI = (await import("../models/EMI.js")).default;
    const Contribution = (await import("../models/Contribution.js")).default;
    const Community = (await import("../models/Community.js")).default;

    const emis = await EMI.find({ ...query, status: 'PAID' });
    const contributions = await Contribution.find(query);

    let communityName = 'All Communities';
    if (query.communityId) {
      const community = await Community.findById(query.communityId);
      communityName = community?.name || 'Unknown Community';
    }

    // Calculate totals
    const totalInterestIncome = emis.reduce((sum, e) => sum + (e.interestAmount || 0), 0);
    const totalLateFeeIncome = contributions.reduce((sum, c) => sum + (c.lateFee || 0), 0) +
      emis.reduce((sum, e) => sum + (e.lateFee || 0), 0);

    // Monthly breakdown
    const monthlyBreakdown = {};
    
    emis.forEach(emi => {
      const month = new Date(emi.paidDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!monthlyBreakdown[month]) {
        monthlyBreakdown[month] = { interestIncome: 0, lateFeeIncome: 0 };
      }
      monthlyBreakdown[month].interestIncome += emi.interestAmount || 0;
      monthlyBreakdown[month].lateFeeIncome += emi.lateFee || 0;
    });

    contributions.forEach(contribution => {
      const month = new Date(contribution.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!monthlyBreakdown[month]) {
        monthlyBreakdown[month] = { interestIncome: 0, lateFeeIncome: 0 };
      }
      monthlyBreakdown[month].lateFeeIncome += contribution.lateFee || 0;
    });

    const reportData = {
      startDate,
      endDate,
      communityName,
      totalInterestIncome,
      totalLateFeeIncome,
      monthlyBreakdown: Object.entries(monthlyBreakdown).map(([month, data]) => ({
        month,
        interestIncome: data.interestIncome,
        lateFeeIncome: data.lateFeeIncome,
        totalIncome: data.interestIncome + data.lateFeeIncome
      }))
    };

    if (format === 'pdf') {
      const exportData = await exportInterestIncomeReportToPDF(reportData);
      const filename = `interest-income-report-${Date.now()}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(Buffer.from(exportData));
    } else {
      return res.status(400).json({ message: "Only PDF format is supported for interest income report" });
    }

  } catch (error) {
    console.error("Export interest income report error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   EXPORT EXTERNAL BORROWER LEDGER
========================= */
export const exportExternalBorrowerLedger = async (req, res) => {
  try {
    const { borrowerId, format } = req.params;

    // Get borrower data
    const ExternalBorrower = (await import("../models/ExternalBorrower.js")).default;
    const ExternalLoan = (await import("../models/ExternalLoan.js")).default;
    const ExternalEMI = (await import("../models/ExternalEMI.js")).default;

    const borrower = await ExternalBorrower.findById(borrowerId);
    if (!borrower) {
      return res.status(404).json({ message: "Borrower not found" });
    }

    const loans = await ExternalLoan.find({ borrowerId }).sort({ createdAt: -1 });
    const emis = await ExternalEMI.find({ borrowerId }).sort({ emiNumber: 1 });

    if (format === 'pdf') {
      const exportData = await exportExternalBorrowerLedgerToPDF(borrower, loans, emis);
      const filename = `external-borrower-ledger-${borrower.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(Buffer.from(exportData));
    } else {
      return res.status(400).json({ message: "Only PDF format is supported for external borrower ledger" });
    }

  } catch (error) {
    console.error("Export external borrower ledger error:", error);
    res.status(500).json({ message: error.message });
  }
};