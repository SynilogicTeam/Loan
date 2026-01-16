import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CANCELLED", "TRIAL"],
      default: "TRIAL",
    },
    
    billingCycle: {
      type: String,
      enum: ["MONTHLY", "YEARLY"],
      default: "MONTHLY",
    },
    
    startDate: {
      type: Date,
      required: true,
    },
    
    endDate: {
      type: Date,
      required: true,
    },
    
    trialEndDate: {
      type: Date,
    },
    
    amount: {
      type: Number,
      required: true,
    },
    
    paymentHistory: [{
      date: { type: Date, default: Date.now },
      amount: { type: Number, required: true },
      status: { type: String, enum: ["SUCCESS", "FAILED", "PENDING"], required: true },
      transactionId: String,
      paymentMethod: String,
    }],
    
    usage: {
      currentMembers: { type: Number, default: 0 },
      currentAdmins: { type: Number, default: 0 },
      currentSessions: { type: Number, default: 0 },
    },
    
    autoRenew: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;