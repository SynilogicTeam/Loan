const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

const planSchema = new mongoose.Schema({
  name: String,
  displayName: String,
  description: String,
  price: {
    monthly: Number,
    yearly: Number,
  },
  features: {
    maxMembers: Number,
    maxAdmins: Number,
    maxSessions: Number,
    advancedReports: Boolean,
    customBranding: Boolean,
    apiAccess: Boolean,
    prioritySupport: Boolean,
  },
  isActive: Boolean,
  isPopular: Boolean,
}, { timestamps: true });

const Plan = mongoose.model('Plan', planSchema);

async function checkPlans() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const plans = await Plan.find({});
    console.log('Found plans:', plans.length);
    
    plans.forEach((plan, index) => {
      console.log(`\nPlan ${index + 1}:`);
      console.log('- ID:', plan._id);
      console.log('- Name:', plan.name);
      console.log('- DisplayName:', plan.displayName);
      console.log('- Description:', plan.description);
      console.log('- Price:', plan.price);
      console.log('- Features:', plan.features);
      console.log('- IsActive:', plan.isActive);
      console.log('- IsPopular:', plan.isPopular);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPlans();