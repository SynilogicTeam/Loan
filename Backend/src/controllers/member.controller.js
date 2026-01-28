import Member from "../models/Member.js";
import generateToken from "../utils/generateToken.js";

/* =========================
   REGISTER MEMBER (PUBLIC)
========================= */
export const registerMember = async (req, res) => {
  try {
    // Member registration is disabled - members can only be added by admins
    return res.status(403).json({
      message: "Member registration is disabled. Members can only be added by community administrators."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   CREATE MEMBER (ADMIN)
========================= */
export const createMember = async (req, res) => {
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
};

/* =========================
   GET ALL MEMBERS (ADMIN)
========================= */
export const getMembers = async (req, res) => {
  try {
    let query = {};

    // Super Admin can see all members, Admin sees only their community members
    if (req.user.role === "ADMIN") {
      if (!req.user.communityId) {
        return res.json({ success: true, members: [], count: 0 });
      }
      query.communityId = req.user.communityId;
    }
    // For SUPER_ADMIN, no filter - see all members

    const members = await Member.find(query).select("-password");

    res.json({
      success: true,
      members: members,
      count: members.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   MEMBER LOGIN
========================= */
export const loginMember = async (req, res) => {
  try {
    console.log("MEMBER LOGIN REQUEST 👉", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const member = await Member.findOne({ email }).populate('communityId', 'name');
    console.log("MEMBER FOUND 👉", member ? "YES" : "NO");

    if (!member) {
      return res.status(401).json({ message: "Invalid credentials - member not found" });
    }

    const passwordMatch = await member.matchPassword(password);
    console.log("PASSWORD MATCH 👉", passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials - wrong password" });
    }

    if (!member.isActive) {
      return res.status(403).json({ message: "Member account is inactive" });
    }

    console.log("MEMBER LOGIN SUCCESS 👉", member.email);

    const responseData = {
      _id: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
      communityId: member.communityId?._id || member.communityId,
      token: generateToken(member._id, member.role),
    };

    // Add community name if populated
    if (member.communityId && member.communityId.name) {
      responseData.communityName = member.communityId.name;
    }

    res.json(responseData);
  } catch (error) {
    console.error("MEMBER LOGIN ERROR 👉", error);
    res.status(500).json({ message: error.message });
  }
};
