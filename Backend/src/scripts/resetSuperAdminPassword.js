import mongoose from "mongoose";
import dotenv from "dotenv";
import SuperAdmin from "../models/SuperAdmin.js";

dotenv.config();

const run = async () => {
  try {
    console.log("🔄 Connecting DB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected");

    // 🔥 STEP 1: LIST ALL SUPER ADMINS
    const superAdmins = await SuperAdmin.find({});
    console.log("👥 SUPER ADMINS FOUND:", superAdmins.map(a => a.email));

    if (superAdmins.length === 0) {
      console.log("❌ No super admins found in DB");
      process.exit(0);
    }

    // 🔥 STEP 2: PICK FIRST SUPER ADMIN
    const superAdmin = superAdmins[0];
    console.log("🔑 Resetting password for:", superAdmin.email);

    superAdmin.password = "admin123";
    await superAdmin.save(); // 🔥 hook will run

    console.log("✅ SUPER ADMIN PASSWORD RESET SUCCESSFUL");
    console.log("📧 Email:", superAdmin.email);
    console.log("🔑 Password: admin123");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
};

run();