import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
    },

    location: {
      type: String,
    },

    description: {
      type: String,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    // Subscription & Plan Info
    currentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    
    subscriptionStatus: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CANCELLED", "TRIAL"],
      default: "TRIAL",
    },
    
    subscriptionEndDate: {
      type: Date,
    },
    
    settings: {
      branding: {
        logo: String,
        primaryColor: { type: String, default: "#4F46E5" },
        secondaryColor: { type: String, default: "#10B981" },
      },
      features: {
        enableLoans: { type: Boolean, default: true },
        enableContributions: { type: Boolean, default: true },
        enableReports: { type: Boolean, default: true },
      },
      limits: {
        maxMembers: { type: Number, default: 50 },
        maxAdmins: { type: Number, default: 2 },
        maxSessions: { type: Number, default: 12 },
      },
      contributions: {
        fixedEnabled: { type: Boolean, default: false },
        fixedAmount: { type: Number, default: 0 },
        fixedDueDay: { type: Number, default: 5 },
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Statistics (calculated fields)
    memberCount: {
      type: Number,
      default: 0,
    },

    totalBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Community = mongoose.model("Community", communitySchema);
export default Community;
