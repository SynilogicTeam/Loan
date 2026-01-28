import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const superAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "SUPER_ADMIN",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // User Settings
    settings: {
      type: Object,
      default: {
        notifications: {
          email: true,
          push: true,
          sms: false,
          newMembers: true,
          payments: true,
          loans: true,
          overdue: true
        },
        security: {
          twoFactor: false,
          sessionTimeout: 30,
          passwordExpiry: 90
        },
        appearance: {
          theme: 'light',
          language: 'en',
          dateFormat: 'DD/MM/YYYY',
          currency: 'INR'
        },
        privacy: {
          profileVisibility: 'admin',
          dataSharing: false,
          analytics: true
        }
      }
    },
  },
  { timestamps: true }
);

/* 🔐 HASH PASSWORD BEFORE SAVE */
superAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* 🔑 PASSWORD MATCH METHOD */
superAdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);
export default SuperAdmin;