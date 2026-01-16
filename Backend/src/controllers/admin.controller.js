import Admin from "../models/Admin.js";
import generateToken from "../utils/generateToken.js";

/* ======================
   REGISTER ADMIN
====================== */
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, communityId } = req.body;

    if (!name || !email || !password || !communityId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists with this email" });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      communityId,
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      communityId: admin.communityId,
      token: generateToken(admin._id, admin.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    // Super Admin doesn't need a community
    if (!isSuperAdmin && admin.role !== 'SUPER_ADMIN' && !admin.communityId) {
      console.log("❌ Admin has no community assigned:", email);
      return res.status(400).json({ message: "Community not linked" });
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
