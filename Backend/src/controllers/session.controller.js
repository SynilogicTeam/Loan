import Session from "../models/Session.js";

/* =========================
   CREATE SESSION
========================= */
export const createSession = async (req, res) => {
  try {
    const { name, startDate, openingBalance } = req.body;

    // check active session
    const activeSession = await Session.findOne({
      communityId: req.user.communityId,
      isActive: true,
    });

    if (activeSession) {
      return res
        .status(400)
        .json({ message: "Active session already exists" });
    }

    const session = await Session.create({
      name,
      startDate,
      openingBalance,
      communityId: req.user.communityId,
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET ACTIVE SESSION
========================= */
export const getActiveSession = async (req, res) => {
  try {
    let query = { isActive: true };

    // For regular admin, filter by communityId
    if (req.user.role === "ADMIN" && req.user.communityId) {
      query.communityId = req.user.communityId;
    }

    const session = await Session.findOne(query);

    if (!session) {
      return res.status(404).json({ message: "No active session found" });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   CLOSE SESSION
========================= */
export const closeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session || !session.isActive) {
      return res.status(400).json({ message: "Invalid session" });
    }

    session.isActive = false;
    session.endDate = new Date();
    session.closingBalance = session.openingBalance; // later auto calc
    await session.save();

    res.json({ message: "Session closed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* =========================
   GET SESSION ACTIVITIES
========================= */
export const getSessionActivities = async (req, res) => {
  try {
    // Get active session
    let sessionQuery = { isActive: true };
    if (req.user.role === "ADMIN" && req.user.communityId) {
      sessionQuery.communityId = req.user.communityId;
    }

    const session = await Session.findOne(sessionQuery);
    if (!session) {
      return res.status(404).json({ message: "No active session found" });
    }

    // Import models dynamically
    const [Contribution, Loan, EMI, Member] = await Promise.all([
      import("../models/Contribution.js").then(m => m.default),
      import("../models/Loan.js").then(m => m.default),
      import("../models/EMI.js").then(m => m.default),
      import("../models/Member.js").then(m => m.default)
    ]);

    // Build community filter
    let communityFilter = {};
    if (req.user.role === "ADMIN" && req.user.communityId) {
      communityFilter.communityId = req.user.communityId;
    }

    // Get recent activities (last 50)
    const activities = [];

    // Recent contributions
    const contributions = await Contribution.find(communityFilter)
      .populate('memberId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    contributions.forEach(contrib => {
      activities.push({
        type: 'contribution',
        title: 'New Contribution',
        description: `${contrib.memberId?.name || 'Member'} contributed ₹${contrib.amount}`,
        amount: contrib.amount,
        status: contrib.status,
        timestamp: contrib.createdAt,
        memberName: contrib.memberId?.name
      });
    });

    // Recent loan applications
    const loans = await Loan.find(communityFilter)
      .populate('memberId', 'name')
      .sort({ createdAt: -1 })
      .limit(15);

    loans.forEach(loan => {
      activities.push({
        type: 'loan',
        title: loan.status === 'PENDING' ? 'Loan Application' : 
               loan.status === 'APPROVED' ? 'Loan Approved' : 'Loan Updated',
        description: `${loan.memberId?.name || 'Member'} ${
          loan.status === 'PENDING' ? 'applied for' : 
          loan.status === 'APPROVED' ? 'got approved for' : 'loan status:'
        } ₹${loan.amount}`,
        amount: loan.amount,
        status: loan.status,
        timestamp: loan.createdAt,
        memberName: loan.memberId?.name
      });
    });

    // Recent EMI payments
    const emis = await EMI.find({ status: 'PAID' })
      .populate({
        path: 'loanId',
        populate: { path: 'memberId', select: 'name' }
      })
      .sort({ paidDate: -1 })
      .limit(15);

    emis.forEach(emi => {
      if (emi.loanId?.memberId) {
        activities.push({
          type: 'emi',
          title: 'EMI Payment',
          description: `${emi.loanId.memberId.name} paid EMI of ₹${emi.amount}`,
          amount: emi.amount,
          status: 'PAID',
          timestamp: emi.paidDate,
          memberName: emi.loanId.memberId.name
        });
      }
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      activities: activities.slice(0, 50), // Return latest 50 activities
      sessionInfo: {
        name: session.name,
        startDate: session.startDate,
        openingBalance: session.openingBalance
      }
    });

  } catch (error) {
    console.error("Session activities error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET SESSION STATISTICS
========================= */
export const getSessionStats = async (req, res) => {
  try {
    // Get active session
    let sessionQuery = { isActive: true };
    if (req.user.role === "ADMIN" && req.user.communityId) {
      sessionQuery.communityId = req.user.communityId;
    }

    const session = await Session.findOne(sessionQuery);
    if (!session) {
      return res.status(404).json({ message: "No active session found" });
    }

    // Import models dynamically
    const [Contribution, Loan, EMI, Member] = await Promise.all([
      import("../models/Contribution.js").then(m => m.default),
      import("../models/Loan.js").then(m => m.default),
      import("../models/EMI.js").then(m => m.default),
      import("../models/Member.js").then(m => m.default)
    ]);

    // Build community filter
    let communityFilter = {};
    if (req.user.role === "ADMIN" && req.user.communityId) {
      communityFilter.communityId = req.user.communityId;
    }

    // Calculate session statistics
    const sessionStart = new Date(session.startDate);
    const now = new Date();

    // Contributions stats
    const contributionsStats = await Contribution.aggregate([
      { 
        $match: { 
          ...communityFilter,
          createdAt: { $gte: sessionStart }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 },
          avgAmount: { $avg: "$amount" }
        }
      }
    ]);

    // Loans stats
    const loansStats = await Loan.aggregate([
      { 
        $match: { 
          ...communityFilter,
          createdAt: { $gte: sessionStart }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    // EMI payments stats
    const emiStats = await EMI.aggregate([
      { 
        $match: { 
          status: 'PAID',
          paidDate: { $gte: sessionStart }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    // Active members count
    const activeMembersCount = await Member.countDocuments({
      ...communityFilter,
      isActive: true
    });

    // Recent activity count (last 7 days)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = {
      contributions: await Contribution.countDocuments({
        ...communityFilter,
        createdAt: { $gte: weekAgo }
      }),
      loans: await Loan.countDocuments({
        ...communityFilter,
        createdAt: { $gte: weekAgo }
      }),
      emiPayments: await EMI.countDocuments({
        status: 'PAID',
        paidDate: { $gte: weekAgo }
      })
    };

    // Format response
    const stats = {
      sessionInfo: {
        name: session.name,
        startDate: session.startDate,
        openingBalance: session.openingBalance,
        daysActive: Math.ceil((now - sessionStart) / (1000 * 60 * 60 * 24))
      },
      contributions: {
        total: contributionsStats[0]?.totalAmount || 0,
        count: contributionsStats[0]?.totalCount || 0,
        average: contributionsStats[0]?.avgAmount || 0
      },
      loans: {
        pending: loansStats.find(l => l._id === 'PENDING')?.count || 0,
        approved: loansStats.find(l => l._id === 'APPROVED')?.count || 0,
        active: loansStats.find(l => l._id === 'ACTIVE')?.count || 0,
        totalAmount: loansStats.reduce((sum, l) => sum + (l.totalAmount || 0), 0)
      },
      emiPayments: {
        total: emiStats[0]?.totalAmount || 0,
        count: emiStats[0]?.totalCount || 0
      },
      members: {
        active: activeMembersCount
      },
      recentActivity
    };

    res.json(stats);

  } catch (error) {
    console.error("Session stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET ALL SESSIONS (SUPER ADMIN ONLY)
========================= */
export const getAllSessions = async (req, res) => {
  try {
    // Only Super Admin can access this
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Access denied. Super Admin only." });
    }

    // Get all sessions across all communities
    const sessions = await Session.find()
      .populate('communityId', 'name')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error("Get all sessions error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   CREATE SESSION FOR SPECIFIC COMMUNITY (SUPER ADMIN ONLY)
========================= */
export const createSessionForCommunity = async (req, res) => {
  try {
    // Only Super Admin can access this
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Access denied. Super Admin only." });
    }

    const { name, startDate, openingBalance, communityId } = req.body;

    if (!name || !startDate || !communityId) {
      return res.status(400).json({ message: "Name, start date, and community ID are required" });
    }

    // Check if community exists
    const Community = (await import("../models/Community.js")).default;
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if there's already an active session for this community
    const activeSession = await Session.findOne({
      communityId: communityId,
      isActive: true,
    });

    if (activeSession) {
      return res.status(400).json({ 
        message: `Community "${community.name}" already has an active session: "${activeSession.name}"` 
      });
    }

    // Create new session
    const session = await Session.create({
      name,
      startDate,
      openingBalance: Number(openingBalance || 0),
      communityId,
    });

    // Populate community info for response
    await session.populate('communityId', 'name');

    res.status(201).json({
      message: `Session "${name}" created successfully for community "${community.name}"`,
      session
    });
  } catch (error) {
    console.error("Create session for community error:", error);
    res.status(500).json({ message: error.message });
  }
};