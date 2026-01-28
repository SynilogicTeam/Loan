const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  communityId: mongoose.Schema.Types.ObjectId,
  permissions: [String],
  role: { type: String, default: 'ADMIN' },
  subscription: {
    planType: String,
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: false },
    paymentHistory: [{
      amount: Number,
      paymentDate: Date,
      paymentMethod: String,
      status: String
    }]
  }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

async function fixExistingAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all admins without permissions
    const adminsWithoutPermissions = await Admin.find({
      $or: [
        { permissions: { $exists: false } },
        { permissions: { $size: 0 } }
      ]
    });

    console.log(`Found ${adminsWithoutPermissions.length} admins without permissions`);

    const basicPermissions = [
      'view_dashboard',
      'manage_members',
      'view_contributions',
      'manage_sessions',
      'view_reports'
    ];

    for (const admin of adminsWithoutPermissions) {
      console.log(`Updating admin: ${admin.name} (${admin.email})`);
      
      admin.permissions = basicPermissions;
      
      // If admin has no subscription, give them a basic one
      if (!admin.subscription || !admin.subscription.planType) {
        admin.subscription = {
          planType: 'BASIC',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: true,
          paymentHistory: [{
            amount: 0,
            paymentDate: new Date(),
            paymentMethod: 'Free Trial',
            status: 'SUCCESS'
          }]
        };
      }
      
      await admin.save();
      console.log(`✅ Updated admin: ${admin.name}`);
    }

    console.log(`\n✅ Successfully updated ${adminsWithoutPermissions.length} admins`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixExistingAdmins();