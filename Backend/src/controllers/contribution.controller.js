import Contribution from "../models/Contribution.js";
import Session from "../models/Session.js";
import Member from "../models/Member.js";
import Ledger from "../models/Ledger.js";

/* =========================
   CREATE MONTHLY CONTRIBUTION (ADMIN)
========================= */
export const createContribution = async (req, res) => {
  try {
    const { memberId, month, amount, dueDate } = req.body;

    const session = await Session.findOne({
      communityId: req.user.communityId,
      isActive: true,
    });

    if (!session) {
      return res.status(400).json({ message: "No active session" });
    }

    const contribution = await Contribution.create({
      memberId,
      communityId: req.user.communityId,
      sessionId: session._id,
      month,
      amount,
      dueDate,
    });

    res.status(201).json({
      message: "Contribution created",
      contribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   PAY CONTRIBUTION (ADMIN / MEMBER)
========================= */
export const payContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    let lateFee = 0;
    const today = new Date();

    if (today > contribution.dueDate) {
      lateFee = 50; // 🔥 later configurable
    }

    contribution.status = "PAID";
    contribution.paidDate = today;
    contribution.lateFee = lateFee;

    await contribution.save();
    
/* after contribution save */
    await Ledger.create({
      communityId: contribution.communityId,
      sessionId: contribution.sessionId,
      memberId: contribution.memberId,
      type: "CREDIT",
      category: "CONTRIBUTION",
      amount: contribution.amount + contribution.lateFee,
      description: "Monthly contribution received",
    });

    res.json({
      message: "Contribution paid",
      contribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   MEMBER CONTRIBUTION LIST
========================= */
export const getMemberContributions = async (req, res) => {
  try {
    const list = await Contribution.find({
      memberId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
