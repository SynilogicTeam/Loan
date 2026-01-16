import Loan from "../models/Loan.js";
import EMI from "../models/EMI.js";
import Session from "../models/Session.js";
import Member from "../models/Member.js";

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
        month: i,
        dueDate: due,
        amount: emiAmount,
      });
    }

    await EMI.insertMany(emis);

    await Ledger.create({
        communityId: loan.communityId,
        sessionId: loan.sessionId,
        memberId: loan.memberId,
        type: "DEBIT",
        category: "LOAN",
        amount: loan.principalAmount,
        description: "Loan disbursed to member",
      });
      

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

    await Ledger.create({
        communityId: loan.communityId,
        sessionId: loan.sessionId,
        memberId: loan.memberId,
        type: "CREDIT",
        category: "EMI",
        amount: emi.amount,
        description: "Loan EMI received",
      });
      

    res.json({ message: "EMI paid successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
