import mongoose from "mongoose";

const externalEMISchema = new mongoose.Schema(
  {
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExternalLoan",
      required: true,
    },
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExternalBorrower",
      required: true,
    },
    emiNumber: {
      type: Number,
      required: true,
    },
    principalAmount: {
      type: Number,
      required: true,
    },
    interestAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    lateFee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "PARTIAL", "OVERDUE", "WAIVED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "BANK_TRANSFER", "CHEQUE", "ONLINE"],
      default: "CASH",
    },
    receiptNumber: {
      type: String,
    },
    remarks: {
      type: String,
      default: "",
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

// Calculate late fee automatically
externalEMISchema.methods.calculateLateFee = function() {
  if (this.status === 'OVERDUE' && this.dueDate < new Date()) {
    const daysLate = Math.floor((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
    const lateFeeRate = 0.05; // 5% of EMI amount
    this.lateFee = Math.floor(this.totalAmount * lateFeeRate);
  }
  return this.lateFee;
};

const ExternalEMI = mongoose.model("ExternalEMI", externalEMISchema);
export default ExternalEMI;