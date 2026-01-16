const axios = require('axios');

async function testMobileApiConnection() {
  try {
    console.log('📱 Testing Mobile App API Connection...\n');
    
    // Read the API config from the mobile app
    const fs = require('fs');
    const path = require('path');
    
    const apiConfigPath = path.join(__dirname, 'CommunityFundMobile', 'config', 'api.ts');
    
    if (fs.existsSync(apiConfigPath)) {
      const apiConfigContent = fs.readFileSync(apiConfigPath, 'utf8');
      console.log('📋 Mobile App API Config:');
      console.log(apiConfigContent);
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
    // Test the endpoints that the mobile app would use
    const baseURL = 'http://192.168.29.117:5001/api'; // Default from previous tests
    
    console.log('1️⃣ Testing Super Admin Login...');
    const loginResponse = await axios.post(`${baseURL}/superadmin/login`, {
      email: 'super@admin.com',
      password: '123456'
    });
    
    console.log('✅ Super Admin login successful!');
    const token = loginResponse.data.token;
    
    console.log('\n2️⃣ Testing Platform Admins Endpoint...');
    const adminsResponse = await axios.get(`${baseURL}/platform/admins`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Platform admins endpoint working!');
    console.log('📊 Found admins:', adminsResponse.data.length);
    
    if (adminsResponse.data.length > 0) {
      const testAdmin = adminsResponse.data[0];
      console.log('👤 Test admin:', testAdmin.name, '(' + testAdmin.email + ')');
      
      console.log('\n3️⃣ Testing Password Reset Endpoint...');
      const resetResponse = await axios.put(
        `${baseURL}/platform/admins/${testAdmin._id}/reset-password`,
        { newPassword: 'mobileTestPassword123' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Password reset endpoint working!');
      console.log('📝 Response:', resetResponse.data);
      
      console.log('\n4️⃣ Testing Login with New Password...');
      const testLoginResponse = await axios.post(`${baseURL}/admin/login`, {
        email: testAdmin.email,
        password: 'mobileTestPassword123'
      });
      
      console.log('✅ Login with new password successful!');
      console.log('👤 Logged in as:', testLoginResponse.data.name);
      
      console.log('\n🎉 ALL ENDPOINTS WORKING CORRECTLY!');
      console.log('📱 The mobile app should be able to connect to these endpoints.');
      console.log(`🔑 Test admin "${testAdmin.name}" password is now: mobileTestPassword123`);
    }
    
  } catch (error) {
    console.error('❌ API Connection Test Failed:');
    console.error('   - Status:', error.response?.status);
    console.error('   - Message:', error.response?.data?.message || error.message);
    console.error('   - URL:', error.config?.url);
    console.error('   - Method:', error.config?.method?.toUpperCase());
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🚨 CONNECTION REFUSED - Backend server might not be running!');
      console.error('   - Make sure the backend server is started');
      console.error('   - Check if the port 5001 is correct');
      console.error('   - Verify the IP address 192.168.29.117 is correct');
    }
  }
}

testMobileApiConnection();