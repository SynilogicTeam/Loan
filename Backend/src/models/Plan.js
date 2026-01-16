import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    
    displayName: {
      type: String,
      required: true,
    },
    
    description: {
      type: String,
      required: true,
    },
    
    price: {
      monthly: { type: Number, required: true },
      yearly: { type: Number, required: true },
    },
    
    features: {
      maxMembers: { type: Number, required: true },
      maxAdmins: { type: Number, required: true },
      maxSessions: { type: Number, required: true },
      advancedReports: { type: Boolean, default: false },
      customBranding: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
    
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);
export default Plan;