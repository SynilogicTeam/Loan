// Complete EMI flow test
const axios = require('axios');

const BASE_URL = 'http://192.168.29.125:5001/api';

async function testCompleteEMIFlow() {
  try {
    console.log('🧪 Testing Complete EMI Flow...\n');

    // Login as member
    const loginResponse = await axios.post(`${BASE_URL}/members/login`, {
      email: 'rajeshkumar@mahadevtrust.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Member logged in');

    // Get loans
    const loansResponse = await axios.get(`${BASE_URL}/members/loans`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\n📋 LOANS:');
    loansResponse.data.forEach(loan => {
      console.log(`  • ${loan.purpose}: ₹${loan.principalAmount} (${loan.status})`);
    });

    // Get EMIs with updated late fees
    const emisResponse = await axios.get(`${BASE_URL}/members/emis`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\n📋 EMI SCHEDULE:');
    const statusCounts = { PAID: 0, PENDING: 0, OVERDUE: 0 };
    let totalLateFees = 0;

    emisResponse.data.forEach(emi => {
      statusCounts[emi.status]++;
      if (emi.lateFee > 0) totalLateFees += emi.lateFee;
      
      const status = emi.status === 'OVERDUE' ? `${emi.status} (+₹${emi.lateFee})` : emi.status;
      console.log(`  Month ${emi.month}: ₹${emi.amount} - ${status} (Due: ${new Date(emi.dueDate).toLocaleDateString()})`);
    });

    console.log('\n📊 EMI SUMMARY:');
    console.log(`  • Total EMIs: ${emisResponse.data.length}`);
    console.log(`  • Paid: ${statusCounts.PAID}`);
    console.log(`  • Pending: ${statusCounts.PENDING}`);
    console.log(`  • Overdue: ${statusCounts.OVERDUE}`);
    console.log(`  • Total Late Fees: ₹${totalLateFees}`);

    // Test paying an overdue EMI
    const overdueEMI = emisResponse.data.find(emi => emi.status === 'OVERDUE');
    if (overdueEMI) {
      console.log('\n💳 Testing Overdue EMI Payment...');
      console.log(`  Paying Month ${overdueEMI.month}: ₹${overdueEMI.amount} + ₹${overdueEMI.lateFee} late fee`);
      
      const paymentResponse = await axios.post(`${BASE_URL}/members/pay-emi/${overdueEMI._id}`, {
        paymentMethod: 'online',
        paymentId: 'test_overdue_payment',
        orderId: 'test_overdue_order'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(`  ✅ Payment successful: ₹${paymentResponse.data.totalAmountPaid}`);
    }

    console.log('\n🎉 Complete EMI flow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCompleteEMIFlow();