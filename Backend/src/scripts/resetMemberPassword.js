import mongoose from "mongoose";
import dotenv from "dotenv";
import Member from "../models/Member.js";

dotenv.config();

const run = async () => {
  try {
    console.log("🔄 Connecting DB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected");

    // 🔥 STEP 1: LIST ALL MEMBERS
    const members = await Member.find({});
    console.log("👥 MEMBERS FOUND:", members.length);

    if (members.length === 0) {
      console.log("❌ No members found in DB");
      process.exit(0);
    }

    // 🔥 STEP 2: RESET PASSWORD FOR ALL MEMBERS
    for (const member of members) {
      console.log(`🔑 Resetting password for: ${member.email}`);
      member.password = "123456";
      await member.save(); // 🔥 hook will run
    }

    console.log("✅ ALL MEMBER PASSWORDS RESET SUCCESSFUL");
    console.log("🔑 New Password: 123456");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
};

run();