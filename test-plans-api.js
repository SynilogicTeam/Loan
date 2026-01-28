const axios = require('axios');

async function testPlansAPI() {
  try {
    console.log('🧪 Testing Plans API...\n');
    
    const response = await axios.get('http://localhost:5001/api/platform/plans/public');
    console.log('✅ Plans API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    response.data.forEach((plan, index) => {
      console.log(`\nPlan ${index + 1}:`);
      console.log('- Name:', plan.name);
      console.log('- DisplayName:', plan.displayName);
      console.log('- Description:', plan.description);
      console.log('- Price:', plan.price);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testPlansAPI();