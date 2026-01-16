const axios = require('axios');

async function testSinglePasswordReset() {
  try {
    console.log('🧪 Testing Single Admin Password Reset...\n');
    
    // Step 1: Login as Super Admin
    console.log('1️⃣ Logging in as Super Admin...');
    const loginResponse = await axios.post('http://192.168.29.117:5001/api/superadmin/login', {
      email: 'super@admin.com',
      password: '123456'
    });
    
    console.log('✅ Super Admin login successful!');
    const token = loginResponse.data.token;
    
    // Step 2: Get admin to test with
    const adminId = '6964d567a666b1fb3ff7acc0'; // Admin One
    const adminEmail = 'admin@samiti.com';
    const testPassword = 'testPassword123';
    
    console.log(`\n2️⃣ Testing password reset for Admin One (${adminEmail})...`);
    
    // Step 3: Reset password
    const resetResponse = await axios.put(
      `http://192.168.29.117:5001/api/platform/admins/${adminId}/reset-password`,
      { newPassword: testPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Password reset successful!');
    console.log('📝 Response:', resetResponse.data);
    
    // Step 4: Test login with new password
    console.log('\n3️⃣ Testing login with new password...');
    try {
      const testLoginResponse = await axios.post('http://192.168.29.117:5001/api/admin/login', {
        email: adminEmail,
        password: testPassword
      });
      
      console.log('✅ Login with new password successful!');
      console.log('👤 Logged in as:', testLoginResponse.data.name);
      
      // Step 5: Wait a moment and test again to ensure persistence
      console.log('\n4️⃣ Waiting 2 seconds and testing persistence...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const persistenceTestResponse = await axios.post('http://192.168.29.117:5001/api/admin/login', {
        email: adminEmail,
        password: testPassword
      });
      
      console.log('✅ Password persisted! Login still works after delay.');
      console.log('👤 Still logged in as:', persistenceTestResponse.data.name);
      
      console.log('\n🎉 SUCCESS: Password reset is working correctly!');
      console.log(`📋 Admin "${persistenceTestResponse.data.name}" password is now: ${testPassword}`);
      console.log('📱 You can now test this in the mobile app by trying to login with this password.');
      
    } catch (loginError) {
      console.log('❌ Login with new password failed:', loginError.response?.data?.message);
      console.log('🔍 This indicates the password reset might not be working properly.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.status, error.response?.data?.message || error.message);
  }
}

testSinglePasswordReset();