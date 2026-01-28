import EMI from "../models/EMI.js";
import ExternalEMI from "../models/ExternalEMI.js";
import InterestRateConfig from "../models/InterestRateConfig.js";

/* =========================
   CALCULATE LATE FEE FOR EMI
========================= */
export const calculateLateFeeForEMI = async (emi) => {
  try {
    if (emi.status === 'PAID' || emi.dueDate >= new Date()) {
      return 0; // No late fee if paid or not overdue
    }

    // Get interest rate config for the community
    const Loan = (await import("../models/Loan.js")).default;
    const loan = await Loan.findById(emi.loanId).populate('communityId');
    
    if (!loan) {
      return 0;
    }

    const config = await InterestRateConfig.findOne({
      communityId: loan.communityId,
      isActive: true
    });

    const lateFeeRate = config?.lateFeeRate || 5; // Default 5%
    const gracePeriod = config?.gracePeriod || 7; // Default 7 days

    // Calculate days overdue
    const daysOverdue = Math.floor((new Date() - emi.dueDate) / (1000 * 60 * 60 * 24));
    
    if (daysOverdue <= gracePeriod) {
      return 0; // Within grace period
    }

    // Calculate late fee as percentage of EMI amount
    const lateFee = Math.floor((emi.amount * lateFeeRate) / 100);
    
    return lateFee;
  } catch (error) {
    console.error("Calculate late fee for EMI error:", error);
    return 0;
  }
};

/* =========================
   UPDATE OVERDUE EMIs WITH LATE FEE
========================= */
export const updateOverdueEMIsWithLateFee = async () => {
  try {
    console.log("🔄 Updating overdue EMIs with late fee...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find overdue EMIs
    const overdueEMIs = await EMI.find({
      status: 'PENDING',
      dueDate: { $lt: today }
    }).populate({
      path: 'loanId',
      populate: { path: 'communityId' }
    });

    let updatedCount = 0;

    for (const emi of overdueEMIs) {
      const lateFee = await calculateLateFeeForEMI(emi);
      
      if (lateFee > 0 && emi.lateFee !== lateFee) {
        emi.lateFee = lateFee;
        emi.status = 'OVERDUE';
        await emi.save();
        updatedCount++;
      } else if (emi.status !== 'OVERDUE') {
        emi.status = 'OVERDUE';
        await emi.save();
        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} overdue EMIs with late fee`);
    return updatedCount;
  } catch (error) {
    console.error("Update overdue EMIs with late fee error:", error);
    return 0;
  }
};

/* =========================
   UPDATE EXTERNAL EMIs WITH LATE FEE
========================= */
export const updateExternalEMIsWithLateFee = async () => {
  try {
    console.log("🔄 Updating overdue external EMIs with late fee...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find overdue external EMIs
    const overdueEMIs = await ExternalEMI.find({
      status: 'PENDING',
      dueDate: { $lt: today }
    });

    let updatedCount = 0;

    for (const emi of overdueEMIs) {
      const lateFee = emi.calculateLateFee();
      
      if (lateFee > 0 && emi.lateFee !== lateFee) {
        emi.lateFee = lateFee;
        emi.status = 'OVERDUE';
        await emi.save();
        updatedCount++;
      } else if (emi.status !== 'OVERDUE') {
        emi.status = 'OVERDUE';
        await emi.save();
        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} overdue external EMIs with late fee`);
    return updatedCount;
  } catch (error) {
    console.error("Update external EMIs with late fee error:", error);
    return 0;
  }
};

/* =========================
   GET OVERDUE ALERTS
========================= */
export const getOverdueAlerts = async (communityId = null) => {
  try {
    let query = { status: 'OVERDUE' };
    if (communityId) {
      query.communityId = communityId;
    }

    // Get overdue EMIs
    const overdueEMIs = await EMI.find(query)
      .populate('memberId', 'name phone email')
      .populate('loanId', 'principalAmount')
      .sort({ dueDate: 1 });

    // Get overdue external EMIs
    const overdueExternalEMIs = await ExternalEMI.find({ status: 'OVERDUE' })
      .populate('borrowerId', 'name phone email')
      .populate('loanId', 'principalAmount loanNumber')
      .sort({ dueDate: 1 });

    const alerts = [];

    // Process member EMIs
    overdueEMIs.forEach(emi => {
      const daysOverdue = Math.floor((new Date() - emi.dueDate) / (1000 * 60 * 60 * 24));
      alerts.push({
        type: 'MEMBER_EMI',
        id: emi._id,
        memberName: emi.memberId?.name || 'Unknown',
        memberPhone: emi.memberId?.phone,
        memberEmail: emi.memberId?.email,
        amount: emi.amount,
        lateFee: emi.lateFee,
        dueDate: emi.dueDate,
        daysOverdue,
        loanAmount: emi.loanId?.principalAmount,
        priority: daysOverdue > 30 ? 'HIGH' : daysOverdue > 15 ? 'MEDIUM' : 'LOW'
      });
    });

    // Process external EMIs
    overdueExternalEMIs.forEach(emi => {
      const daysOverdue = Math.floor((new Date() - emi.dueDate) / (1000 * 60 * 60 * 24));
      alerts.push({
        type: 'EXTERNAL_EMI',
        id: emi._id,
        borrowerName: emi.borrowerId?.name || 'Unknown',
        borrowerPhone: emi.borrowerId?.phone,
        borrowerEmail: emi.borrowerId?.email,
        amount: emi.totalAmount,
        lateFee: emi.lateFee,
        dueDate: emi.dueDate,
        daysOverdue,
        loanNumber: emi.loanId?.loanNumber,
        loanAmount: emi.loanId?.principalAmount,
        priority: daysOverdue > 30 ? 'HIGH' : daysOverdue > 15 ? 'MEDIUM' : 'LOW'
      });
    });

    // Sort by priority and days overdue
    alerts.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.daysOverdue - a.daysOverdue;
    });

    return alerts;
  } catch (error) {
    console.error("Get overdue alerts error:", error);
    return [];
  }
};

/* =========================
   SCHEDULE LATE FEE CALCULATION (CRON JOB)
========================= */
export const scheduledLateFeeUpdate = async () => {
  try {
    console.log("🕐 Running scheduled late fee update...");
    
    const memberEMIsUpdated = await updateOverdueEMIsWithLateFee();
    const externalEMIsUpdated = await updateExternalEMIsWithLateFee();
    
    console.log(`✅ Scheduled update completed: ${memberEMIsUpdated + externalEMIsUpdated} EMIs updated`);
    
    return {
      memberEMIsUpdated,
      externalEMIsUpdated,
      totalUpdated: memberEMIsUpdated + externalEMIsUpdated
    };
  } catch (error) {
    console.error("Scheduled late fee update error:", error);
    return { memberEMIsUpdated: 0, externalEMIsUpdated: 0, totalUpdated: 0 };
  }
};