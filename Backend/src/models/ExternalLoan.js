import mongoose from "mongoose";

const externalLoanSchema = new mongoose.Schema(
  {
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExternalBorrower",
      required: true,
    },
    loanNumber: {
      type: String,
      unique: true,
      required: true,
    },
    principalAmount: {
      type: Number,
      required: true,
    },
    interestRate: {
      type: Number, // % per year
      required: true,
    },
    interestType: {
      type: String,
      enum: ["SIMPLE", "COMPOUND"],
      default: "SIMPLE",
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
    processingFee: {
      type: Number,
      default: 0,
    },
    purpose: {
      type: String,
      required: true,
    },
    collateral: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "ACTIVE", "REJECTED", "COMPLETED", "CANCELLED", "DEFAULTED"],
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
    completedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    adminRemarks: {
      type: String,
      default: "",
    },
    riskAssessment: {
      score: {
        type: Number,
        min: 1,
        max: 10,
      },
      category: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
      },
      notes: String,
    },
    repaymentHistory: [{
      emiNumber: Number,
      amount: Number,
      paidDate: Date,
      lateFee: Number,
      status: {
        type: String,
        enum: ["PAID", "PARTIAL", "MISSED"],
      },
    }],
  },
  { timestamps: true }
);

// Generate loan number before saving
externalLoanSchema.pre('save', async function(next) {
  if (!this.loanNumber) {
    const count = await mongoose.model('ExternalLoan').countDocuments();
    this.loanNumber = `EXT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const ExternalLoan = mongoose.model("ExternalLoan", externalLoanSchema);
export default ExternalLoan;