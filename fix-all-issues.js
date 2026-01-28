const mongoose = require('mongoose');

// MongoDB connection from .env
const MONGO_URI = 'mongodb://saasadmin:saas123@ac-ibylzq8-shard-00-00.uydgzb2.mongodb.net:27017,ac-ibylzq8-shard-00-01.uydgzb2.mongodb.net:27017,ac-ibylzq8-shard-00-02.uydgzb2.mongodb.net:27017/test?ssl=true&replicaSet=atlas-147xe7-shard-0&authSource=admin&retryWrites=true&w=majority';

async function fixSuperAdmin() {
    try {
        console.log('🔧 Fixing Super Admin Password...\n');

        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Import the actual SuperAdmin model from backend
        const SuperAdminSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            role: { type: String, default: 'SUPER_ADMIN' },
            isActive: { type: Boolean, default: true }
        });

        // Add password hashing middleware
        SuperAdminSchema.pre('save', async function (next) {
            if (!this.isModified('password')) return next();
            const bcrypt = require('bcryptjs');
            this.password = await bcrypt.hash(this.password, 10);
            next();
        });

        const SuperAdmin = mongoose.model('SuperAdmin', SuperAdminSchema);

        // Delete existing super admin
        console.log('1️⃣ Deleting old super admin...');
        await SuperAdmin.deleteMany({ email: 'super@admin.com' });
        console.log('✅ Deleted\n');

        // Create new super admin with proper password
        console.log('2️⃣ Creating new super admin...');
        const superAdmin = await SuperAdmin.create({
            name: 'Super Admin',
            email: 'super@admin.com',
            password: '123456',
            role: 'SUPER_ADMIN',
            isActive: true
        });

        console.log('✅ Super Admin created successfully!');
        console.log(`   Email: super@admin.com`);
        console.log(`   Password: 123456`);
        console.log(`   ID: ${superAdmin._id}\n`);

        await mongoose.disconnect();
        console.log('✅ Done!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixSuperAdmin();
