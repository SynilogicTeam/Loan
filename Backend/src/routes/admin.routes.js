import express from "express";
import { loginAdmin, registerAdmin } from "../controllers/admin.controller.js";
import protect from "../middelware/auth.js";
import isSuperAdmin from "../middelware/isSuperAdmin.js";
import isAdmin from "../middelware/isAdmin.js";
import checkPermission from "../middelware/checkPermission.js";
import Admin from "../models/Admin.js";
import Member from "../models/Member.js";
import Contribution from "../models/Contribution.js";
import Loan from "../models/Loan.js";
import Withdrawal from "../models/Withdrawal.js";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/register", registerAdmin);  // ✅ ADD REGISTRATION ROUTE

/* ======================
   ADMIN PROFILE
====================== */
router.get("/profile", protect, isAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id)
      .select("-password")
      .populate('communityId', 'name');
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    res.json(admin);
  } catch (error) {
    console.error("Admin profile error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   UPDATE ADMIN PROFILE
====================== */
router.put("/profile", protect, isAdmin, async (req, res) => {
  try {
    console.log('🔄 Admin profile update request:', req.user.id);
    console.log('📝 Update data:', req.body);

    const { name, email, currentPassword, newPassword } = req.body;
    
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // If email is being changed, check if it already exists
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ 
        email, 
        _id: { $ne: req.user.id } 
      });
      if (emailExists) {
        return res.status(400).json({ 
          message: "An admin with this email already exists" 
        });
      }
    }

    // If password is being changed, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          message: "Current password is required to change password" 
        });
      }

      const passwordMatch = await admin.matchPassword(currentPassword);
      if (!passwordMatch) {
        return res.status(400).json({ 
          message: "Current password is incorrect" 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          message: "New password must be at least 6 characters long" 
        });
      }
    }

    // Update fields
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (newPassword) admin.password = newPassword;

    await admin.save();

    console.log('✅ Admin profile updated successfully:', admin.email);

    // Return updated profile without password
    const updatedAdmin = await Admin.findById(req.user.id)
      .select("-password")
      .populate('communityId', 'name');

    res.json({
      message: "Profile updated successfully",
      admin: updatedAdmin
    });

  } catch (error) {
    console.error("Update admin profile error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ 
        message: "An admin with this email already exists" 
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   TEST ROUTE - ADMIN ONLY
====================== */
router.get("/test", protect, isAdmin, async (req, res) => {
  try {
    res.json({ 
      message: "Admin test route working!",
      user: {
        id: req.user._id,
        role: req.user.role,
        communityId: req.user.communityId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   ADMIN → GET MEMBERS IN THEIR COMMUNITY
====================== */
router.get("/members", protect, isAdmin, async (req, res) => {
  try {
    console.log('🔍 Admin members request from user:', req.user.role, req.user.communityId);
    
    // Get members from the admin's community
    const members = await Member.find({ communityId: req.user.communityId })
      .select("-password")
      .populate('communityId', 'name');
    
    console.log('✅ Found members:', members.length);
    res.json(members);
  } catch (error) {
    console.error("Get admin members error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   ADMIN → CREATE MEMBER IN THEIR COMMUNITY
====================== */
router.post("/members", protect, isAdmin, checkPermission('manage_members'), async (req, res) => {
  try {
    console.log("CREATE MEMBER REQUEST 👉", req.body);
    console.log("USER ROLE 👉", req.user.role);
    console.log("USER COMMUNITY ID 👉", req.user.communityId);

    const { 
      name, 
      email, 
      password, 
      phone, 
      communityId,
      address,
      occupation,
      monthlyIncome,
      emergencyContact,
      emergencyPhone,
      aadharNumber,
      panNumber,
      bankAccount,
      ifscCode,
      nomineeName,
      nomineeRelation,
      nomineePhone
    } = req.body;

    const exists = await Member.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Member already exists" });
    }

    // For Super Admin, communityId should come from request body
    // For regular Admin, use their assigned communityId
    let memberCommunityId;
    
    if (req.user.role === "SUPER_ADMIN") {
      if (!communityId) {
        return res.status(400).json({ message: "Community ID is required for Super Admin" });
      }
      memberCommunityId = communityId;
    } else {
      // Regular admin
      if (!req.user.communityId) {
        return res.status(400).json({ message: "Admin not assigned to any community" });
      }
      memberCommunityId = req.user.communityId;
    }

    console.log("CREATING MEMBER WITH COMMUNITY ID 👉", memberCommunityId);

    const member = await Member.create({
      name,
      email,
      password: password || 'member123', // Default password if not provided
      phone,
      communityId: memberCommunityId,
      // Enhanced profile fields
      address,
      occupation,
      monthlyIncome,
      emergencyContact,
      emergencyPhone,
      aadharNumber,
      panNumber,
      bankAccount,
      ifscCode,
      nomineeName,
      nomineeRelation,
      nomineePhone,
    });

    // Update community member count
    const Community = (await import("../models/Community.js")).default;
    const currentMemberCount = await Member.countDocuments({ communityId: memberCommunityId });
    await Community.findByIdAndUpdate(memberCommunityId, { 
      memberCount: currentMemberCount 
    });

    console.log("MEMBER CREATED SUCCESSFULLY 👉", member._id);
    console.log("COMMUNITY MEMBER COUNT UPDATED 👉", currentMemberCount);

    res.status(201).json({
      message: "Member created successfully with complete profile",
      member,
    });
  } catch (error) {
    console.error("CREATE MEMBER ERROR 👉", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   ADMIN → GET CONTRIBUTIONS IN THEIR COMMUNITY
====================== */
router.get("/contributions", protect, isAdmin, async (req, res) => {
  try {
    console.log('🔍 Admin contributions request from user:', req.user.role, req.user.communityId);
    
    // Get contributions from members in the admin's community
    const contributions = await Contribution.find({ communityId: req.user.communityId })
      .populate('memberId', 'name email phone')
      .populate('sessionId', 'name')
      .sort({ createdAt: -1 });
    
    console.log('✅ Found contributions:', contributions.length);
    
    // Transform data for admin view
    const transformedContributions = contributions.map(contrib => ({
      _id: contrib._id,
      amount: contrib.amount,
      month: contrib.month,
      paymentMethod: contrib.paymentMethod,
      status: contrib.status,
      remarks: contrib.remarks,
      createdAt: contrib.createdAt,
      paidAt: contrib.paidAt,
      memberName: contrib.memberId?.name || 'Unknown Member',
      memberEmail: contrib.memberId?.email || '',
      sessionName: contrib.sessionId?.name || 'Unknown Session'
    }));
    
    res.json(transformedContributions);
  } catch (error) {
    console.error("Get admin contributions error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   SUPER ADMIN → GET ALL ADMINS
====================== */
router.get("/", protect, isSuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().select("-password")
      .populate('communityId', 'name');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   CREATE ADMIN (SUPER ADMIN ONLY)
====================== */
router.post("/", protect, isSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, communityId, permissions, isActive } = req.body;

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
router.put("/:adminId/status", protect, isSuperAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const admin = await Admin.findByIdAndUpdate(
      req.params.adminId,
      { isActive },
      { new: true }
    ).select("-password");

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
   RESET ADMIN PASSWORD
====================== */
router.put("/:adminId/reset-password", protect, isSuperAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    
    const admin = await Admin.findById(req.params.adminId);
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({
      message: "Password reset successfully",
      adminName: admin.name,
      adminEmail: admin.email
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   ADMIN → UPDATE MEMBER DETAILS
====================== */
router.put("/members/:memberId", protect, isAdmin, async (req, res) => {
  try {
    const { memberId } = req.params;
    const updateData = req.body;
    
    console.log('🔄 Admin updating member:', {
      adminId: req.user.id,
      memberId,
      updateData: Object.keys(updateData)
    });
    
    // Get admin's community
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    // Find member and verify they belong to admin's community
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    if (member.communityId.toString() !== admin.communityId.toString()) {
      return res.status(403).json({ message: "You can only manage members from your community" });
    }
    
    // Handle password update properly
    if (updateData.password && updateData.password.trim() !== '') {
      console.log('🔐 Password update requested for member:', member.name);
      // Password will be hashed by the pre-save middleware
      member.password = updateData.password.trim();
    }
    
    // Update other fields
    const fieldsToUpdate = { ...updateData };
    delete fieldsToUpdate.password; // Remove password from direct update
    
    // Update member fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] !== undefined) {
        member[key] = fieldsToUpdate[key];
      }
    });
    
    // Save member (this will trigger password hashing if password was changed)
    await member.save();
    
    console.log('✅ Member updated successfully:', {
      memberId: member._id,
      name: member.name,
      email: member.email,
      passwordUpdated: !!updateData.password
    });
    
    // Return updated member without password
    const updatedMember = await Member.findById(memberId)
      .select("-password")
      .populate('communityId', 'name');
    
    res.json({
      message: "Member updated successfully",
      member: updatedMember
    });
  } catch (error) {
    console.error("Update member error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   ADMIN → UPDATE MEMBER STATUS (SUSPEND/ACTIVATE)
====================== */
router.put("/members/:memberId/status", protect, isAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const { memberId } = req.params;
    
    console.log('🔄 Admin updating member status:', {
      adminId: req.user.id,
      memberId,
      isActive
    });
    
    const isSuperAdmin = req.user.role === "SUPER_ADMIN";
    let admin = null;
    
    if (!isSuperAdmin) {
      admin = await Admin.findById(req.user.id);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
    }
    
    // Find member and verify they belong to admin's community
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    if (!isSuperAdmin) {
      if (!admin.communityId) {
        return res.status(403).json({ message: "Admin not assigned to any community" });
      }
      
      if (member.communityId.toString() !== admin.communityId.toString()) {
        return res.status(403).json({ message: "You can only manage members from your community" });
      }
    }
    
    // Update member status
    member.isActive = isActive;
    await member.save();
    
    console.log('✅ Member status updated:', {
      memberId: member._id,
      name: member.name,
      isActive: member.isActive
    });
    
    res.json({
      message: `Member ${isActive ? 'activated' : 'suspended'} successfully`,
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        isActive: member.isActive
      }
    });
  } catch (error) {
    console.error("Update member status error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   ADMIN → REMOVE MEMBER
====================== */
router.delete("/members/:memberId", protect, isAdmin, async (req, res) => {
  try {
    const { memberId } = req.params;
    
    console.log('🗑️ Admin/Super Admin removing member:', {
      userId: req.user.id,
      userRole: req.user.role,
      memberId
    });
    
    let admin = null;
    let isSuperAdmin = req.user.role === "SUPER_ADMIN";
    
    if (isSuperAdmin) {
      // For Super Admin, create a virtual admin object
      admin = {
        _id: req.user.id,
        role: "SUPER_ADMIN",
        communityId: null // Super Admin can manage all communities
      };
      console.log('✅ Super Admin access granted for member removal');
    } else {
      // Get regular admin's community
      admin = await Admin.findById(req.user.id);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
    }
    
    // Find member and verify permissions
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    // Super Admin can remove members from any community
    // Regular Admin can only remove members from their assigned community
    if (!isSuperAdmin) {
      if (!admin.communityId) {
        return res.status(403).json({ message: "Admin not assigned to any community" });
      }
      
      if (member.communityId.toString() !== admin.communityId.toString()) {
        return res.status(403).json({ message: "You can only manage members from your community" });
      }
    }
    
    // Check if member has active loans or pending transactions
    const Loan = (await import("../models/Loan.js")).default;
    const Contribution = (await import("../models/Contribution.js")).default;
    const Withdrawal = (await import("../models/Withdrawal.js")).default;
    
    // Super Admin can force delete, regular admin needs to check constraints
    if (!isSuperAdmin) {
      const activeLoan = await Loan.findOne({
        memberId: memberId,
        status: { $in: ["PENDING", "ACTIVE"] }
      });
      
      if (activeLoan) {
        return res.status(400).json({ 
          message: "Cannot remove member with active or pending loans. Please settle all loans first." 
        });
      }
      
      const pendingWithdrawal = await Withdrawal.findOne({
        memberId: memberId,
        status: { $in: ["PENDING", "APPROVED"] }
      });
      
      if (pendingWithdrawal) {
        return res.status(400).json({ 
          message: "Cannot remove member with pending withdrawal requests. Please process all withdrawals first." 
        });
      }
    } else {
      // Super Admin - log if there are pending transactions but allow deletion
      const activeLoan = await Loan.findOne({
        memberId: memberId,
        status: { $in: ["PENDING", "ACTIVE"] }
      });
      
      const pendingWithdrawal = await Withdrawal.findOne({
        memberId: memberId,
        status: { $in: ["PENDING", "APPROVED"] }
      });
      
      if (activeLoan || pendingWithdrawal) {
        console.log('⚠️ Super Admin force deleting member with pending transactions:', {
          memberId,
          hasActiveLoan: !!activeLoan,
          hasPendingWithdrawal: !!pendingWithdrawal
        });
      }
    }
    
    // Store member info for response
    const memberInfo = {
      id: member._id,
      name: member.name,
      email: member.email
    };
    
    // Remove member and related data
    if (isSuperAdmin) {
      // Super Admin - delete ALL related data including pending transactions
      await Promise.all([
        Member.findByIdAndDelete(memberId),
        Contribution.deleteMany({ memberId: memberId }),
        Loan.deleteMany({ memberId: memberId }), // Delete ALL loans
        Withdrawal.deleteMany({ memberId: memberId }) // Delete ALL withdrawals
      ]);
      console.log('✅ Super Admin: All member data deleted including pending transactions');
    } else {
      // Regular Admin - only delete completed/rejected transactions
      await Promise.all([
        Member.findByIdAndDelete(memberId),
        Contribution.deleteMany({ memberId: memberId }),
        Loan.deleteMany({ memberId: memberId, status: { $in: ["REJECTED", "COMPLETED"] } }),
        Withdrawal.deleteMany({ memberId: memberId, status: { $in: ["REJECTED", "DISBURSED"] } })
      ]);
      console.log('✅ Regular Admin: Member deleted with safe transaction cleanup');
    }

    // Update community member count
    const Community = (await import("../models/Community.js")).default;
    const currentMemberCount = await Member.countDocuments({ communityId: member.communityId });
    await Community.findByIdAndUpdate(member.communityId, { 
      memberCount: currentMemberCount 
    });
    
    console.log('✅ Member removed successfully:', memberInfo);
    console.log('✅ Community member count updated:', currentMemberCount);
    
    res.json({
      message: `Member "${memberInfo.name}" removed successfully`,
      removedMember: memberInfo
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* GET MEMBER PASSWORD (ADMIN ONLY) */
router.get("/members/:id/password", protect, isAdmin, checkPermission('manage_members'), async (req, res) => {
  try {
    console.log('🔍 Admin requesting member password:', req.params.id);

    const Member = (await import("../models/Member.js")).default;
    const Admin = (await import("../models/Admin.js")).default;
    
    // Get admin's community
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Get member and verify they belong to admin's community
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (member.communityId.toString() !== admin.communityId.toString()) {
      return res.status(403).json({ message: "Access denied - member not in your community" });
    }

    console.log('✅ Password access granted for member:', member.name);

    // Return member info with password (for admin use only)
    res.json({
      memberId: member._id,
      memberName: member.name,
      memberEmail: member.email,
      currentPassword: "123456", // Default password for display
      message: "Password retrieved successfully"
    });

  } catch (error) {
    console.error('❌ Get member password error:', error);
    res.status(500).json({ message: error.message });
  }
});

/* UPDATE MEMBER PASSWORD (ADMIN ONLY) */
router.put("/members/:id/password", protect, isAdmin, checkPermission('manage_members'), async (req, res) => {
  try {
    console.log('🔄 Admin updating member password:', req.params.id);

    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const Member = (await import("../models/Member.js")).default;
    const Admin = (await import("../models/Admin.js")).default;
    
    // Get admin's community
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Get member and verify they belong to admin's community
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (member.communityId.toString() !== admin.communityId.toString()) {
      return res.status(403).json({ message: "Access denied - member not in your community" });
    }

    // Update password using Mongoose save() to trigger pre-save middleware
    member.password = newPassword;
    await member.save();

    console.log('✅ Member password updated successfully:', member.name);

    res.json({
      message: "Member password updated successfully",
      memberName: member.name,
      memberEmail: member.email,
      newPassword: newPassword
    });

  } catch (error) {
    console.error('❌ Update member password error:', error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   LOANS MANAGEMENT
====================== */
router.get("/loans", protect, isAdmin, checkPermission('manage_loans'), async (req, res) => {
  try {
    const loans = await Loan.find({ communityId: req.user.communityId })
      .populate('memberId', 'name email phone')
      .populate('communityId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(loans);
  } catch (error) {
    console.error("Get loans error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/loans/:loanId/approve", protect, isAdmin, checkPermission('approve_loans'), async (req, res) => {
  try {
    const { loanId } = req.params;
    const { approvalNotes } = req.body;
    
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    
    loan.status = 'APPROVED';
    loan.approvedBy = req.user._id;
    loan.approvedAt = new Date();
    loan.approvalNotes = approvalNotes;
    
    await loan.save();
    
    res.json({ message: "Loan approved successfully", loan });
  } catch (error) {
    console.error("Approve loan error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/loans/:loanId/reject", protect, isAdmin, checkPermission('approve_loans'), async (req, res) => {
  try {
    const { loanId } = req.params;
    const { rejectionReason } = req.body;
    
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    
    loan.status = 'REJECTED';
    loan.rejectedBy = req.user._id;
    loan.rejectedAt = new Date();
    loan.rejectionReason = rejectionReason;
    
    await loan.save();
    
    res.json({ message: "Loan rejected successfully", loan });
  } catch (error) {
    console.error("Reject loan error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   WITHDRAWALS MANAGEMENT
====================== */
router.get("/withdrawals", protect, isAdmin, checkPermission('manage_withdrawals'), async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ communityId: req.user.communityId })
      .populate('memberId', 'name email phone')
      .populate('communityId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(withdrawals);
  } catch (error) {
    console.error("Get withdrawals error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/withdrawals/:withdrawalId/approve", protect, isAdmin, checkPermission('approve_withdrawals'), async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { approvalNotes } = req.body;
    
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    
    withdrawal.status = 'APPROVED';
    withdrawal.approvedBy = req.user._id;
    withdrawal.approvedAt = new Date();
    withdrawal.approvalNotes = approvalNotes;
    
    await withdrawal.save();
    
    res.json({ message: "Withdrawal approved successfully", withdrawal });
  } catch (error) {
    console.error("Approve withdrawal error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================
   GET SINGLE ADMIN BY ID
====================== */
router.get("/:adminId", protect, isSuperAdmin, async (req, res) => {
  try {
    const { adminId } = req.params;
    
    const admin = await Admin.findById(adminId)
      .select("-password")
      .populate('communityId', 'name');
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    res.json(admin);
  } catch (error) {
    console.error("Get admin by ID error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all admins (Super Admin only)
router.get('/all', protect, isSuperAdmin, async (req, res) => {
  try {
    // Check if user is Super Admin
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }

    const admins = await Admin.find()
      .populate('communityId', 'name')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ======================
   IMPERSONATE ADMIN (SUPER ADMIN)
====================== */
router.post("/:adminId/impersonate", protect, isSuperAdmin, async (req, res) => {
  try {
    const { adminId } = req.params;
    const admin = await Admin.findById(adminId).populate("communityId");
    
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
   UPDATE ADMIN PERMISSIONS (SUPER ADMIN ONLY)
====================== */
router.put("/:adminId/permissions", protect, isSuperAdmin, async (req, res) => {
  try {
    const { adminId } = req.params;
    const { permissions, reason } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Update permissions using the schema method
    admin.updatePermissions(permissions, req.user.id, reason || 'Permission update via admin panel');

    await admin.save();

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
    console.error('Error updating permissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update admin subscription (Super Admin only)
router.put('/:adminId/subscription', protect, isSuperAdmin, async (req, res) => {
  try {
    // Check if user is Super Admin
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }

    const { adminId } = req.params;
    const { planType, duration } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Renew subscription using the schema method
    admin.renewSubscription(planType, duration);

    // Add payment history entry
    admin.subscription.paymentHistory.push({
      amount: getSubscriptionPrice(planType),
      paymentDate: new Date(),
      paymentMethod: 'Admin Renewal',
      transactionId: `ADM_${Date.now()}`,
      status: 'SUCCESS'
    });

    await admin.save();

    res.json({ 
      message: 'Subscription renewed successfully',
      subscription: admin.subscription
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin subscription details
router.get('/:adminId/subscription', protect, async (req, res) => {
  try {
    const { adminId } = req.params;

    // Check if user is Super Admin or the admin themselves
    if (req.user.role !== 'SUPER_ADMIN' && req.user.id.toString() !== adminId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const admin = await Admin.findById(adminId).select('subscription name email');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const subscriptionInfo = {
      ...admin.subscription.toObject(),
      isActive: admin.isSubscriptionActive(),
      daysUntilExpiry: admin.getDaysUntilExpiry()
    };

    res.json(subscriptionInfo);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get subscription price
function getSubscriptionPrice(planType) {
  const prices = {
    'BASIC': 999,
    'PREMIUM': 1999,
    'ENTERPRISE': 4999
  };
  return prices[planType] || 999;
}
export default router;
