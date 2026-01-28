// Check all loans in the system
const axios = require('axios');

const BASE_URL = 'http://192.168.29.125:5001/api';

async function checkAllLoans() {
  try {
    console.log('🔍 Checking all loans in the system...\n');

    // Login as Super Admin
    const adminLogin = await axios.post(`${BASE_URL}/superadmin/login`, {
      email: 'super@admin.com',
      password: 'admin123'
    });

    const adminToken = adminLogin.data.token;
    console.log('✅ Super Admin logged in');

    // Get all loans
    const loansResponse = await axios.get(`${BASE_URL}/loans`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('📋 All Loans in System:');
    if (loansResponse.data.length === 0) {
      console.log('❌ No loans found in the system');
    } else {
      loansResponse.data.forEach((loan, index) => {
        console.log(`${index + 1}. Loan ID: ${loan._id}`);
        console.log(`   Member: ${loan.memberId?.name || loan.memberId}`);
        console.log(`   Purpose: ${loan.purpose}`);
        console.log(`   Amount: ₹${loan.principalAmount}`);
        console.log(`   Status: ${loan.status}`);
        console.log(`   Duration: ${loan.duration} months`);
        console.log(`   Monthly EMI: ₹${loan.monthlyEMI}`);
        console.log(`   Applied At: ${new Date(loan.appliedAt).toLocaleDateString()}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkAllLoans();