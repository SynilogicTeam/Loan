const mongoose = require('mongoose');

// MongoDB connection
const MONGO_URI = 'mongodb://saasadmin:saas123@ac-ibylzq8-shard-00-00.uydgzb2.mongodb.net:27017,ac-ibylzq8-shard-00-01.uydgzb2.mongodb.net:27017,ac-ibylzq8-shard-00-02.uydgzb2.mongodb.net:27017/test?ssl=true&replicaSet=atlas-147xe7-shard-0&authSource=admin&retryWrites=true&w=majority';

async function resetAdminPassword() {
    try {
        console.log('🔧 Resetting Admin Password...\n');

        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Import models
        const Admin = mongoose.model('Admin', new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            communityId: mongoose.Schema.Types.ObjectId,
            permissions: [String],
            role: { type: String, default: 'ADMIN' },
            isActive: { type: Boolean, default: true }
        }));

        // Find admin
        const admin = await Admin.findOne({ email: 'admin@samiti.com' });

        if (admin) {
            console.log('✅ Found admin:', admin.name);
            console.log('   Current permissions:', admin.permissions);

            // Update permissions
            admin.permissions = [
                'view_dashboard',
                'manage_members',
                'manage_contributions',
                'manage_loans',
                'manage_sessions',
                'view_reports',
                'manage_withdrawals',
                'approve_loans',
                'manage_social_fund',
                'view_settings'
            ];

            await admin.save();

            console.log('\n✅ Permissions updated successfully!');
            console.log('   New permissions:', admin.permissions);
        } else {
            console.log('❌ Admin not found');
        }

        await mongoose.disconnect();
        console.log('\n✅ Done!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetAdminPassword();
