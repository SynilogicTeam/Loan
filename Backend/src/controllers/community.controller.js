import Community from "../models/Community.js";
import Admin from "../models/Admin.js";
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