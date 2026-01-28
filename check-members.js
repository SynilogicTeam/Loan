// Check existing members
const axios = require('axios');

const BASE_URL = 'http://192.168.29.125:5001/api';

async function checkMembers() {
  try {
    console.log('🔍 Checking existing members...\n');

    // Login as Super Admin first
    const adminLogin = await axios.post(`${BASE_URL}/superadmin/login`, {
      email: 'super@admin.com',
      password: 'admin123'
    });

    const adminToken = adminLogin.data.token;
    console.log('✅ Super Admin logged in');

    // Get all members
    const membersResponse = await axios.get(`${BASE_URL}/platform/members`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('📋 Members Response:', membersResponse.data);

    const members = membersResponse.data.members || membersResponse.data || [];
    console.log('📋 Existing Members:');
    
    if (members.length === 0) {
      console.log('❌ No members found in database');
      return;
    }

    members.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name} (${member.email}) - ID: ${member._id}`);
    });

    if (members.length > 0) {
      const firstMember = members[0];
      console.log(`\n🧪 Testing with first member: ${firstMember.email}`);
      
      // Try to login with this member (assuming password is 'password123')
      try {
        const memberLogin = await axios.post(`${BASE_URL}/members/login`, {
          email: firstMember.email,
          password: 'password123'
        });
        console.log('✅ Member login successful');
        return firstMember.email;
      } catch (loginError) {
        console.log('❌ Member login failed:', loginError.response?.data?.message);
        console.log('💡 Try using password: "123456" or create a new member');
      }
    } else {
      console.log('❌ No members found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkMembers();