import Ledger from "../models/Ledger.js";
import Session from "../models/Session.js";

/* =========================
   GET SESSION LEDGER
========================= */
export const getSessionLedger = async (req, res) => {
  try {
    // Super admin can see all ledger entries
    if (req.user.role === "SUPER_ADMIN") {
      const ledger = await Ledger.find({}).sort({ createdAt: -1 }).limit(50);
      return res.json(ledger);
    }

    // Regular admin needs communityId
    if (!req.user?.communityId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const session = await Session.findOne({
      communityId: req.user.communityId,
      isActive: true,
    });

    if (!session) {
      return res.status(400).json({ message: "No active session" });
    }

    const ledger = await Ledger.find({
      communityId: req.user.communityId,
      sessionId: session._id,
    }).sort({ createdAt: -1 });

    return res.json(ledger);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
