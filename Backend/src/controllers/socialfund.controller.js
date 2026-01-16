import SocialFund from "../models/SocialFund.js";
import Member from "../models/Member.js";
import Admin from "../models/Admin.js";
import Community from "../models/Community.js";

/* ======================
   CREATE SOCIAL FUND
====================== */
export const createSocialFund = async (req, res) => {
  try {
    const { name, description, targetAmount, category, priority, targetDate } = req.body;
    const { communityId } = req.user;

    if (!name || !description || !targetAmount) {
      return res.status(400).json({ message: "Name, description, and target amount are required" });
    }

    const socialFund = await SocialFund.create({
      name,
      description,
      targetAmount: Number(targetAmount),
      communityId,
      category: category || "OTHER",
      priority: priority || "MEDIUM",
      targetDate: targetDate ? new Date(targetDate) : null,
      createdBy: req.user.id,
    });

    await socialFund.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'communityId', select: 'name' }
    ]);

    res.status(201).json({
      message: "Social fund created successfully",
      socialFund
    });

  } catch (error) {
    console.error("Create social fund error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   GET ALL SOCIAL FUNDS
====================== */
export const getAllSocialFunds = async (req, res) => {
  try {
    const { communityId } = req.user;
    const { status, category } = req.query;

    let query = { communityId };
    
    if (status) query.status = status;
    if (category) query.category = category;

    const socialFunds = await SocialFund.find(query)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('communityId', 'name')
      .populate('contributors.memberId', 'name email')
      .populate('expenses.spentBy', 'name email')
      .populate('expenses.approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(socialFunds);

  } catch (error) {
    console.error("Get social funds error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   GET SINGLE SOCIAL FUND
====================== */
export const getSocialFund = async (req, res) => {
  try {
    const { id } = req.params;
    const { communityId } = req.user;

    const socialFund = await SocialFund.findOne({ _id: id, communityId })
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('communityId', 'name')
      .populate('contributors.memberId', 'name email phone')
      .populate('expenses.spentBy', 'name email')
      .populate('expenses.approvedBy', 'name email');

    if (!socialFund) {
      return res.status(404).json({ message: "Social fund not found" });
    }

    res.json(socialFund);

  } catch (error) {
    console.error("Get social fund error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   UPDATE SOCIAL FUND
====================== */
export const updateSocialFund = async (req, res) => {
  try {
    const { id } = req.params;
    const { communityId } = req.user;
    const { name, description, targetAmount, category, priority, targetDate, status } = req.body;

    const socialFund = await SocialFund.findOne({ _id: id, communityId });
    
    if (!socialFund) {
      return res.status(404).json({ message: "Social fund not found" });
    }

    // Update fields
    if (name) socialFund.name = name;
    if (description) socialFund.description = description;
    if (targetAmount) socialFund.targetAmount = Number(targetAmount);
    if (category) socialFund.category = category;
    if (priority) socialFund.priority = priority;
    if (targetDate) socialFund.targetDate = new Date(targetDate);
    if (status) socialFund.status = status;

    await socialFund.save();

    await socialFund.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'communityId', select: 'name' }
    ]);

    res.json({
      message: "Social fund updated successfully",
      socialFund
    });

  } catch (error) {
    console.error("Update social fund error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   CONTRIBUTE TO SOCIAL FUND
====================== */
export const contributeToSocialFund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, memberId, transactionId } = req.body;
    const { communityId } = req.user;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid contribution amount is required" });
    }

    const socialFund = await SocialFund.findOne({ _id: id, communityId });
    
    if (!socialFund) {
      return res.status(404).json({ message: "Social fund not found" });
    }

    if (socialFund.status !== 'ACTIVE') {
      return res.status(400).json({ message: "Cannot contribute to inactive social fund" });
    }

    // Verify member exists and belongs to community
    if (memberId) {
      const member = await Member.findOne({ _id: memberId, communityId });
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
    }

    // Add contribution
    socialFund.contributors.push({
      memberId: memberId || null,
      amount: Number(amount),
      transactionId: transactionId || null,
      contributedAt: new Date()
    });

    // Update current amount
    socialFund.currentAmount += Number(amount);

    // Check if target reached
    if (socialFund.currentAmount >= socialFund.targetAmount) {
      socialFund.status = 'COMPLETED';
    }

    await socialFund.save();

    await socialFund.populate([
      { path: 'contributors.memberId', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.json({
      message: "Contribution added successfully",
      socialFund,
      contribution: socialFund.contributors[socialFund.contributors.length - 1]
    });

  } catch (error) {
    console.error("Contribute to social fund error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   ADD EXPENSE TO SOCIAL FUND
====================== */
export const addExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, receipt } = req.body;
    const { communityId } = req.user;

    if (!description || !amount || amount <= 0) {
      return res.status(400).json({ message: "Description and valid amount are required" });
    }

    const socialFund = await SocialFund.findOne({ _id: id, communityId });
    
    if (!socialFund) {
      return res.status(404).json({ message: "Social fund not found" });
    }

    // Check if sufficient balance available
    const totalExpenses = socialFund.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const availableBalance = socialFund.currentAmount - totalExpenses;

    if (Number(amount) > availableBalance) {
      return res.status(400).json({ 
        message: `Insufficient balance. Available: ₹${availableBalance}` 
      });
    }

    // Add expense
    socialFund.expenses.push({
      description,
      amount: Number(amount),
      spentBy: req.user.id,
      receipt: receipt || null,
      spentAt: new Date()
    });

    await socialFund.save();

    await socialFund.populate([
      { path: 'expenses.spentBy', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.json({
      message: "Expense added successfully",
      socialFund,
      expense: socialFund.expenses[socialFund.expenses.length - 1]
    });

  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   GET SOCIAL FUND STATISTICS
====================== */
export const getSocialFundStats = async (req, res) => {
  try {
    const { communityId } = req.user;

    const stats = await SocialFund.aggregate([
      { $match: { communityId: communityId } },
      {
        $group: {
          _id: null,
          totalFunds: { $sum: 1 },
          activeFunds: {
            $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] }
          },
          completedFunds: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
          },
          totalTargetAmount: { $sum: "$targetAmount" },
          totalCurrentAmount: { $sum: "$currentAmount" },
          totalContributions: {
            $sum: { $size: "$contributors" }
          },
          totalExpenses: {
            $sum: {
              $reduce: {
                input: "$expenses",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.amount"] }
              }
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalFunds: 0,
      activeFunds: 0,
      completedFunds: 0,
      totalTargetAmount: 0,
      totalCurrentAmount: 0,
      totalContributions: 0,
      totalExpenses: 0
    };

    // Calculate additional metrics
    result.completionRate = result.totalFunds > 0 
      ? ((result.completedFunds / result.totalFunds) * 100).toFixed(1)
      : 0;
    
    result.availableBalance = result.totalCurrentAmount - result.totalExpenses;

    res.json(result);

  } catch (error) {
    console.error("Get social fund stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   SUPER ADMIN: GET ALL SOCIAL FUNDS ACROSS COMMUNITIES
====================== */
export const getAllSocialFundsForSuperAdmin = async (req, res) => {
  try {
    const { status, category, communityId } = req.query;

    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (communityId) query.communityId = communityId;

    const socialFunds = await SocialFund.find(query)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('communityId', 'name location')
      .populate('contributors.memberId', 'name email')
      .populate('expenses.spentBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(socialFunds);

  } catch (error) {
    console.error("Get all social funds for super admin error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   SUPER ADMIN: GET PLATFORM SOCIAL FUND STATISTICS
====================== */
export const getPlatformSocialFundStats = async (req, res) => {
  try {
    const stats = await SocialFund.aggregate([
      {
        $group: {
          _id: null,
          totalFunds: { $sum: 1 },
          activeFunds: {
            $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] }
          },
          completedFunds: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
          },
          totalTargetAmount: { $sum: "$targetAmount" },
          totalCurrentAmount: { $sum: "$currentAmount" },
          totalContributions: {
            $sum: { $size: "$contributors" }
          },
          totalExpenses: {
            $sum: {
              $reduce: {
                input: "$expenses",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.amount"] }
              }
            }
          }
        }
      }
    ]);

    // Get stats by community
    const communityStats = await SocialFund.aggregate([
      {
        $group: {
          _id: "$communityId",
          totalFunds: { $sum: 1 },
          totalAmount: { $sum: "$currentAmount" },
          activeFunds: {
            $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: "communities",
          localField: "_id",
          foreignField: "_id",
          as: "community"
        }
      },
      {
        $unwind: "$community"
      },
      {
        $project: {
          communityName: "$community.name",
          totalFunds: 1,
          totalAmount: 1,
          activeFunds: 1
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const result = stats[0] || {
      totalFunds: 0,
      activeFunds: 0,
      completedFunds: 0,
      totalTargetAmount: 0,
      totalCurrentAmount: 0,
      totalContributions: 0,
      totalExpenses: 0
    };

    result.completionRate = result.totalFunds > 0 
      ? ((result.completedFunds / result.totalFunds) * 100).toFixed(1)
      : 0;
    
    result.availableBalance = result.totalCurrentAmount - result.totalExpenses;
    result.communityStats = communityStats;

    res.json(result);

  } catch (error) {
    console.error("Get platform social fund stats error:", error);
    res.status(500).json({ message: error.message });
  }
};