const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function fixAdminPermissions() {
    try {
        console.log('🔧 Fixing Admin Permissions...\n');

        // Step 1: Login as Super Admin
        console.log('1️⃣ Logging in as Super Admin...');
        const loginRes = await axios.post(`${BASE_URL}/auth/super-admin/login`, {
            email: 'super@admin.com',
            password: '123456'
        });

        const token = loginRes.data.token;
        console.log('✅ Super Admin logged in\n');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // Step 2: Get all admins
        console.log('2️⃣ Getting all admins...');
        const adminsRes = await axios.get(`${BASE_URL}/admin`, config);
        console.log(`✅ Found ${adminsRes.data.length} admins\n`);

        // Find admin@samiti.com
        const targetAdmin = adminsRes.data.find(a => a.email === 'admin@samiti.com');

        if (targetAdmin) {
            console.log('3️⃣ Found target admin:');
            console.log(`   Name: ${targetAdmin.name}`);
            console.log(`   Email: ${targetAdmin.email}`);
            console.log(`   Current Permissions: ${targetAdmin.permissions?.join(', ') || 'None'}`);
            console.log('');

            // Update permissions
            console.log('4️⃣ Updating admin permissions...');
            const updateRes = await axios.put(
                `${BASE_URL}/admin/${targetAdmin._id}/permissions`,
                {
                    permissions: [
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
                    ]
                },
                config
            );

            console.log('✅ Permissions updated successfully!');
            console.log(`   New Permissions: ${updateRes.data.admin.permissions.join(', ')}`);
            console.log('');

            // Test login with updated admin
            console.log('5️⃣ Testing admin login with new permissions...');
            const adminLoginRes = await axios.post(`${BASE_URL}/admin/login`, {
                email: 'admin@samiti.com',
                password: '123456'
            });

            console.log('✅ Admin login successful!');
            console.log(`   Name: ${adminLoginRes.data.name}`);
            console.log(`   Permissions: ${adminLoginRes.data.permissions.join(', ')}`);
            console.log('');

            console.log('🎉 Admin permissions fixed successfully!');
        } else {
            console.log('❌ Admin admin@samiti.com not found');
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

fixAdminPermissions();
