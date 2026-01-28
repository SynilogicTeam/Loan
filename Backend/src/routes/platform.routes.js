import express from "express";
import protect from "../middelware/auth.js";
import isSuperAdmin from "../middelware/isSuperAdmin.js";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

/* ======================
   PUBLIC COMMUNITIES (FOR REGISTRATION)
====================== */
router.get("/communities/public", async (req, res) => {
  try {
    console.log("GET /api/platform/communities/public called - PUBLIC ACCESS");

    const Community = (await import("../models/Community.js")).default;

    // Get only basic community info for registration
    const communities = await Community.find({ isActive: { $ne: false } })
      .select('name description location')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to prevent too much data

    console.log("Found public communities:", communities.length);

    res.json(communities);

  } catch (error) {
    console.error("Public communities error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   PLATFORM STATS
====================== */
router.get("/stats", protect, isSuperAdmin, async (req, res) => {
  try {
    const [Community, Member, Subscription, Admin, Contribution, Loan] = await Promise.all([
      import("../models/Community.js").then(m => m.default),
      import("../models/Member.js").then(m => m.default),
      import("../models/Subscription.js").then(m => m.default),
      import("../models/Admin.js").then(m => m.default),
      import("../models/Contribution.js").then(m => m.default).catch(() => null),
      import("../models/Loan.js").then(m => m.default).catch(() => null)
    ]);

    // Get platform statistics
    const totalCommunities = await Community.countDocuments();
    const totalMembers = await Member.countDocuments();
    const totalAdmins = await Admin.countDocuments();

    // Active subscriptions
    const activeSubscriptions = await Subscription.countDocuments({
      status: "ACTIVE"
    });

    // Monthly revenue calculation
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyRevenue = await Subscription.aggregate([
      {
        $match: {
          status: "ACTIVE",
          startDate: { $gte: currentMonth, $lt: nextMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Calculate total balance from communities
    const totalBalanceResult = await Community.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalBalance" }
        }
      }
    ]);

    // Calculate total contributions if Contribution model exists
    let totalContributions = 0;
    if (Contribution) {
      const contributionsResult = await Contribution.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]);
      totalContributions = contributionsResult[0]?.total || 0;
    }

    // Calculate total loans if Loan model exists
    let totalLoans = 0;
    if (Loan) {
      const loansResult = await Loan.aggregate([
        {
          $match: {
            status: { $in: ["ACTIVE", "COMPLETED"] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]);
      totalLoans = loansResult[0]?.total || 0;
    }

    res.json({
      totalCommunities,
      totalMembers,
      totalAdmins,
      totalBalance: totalBalanceResult[0]?.total || 0,
      totalContributions,
      totalLoans,
      activeSubscriptions,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      trialCommunities: await Community.countDocuments({ subscriptionStatus: "TRIAL" }),
      expiredSubscriptions: await Subscription.countDocuments({ status: "EXPIRED" })
    });

  } catch (error) {
    console.error("Platform stats error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   GET SINGLE COMMUNITY DETAILS
====================== */
router.get("/communities/:id", protect, isSuperAdmin, async (req, res) => {
  try {
    console.log("GET /api/platform/communities/:id called with ID:", req.params.id);

    const [Community, Member, Plan] = await Promise.all([
      import("../models/Community.js").then(m => m.default),
      import("../models/Member.js").then(m => m.default),
      import("../models/Plan.js").then(m => m.default)
    ]);

    const community = await Community.findById(req.params.id)
      .populate('currentPlan', 'name displayName price')
      .populate('admin', 'name email');

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Get member count and total balance
    const memberCount = await Member.countDocuments({
      communityId: community._id
    });

    // Get total balance from active session
    const Session = (await import("../models/Session.js")).default;
    const mongoose = (await import("mongoose")).default;

    const activeSession = await Session.findOne({
      communityId: new mongoose.Types.ObjectId(community._id),
      isActive: true
    });

    const totalBalance = activeSession?.closingBalance || 0;

    res.json({
      ...community.toObject(),
      memberCount,
      totalBalance
    });

  } catch (error) {
    console.error("Get community details error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   GET COMMUNITY MEMBERS BY COMMUNITY ID
====================== */
router.get("/communities/:id/members", protect, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching members for community ID: ${id}`);
    console.log("USER ROLE 👉", req.user.role);

    const Member = (await import("../models/Member.js")).default;

    // Get members from the specified community
    const members = await Member.find({ communityId: id })
      .select("-password")
      .populate('communityId', 'name');

    console.log('✅ Found members for community:', members.length);
    res.json(members);
  } catch (error) {
    console.error("Get community members error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   UPDATE COMMUNITY DETAILS
====================== */
router.put("/communities/:id", protect, isSuperAdmin, async (req, res) => {
  try {
    console.log("🔄 UPDATE COMMUNITY:", req.params.id);
    console.log("📝 Update data:", req.body);

    const {
      name,
      description,
      location,
      planId,
      adminName,
      adminEmail,
      fixedContributionEnabled,
      fixedContributionAmount,
      fixedContributionDueDay
    } = req.body;
    const Community = (await import("../models/Community.js")).default;
    const Admin = (await import("../models/Admin.js")).default;
    const Plan = (await import("../models/Plan.js")).default;

    // Find community
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    community.name = name || community.name;
    community.description = description || community.description;
    community.location = location || community.location;

    if (typeof fixedContributionEnabled === "boolean") {
      if (!community.settings) {
        community.settings = {};
      }
      if (!community.settings.contributions) {
        community.settings.contributions = {};
      }
      community.settings.contributions.fixedEnabled = fixedContributionEnabled;
    }

    if (typeof fixedContributionAmount === "number") {
      if (!community.settings) {
        community.settings = {};
      }
      if (!community.settings.contributions) {
        community.settings.contributions = {};
      }
      community.settings.contributions.fixedAmount = fixedContributionAmount;
    }

    if (typeof fixedContributionDueDay === "number") {
      if (!community.settings) {
        community.settings = {};
      }
      if (!community.settings.contributions) {
        community.settings.contributions = {};
      }
      community.settings.contributions.fixedDueDay = fixedContributionDueDay;
    }

    // Update plan if provided
    if (planId) {
      const plan = await Plan.findById(planId);
      if (plan) {
        community.currentPlan = planId;
      }
    }

    await community.save();

    // Update admin if provided
    if (adminName || adminEmail) {
      const existingAdmin = await Admin.findOne({ communityId: community._id });

      if (existingAdmin) {
        // Update existing admin
        if (adminName) existingAdmin.name = adminName;
        if (adminEmail) existingAdmin.email = adminEmail;
        await existingAdmin.save();
        console.log("✅ Admin updated:", existingAdmin.email);
      } else if (adminName && adminEmail) {
        // Create new admin if none exists
        const bcrypt = (await import("bcryptjs")).default;
        const hashedPassword = await bcrypt.hash("defaultPassword123", 10);

        const newAdmin = await Admin.create({
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          communityId: community._id,
          permissions: [
            "manage_members",
            "manage_contributions",
            "manage_loans",
            "manage_sessions",
            "view_reports",
            "manage_settings"
          ]
        });

        community.admin = newAdmin._id;
        await community.save();
        console.log("✅ New admin created:", newAdmin.email);
      }
    }

    // Get updated community with populated data
    const updatedCommunity = await Community.findById(community._id)
      .populate('admin', 'name email')
      .populate('currentPlan', 'name displayName price');

    console.log("✅ Community updated successfully:", updatedCommunity.name);

    res.json({
      message: "Community updated successfully",
      community: updatedCommunity
    });

  } catch (error) {
    console.error("❌ Update community error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   ALL COMMUNITIES WITH SUBSCRIPTION INFO
====================== */
router.get("/communities", protect, isSuperAdmin, async (req, res) => {
  try {
    console.log("GET /api/platform/communities called");
    console.log("User:", req.user);

    const [Community, Member, Plan] = await Promise.all([
      import("../models/Community.js").then(m => m.default),
      import("../models/Member.js").then(m => m.default),
      import("../models/Plan.js").then(m => m.default)
    ]);

    const communities = await Community.find()
      .populate('currentPlan', 'name displayName price')
      .populate('admin', 'name email')
      .sort({ createdAt: -1 });

    console.log("Found communities:", communities.length);

    // Add member count, total balance, and revenue for each community
    const communitiesWithStats = await Promise.all(
      communities.map(async (community) => {
        const memberCount = await Member.countDocuments({
          communityId: community._id
        });

        // Get total balance from active session
        const Session = (await import("../models/Session.js")).default;
        const mongoose = (await import("mongoose")).default;

        const activeSession = await Session.findOne({
          communityId: new mongoose.Types.ObjectId(community._id),
          isActive: true
        });

        const totalBalance = activeSession?.closingBalance || 0;

        return {
          ...community.toObject(),
          memberCount,
          totalBalance,
          monthlyRevenue: community.currentPlan?.price?.monthly || 0
        };
      })
    );

    res.json(communitiesWithStats);

  } catch (error) {
    console.error("Platform communities error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   ALL SUBSCRIPTION PLANS (SUPER ADMIN ONLY)
====================== */
router.get("/plans", protect, isSuperAdmin, async (req, res) => {
  try {
    const Plan = (await import("../models/Plan.js")).default;
    const plans = await Plan.find({ isActive: true }).sort({ 'price.monthly': 1 });
    res.json(plans);
  } catch (error) {
    console.error("Platform plans error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   PUBLIC SUBSCRIPTION PLANS (FOR ALL USERS)
====================== */
router.get("/plans/public", async (req, res) => {
  try {
    console.log("GET /api/platform/plans/public called - PUBLIC ACCESS");

    const Plan = (await import("../models/Plan.js")).default;
    const plans = await Plan.find({ isActive: true })
      .select('name displayName description price features permissions isActive isPopular')
      .sort({ 'price.monthly': 1 })
      .limit(10); // Limit to prevent too much data

    console.log("Found public plans:", plans.length);

    res.json(plans);

  } catch (error) {
    console.error("Public plans error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   CREATE NEW PLAN
====================== */
router.post("/plans", protect, isSuperAdmin, async (req, res) => {
  try {
    const Plan = (await import("../models/Plan.js")).default;
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    console.error("Create plan error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   ALL SUBSCRIPTIONS
====================== */
router.get("/subscriptions", protect, isSuperAdmin, async (req, res) => {
  try {
    const Subscription = (await import("../models/Subscription.js")).default;

    const subscriptions = await Subscription.find()
      .populate('communityId', 'name')
      .populate('planId', 'name displayName')
      .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    console.error("Platform subscriptions error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   CREATE COMMUNITY (SIMPLE)
====================== */
router.post("/communities", protect, isSuperAdmin, async (req, res) => {
  try {
    const { name, description, location } = req.body;

    if (!name || !description || !location) {
      return res.status(400).json({ message: "Name, description, and location are required" });
    }

    const Community = (await import("../models/Community.js")).default;

    // Create community without admin initially
    const community = await Community.create({
      name,
      description,
      location,
      subscriptionStatus: "ACTIVE", // Set as active by default for Super Admin created communities
      memberCount: 0,
      totalBalance: 0
    });

    res.status(201).json({
      message: "Community created successfully",
      community
    });

  } catch (error) {
    console.error("Create community error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   CREATE COMMUNITY WITH PLAN (ADVANCED)
====================== */
router.post("/communities/with-plan", protect, isSuperAdmin, async (req, res) => {
  try {
    const { name, address, planId, adminEmail, adminName } = req.body;

    const [Community, Admin, Plan, Subscription] = await Promise.all([
      import("../models/Community.js").then(m => m.default),
      import("../models/Admin.js").then(m => m.default),
      import("../models/Plan.js").then(m => m.default),
      import("../models/Subscription.js").then(m => m.default)
    ]);

    // Create community
    const community = await Community.create({
      name,
      address,
      currentPlan: planId,
      subscriptionStatus: "TRIAL"
    });

    // Create admin for community
    const admin = await Admin.create({
      name: adminName,
      email: adminEmail,
      password: "defaultPassword123", // Should be changed on first login
      communityId: community._id,
      permissions: ['manage_members', 'manage_contributions', 'manage_loans', 'manage_sessions', 'view_reports']
    });

    // Update community with admin
    community.admin = admin._id;
    await community.save();

    // Create trial subscription
    const plan = await Plan.findById(planId);
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30); // 30 days trial

    await Subscription.create({
      communityId: community._id,
      planId: planId,
      status: "TRIAL",
      startDate: new Date(),
      endDate: trialEndDate,
      trialEndDate: trialEndDate,
      amount: plan.price.monthly
    });

    res.status(201).json({
      message: "Community created successfully",
      community,
      admin: { ...admin.toObject(), password: undefined }
    });

  } catch (error) {
    console.error("Create community error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   UPDATE COMMUNITY STATUS
====================== */
router.put("/communities/:id/status", protect, isSuperAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const Community = (await import("../models/Community.js")).default;

    const community = await Community.findByIdAndUpdate(
      req.params.id,
      { subscriptionStatus: status },
      { new: true }
    );

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    res.json({
      message: `Community status updated to ${status}`,
      community
    });

  } catch (error) {
    console.error("Update community status error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   ALL MEMBERS (SUPER ADMIN)
====================== */
router.get("/members", protect, isSuperAdmin, async (req, res) => {
  try {
    console.log("GET /api/platform/members called");
    console.log("User:", req.user);

    const Member = (await import("../models/Member.js")).default;

    const members = await Member.find()
      .populate('communityId', 'name')
      .select('-password')
      .sort({ createdAt: -1 });

    console.log("Found members:", members.length);
    res.json(members);
  } catch (error) {
    console.error("Platform members error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   ALL ADMINS
====================== */
router.get("/admins", protect, isSuperAdmin, async (req, res) => {
  try {
    console.log("GET /api/platform/admins called");
    console.log("User:", req.user);

    const Admin = (await import("../models/Admin.js")).default;

    // Only return regular admins, exclude Super Admins
    const admins = await Admin.find({ role: { $ne: 'SUPER_ADMIN' } })
      .populate('communityId', 'name')
      .select('-password')
      .sort({ createdAt: -1 });

    console.log("Found regular admins:", admins.length);
    res.json(admins);
  } catch (error) {
    console.error("Platform admins error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   CREATE ADMIN (PLATFORM LEVEL)
====================== */
router.post("/admins", protect, isSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, communityId, permissions, isActive } = req.body;

    const Admin = (await import("../models/Admin.js")).default;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists with this email" });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      communityId: communityId || null,
      permissions: permissions || [],
      isActive: isActive !== false,
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        communityId: admin.communityId,
        permissions: admin.permissions,
        isActive: admin.isActive,
      }
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: error.message });
  }
});
/* ======================
   UPDATE ADMIN STATUS
====================== */
router.put("/admins/:id/status", protect, isSuperAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const Admin = (await import("../models/Admin.js")).default;

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully`,
      admin
    });

  } catch (error) {
    console.error("Update admin status error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   UPDATE ADMIN (EDIT)
====================== */
router.put("/admins/:id", protect, isSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, communityId, permissions, isActive } = req.body;
    const Admin = (await import("../models/Admin.js")).default;
    const Community = (await import("../models/Community.js")).default;

    console.log("Updating admin:", req.params.id);
    console.log("Update data:", { name, email, communityId, permissions, isActive, hasPassword: !!password });

    // Check if email is being changed and if it already exists
    const existingAdmin = await Admin.findById(req.params.id);
    if (!existingAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // If email is being changed, check for duplicates
    if (email && email !== existingAdmin.email) {
      const emailExists = await Admin.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({ message: "An admin with this email address already exists" });
      }
    }

    // If community is being changed, update community references
    if (communityId && communityId !== existingAdmin.communityId?.toString()) {
      // Remove admin from old community
      if (existingAdmin.communityId) {
        await Community.findByIdAndUpdate(existingAdmin.communityId, {
          $unset: { admin: 1 }
        });
      }

      // Add admin to new community
      if (communityId !== 'null' && communityId !== '') {
        await Community.findByIdAndUpdate(communityId, {
          admin: req.params.id
        });
      }
    }

    const updateData = {
      name: name || existingAdmin.name,
      email: email || existingAdmin.email,
      communityId: communityId && communityId !== 'null' ? communityId : null,
      permissions: permissions || existingAdmin.permissions,
      isActive: isActive !== undefined ? isActive : existingAdmin.isActive
    };

    // Only update password if provided and hash it
    if (password && password.trim() !== "") {
      console.log("Hashing new password");
      const bcrypt = (await import("bcryptjs")).default;
      updateData.password = await bcrypt.hash(password, 10);
    }

    console.log("Final update data:", { ...updateData, password: updateData.password ? '[HASHED]' : 'NOT_CHANGED' });

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password').populate('communityId', 'name');

    if (!admin) {
      return res.status(404).json({ message: "Admin not found after update" });
    }

    console.log("Admin updated successfully:", admin._id);

    res.json({
      message: "Admin updated successfully",
      admin
    });

  } catch (error) {
    console.error("Update admin error:", error);

    // Handle duplicate key error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ message: "An admin with this email address already exists" });
    }

    res.status(500).json({ message: error.message });
  }
});

/* ======================
   UPDATE ADMIN PERMISSIONS
====================== */
router.put("/admins/:id/permissions", protect, isSuperAdmin, async (req, res) => {
  try {
    const { communityId, permissions, isActive } = req.body;
    const Admin = (await import("../models/Admin.js")).default;

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      {
        communityId: communityId || null,
        permissions: permissions || [],
        isActive: isActive !== false
      },
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      message: "Admin permissions updated successfully",
      admin
    });

  } catch (error) {
    console.error("Update admin permissions error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/admins/:id/impersonate", protect, isSuperAdmin, async (req, res) => {
  try {
    const Admin = (await import("../models/Admin.js")).default;

    const admin = await Admin.findById(req.params.id).populate("communityId");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.isActive === false) {
      return res.status(403).json({ message: "Admin account is deactivated" });
    }

    const token = generateToken(admin._id, admin.role);

    const responseData = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions || [],
      isActive: admin.isActive,
      token,
    };

    if (admin.communityId) {
      responseData.communityId = admin.communityId._id;
      responseData.communityName = admin.communityId.name;
    }

    res.json(responseData);
  } catch (error) {
    console.error("Impersonate admin error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   RESET ADMIN PASSWORD
====================== */
router.put("/admins/:id/reset-password", protect, isSuperAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const Admin = (await import("../models/Admin.js")).default;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    console.log('🔄 ADMIN PASSWORD RESET REQUEST:');
    console.log('   - Admin ID:', req.params.id);
    console.log('   - Admin Name:', admin.name);
    console.log('   - Admin Email:', admin.email);
    console.log('   - New Password Length:', newPassword.length);
    console.log('   - Reset By Super Admin:', req.user.id);
    console.log('   - Timestamp:', new Date().toISOString());

    // Store old password hash for verification
    const oldPasswordHash = admin.password;

    admin.password = newPassword; // This will be hashed by the pre-save middleware
    await admin.save();

    // Verify the password was actually changed
    const updatedAdmin = await Admin.findById(req.params.id);
    const passwordChanged = updatedAdmin.password !== oldPasswordHash;

    console.log('✅ PASSWORD RESET COMPLETED:');
    console.log('   - Password Hash Changed:', passwordChanged);
    console.log('   - New Hash Length:', updatedAdmin.password.length);
    console.log('   - Admin:', admin.name, '(' + admin.email + ')');

    // Add to admin's activity log if it exists
    if (admin.permissionHistory) {
      admin.permissionHistory.push({
        changedBy: req.user.id,
        changedAt: new Date(),
        oldPermissions: admin.permissions,
        newPermissions: admin.permissions,
        reason: `Password reset by Super Admin - ${new Date().toISOString()}`
      });
      await admin.save();
    }

    res.json({
      message: "Password reset successfully",
      adminName: admin.name,
      adminEmail: admin.email,
      passwordChanged: passwordChanged,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ RESET ADMIN PASSWORD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   DELETE COMMUNITY
====================== */
router.delete("/communities/:id", protect, isSuperAdmin, async (req, res) => {
  try {
    console.log('🗑️ DELETE COMMUNITY REQUEST:');
    console.log('   - Community ID:', req.params.id);
    console.log('   - User ID:', req.user.id);
    console.log('   - User Role:', req.user.role);
    console.log('   - Timestamp:', new Date().toISOString());

    const Community = (await import("../models/Community.js")).default;
    const Admin = (await import("../models/Admin.js")).default;
    const Member = (await import("../models/Member.js")).default;
    const Subscription = (await import("../models/Subscription.js")).default;

    const community = await Community.findById(req.params.id);
    if (!community) {
      console.log('❌ Community not found:', req.params.id);
      return res.status(404).json({ message: "Community not found" });
    }

    console.log('✅ Community found:', community.name);

    // Delete related data
    const deleteResults = await Promise.all([
      Admin.deleteMany({ communityId: req.params.id }),
      Member.deleteMany({ communityId: req.params.id }),
      Subscription.deleteMany({ communityId: req.params.id })
    ]);

    console.log('🗑️ Deleted related data:');
    console.log('   - Admins deleted:', deleteResults[0].deletedCount);
    console.log('   - Members deleted:', deleteResults[1].deletedCount);
    console.log('   - Subscriptions deleted:', deleteResults[2].deletedCount);

    // Delete community
    await Community.findByIdAndDelete(req.params.id);

    console.log('✅ Community deleted successfully:', community.name);

    res.json({
      message: `Community "${community.name}" and all related data deleted successfully`
    });

  } catch (error) {
    console.error("❌ Delete community error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   GET ALL PLANS
====================== */
router.get("/plans", protect, isSuperAdmin, async (req, res) => {
  try {
    const Plan = (await import("../models/Plan.js")).default;

    const plans = await Plan.find({ isActive: true }).sort({
      isPopular: -1,
      'price.monthly': 1
    });

    res.json(plans);
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   CREATE DEFAULT PLANS (SETUP)
====================== */
router.post("/plans/setup", protect, isSuperAdmin, async (req, res) => {
  try {
    const Plan = (await import("../models/Plan.js")).default;

    // Check if plans already exist
    const existingPlans = await Plan.countDocuments();
    if (existingPlans > 0) {
      return res.status(400).json({ message: "Plans already exist" });
    }

    // Create default plans
    const defaultPlans = [
      {
        name: "basic",
        displayName: "Basic Plan",
        description: "Perfect for small communities getting started",
        price: { monthly: 999, yearly: 9999 },
        features: {
          maxMembers: 50,
          maxAdmins: 2,
          maxSessions: 12,
          advancedReports: false,
          customBranding: false,
          apiAccess: false,
          prioritySupport: false,
        },
        isActive: true,
        isPopular: false,
      },
      {
        name: "standard",
        displayName: "Standard Plan",
        description: "Great for growing communities with more features",
        price: { monthly: 1999, yearly: 19999 },
        features: {
          maxMembers: 150,
          maxAdmins: 5,
          maxSessions: 24,
          advancedReports: true,
          customBranding: false,
          apiAccess: false,
          prioritySupport: false,
        },
        isActive: true,
        isPopular: true,
      },
      {
        name: "premium",
        displayName: "Premium Plan",
        description: "Full-featured plan for large communities",
        price: { monthly: 3999, yearly: 39999 },
        features: {
          maxMembers: 500,
          maxAdmins: 10,
          maxSessions: 50,
          advancedReports: true,
          customBranding: true,
          apiAccess: true,
          prioritySupport: true,
        },
        isActive: true,
        isPopular: false,
      },
    ];

    const createdPlans = await Plan.insertMany(defaultPlans);

    res.status(201).json({
      message: "Default plans created successfully",
      plans: createdPlans
    });
  } catch (error) {
    console.error("Setup plans error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET COMMUNITY ANALYTICS */
router.get("/community-analytics", protect, async (req, res) => {
  try {
    console.log('🔍 Fetching community analytics for user:', req.user.id, 'Role:', req.user.role);

    const Community = (await import("../models/Community.js")).default;
    const Member = (await import("../models/Member.js")).default;
    const Contribution = (await import("../models/Contribution.js")).default;
    const Loan = (await import("../models/Loan.js")).default;
    const Session = (await import("../models/Session.js")).default;

    let communities = [];

    if (req.user.role === 'SUPER_ADMIN') {
      // Super Admin can see all communities
      communities = await Community.find({});
    } else if (req.user.role === 'ADMIN') {
      // Admin can only see their own community
      const Admin = (await import("../models/Admin.js")).default;
      const admin = await Admin.findById(req.user.id);
      if (admin && admin.communityId) {
        communities = await Community.find({ _id: admin.communityId });
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const analyticsData = [];

    for (const community of communities) {
      console.log('📊 Processing analytics for community:', community.name);

      // Get active session
      const activeSession = await Session.findOne({
        communityId: community._id,
        isActive: true
      });

      // Get all members in this community
      const members = await Member.find({ communityId: community._id });

      // Get total contributions for this community
      const contributionStats = await Contribution.aggregate([
        {
          $match: {
            communityId: community._id,
            status: "PAID"
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

      // Get member-wise contribution details
      const memberContributions = await Contribution.aggregate([
        {
          $match: {
            communityId: community._id,
            status: "PAID"
          }
        },
        {
          $lookup: {
            from: "members",
            localField: "memberId",
            foreignField: "_id",
            as: "member"
          }
        },
        {
          $unwind: "$member"
        },
        {
          $group: {
            _id: "$memberId",
            memberName: { $first: "$member.name" },
            memberEmail: { $first: "$member.email" },
            totalContributions: { $sum: "$amount" },
            contributionCount: { $sum: 1 }
          }
        },
        {
          $sort: { totalContributions: -1 }
        }
      ]);

      // Get loan statistics for this community
      const loanStats = await Loan.aggregate([
        {
          $match: {
            communityId: community._id
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$principalAmount" },
            totalOutstanding: { $sum: "$outstandingAmount" }
          }
        }
      ]);

      // Get member-wise loan details
      const memberLoans = await Loan.aggregate([
        {
          $match: {
            communityId: community._id
          }
        },
        {
          $lookup: {
            from: "members",
            localField: "memberId",
            foreignField: "_id",
            as: "member"
          }
        },
        {
          $unwind: "$member"
        },
        {
          $group: {
            _id: "$memberId",
            memberName: { $first: "$member.name" },
            memberEmail: { $first: "$member.email" },
            totalLoans: { $sum: 1 },
            totalLoanAmount: { $sum: "$principalAmount" },
            totalOutstanding: { $sum: "$outstandingAmount" },
            activeLoans: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["APPROVED", "ACTIVE"]] },
                  1,
                  0
                ]
              }
            },
            activeLoanAmount: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["APPROVED", "ACTIVE"]] },
                  "$principalAmount",
                  0
                ]
              }
            }
          }
        },
        {
          $sort: { totalLoanAmount: -1 }
        }
      ]);

      // Calculate summary statistics
      const totalContributions = contributionStats[0]?.totalAmount || 0;
      const contributionCount = contributionStats[0]?.totalCount || 0;

      const totalLoans = loanStats.reduce((sum, stat) => sum + stat.count, 0);
      const totalLoanAmount = loanStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
      const totalOutstanding = loanStats.reduce((sum, stat) => sum + stat.totalOutstanding, 0);

      const activeLoans = loanStats.find(stat => stat._id === 'ACTIVE')?.count || 0;
      const pendingLoans = loanStats.find(stat => stat._id === 'PENDING')?.count || 0;
      const completedLoans = loanStats.find(stat => stat._id === 'COMPLETED')?.count || 0;

      analyticsData.push({
        community: {
          _id: community._id,
          name: community.name,
          description: community.description,
          location: community.location,
          memberCount: members.length,
          currentBalance: activeSession?.closingBalance || 0
        },
        contributions: {
          total: totalContributions,
          count: contributionCount,
          average: contributionCount > 0 ? Math.round(totalContributions / contributionCount) : 0,
          memberWise: memberContributions
        },
        loans: {
          total: totalLoans,
          totalAmount: totalLoanAmount,
          outstanding: totalOutstanding,
          active: activeLoans,
          pending: pendingLoans,
          completed: completedLoans,
          memberWise: memberLoans
        },
        summary: {
          netBalance: totalContributions - totalOutstanding,
          utilizationRate: totalContributions > 0 ? Math.round((totalOutstanding / totalContributions) * 100) : 0,
          avgContributionPerMember: members.length > 0 ? Math.round(totalContributions / members.length) : 0,
          avgLoanPerMember: members.length > 0 ? Math.round(totalLoanAmount / members.length) : 0
        }
      });
    }

    console.log('✅ Community analytics generated for', analyticsData.length, 'communities');

    res.json(analyticsData);

  } catch (error) {
    console.error('❌ Community analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   GET SINGLE ADMIN BY ID (SUPER ADMIN ONLY)
====================== */
router.get("/admins/:id", protect, isSuperAdmin, async (req, res) => {
  try {
    console.log('🔍 Super Admin requesting admin details:', req.params.id);

    const Admin = (await import("../models/Admin.js")).default;

    const admin = await Admin.findById(req.params.id)
      .select("-password")
      .populate('communityId', 'name');

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    console.log('✅ Admin details retrieved:', admin.name);
    res.json(admin);

  } catch (error) {
    console.error('❌ Get admin details error:', error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   UPDATE ADMIN PERMISSIONS (SUPER ADMIN ONLY)
====================== */
router.put("/admins/:id/permissions", protect, isSuperAdmin, async (req, res) => {
  try {
    console.log('🔄 Super Admin updating admin permissions:', req.params.id);

    const { permissions, reason } = req.body;
    const Admin = (await import("../models/Admin.js")).default;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update permissions using the schema method
    admin.updatePermissions(permissions, req.user.id, reason || 'Permission update via admin panel');
    await admin.save();

    console.log('✅ Admin permissions updated:', admin.name);

    res.json({
      message: 'Permissions updated successfully',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        permissions: admin.permissions,
        isActive: admin.isActive
      }
    });

  } catch (error) {
    console.error('❌ Update admin permissions error:', error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   DELETE ADMIN (SUPER ADMIN ONLY)
====================== */
router.delete("/admins/:id", protect, isSuperAdmin, async (req, res) => {
  try {
    console.log('🗑️ Super Admin deleting admin:', req.params.id);

    const Admin = (await import("../models/Admin.js")).default;
    const Member = (await import("../models/Member.js")).default;
    const Community = (await import("../models/Community.js")).default;

    const admin = await Admin.findById(req.params.id).populate('communityId', 'name');
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Prevent deleting Super Admin
    if (admin.role === 'SUPER_ADMIN') {
      return res.status(403).json({ message: "Cannot delete Super Admin account" });
    }

    // Store admin info for response before deletion
    const adminInfo = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      communityName: admin.communityId?.name || 'No Community'
    };

    // Check if admin has active community members
    if (admin.communityId) {
      const memberCount = await Member.countDocuments({ communityId: admin.communityId._id });

      if (memberCount > 0) {
        return res.status(400).json({
          message: `Cannot delete admin. Community "${admin.communityId.name}" has ${memberCount} active members. Please transfer or remove all members first.`
        });
      }

      // Update community to remove admin reference
      await Community.findByIdAndUpdate(admin.communityId._id, {
        $unset: { admin: 1 }
      });
    }

    // Delete the admin
    await Admin.findByIdAndDelete(req.params.id);

    console.log('✅ Admin deleted successfully:', adminInfo.name);

    res.json({
      success: true,
      message: `Admin "${adminInfo.name}" deleted successfully`,
      deletedAdmin: adminInfo
    });

  } catch (error) {
    console.error('❌ Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/* GET ADMIN PASSWORD (SUPER ADMIN ONLY) */
router.get("/admins/:id/password", protect, isSuperAdmin, async (req, res) => {
  try {
    console.log('🔍 Super Admin requesting admin password:', req.params.id);

    const Admin = (await import("../models/Admin.js")).default;

    const admin = await Admin.findById(req.params.id).populate('communityId', 'name');
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    console.log('✅ Password access granted for admin:', admin.name);

    // Return admin info with password (for super admin use only)
    res.json({
      adminId: admin._id,
      adminName: admin.name,
      adminEmail: admin.email,
      communityName: admin.communityId?.name || 'No Community',
      currentPassword: "123456", // Default password for display
      permissions: admin.permissions,
      isActive: admin.isActive,
      message: "Admin password retrieved successfully"
    });

  } catch (error) {
    console.error('❌ Get admin password error:', error);
    res.status(500).json({ message: error.message });
  }
});

/* UPDATE ADMIN PASSWORD (SUPER ADMIN ONLY) */
router.put("/admins/:id/password", protect, isSuperAdmin, async (req, res) => {
  try {
    console.log('🔄 Super Admin updating admin password:', req.params.id);

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const Admin = (await import("../models/Admin.js")).default;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update password using Mongoose save() to trigger pre-save middleware
    admin.password = newPassword;
    await admin.save();

    console.log('✅ Admin password updated successfully:', admin.name);

    res.json({
      message: "Admin password updated successfully",
      adminName: admin.name,
      adminEmail: admin.email,
      newPassword: newPassword
    });

  } catch (error) {
    console.error('❌ Update admin password error:', error);
    res.status(500).json({ message: error.message });
  }
});

/* GET ALL ADMINS WITH PASSWORDS (SUPER ADMIN ONLY) */
router.get("/admins-with-passwords", protect, isSuperAdmin, async (req, res) => {
  try {
    console.log('🔍 Super Admin requesting all admin passwords');

    const Admin = (await import("../models/Admin.js")).default;

    const admins = await Admin.find()
      .populate('communityId', 'name')
      .select('-password') // We'll add default password in response
      .sort({ createdAt: -1 });

    const adminsWithPasswords = admins.map(admin => ({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      communityName: admin.communityId?.name || 'No Community',
      currentPassword: "123456", // Default password for display
      permissions: admin.permissions,
      isActive: admin.isActive,
      createdAt: admin.createdAt
    }));

    console.log('✅ Admin passwords retrieved:', adminsWithPasswords.length);

    res.json(adminsWithPasswords);

  } catch (error) {
    console.error('❌ Get all admin passwords error:', error);
    res.status(500).json({ message: error.message });
  }
});
export default router;
