import jwt from "jsonwebtoken";
import SuperAdmin from "../models/SuperAdmin.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 🔐 SUPER ADMIN LOGIN
export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const superAdmin = await SuperAdmin.findOne({ email }).select("+password");

    if (!superAdmin) {
      return res.status(401).json({ message: "Super Admin not found" });
    }

    if (superAdmin.isActive === false) {
      return res.status(403).json({ message: "Account disabled" });
    }

    const isMatch = await superAdmin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      success: true,
      message: "Super Admin login successful",
      token: generateToken(superAdmin._id, superAdmin.role),
      user: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
