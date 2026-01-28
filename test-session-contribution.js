const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testSessionAndContribution() {
    try {
        console.log('🧪 Testing Session Creation and Contribution Flow...\n');

        // Step 1: Login as Admin
        console.log('1️⃣ Logging in as admin...');
        const loginRes = await axios.post(`${BASE_URL}/admin/login`, {
            email: 'admin@samiti.com',
            password: '123456'
        });

        const token = loginRes.data.token;
        const adminInfo = loginRes.data; // Admin info is directly in response
        console.log('✅ Login successful');
        console.log(`   Admin: ${adminInfo.name}`);
        console.log(`   Community ID: ${adminInfo.communityId || 'Not assigned'}`);
        console.log(`   Permissions: ${adminInfo.permissions?.join(', ') || 'None'}`);
        console.log('');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // Step 2: Check if active session exists
        console.log('2️⃣ Checking for active session...');
        try {
            const activeSessionRes = await axios.get(`${BASE_URL}/sessions/active`, config);
            console.log('✅ Active session found:');
            console.log(`   Name: ${activeSessionRes.data.name}`);
            console.log(`   Opening Balance: ₹${activeSessionRes.data.openingBalance}`);
            console.log('');
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('⚠️ No active session found');
                console.log('');

                // Try to create session
                console.log('3️⃣ Attempting to create new session...');
                try {
                    const createSessionRes = await axios.post(`${BASE_URL}/sessions`, {
                        name: `Session ${new Date().toISOString().split('T')[0]}`,
                        startDate: new Date().toISOString(),
                        openingBalance: 10000
                    }, config);
                    console.log('✅ Session created successfully:');
                    console.log(`   Name: ${createSessionRes.data.name}`);
                    console.log(`   Opening Balance: ₹${createSessionRes.data.openingBalance}`);
                    console.log('');
                } catch (sessionError) {
                    console.log('❌ Session creation failed:');
                    console.log(`   Status: ${sessionError.response?.status}`);
                    console.log(`   Error: ${sessionError.response?.data?.message || sessionError.message}`);
                    console.log('');
                }
            } else {
                throw error;
            }
        }

        // Step 3: Get members
        console.log('4️⃣ Getting community members...');
        const membersRes = await axios.get(`${BASE_URL}/admin/members`, config);
        console.log(`✅ Found ${membersRes.data.length} members`);

        if (membersRes.data.length > 0) {
            const firstMember = membersRes.data[0];
            console.log(`   First member: ${firstMember.name} (${firstMember.email})`);
            console.log('');

            // Step 4: Try to create contribution
            console.log('5️⃣ Attempting to create contribution...');
            try {
                const contributionRes = await axios.post(`${BASE_URL}/contributions`, {
                    memberId: firstMember._id,
                    month: 'February 2026',
                    amount: 5000,
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                }, config);
                console.log('✅ Contribution created successfully:');
                console.log(`   Amount: ₹${contributionRes.data.contribution.amount}`);
                console.log(`   Month: ${contributionRes.data.contribution.month}`);
                console.log('');
            } catch (contribError) {
                console.log('❌ Contribution creation failed:');
                console.log(`   Status: ${contribError.response?.status}`);
                console.log(`   Error: ${contribError.response?.data?.message || contribError.message}`);
                console.log('');
            }
        } else {
            console.log('⚠️ No members found in community');
            console.log('');
        }

        // Step 5: Get all contributions
        console.log('6️⃣ Getting all contributions...');
        try {
            const allContribRes = await axios.get(`${BASE_URL}/contributions`, config);
            console.log(`✅ Found ${allContribRes.data.length} contributions`);
            if (allContribRes.data.length > 0) {
                console.log('   Recent contributions:');
                allContribRes.data.slice(0, 3).forEach((c, i) => {
                    console.log(`   ${i + 1}. ${c.month} - ₹${c.amount} (${c.status})`);
                });
            }
        } catch (error) {
            console.log('❌ Failed to get contributions:');
            console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }

        console.log('\n✅ Test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testSessionAndContribution();
