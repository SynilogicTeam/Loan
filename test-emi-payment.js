// Test EMI payment functionality
const axios = require('axios');

const BASE_URL = 'http://192.168.29.125:5001/api';

async function testEMIPayment() {
  try {
    console.log('🧪 Testing EMI Payment Flow...\n');

    // Step 1: Login as member (Rajesh Kumar who has EMIs)
    console.log('1️⃣ Logging in as member...');
    const loginResponse = await axios.post(`${BASE_URL}/members/login`, {
      email: 'rajeshkumar@mahadevtrust.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Get member EMIs
    console.log('\n2️⃣ Getting member EMIs...');
    const emisResponse = await axios.get(`${BASE_URL}/members/emis`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (emisResponse.data.length === 0) {
      console.log('❌ No EMIs found');
      return;
    }

    const firstEMI = emisResponse.data[0];
    console.log('📊 First EMI:', {
      id: firstEMI._id,
      month: firstEMI.month,
      amount: firstEMI.amount,
      dueDate: new Date(firstEMI.dueDate).toLocaleDateString(),
      status: firstEMI.status
    });

    if (firstEMI.status !== 'PENDING') {
      console.log('⚠️ First EMI is not pending, cannot test payment');
      return;
    }

    // Step 3: Pay the EMI
    console.log('\n3️⃣ Paying EMI...');
    const paymentResponse = await axios.post(`${BASE_URL}/members/pay-emi/${firstEMI._id}`, {
      paymentMethod: 'cash',
      paymentId: 'test_payment_123',
      orderId: 'test_order_123'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ EMI Payment Response:', paymentResponse.data);

    // Step 4: Verify EMI status changed
    console.log('\n4️⃣ Verifying EMI status...');
    const updatedEmisResponse = await axios.get(`${BASE_URL}/members/emis`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const updatedEMI = updatedEmisResponse.data.find(emi => emi._id === firstEMI._id);
    console.log('📊 Updated EMI Status:', {
      id: updatedEMI._id,
      month: updatedEMI.month,
      status: updatedEMI.status,
      paidDate: updatedEMI.paidDate ? new Date(updatedEMI.paidDate).toLocaleDateString() : null
    });

    if (updatedEMI.status === 'PAID') {
      console.log('✅ TEST PASSED: EMI payment successful!');
    } else {
      console.log('❌ TEST FAILED: EMI status not updated');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testEMIPayment();