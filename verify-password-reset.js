const axios = require('axios');

async function verifyPasswordReset() {
  try {
    console.log('🔍 Verifying Admin Password Reset functionality...\n');
    
    // Step 1: Login as Super Admin
    console.log('1️⃣ Logging in as Super Admin...');
    const loginResponse = await axios.post('http://192.168.29.117:5001/api/superadmin/login', {
      email: 'super@admin.com',
      password: '123456'
    });
    
    console.log('✅ Super Admin login successful!');
    const token = loginResponse.data.token;
    
    // Step 2: Get all admins
    console.log('\n2️⃣ Getting all admins...');
    const adminsResponse = await axios.get('http://192.168.29.117:5001/api/platform/admins', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Found admins:', adminsResponse.data.length);
    
    if (adminsResponse.data.length > 0) {
      // Show admin details
      console.log('\n📋 Available Admins:');
      adminsResponse.data.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - ID: ${admin._id}`);
      });
      
      const testAdmin = adminsResponse.data[0];
      console.log(`\n👤 Testing with: ${testAdmin.name} (${testAdmin.email})`);
      
      // Step 3: Try to login with current password to see what it is
      console.log('\n3️⃣ Testing current password...');
      
      const commonPasswords = ['123456', 'admin123', 'password', 'defaultPassword123'];
      let currentPassword = null;
      
      for (const pwd of commonPasswords) {
        try {
          await axios.post('http://192.168.29.117:5001/api/admin/login', {
            email: testAdmin.email,
            password: pwd
          });
          currentPassword = pwd;
          console.log(`✅ Current password is: ${pwd}`);
          break;
        } catch (error) {
          // Password didn't work, try next
        }
      }
      
      if (!currentPassword) {
        console.log('❓ Could not determine current password from common passwords');
        console.log('   This might mean the password was already changed');
      }
      
      console.log('\n📝 Instructions for manual testing:');
      console.log('1. Use the mobile app to reset this admin\'s password');
      console.log('2. Set a new password (e.g., "myNewPassword123")');
      console.log('3. Try to login with the new password');
      console.log('4. Check if the password persists after refresh/restart');
      console.log('\n⚠️ Make sure the test-password-reset.js script is NOT running!');
      
    } else {
      console.log('ℹ️ No admins found to test with');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.response?.status, error.response?.data?.message || error.message);
  }
}

verifyPasswordReset();