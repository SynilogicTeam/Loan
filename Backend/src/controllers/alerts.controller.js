import {
  getOverdueAlerts,
  updateOverdueEMIsWithLateFee,
  updateExternalEMIsWithLateFee,
  scheduledLateFeeUpdate
} from "../services/lateFeeService.js";

/* =========================
   GET OVERDUE ALERTS
========================= */
export const getOverdueAlertsController = async (req, res) => {
  try {
    let communityId = null;

    // For regular admin, filter by communityId
    if (req.user.role === "ADMIN" && req.user.communityId) {
      communityId = req.user.communityId;
    }

    const alerts = await getOverdueAlerts(communityId);

    // Group alerts by priority
    const groupedAlerts = {
      HIGH: alerts.filter(a => a.priority === 'HIGH'),
      MEDIUM: alerts.filter(a => a.priority === 'MEDIUM'),
      LOW: alerts.filter(a => a.priority === 'LOW')
    };

    // Calculate summary
    const summary = {
      totalOverdue: alerts.length,
      highPriority: groupedAlerts.HIGH.length,
      mediumPriority: groupedAlerts.MEDIUM.length,
      lowPriority: groupedAlerts.LOW.length,
      totalOverdueAmount: alerts.reduce((sum, alert) => sum + alert.amount, 0),
      totalLateFee: alerts.reduce((sum, alert) => sum + alert.lateFee, 0)
    };

    res.json({
      summary,
      alerts: groupedAlerts,
      allAlerts: alerts
    });
  } catch (error) {
    console.error("Get overdue alerts error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE LATE FEES MANUALLY
========================= */
export const updateLateFees = async (req, res) => {
  try {
    const memberEMIsUpdated = await updateOverdueEMIsWithLateFee();
    const externalEMIsUpdated = await updateExternalEMIsWithLateFee();

    res.json({
      message: "Late fees updated successfully",
      memberEMIsUpdated,
      externalEMIsUpdated,
      totalUpdated: memberEMIsUpdated + externalEMIsUpdated
    });
  } catch (error) {
    console.error("Update late fees error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET DASHBOARD ALERTS SUMMARY
========================= */
export const getDashboardAlertsSummary = async (req, res) => {
  try {
    let communityId = null;

    // For regular admin, filter by communityId
    if (req.user.role === "ADMIN" && req.user.communityId) {
      communityId = req.user.communityId;
    }

    const alerts = await getOverdueAlerts(communityId);

    // Get today's due EMIs
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const EMI = (await import("../models/EMI.js")).default;
    const ExternalEMI = (await import("../models/ExternalEMI.js")).default;

    let todayDueQuery = {
      status: 'PENDING',
      dueDate: { $gte: today, $lt: tomorrow }
    };

    if (communityId) {
      todayDueQuery.communityId = communityId;
    }

    const todayDueEMIs = await EMI.countDocuments(todayDueQuery);
    const todayDueExternalEMIs = await ExternalEMI.countDocuments({
      status: 'PENDING',
      dueDate: { $gte: today, $lt: tomorrow }
    });

    // Get upcoming due EMIs (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    let upcomingQuery = {
      status: 'PENDING',
      dueDate: { $gte: tomorrow, $lt: nextWeek }
    };

    if (communityId) {
      upcomingQuery.communityId = communityId;
    }

    const upcomingEMIs = await EMI.countDocuments(upcomingQuery);
    const upcomingExternalEMIs = await ExternalEMI.countDocuments({
      status: 'PENDING',
      dueDate: { $gte: tomorrow, $lt: nextWeek }
    });

    const summary = {
      overdue: {
        total: alerts.length,
        high: alerts.filter(a => a.priority === 'HIGH').length,
        medium: alerts.filter(a => a.priority === 'MEDIUM').length,
        low: alerts.filter(a => a.priority === 'LOW').length,
        totalAmount: alerts.reduce((sum, alert) => sum + alert.amount, 0),
        totalLateFee: alerts.reduce((sum, alert) => sum + alert.lateFee, 0)
      },
      dueToday: {
        memberEMIs: todayDueEMIs,
        externalEMIs: todayDueExternalEMIs,
        total: todayDueEMIs + todayDueExternalEMIs
      },
      upcomingDue: {
        memberEMIs: upcomingEMIs,
        externalEMIs: upcomingExternalEMIs,
        total: upcomingEMIs + upcomingExternalEMIs
      }
    };

    res.json(summary);
  } catch (error) {
    console.error("Get dashboard alerts summary error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   RUN SCHEDULED UPDATE
========================= */
export const runScheduledUpdate = async (req, res) => {
  try {
    const result = await scheduledLateFeeUpdate();
    
    res.json({
      message: "Scheduled update completed successfully",
      ...result
    });
  } catch (error) {
    console.error("Run scheduled update error:", error);
    res.status(500).json({ message: error.message });
  }
};