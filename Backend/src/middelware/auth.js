import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Member from "../models/Member.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔐 ADMIN OR SUPER_ADMIN
    if (decoded.role === "ADMIN" || decoded.role === "SUPER_ADMIN") {
      let admin;
      
      if (decoded.role === "SUPER_ADMIN") {
        // Look in SuperAdmin collection
        const SuperAdmin = (await import("../models/SuperAdmin.js")).default;
        admin = await SuperAdmin.findById(decoded.id).select("-password");
        
        if (!admin) {
          console.log("❌ Super Admin not found with ID:", decoded.id);
          return res.status(401).json({ message: "Super Admin not found" });
        }
        
        console.log("✅ Super Admin found:", admin.name, admin.email);
      } else {
        // Look in Admin collection
        admin = await Admin.findById(decoded.id).select("-password");
        
        if (!admin) {
          console.log("❌ Admin not found with ID:", decoded.id);
          return res.status(401).json({ message: "Admin not found" });
        }
        
        console.log("✅ Admin found:", admin.name, admin.email);
      }

      req.user = {
        _id: admin._id, // Add _id field
        id: admin._id,
        role: decoded.role, // Use role from token instead of admin.role
        communityId: admin.communityId || null, // Super Admin might not have communityId
        permissions: admin.permissions || [], // Include permissions
        isActive: admin.isActive !== false, // Include active status
      };

      console.log("✅ Auth successful - Role:", req.user.role, "ID:", req.user.id);
    }

    // 🔐 MEMBER
    else if (decoded.role === "MEMBER") {
      const member = await Member.findById(decoded.id).select("-password");
      if (!member) {
        return res.status(401).json({ message: "Member not found" });
      }

      req.user = {
        id: member._id,
        role: member.role,
        communityId: member.communityId,
      };
    }

    // 🔐 UNKNOWN ROLE
    else {
      return res.status(403).json({ message: "Invalid role" });
    }

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Token failed" });
  }
};

export default protect;
