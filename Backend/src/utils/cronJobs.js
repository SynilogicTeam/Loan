import cron from 'node-cron';
import { scheduledLateFeeUpdate } from '../services/lateFeeService.js';

/* =========================
   SETUP CRON JOBS
========================= */
export const setupCronJobs = () => {
  console.log('🕐 Setting up cron jobs...');

  // Run late fee calculation daily at 6:00 AM
  cron.schedule('0 6 * * *', async () => {
    console.log('🕐 Running daily late fee calculation...');
    try {
      const result = await scheduledLateFeeUpdate();
      console.log(`✅ Daily late fee calculation completed: ${result.totalUpdated} EMIs updated`);
    } catch (error) {
      console.error('❌ Daily late fee calculation failed:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  // Run late fee calculation every hour during business hours (9 AM to 6 PM)
  cron.schedule('0 9-18 * * *', async () => {
    console.log('🕐 Running hourly late fee check...');
    try {
      const result = await scheduledLateFeeUpdate();
      if (result.totalUpdated > 0) {
        console.log(`✅ Hourly late fee check completed: ${result.totalUpdated} EMIs updated`);
      }
    } catch (error) {
      console.error('❌ Hourly late fee check failed:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('✅ Cron jobs setup completed');
  console.log('   • Daily late fee calculation: 6:00 AM IST');
  console.log('   • Hourly late fee check: 9:00 AM - 6:00 PM IST');
};