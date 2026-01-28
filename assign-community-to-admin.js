const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'Backend', '.env') });

async function assignCommunityToAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }));
        const Community = mongoose.model('Community', new mongoose.Schema({}, { strict: false }));

        // Find admin without community
        const admin = await Admin.findOne({ communityId: null }).sort({ createdAt: -1 });

        if (!admin) {
            console.log('❌ No admin found without community');
            process.exit(0);
        }

        console.log('👤 Found admin:', admin.email);

        // Check if community exists
        let community = await Community.findOne();

        if (!community) {
            // Create a new community
            console.log('🏘️ Creating new community...');
            community = await Community.create({
                name: `${admin.name}'s Community`,
                description: 'Community Fund Management',
                address: 'India',
                registrationNumber: `COM-${Date.now()}`,
                memberCount: 0,
                isActive: true,
                settings: {
                    contributions: {
                        fixedEnabled: true,
                        fixedAmount: 5000,
                        fixedDueDay: 10
                    }
                }
            });
            console.log('✅ Community created:', community.name);
        } else {
            console.log('✅ Using existing community:', community.name);
        }

        // Assign community to admin
        admin.communityId = community._id;
        await admin.save();

        console.log('✅ Community assigned to admin!');
        console.log('\n📋 Admin Details:');
        console.log('   Email:', admin.email);
        console.log('   Name:', admin.name);
        console.log('   Community:', community.name);
        console.log('   Community ID:', community._id);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

assignCommunityToAdmin();
