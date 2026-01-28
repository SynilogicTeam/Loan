import Community from "../models/Community.js";
import Admin from "../models/Admin.js";
import Plan from "../models/Plan.js";
import generateToken from "../utils/generateToken.js";

/* =========================
   CREATE COMMUNITY + ADMIN
========================= */
export const createCommunity = async (req, res) => {
  try {
    const { communityName, address, adminName, adminEmail, adminPassword } =
      req.body;

    // check admin exists
    const adminExists = await Admin.findOne({ email: adminEmail });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // create community
    const community = await Community.create({
      name: communityName,
      address,
    });

    // create admin
    const admin = await Admin.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      communityId: community._id,
    });

    // link admin to community
    community.admin = admin._id;
    await community.save();

    res.status(201).json({
      message: "Community created successfully",
      community,
      admin: {
        id: admin._id,
        email: admin.email,
        token: generateToken(admin._id, admin.role),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   CREATE COMMUNITY BY EXISTING ADMIN
========================= */
export const createCommunityByAdmin = async (req, res) => {
  try {
    const { name, address, description, location, planId } = req.body;
    const adminId = req.user._id;

    console.log('🏗️ Creating community by admin:', adminId);
    console.log('🏗️ Community data:', { name, address, description, location, planId });

    // Check if admin already has a community
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.communityId) {
      return res.status(400).json({ message: "Admin already has a community" });
    }

    // If planId is provided, validate it and get plan details
    let selectedPlan = null;
    if (planId) {
      const Plan = (await import("../models/Plan.js")).default;
      selectedPlan = await Plan.findById(planId);
      if (!selectedPlan) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }
    }

    // Create community
    const community = await Community.create({
      name,
      address,
      description,
      location,
      admin: adminId,
      currentPlan: selectedPlan ? selectedPlan._id : null,
    });

    // Update admin with community ID and assign plan-based permissions
    admin.communityId = community._id;
    
    // Assign permissions based on selected plan
    if (selectedPlan) {
      // Basic permissions for all plans
      const basicPermissions = [
        'view_dashboard',
        'manage_members',
        'view_contributions',
        'manage_sessions',
        'view_reports'
      ];

      // Additional permissions based on plan
      let planPermissions = [...basicPermissions];
      
      if (selectedPlan.name === 'premium' || selectedPlan.name === 'enterprise') {
        planPermissions.push(
          'advanced_reports',
          'export_data',
          'manage_settings',
          'view_analytics'
        );
      }
      
      if (selectedPlan.name === 'enterprise') {
        planPermissions.push(
          'api_access',
          'custom_branding',
          'bulk_operations',
          'advanced_security'
        );
      }

      admin.permissions = planPermissions;
      
      // Set subscription details
      admin.subscription = {
        planType: selectedPlan.name.toUpperCase(),
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        paymentHistory: [{
          amount: selectedPlan.price.monthly,
          paymentDate: new Date(),
          paymentMethod: 'Free Trial', // For now, we'll make it free
          status: 'SUCCESS'
        }]
      };
    }
    
    await admin.save();

    console.log('✅ Community created successfully:', community._id);
    console.log('✅ Admin permissions assigned:', admin.permissions);
    console.log('✅ Admin subscription:', admin.subscription);

    res.status(201).json({
      message: "Community created successfully",
      community: {
        _id: community._id,
        name: community.name,
        address: community.address,
        description: community.description,
        location: community.location,
        currentPlan: selectedPlan ? {
          _id: selectedPlan._id,
          name: selectedPlan.name,
          displayName: selectedPlan.displayName,
          features: selectedPlan.features
        } : null,
      },
      permissions: admin.permissions,
      subscription: admin.subscription
    });
  } catch (error) {
    console.error('❌ Error creating community:', error);
    res.status(500).json({ message: error.message });
  }
};