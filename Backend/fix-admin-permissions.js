import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const Admin = (await import('./src/models/Admin.js')).default;

console.log('🔧 FIXING ADMIN PERMISSIONS');
console.log('============================');

try {
  // Update admin with all permissions
  const allPermissions = [
    'manage_members',
    'manage_contributions', 
    'manage_loans',
    'manage_sessions',
    'manage_withdrawals',
    'view_reports',
    'manage_settings',
    'manage_social_fund',
    'approve_loans',
    'approve_withdrawals'
  ];

  const result = await Admin.updateOne(
    { email: 'admin@samiti.com' },
    { 
      $set: { 
        permissions: allPermissions,
        isActive: true
      } 
    }
  );

  console.log('✅ Admin permissions updated:', result);

  // Verify the update
  const admin = await Admin.findOne({ email: 'admin@samiti.com' });
  console.log('✅ Admin permissions verified:', admin.permissions);
  console.log('✅ Admin active status:', admin.isActive);

} catch (error) {
  console.error('❌ Error updating admin permissions:', error);
} finally {
  mongoose.disconnect();
  console.log('🔌 Database disconnected');
}