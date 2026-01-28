const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function checkAdmins() {
    try {
        console.log('🔍 Checking existing admins...\n');

        // Login as Super Admin first
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

        // Get all admins
        console.log('2️⃣ Getting all admins...');
        const adminsRes = await axios.get(`${BASE_URL}/admin`, config);

        console.log(`✅ Found ${adminsRes.data.length} admins:\n`);
        adminsRes.data.forEach((admin, i) => {
            console.log(`${i + 1}. ${admin.name}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Role: ${admin.role}`);
            console.log(`   Community: ${admin.communityId?.name || 'Not assigned'}`);
            console.log(`   Permissions: ${admin.permissions?.join(', ') || 'None'}`);
            console.log(`   Active: ${admin.isActive}`);
            console.log('');
        });

        // Try to login with first admin
        if (adminsRes.data.length > 0) {
            const firstAdmin = adminsRes.data[0];
            console.log(`3️⃣ Testing login with first admin: ${firstAdmin.email}`);
            console.log('   Trying password: 123456\n');

            try {
                const adminLoginRes = await axios.post(`${BASE_URL}/admin/login`, {
                    email: firstAdmin.email,
                    password: '123456'
                });
                console.log('✅ Admin login successful!');
                console.log(`   Token received: ${adminLoginRes.data.token.substring(0, 20)}...`);
                console.log(`   Admin: ${adminLoginRes.data.admin.name}`);
                console.log(`   Permissions: ${adminLoginRes.data.admin.permissions?.join(', ')}`);
            } catch (loginError) {
                console.log('❌ Admin login failed:');
                console.log(`   Error: ${loginError.response?.data?.message || loginError.message}`);
                console.log('\n💡 Password might need to be reset');
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

checkAdmins();
