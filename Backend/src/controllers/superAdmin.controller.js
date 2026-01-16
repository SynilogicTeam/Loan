import SuperAdmin from "../models/SuperAdmin.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

/* ======================
   REGISTER SUPER ADMIN
====================== */
export const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await SuperAdmin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "SuperAdmin already exists" });
    }

    const admin = await SuperAdmin.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role, // ✅ VERY IMPORTANT
      token: generateToken(admin._id, admin.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   LOGIN SUPER ADMIN
====================== */
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const admin = await SuperAdmin.findOne({ email });

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role, // ✅ THIS FIXES SUPER ADMIN
      token: generateToken(admin._id, admin.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   GET SUPER ADMIN PROFILE
====================== */
export const getSuperAdminProfile = async (req, res) => {
  try {
    console.log('🔍 Getting Super Admin profile for user:', req.user.id);
    
    const admin = await SuperAdmin.findById(req.user.id).select("-password");
    
    if (!admin) {
      return res.status(404).json({ message: "Super Admin not found" });
    }

    console.log('✅ Super Admin profile found:', admin.name);

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: ['ALL'], // Super Admin has all permissions
      isActive: true,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    console.error('❌ Error getting Super Admin profile:', error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   UPDATE SUPER ADMIN PROFILE
====================== */
export const updateSuperAdminProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    
    console.log('🔄 Updating Super Admin profile for user:', req.user.id);
    
    const admin = await SuperAdmin.findById(req.user.id);
    
    if (!admin) {
      return res.status(404).json({ message: "Super Admin not found" });
    }

    // If updating password
    if (currentPassword && newPassword) {
      const isCurrentPasswordValid = await admin.matchPassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      
      admin.password = newPassword; // Will be hashed by pre-save middleware
      await admin.save();
      
      console.log('✅ Super Admin password updated');
      return res.json({ message: "Password updated successfully" });
    }

    // If updating profile info
    if (name) admin.name = name;
    if (email) {
      // Check if email already exists
      const emailExists = await SuperAdmin.findOne({ 
        email, 
        _id: { $ne: admin._id } 
      });
      
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      admin.email = email;
    }

    await admin.save();
    
    console.log('✅ Super Admin profile updated');

    const updatedAdmin = await SuperAdmin.findById(admin._id).select("-password");

    res.json({
      message: "Profile updated successfully",
      admin: {
        _id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        permissions: ['ALL'],
        isActive: true,
        createdAt: updatedAdmin.createdAt,
      }
    });
  } catch (error) {
    console.error('❌ Error updating Super Admin profile:', error);
    res.status(500).json({ message: error.message });
  }
};
