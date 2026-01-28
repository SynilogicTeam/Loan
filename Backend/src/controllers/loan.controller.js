import Loan from "../models/Loan.js";
import EMI from "../models/EMI.js";
import Session from "../models/Session.js";
import Member from "../models/Member.js";
import Ledger from "../models/Ledger.js";

/* =========================
   CREATE LOAN (ADMIN)
========================= */
export const createLoan = async (req, res) => {
  try {
    const { memberId, principalAmount, interestRate, durationMonths } = req.body;

    if (!memberId || !principalAmount || !interestRate || !durationMonths) {
      return res.status(400).json({ message: "All fields required" });
    }

    const session = await Session.findOne({
      communityId: req.user.communityId,
      isActive: true,
    });

    if (!session) {
      return res.status(400).json({ message: "No active session" });
    }

    // member belongs to same community
    const member = await Member.findOne({ _id: memberId, communityId: req.user.communityId });
    if (!member) {
      return res.status(400).json({ message: "Member not in your community" });
    }

    // simple interest
    const totalInterest =
      (principalAmount * interestRate * durationMonths) / (12 * 100);

    const totalPayable = principalAmount + totalInterest;
    const emiAmount = Math.round(totalPayable / durationMonths);

    const loan = await Loan.create({
      memberId,
      communityId: req.user.communityId,
      sessionId: session._id,
      principalAmount,
      interestRate,
      durationMonths,
      emiAmount,
      totalPayable,
      outstandingAmount: totalPayable,
    });

    // EMI schedule (safer date handling)
    const base = new Date(); // or session.startDate
    const emis = [];

    for (let i = 1; i <= durationMonths; i++) {
      const due = new Date(base);
      due.setMonth(due.getMonth() + i);

      emis.push({
        loanId: loan._id,
        memberId: loan.memberId,
        communityId: loan.communityId,
        sessionId: loan.sessionId,
        month: i,
        dueDate: due,
        amount: emiAmount,
        status: "PENDING"
      });
    }

    await EMI.insertMany(emis);

    // Create ledger entry for loan disbursement
    await Ledger.create({
      communityId: loan.communityId,
      sessionId: loan.sessionId,
      memberId: loan.memberId,
      type: "DEBIT",
      category: "LOAN",
      amount: loan.principalAmount,
      description: `Loan disbursed - ${loan.purpose || 'General'}`,
      balance: session.closingBalance - loan.principalAmount
    });

    // Update session balance
    session.closingBalance -= loan.principalAmount;
    await session.save();

    console.log(`✅ Loan created with ${emis.length} EMI records and ledger entry`);
      

    res.status(201).json({
      message: "Loan created successfully",
      loan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   PAY EMI
========================= */
export const payEmi = async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id);
    if (!emi) return res.status(404).json({ message: "EMI not found" });

    if (emi.status === "PAID") {
      return res.status(400).json({ message: "EMI already paid" });
    }

    emi.status = "PAID";
    emi.paidDate = new Date();
    await emi.save();

    const loan = await Loan.findById(emi.loanId);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    loan.outstandingAmount = Math.max(0, loan.outstandingAmount - emi.amount);

    if (loan.outstandingAmount === 0) {
      loan.status = "CLOSED";
    }

    await loan.save();

    // Create ledger entry for EMI payment
    await Ledger.create({
      communityId: loan.communityId,
      sessionId: loan.sessionId,
      memberId: loan.memberId,
      type: "CREDIT",
      category: "EMI",
      amount: emi.amount,
      description: `EMI Payment - Month ${emi.month}`,
      balance: session.closingBalance + emi.amount
    });

    // Update session balance
    session.closingBalance += emi.amount;
    await session.save();

    console.log(`✅ EMI payment processed: ₹${emi.amount} for Month ${emi.month}`);
      

    res.json({ message: "EMI paid successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
