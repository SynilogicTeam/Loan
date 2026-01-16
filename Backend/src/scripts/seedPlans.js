import mongoose from "mongoose";
import dotenv from "dotenv";
import Plan from "../models/Plan.js";

dotenv.config();

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing plans
    await Plan.deleteMany({});

    // Create default plans
    const plans = [
      {
        name: "basic",
        displayName: "Basic",
        description: "Perfect for small communities",
        price: {
          monthly: 999,
          yearly: 9990
        },
        features: {
          maxMembers: 50,
          maxAdmins: 2,
          maxSessions: 12,
          advancedReports: false,
          customBranding: false,
          apiAccess: false,
          prioritySupport: false
        },
        isActive: true,
        isPopular: false
      },
      {
        name: "premium",
        displayName: "Premium",
        description: "Best for growing communities",
        price: {
          monthly: 1999,
          yearly: 19990
        },
        features: {
          maxMembers: 200,
          maxAdmins: 5,
          maxSessions: 24,
          advancedReports: true,
          customBranding: true,
          apiAccess: false,
          prioritySupport: false
        },
        isActive: true,
        isPopular: true
      },
      {
        name: "enterprise",
        displayName: "Enterprise",
        description: "For large organizations",
        price: {
          monthly: 4999,
          yearly: 49990
        },
        features: {
          maxMembers: -1, // Unlimited
          maxAdmins: -1, // Unlimited
          maxSessions: -1, // Unlimited
          advancedReports: true,
          customBranding: true,
          apiAccess: true,
          prioritySupport: true
        },
        isActive: true,
        isPopular: false
      }
    ];

    const createdPlans = await Plan.insertMany(plans);
    console.log("✅ Plans seeded successfully:", createdPlans.length);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding plans:", error);
    process.exit(1);
  }
};

seedPlans();