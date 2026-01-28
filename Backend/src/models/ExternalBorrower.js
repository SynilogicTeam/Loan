import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const externalBorrowerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    aadharNumber: {
      type: String,
      required: true,
      unique: true,
    },
    panNumber: {
      type: String,
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    occupation: {
      type: String,
      required: true,
    },
    monthlyIncome: {
      type: Number,
      required: true,
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branchName: String,
    },
    guarantor1: {
      name: String,
      phone: String,
      address: String,
      relation: String,
    },
    guarantor2: {
      name: String,
      phone: String,
      address: String,
      relation: String,
    },
    creditScore: {
      type: Number,
      min: 300,
      max: 900,
      default: 650,
    },
    riskCategory: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    documents: [{
      type: {
        type: String,
        enum: ["AADHAR", "PAN", "INCOME_PROOF", "BANK_STATEMENT", "PHOTO"],
      },
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    verifiedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const ExternalBorrower = mongoose.model("ExternalBorrower", externalBorrowerSchema);
export default ExternalBorrower;