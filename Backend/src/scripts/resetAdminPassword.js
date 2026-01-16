import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

const run = async () => {
  try {
    console.log("🔄 Connecting DB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected");

    // 🔥 STEP 1: LIST ALL ADMINS
    const admins = await Admin.find({});
    console.log("👥 ADMINS FOUND:", admins.map(a => a.email));

    if (admins.length === 0) {
      console.log("❌ No admins found in DB");
      process.exit(0);
    }

    // 🔥 STEP 2: PICK FIRST ADMIN
    const admin = admins[0];
    console.log("🔑 Resetting password for:", admin.email);

    admin.password = "123456";
    await admin.save(); // 🔥 hook will run

    console.log("✅ PASSWORD RESET SUCCESSFUL");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
};

run();
