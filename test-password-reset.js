const axios = require('axios');

// ⚠️ WARNING: THIS SCRIPT RESETS ADMIN PASSWORDS TO '123456'
// ⚠️ DO NOT RUN THIS SCRIPT IN PRODUCTION OR WHEN TESTING PASSWORD CHANGES
// ⚠️ THIS SCRIPT IS FOR DEVELOPMENT/TESTING PURPOSES ONLY

async function testPasswordReset() {
  console.log('⚠️⚠️⚠️ WARNING: THIS SCRIPT WILL RESET ADMIN PASSWORDS ⚠️⚠️⚠️');
  console.log('⚠️ This script should NOT be run when testing password management');
  console.log('⚠️ It will reset passwords back to "123456" which may interfere with testing');
  console.log('⚠️ Only run this for development testing purposes\n');
  
  // Add a delay to make sure the warning is seen
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    console.log('🚀 Testing Admin Password Reset functionality...\n');
    
    // Step 1: Login as Super Admin
    console.log('1️⃣ Logging in as Super Admin...');
    const loginResponse = await axios.post('http://192.168.29.117:5001/api/superadmin/login', {
      email: 'super@admin.com',
      password: '123456'
    });
    
    console.log('✅ Login successful!');
    const token = loginResponse.data.token;
    
    // Step 2: Get all admins to find one to test with
    console.log('\n2️⃣ Getting all admins...');
    const adminsResponse = await axios.get('http://192.168.29.117:5001/api/platform/admins', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Admins retrieved:', adminsResponse.data.length);
    
    if (adminsResponse.data.length > 0) {
      const testAdmin = adminsResponse.data[0];
      console.log('👤 Test admin:', testAdmin.name, testAdmin.email);
      
      // Step 3: Test password reset
      console.log('\n3️⃣ Testing password reset...');
      const newPassword = 'newTestPassword123';
      
      const resetResponse = await axios.put(
        `http://192.168.29.117:5001/api/platform/admins/${testAdmin._id}/reset-password`,
        { newPassword: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Password reset successful!');
      console.log('📝 Response:', resetResponse.data);
      
      // Step 4: Test login with new password
      console.log('\n4️⃣ Testing login with new password...');
      try {
        const testLoginResponse = await axios.post('http://192.168.29.117:5001/api/admin/login', {
          email: testAdmin.email,
          password: newPassword
        });
        
        console.log('✅ Login with new password successful!');
        console.log('👤 Logged in as:', testLoginResponse.data.name);
        
        // ⚠️ WARNING: This step resets the password back to 123456
        console.log('\n⚠️ WARNING: About to reset password back to 123456...');
        console.log('⚠️ This may interfere with manual password testing!');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Step 5: Reset back to original password for safety
        console.log('\n5️⃣ Resetting back to safe password...');
        await axios.put(
          `http://192.168.29.117:5001/api/platform/admins/${testAdmin._id}/reset-password`,
          { newPassword: '123456' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Password reset back to 123456');
        console.log('⚠️ This may have interfered with any manual password changes!');
        
      } catch (loginError) {
        console.log('❌ Login with new password failed:', loginError.response?.data?.message);
      }
      
    } else {
      console.log('ℹ️ No admins found to test with');
    }
    
    console.log('\n🎉 Password reset test completed!');
    console.log('⚠️ Remember: This script resets passwords to "123456"');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.status, error.response?.data?.message || error.message);
  }
}

// Only run if explicitly called with a flag
if (process.argv.includes('--run-test')) {
  testPasswordReset();
} else {
  console.log('⚠️ This script is disabled to prevent interference with password testing');
  console.log('⚠️ To run this test script, use: node test-password-reset.js --run-test');
  console.log('⚠️ WARNING: This will reset admin passwords to "123456"');
}