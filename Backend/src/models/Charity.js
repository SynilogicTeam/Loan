import mongoose from "mongoose";

const charitySchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 100, // Minimum charity amount
    },
    charityName: {
      type: String,
      required: true,
      enum: [
        "orphanage",
        "old_age_home", 
        "education_fund",
        "medical_aid",
        "disaster_relief",
        "animal_welfare",
        "environment",
        "women_empowerment",
        "skill_development",
        "food_distribution",
        "other"
      ]
    },
    charityDescription: {
      type: String,
      required: true,
    },
    recipientDetails: {
      organizationName: String,
      contactPerson: String,
      phoneNumber: String,
      address: String,
    },
    donationMethod: {
      type: String,
      enum: ["direct_transfer", "community_fund", "cash", "cheque"],
      default: "community_fund"
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "DISBURSED", "REJECTED"],
      default: "PENDING",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedAt: {
      type: Date,
    },
    disbursedAt: {
      type: Date,
    },
    transactionId: {
      type: String, // For tracking actual payment
    },
    adminRemarks: {
      type: String,
      default: "",
    },
    memberRemarks: {
      type: String,
      default: "",
    },
    // Tax benefit tracking
    taxBenefitClaimed: {
      type: Boolean,
      default: false,
    },
    receiptNumber: {
      type: String,
    },
  },
  { timestamps: true }
);

const Charity = mongoose.model("Charity", charitySchema);
export default Charity;