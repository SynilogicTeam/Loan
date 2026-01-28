import express from "express";
import protect from "../middelware/auth.js";
import isAdmin from "../middelware/isAdmin.js";

const router = express.Router();

/* =========================
   CHECK COMMUNITY STATUS
========================= */
router.get("/status", protect, isAdmin, async (req, res) => {
    try {
        console.log("🔍 Checking community status for admin:", req.user.id);

        const Admin = (await import("../models/Admin.js")).default;
        const Community = (await import("../models/Community.js")).default;

        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        let communityData = null;
        if (admin.communityId) {
            const community = await Community.findById(admin.communityId);
            if (community) {
                communityData = {
                    _id: community._id,
                    name: community.name,
                    description: community.description,
                    memberCount: community.memberCount,
                    isActive: community.isActive
                };
            }
        }

        res.json({
            hasCommunity: !!admin.communityId,
            community: communityData,
            adminName: admin.name,
            adminEmail: admin.email
        });

    } catch (error) {
        console.error("❌ Community status check error:", error);
        res.status(500).json({ message: error.message });
    }
});

/* =========================
   CREATE COMMUNITY (SELF-SERVICE)
========================= */
router.post("/create", protect, isAdmin, async (req, res) => {
    try {
        console.log("🏘️ Admin creating community:", req.user.id);
        console.log("📝 Community data:", req.body);

        const Admin = (await import("../models/Admin.js")).default;
        const Community = (await import("../models/Community.js")).default;
        const Session = (await import("../models/Session.js")).default;
        const Plan = (await import("../models/Plan.js")).default;
        const Subscription = (await import("../models/Subscription.js")).default;

        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Check if admin already has a community
        if (admin.communityId) {
            return res.status(400).json({
                message: "You already have a community assigned. Contact support to change communities."
            });
        }

        const {
            name,
            description,
            address,
            registrationNumber,
            fixedContributionAmount,
            fixedContributionDueDay,
            planId
        } = req.body;

        // Validate required fields
        if (!name || !description || !address) {
            return res.status(400).json({
                message: "Community name, description, and address are required"
            });
        }

        if (!planId) {
            return res.status(400).json({
                message: "Subscription plan is required"
            });
        }

        // Fetch Plan
        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({
                message: "Selected plan not found"
            });
        }

        // Check if community name already exists
        const existingCommunity = await Community.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingCommunity) {
            return res.status(400).json({
                message: "A community with this name already exists. Please choose a different name."
            });
        }

        // Create community
        const community = await Community.create({
            name: name.trim(),
            description: description.trim(),
            address: address.trim(),
            registrationNumber: registrationNumber || `COM-${Date.now()}`,
            memberCount: 0,
            isActive: true,
            currentPlan: plan._id,
            subscriptionStatus: 'ACTIVE',
            settings: {
                contributions: {
                    fixedEnabled: !!fixedContributionAmount,
                    fixedAmount: fixedContributionAmount || 5000,
                    fixedDueDay: fixedContributionDueDay || 10
                }
            },
            createdBy: req.user.id,
            createdAt: new Date()
        });

        console.log("✅ Community created:", community._id);

        // Create Subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // 30 days validity

        const subscription = await Subscription.create({
            communityId: community._id,
            planId: plan._id,
            status: "ACTIVE",
            startDate: startDate,
            endDate: endDate,
            amount: plan.price.monthly,
            paymentHistory: [{
                amount: plan.price.monthly,
                date: new Date(),
                status: "SUCCESS"
            }]
        });

        console.log("✅ Subscription created:", subscription._id);

        // Assign community and permissions to admin
        admin.communityId = community._id;
        admin.permissions = plan.permissions || []; // Assign permissions from plan
        await admin.save();

        console.log("✅ Community assigned to admin with permissions:", admin.permissions.length);

        // Create initial session for the community
        const currentDate = new Date();
        const sessionName = `Session ${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

        const session = await Session.create({
            name: sessionName,
            communityId: community._id,
            startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
            endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
            openingBalance: 0,
            closingBalance: 0,
            isActive: true,
            createdBy: req.user.id
        });

        console.log("✅ Initial session created:", session._id);

        res.status(201).json({
            message: "Community created successfully! You can now start managing members and contributions.",
            community: {
                _id: community._id,
                name: community.name,
                description: community.description,
                address: community.address,
                registrationNumber: community.registrationNumber,
                memberCount: community.memberCount
            },
            session: {
                _id: session._id,
                name: session.name,
                isActive: session.isActive
            },
            permissions: admin.permissions // Return updated permissions
        });

    } catch (error) {
        console.error("❌ Community creation error:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
