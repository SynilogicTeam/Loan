// Test script to verify contribution flow
const axios = require('axios');

const BASE_URL = 'http://192.168.29.125:5001/api';

async function testContributionFlow() {
  try {
    console.log('🧪 Testing Contribution Flow...\n');

    // Step 1: Login as a member
    console.log('1️⃣ Logging in as member...');
    const loginResponse = await axios.post(`${BASE_URL}/members/login`, {
      email: 'd@g.com',
      password: '123456'
    });

    if (!loginResponse.data.token) {
      console.log('❌ Login failed - no token received');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Get member profile before contribution
    console.log('\n2️⃣ Getting member profile before contribution...');
    const profileBefore = await axios.get(`${BASE_URL}/members/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 Profile Before:', {
      name: profileBefore.data.name,
      totalContributions: profileBefore.data.totalContributions || 0,
      balance: profileBefore.data.balance || 0,
      contributionCount: profileBefore.data.contributionCount || 0
    });

    // Step 3: Make a contribution
    console.log('\n3️⃣ Making a contribution...');
    const contributionResponse = await axios.post(`${BASE_URL}/members/contribution`, {
      amount: 5000,
      month: '2026-02', // February 2026
      paymentMethod: 'cash',
      remarks: 'Test contribution'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Contribution created:', {
      id: contributionResponse.data.contribution._id,
      amount: contributionResponse.data.contribution.amount,
      status: contributionResponse.data.contribution.status
    });

    // Step 4: Get member profile after contribution
    console.log('\n4️⃣ Getting member profile after contribution...');
    const profileAfter = await axios.get(`${BASE_URL}/members/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 Profile After:', {
      name: profileAfter.data.name,
      totalContributions: profileAfter.data.totalContributions || 0,
      balance: profileAfter.data.balance || 0,
      contributionCount: profileAfter.data.contributionCount || 0
    });

    // Step 5: Compare results
    console.log('\n5️⃣ Comparison:');
    const contributionIncrease = (profileAfter.data.totalContributions || 0) - (profileBefore.data.totalContributions || 0);
    const countIncrease = (profileAfter.data.contributionCount || 0) - (profileBefore.data.contributionCount || 0);

    console.log(`💰 Contribution amount increase: ₹${contributionIncrease}`);
    console.log(`📈 Contribution count increase: ${countIncrease}`);

    if (contributionIncrease === 5000 && countIncrease === 1) {
      console.log('✅ TEST PASSED: Contribution flow working correctly!');
    } else {
      console.log('❌ TEST FAILED: Contribution not reflected in profile');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testContributionFlow();