import mongoose from "mongoose";
import dotenv from "dotenv";
import EMI from "../models/EMI.js";

dotenv.config();

const run = async () => {
  try {
    console.log("🔄 Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected");

    // Find some pending EMIs and make them overdue for testing
    const pendingEMIs = await EMI.find({ 
      status: "PENDING",
      month: { $in: [2, 3] } // Get month 2 and 3 EMIs
    }).limit(3);
    
    console.log(`📋 Found ${pendingEMIs.length} EMIs to make overdue`);
    
    if (pendingEMIs.length === 0) {
      console.log("❌ No pending EMIs found");
      process.exit(0);
    }
    
    for (const emi of pendingEMIs) {
      // Set due date to past date (30 days ago)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      
      emi.dueDate = pastDate;
      emi.status = "OVERDUE";
      
      // Calculate late fee: ₹100 per day
      const daysLate = 30;
      emi.lateFee = daysLate * 100; // ₹3000 late fee
      
      await emi.save();
      
      console.log(`✅ Made EMI ${emi._id} overdue with ₹${emi.lateFee} late fee`);
    }
    
    console.log(`\n🎉 Created ${pendingEMIs.length} overdue EMIs for testing`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
};

run();