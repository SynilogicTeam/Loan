const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testCommunityCreationWithPlan() {
  try {
    console.log('🧪 Testing Community Creation with Plan Selection...\n');

    // Step 1: Register a new admin
    console.log('1️⃣ Registering new admin...');
    const adminData = {
      name: 'Test Admin',
      email: `testadmin${Date.now()}@example.com`,
      password: 'password123',
      phone: '9876543210'
    };

    const registerResponse = await axios.post(`${API_BASE_URL}/admin/register`, adminData);
    console.log('✅ Admin registered successfully');
    console.log('Admin ID:', registerResponse.data._id);
    console.log('Token:', registerResponse.data.token.substring(0, 20) + '...');

    const token = registerResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Step 2: Get available plans
    console.log('\n2️⃣ Fetching available plans...');
    const plansResponse = await axios.get(`${API_BASE_URL}/platform/plans/public`);
    console.log('✅ Plans fetched successfully');
    console.log('Available plans:', plansResponse.data.map(p => `${p.displayName} (${p.name}) - ₹${p.price.monthly}/month`));

    // Step 3: Select the Premium plan (₹1999)
    const premiumPlan = plansResponse.data.find(p => p.name === 'premium');
    if (!premiumPlan) {
      throw new Error('Premium plan not found');
    }
    console.log('\n3️⃣ Selected plan:', premiumPlan.displayName);
    console.log('Plan features:', premiumPlan.features);

    // Step 4: Create community with plan
    console.log('\n4️⃣ Creating community with selected plan...');
    const communityData = {
      name: `Test Community ${Date.now()}`,
      address: '123 Test Street, Test City',
      description: 'A test community for plan testing',
      location: 'Test City, Test State',
      planId: premiumPlan._id
    };

    const communityResponse = await axios.post(`${API_BASE_URL}/communities/create`, communityData, { headers });
    console.log('✅ Community created successfully');
    console.log('Community ID:', communityResponse.data.community._id);
    console.log('Community Name:', communityResponse.data.community.name);
    console.log('Selected Plan:', communityResponse.data.community.currentPlan?.displayName);

    // Step 5: Check admin permissions
    console.log('\n5️⃣ Checking admin permissions...');
    console.log('Assigned Permissions:', communityResponse.data.permissions);
    console.log('Subscription Details:', communityResponse.data.subscription);

    // Step 6: Verify admin can create members
    console.log('\n6️⃣ Testing member creation...');
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

    console.log('\n🎉 All tests passed! Community creation with plan selection is working correctly.');
    console.log('\n📋 Summary:');
    console.log(`- Admin: ${adminData.name} (${adminData.email})`);
    console.log(`- Community: ${communityData.name}`);
    console.log(`- Plan: ${premiumPlan.displayName} (₹${premiumPlan.price.monthly}/month)`);
    console.log(`- Permissions: ${communityResponse.data.permissions?.length || 0} permissions assigned`);
    console.log(`- Member: ${memberData.name} created successfully`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCommunityCreationWithPlan();