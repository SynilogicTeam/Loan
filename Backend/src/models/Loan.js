import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
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

    principalAmount: {
      type: Number,
      required: true,
    },

    interestRate: {
      type: Number, // % per year
      required: true,
      default: 12,
    },

    duration: {
      type: Number, // months
      required: true,
    },

    monthlyEMI: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    outstandingAmount: {
      type: Number,
      required: true,
    },

    purpose: {
      type: String,
      required: true,
    },

    guarantor1: {
      type: String,
      required: true,
    },

    guarantor2: {
      type: String,
      required: true,
    },

    monthlyIncome: {
      type: Number,
      required: true,
    },

    remarks: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "ACTIVE", "REJECTED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    approvedAt: {
      type: Date,
    },

    disbursedAt: {
      type: Date,
    },

    cancelledAt: {
      type: Date,
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    adminRemarks: {
      type: String,
      default: "",
    },

    // Razorpay payment fields
    paymentId: {
      type: String, // Razorpay payment ID
    },

    orderId: {
      type: String, // Razorpay order ID
    },
  },
  { timestamps: true }
);

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;