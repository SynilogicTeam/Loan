// Check existing loans and EMIs
const axios = require('axios');

const BASE_URL = 'http://192.168.29.125:5001/api';

async function checkLoansAndEmis() {
  try {
    console.log('🔍 Checking existing loans and EMIs...\n');

    // Login as member (Rajesh Kumar who has an active loan)
    const memberLogin = await axios.post(`${BASE_URL}/members/login`, {
      email: 'rajeshkumar@mahadevtrust.com',
      password: '123456'
    });

    const memberToken = memberLogin.data.token;
    console.log('✅ Member logged in');

    // Get member loans
    const loansResponse = await axios.get(`${BASE_URL}/members/loans`, {
      headers: { Authorization: `Bearer ${memberToken}` }
    });

    console.log('📋 Member Loans:');
    loansResponse.data.forEach((loan, index) => {
      console.log(`${index + 1}. Loan ID: ${loan._id}`);
      console.log(`   Purpose: ${loan.purpose}`);
      console.log(`   Amount: ₹${loan.principalAmount}`);
      console.log(`   Status: ${loan.status}`);
      console.log(`   Duration: ${loan.duration} months`);
      console.log(`   Monthly EMI: ₹${loan.monthlyEMI}`);
      console.log('');
    });

    // Get member EMIs
    const emisResponse = await axios.get(`${BASE_URL}/members/emis`, {
      headers: { Authorization: `Bearer ${memberToken}` }
    });

    console.log('📋 Member EMIs:');
    if (emisResponse.data.length === 0) {
      console.log('❌ No EMI records found');
    } else {
      emisResponse.data.forEach((emi, index) => {
        console.log(`${index + 1}. EMI ID: ${emi._id}`);
        console.log(`   Loan ID: ${emi.loanId}`);
        console.log(`   Month: ${emi.month}`);
        console.log(`   Amount: ₹${emi.amount}`);
        console.log(`   Due Date: ${new Date(emi.dueDate).toLocaleDateString()}`);
        console.log(`   Status: ${emi.status}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkLoansAndEmis();