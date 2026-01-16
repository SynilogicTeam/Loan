import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
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
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },
    category: {
      type: String,
      enum: ["CONTRIBUTION", "LOAN", "EMI", "INTEREST", "LATE_FEE", "WITHDRAWAL", "CHARITY"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: String,
    balance: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Ledger = mongoose.model("Ledger", ledgerSchema);
export default Ledger;
