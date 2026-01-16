import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1000 // Minimum withdrawal amount
  },
  reason: {
    type: String,
    required: true,
    enum: [
      "medical_emergency",
      "family_emergency", 
      "education_expenses",
      "business_need",
      "home_repair",
      "marriage_expenses",
      "debt_repayment",
      "other"
    ]
  },
  urgency: {
    type: String,
    required: true,
    enum: ["normal", "urgent", "emergency"],
    default: "normal"
  },
  guarantor: {
    type: String,
    required: true
  },
  repaymentPlan: {
    type: String,
    required: true,
    enum: ["3_months", "6_months", "12_months", "lump_sum"]
  },
  remarks: {
    type: String,
    default: ""
  },
  processingFee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "DISBURSED", "CANCELLED"],
    default: "PENDING"
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  reviewedDate: {
    type: Date
  },
  approvedDate: {
    type: Date
  },
  disbursedDate: {
    type: Date
  },
  rejectedDate: {
    type: Date
  },
  cancelledDate: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  adminRemarks: {
    type: String,
    default: ""
  },
  eligibleAmount: {
    type: Number,
    required: true
  },
  contributionHistory: {
    type: Number,
    required: true
  },
  disbursementMethod: {
    type: String,
    enum: ["bank_transfer", "cash", "cheque"],
    default: "bank_transfer"
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },
  transactionId: {
    type: String
  },
  repaymentSchedule: [{
    month: Number,
    amount: Number,
    dueDate: Date,
    status: {
      type: String,
      enum: ["PENDING", "PAID", "OVERDUE"],
      default: "PENDING"
    },
    paidDate: Date,
    paidAmount: Number
  }],
  totalRepaid: {
    type: Number,
    default: 0
  },
  outstandingAmount: {
    type: Number,
    default: 0
  },
  interestRate: {
    type: Number,
    default: 0 // 0% for 3 months, 2% for 6 months, 5% for 12 months
  },
  totalInterest: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate repayment schedule and interest
withdrawalSchema.pre('save', function(next) {
  if (this.isNew && this.status === 'APPROVED') {
    this.calculateRepaymentSchedule();
  }
  next();
});

// Method to calculate repayment schedule
withdrawalSchema.methods.calculateRepaymentSchedule = function() {
  const amount = this.amount;
  let interestRate = 0;
  let months = 0;

  // Set interest rate and months based on repayment plan
  switch (this.repaymentPlan) {
    case "3_months":
      interestRate = 0; // No interest
      months = 3;
      break;
    case "6_months":
      interestRate = 0.02; // 2% interest
      months = 6;
      break;
    case "12_months":
      interestRate = 0.05; // 5% interest
      months = 12;
      break;
    case "lump_sum":
      interestRate = 0; // No interest
      months = 1;
      break;
    default:
      interestRate = 0;
      months = 3;
  }

  this.interestRate = interestRate;
  const totalInterest = amount * interestRate;
  this.totalInterest = totalInterest;
  const totalAmount = amount + totalInterest;
  this.outstandingAmount = totalAmount;

  // Create repayment schedule
  const monthlyAmount = Math.round(totalAmount / months);
  const schedule = [];
  
  for (let i = 1; i <= months; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);
    
    schedule.push({
      month: i,
      amount: i === months ? totalAmount - (monthlyAmount * (months - 1)) : monthlyAmount, // Adjust last payment
      dueDate: dueDate,
      status: "PENDING"
    });
  }
  
  this.repaymentSchedule = schedule;
};

// Method to process repayment
withdrawalSchema.methods.processRepayment = function(monthIndex, paidAmount) {
  if (this.repaymentSchedule[monthIndex]) {
    this.repaymentSchedule[monthIndex].status = "PAID";
    this.repaymentSchedule[monthIndex].paidDate = new Date();
    this.repaymentSchedule[monthIndex].paidAmount = paidAmount;
    
    this.totalRepaid += paidAmount;
    this.outstandingAmount -= paidAmount;
    
    // Check if fully repaid
    if (this.outstandingAmount <= 0) {
      this.status = "COMPLETED";
    }
  }
};

// Index for efficient queries
withdrawalSchema.index({ memberId: 1, status: 1 });
withdrawalSchema.index({ communityId: 1, status: 1 });
withdrawalSchema.index({ requestDate: -1 });

export default mongoose.model("Withdrawal", withdrawalSchema);