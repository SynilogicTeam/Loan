const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testCompleteAdminFlow() {
  try {
    console.log('🧪 Testing Complete Admin Flow...\n');

    // Step 1: Register admin
    console.log('1️⃣ Registering new admin...');
    const adminData = {
      name: 'Complete Test Admin',
      email: `completeadmin${Date.now()}@example.com`,
      password: 'password123',
      phone: '9876543210'
    };

    const registerResponse = await axios.post(`${API_BASE_URL}/admin/register`, adminData);
    console.log('✅ Admin registered successfully');
    console.log('Admin ID:', registerResponse.data._id);
    console.log('Permissions:', registerResponse.data.permissions || 'Not in response');

    const token = registerResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Step 2: Check admin profile
    console.log('\n2️⃣ Checking admin profile...');
    const profileResponse = await axios.get(`${API_BASE_URL}/admin/profile`, { headers });
    console.log('✅ Admin profile retrieved');
    console.log('Community ID:', profileResponse.data.communityId || 'None');
    console.log('Permissions:', profileResponse.data.permissions);

    // Step 3: Try to create member (should fail)
    console.log('\n3️⃣ Trying to create member without community (should fail)...');
    try {
      const memberData = {
        name: 'Test Member',
        email: `testmember${Date.now()}@example.com`,
        phone: '9876543211',
        password: 'member123'
      };

      await axios.post(`${API_BASE_URL}/admin/members`, memberData, { headers });
      console.log('❌ Unexpected: Member creation succeeded without community');
    } catch (error) {
      console.log('✅ Expected error:', error.response.data.message);
    }

    // Step 4: Get available plans
    console.log('\n4️⃣ Getting available plans...');
    const plansResponse = await axios.get(`${API_BASE_URL}/platform/plans/public`);
    const basicPlan = plansResponse.data.find(p => p.name === 'basic');
    console.log('✅ Plans retrieved, selected:', basicPlan.displayName);

    // Step 5: Create community with plan
    console.log('\n5️⃣ Creating community with plan...');
    const communityData = {
      name: `Complete Test Community ${Date.now()}`,
      address: '123 Complete Test Street',
      description: 'A complete test community',
      location: 'Test City',
      planId: basicPlan._id
    };

    const communityResponse = await axios.post(`${API_BASE_URL}/communities/create`, communityData, { headers });
    console.log('✅ Community created successfully');
    console.log('Community ID:', communityResponse.data.community._id);
    console.log('Plan:', communityResponse.data.community.currentPlan?.displayName);

    // Step 6: Now try to create member (should succeed)
    console.log('\n6️⃣ Now creating member (should succeed)...');
    const memberData = {
      name: 'Test Member',
      email: `testmember${Date.now()}@example.com`,
      phone: '9876543211',
      password: 'member123'
    };

    const memberResponse = await axios.post(`${API_BASE_URL}/admin/members`, memberData, { headers });
    console.log('✅ Member created successfully');
    console.log('Member ID:', memberResponse.data.member._id);
    console.log('Member Name:', memberResponse.data.member.name);

    // Step 7: Verify member list
    console.log('\n7️⃣ Checking member list...');
    const membersResponse = await axios.get(`${API_BASE_URL}/admin/members`, { headers });
    console.log('✅ Members retrieved:', membersResponse.data.length, 'members');

    console.log('\n🎉 Complete admin flow test passed!');
    console.log('\n📋 Summary:');
    console.log(`- Admin: ${adminData.name} (${adminData.email})`);
    console.log(`- Community: ${communityData.name}`);
    console.log(`- Plan: ${basicPlan.displayName}`);
    console.log(`- Member: ${memberData.name}`);
    console.log('\n✅ The flow works correctly: Admin → Community → Members');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCompleteAdminFlow();