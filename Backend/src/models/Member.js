import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
    },

    password: {
      type: String,
    },

    phone: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "MEMBER",
    },

    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Enhanced member profile fields
    address: {
      type: String,
    },

    occupation: {
      type: String,
    },

    monthlyIncome: {
      type: String,
    },

    emergencyContact: {
      type: String,
    },

    emergencyPhone: {
      type: String,
    },

    aadharNumber: {
      type: String,
    },

    panNumber: {
      type: String,
    },

    bankAccount: {
      type: String,
    },

    ifscCode: {
      type: String,
    },

    nomineeName: {
      type: String,
    },

    nomineeRelation: {
      type: String,
    },

    nomineePhone: {
      type: String,
    },
  },
  { timestamps: true }
);

/* hash password */
memberSchema.pre("save", async function (next) {
  // Only hash password if it exists and is modified
  if (!this.password || !this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

memberSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const Member = mongoose.model("Member", memberSchema);
export default Member;  // ✅ THIS LINE MUST BE HERE
