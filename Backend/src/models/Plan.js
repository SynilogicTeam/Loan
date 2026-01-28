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

    permissions: {
      type: [String],
      default: [
        'view_dashboard',
        'manage_members',
        'manage_contributions',
        'manage_loans',
        'manage_sessions',
        'view_reports'
      ],
      enum: [
        'view_dashboard',
        'manage_members',
        'manage_contributions',
        'manage_loans',
        'manage_sessions',
        'view_reports',
        'manage_withdrawals',
        'approve_loans',
        'manage_social_fund',
        'view_settings'
      ]
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