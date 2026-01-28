import Admin from "../models/Admin.js";
import generateToken from "../utils/generateToken.js";

/* ======================
   REGISTER ADMIN
====================== */
export const registerAdmin = async (req, res) => {
  try {
    console.log('📝 Admin Registration Request Received');
    console.log('   Body:', { ...req.body, password: '***' });

    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        message: "Name, email, and password are required",
        received: {
          hasName: !!name,
          hasEmail: !!email,
          hasPassword: !!password
        }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.toLowerCase().trim();
    if (!emailRegex.test(cleanEmail)) {
      console.log('❌ Validation failed: Invalid email format');
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Password validation
    if (password.length < 6) {
      console.log('❌ Validation failed: Password too short');
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if admin already exists
    console.log('🔍 Checking if admin exists with email:', cleanEmail);
    const exists = await Admin.findOne({ email: cleanEmail });
    if (exists) {
      console.log('❌ Admin already exists:', cleanEmail);
      return res.status(409).json({
        message: "Admin already exists with this email. Please login or use a different email."
      });
    }

    // Create admin without community initially
    console.log('✅ Creating new admin...');
    const admin = await Admin.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: phone ? phone.trim() : undefined,
      // communityId will be null initially - admin can create community after login
      // Give all permissions to new admins
      permissions: [
        'view_dashboard',
        'manage_members',
        'manage_contributions',
        'manage_loans',
        'manage_sessions',
        'view_reports',
        'manage_withdrawals',
        'approve_loans',
        'manage_social_fund',
        'view_settings'
      ]
    });

    console.log('✅ Admin registered successfully:', {
      id: admin._id,
      email: admin.email,
      name: admin.name
    });

    const token = generateToken(admin._id, admin.role);

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      communityId: admin.communityId,
      token: token,
      message: "Admin registration successful"
    });
  } catch (error) {
    console.error('❌ Admin registration error:', error);
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);

    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        message: `Validation error: ${validationErrors}`
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Admin already exists with this email. Please login or use a different email."
      });
    }

    res.status(500).json({
      message: error.message || "Server error. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/* ======================
   LOGIN ADMIN
====================== */
export const loginAdmin = async (req, res) => {
  try {
    console.log("ADMIN LOGIN REQUEST 👉", req.body);

    const { email, password } = req.body;

    // First try to find in Admin collection
    let admin = await Admin.findOne({ email }).populate("communityId");
    let isSuperAdmin = false;

    // If not found in Admin, try SuperAdmin collection
    if (!admin) {
      const SuperAdmin = (await import("../models/SuperAdmin.js")).default;
      admin = await SuperAdmin.findOne({ email });
      isSuperAdmin = true;
    }

    console.log("ADMIN FOUND 👉", admin ? "YES" : "NO");
    console.log("IS SUPER ADMIN 👉", isSuperAdmin);

    if (!admin) {
      console.log("❌ Admin/SuperAdmin not found with email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await admin.matchPassword(password);
    console.log("PASSWORD MATCH 👉", passwordMatch);

    if (!passwordMatch) {
      console.log("❌ Password mismatch for admin:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if admin is active (only for regular admins, not super admins)
    if (!isSuperAdmin && admin.isActive === false) {
      console.log("❌ Admin account deactivated:", email);
      return res.status(403).json({ message: "Account is deactivated. Contact Super Admin." });
    }

    // Super Admin doesn't need a community, and new admins can login without community
    // They will create community after login
    if (!isSuperAdmin && admin.role !== 'SUPER_ADMIN' && admin.communityId && !admin.communityId) {
      console.log("ℹ️ Admin has no community yet - they can create one after login");
    }

    console.log("✅ ADMIN/SUPER ADMIN LOGIN SUCCESS 👉", admin.email);

    const responseData = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: isSuperAdmin ? [] : (admin.permissions || []), // Super Admin doesn't need permissions array
      isActive: isSuperAdmin ? true : admin.isActive,
      token: generateToken(admin._id, admin.role),
    };

    // Add community info only if admin has a community (not for Super Admin)
    if (!isSuperAdmin && admin.communityId) {
      responseData.communityId = admin.communityId._id;
      responseData.communityName = admin.communityId.name;
    }

    res.json(responseData);
  } catch (error) {
    console.error("ADMIN LOGIN ERROR 👉", error);
    res.status(500).json({ message: error.message });
  }
};
