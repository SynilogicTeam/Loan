import mongoose from "mongoose";

const interestRateConfigSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    loanType: {
      type: String,
      enum: ["PERSONAL", "BUSINESS", "EMERGENCY", "EDUCATION", "MEDICAL"],
      default: "PERSONAL",
    },
    interestRate: {
      type: Number, // Annual percentage
      required: true,
      default: 12,
    },
    interestType: {
      type: String,
      enum: ["SIMPLE", "COMPOUND"],
      default: "SIMPLE",
    },
    minAmount: {
      type: Number,
      default: 1000,
    },
    maxAmount: {
      type: Number,
      default: 100000,
    },
    maxTenure: {
      type: Number, // months
      default: 24,
    },
    processingFee: {
      type: Number, // percentage
      default: 1,
    },
    lateFeeRate: {
      type: Number, // percentage of EMI amount
      default: 5,
    },
    gracePeriod: {
      type: Number, // days
      default: 7,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

// Ensure one config per community per loan type
interestRateConfigSchema.index({ communityId: 1, loanType: 1 }, { unique: true });

const InterestRateConfig = mongoose.model("InterestRateConfig", interestRateConfigSchema);
export default InterestRateConfig;