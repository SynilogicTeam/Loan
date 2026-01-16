import mongoose from "mongoose";

const socialFundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    targetAmount: {
      type: Number,
      required: true,
    },

    currentAmount: {
      type: Number,
      default: 0,
    },

    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },

    category: {
      type: String,
      enum: ["EMERGENCY", "INFRASTRUCTURE", "EDUCATION", "HEALTHCARE", "COMMUNITY_EVENT", "OTHER"],
      default: "OTHER",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "PAUSED", "CANCELLED"],
      default: "ACTIVE",
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
    },

    targetDate: {
      type: Date,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    contributors: [{
      memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
      amount: {
        type: Number,
        required: true,
      },
      contributedAt: {
        type: Date,
        default: Date.now,
      },
      transactionId: String,
    }],

    expenses: [{
      description: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      spentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
      },
      spentAt: {
        type: Date,
        default: Date.now,
      },
      receipt: String, // File path or URL
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
    }],

    documents: [{
      name: String,
      url: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Calculate completion percentage
socialFundSchema.virtual('completionPercentage').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

// Calculate remaining amount
socialFundSchema.virtual('remainingAmount').get(function() {
  return Math.max(this.targetAmount - this.currentAmount, 0);
});

// Calculate total expenses
socialFundSchema.virtual('totalExpenses').get(function() {
  return this.expenses.reduce((total, expense) => total + expense.amount, 0);
});

// Calculate available balance
socialFundSchema.virtual('availableBalance').get(function() {
  return this.currentAmount - this.totalExpenses;
});

socialFundSchema.set('toJSON', { virtuals: true });
socialFundSchema.set('toObject', { virtuals: true });

const SocialFund = mongoose.model("SocialFund", socialFundSchema);
export default SocialFund;