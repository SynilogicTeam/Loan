import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema(
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

    month: {
      type: String, // e.g. April-2024
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["online", "cash", "bank"],
      default: "online",
    },

    remarks: {
      type: String,
      default: "",
    },

    dueDate: {
      type: Date,
    },

    paidAt: {
      type: Date,
    },

    lateFee: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    // Razorpay payment fields
    paymentId: {
      type: String, // Razorpay payment ID
    },

    orderId: {
      type: String, // Razorpay order ID
    },

    signature: {
      type: String, // Razorpay signature for verification
    },
  },
  { timestamps: true }
);

const Contribution = mongoose.model("Contribution", contributionSchema);
export default Contribution;
