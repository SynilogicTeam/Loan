import mongoose from "mongoose";
import dotenv from "dotenv";
import Loan from "../models/Loan.js";
import EMI from "../models/EMI.js";

dotenv.config();

const generateEMIsForLoan = async (loan) => {
  try {
    console.log(`📋 Generating EMIs for Loan ${loan._id} (${loan.purpose})`);
    
    // Delete existing EMIs for this loan
    await EMI.deleteMany({ loanId: loan._id });
    
    // Generate EMI schedule
    const startDate = new Date(loan.appliedAt || loan.createdAt);
    const emiRecords = [];
    
    for (let i = 1; i <= loan.duration; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      emiRecords.push({
        loanId: loan._id,
        memberId: loan.memberId,
        communityId: loan.communityId,
        sessionId: loan.sessionId,
        amount: loan.monthlyEMI,
        dueDate: dueDate,
        month: i,
        status: "PENDING"
      });
    }
    
    // Insert EMI records
    await EMI.insertMany(emiRecords);
    console.log(`✅ Generated ${emiRecords.length} EMI records for loan ${loan._id}`);
    
    return emiRecords.length;
  } catch (error) {
    console.error(`❌ Error generating EMIs for loan ${loan._id}:`, error.message);
    return 0;
  }
};

const run = async () => {
  try {
    console.log("🔄 Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected");

    // Get all approved and active loans
    const loans = await Loan.find({ 
      status: { $in: ["APPROVED", "ACTIVE"] } 
    });
    
    console.log(`📋 Found ${loans.length} loans that need EMI generation`);
    
    if (loans.length === 0) {
      console.log("❌ No loans found");
      process.exit(0);
    }
    
    let totalEMIsGenerated = 0;
    
    for (const loan of loans) {
      const emisGenerated = await generateEMIsForLoan(loan);
      totalEMIsGenerated += emisGenerated;
    }
    
    console.log(`\n🎉 EMI Generation Complete!`);
    console.log(`📊 Total EMIs generated: ${totalEMIsGenerated}`);
    console.log(`📊 Loans processed: ${loans.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
};

run();