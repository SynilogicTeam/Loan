import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    name: String,

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
      default: "ADMIN",
    },

    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: false, // Allow null for Super Admin or unassigned admins
    },

    permissions: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Subscription Management
    subscription: {
      planType: {
        type: String,
        enum: ["BASIC", "PREMIUM", "ENTERPRISE"],
        default: "BASIC",
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
        default: function() {
          // Default to 30 days from now
          return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
      },
      status: {
        type: String,
        enum: ["ACTIVE", "EXPIRED", "CANCELLED", "TRIAL"],
        default: "TRIAL",
      },
      paymentHistory: [{
        amount: Number,
        paymentDate: Date,
        paymentMethod: String,
        transactionId: String,
        status: {
          type: String,
          enum: ["SUCCESS", "FAILED", "PENDING"],
          default: "SUCCESS"
        }
      }],
      autoRenewal: {
        type: Boolean,
        default: false,
      },
      lastPaymentDate: Date,
      nextBillingDate: Date,
    },

    // Permission Management
    permissionHistory: [{
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
      changedAt: {
        type: Date,
        default: Date.now,
      },
      oldPermissions: [String],
      newPermissions: [String],
      reason: String,
    }],

    // Activity Tracking
    lastLoginDate: Date,
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* hash password */
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Subscription Management Methods
adminSchema.methods.isSubscriptionActive = function() {
  return this.subscription.status === 'ACTIVE' && 
         this.subscription.endDate > new Date();
};

adminSchema.methods.getDaysUntilExpiry = function() {
  const now = new Date();
  const endDate = new Date(this.subscription.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

adminSchema.methods.renewSubscription = function(planType, duration = 30) {
  const now = new Date();
  this.subscription.planType = planType;
  this.subscription.startDate = now;
  this.subscription.endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
  this.subscription.status = 'ACTIVE';
  this.subscription.lastPaymentDate = now;
  this.subscription.nextBillingDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
};

adminSchema.methods.updatePermissions = function(newPermissions, changedBy, reason) {
  // Record permission change history
  this.permissionHistory.push({
    changedBy: changedBy,
    changedAt: new Date(),
    oldPermissions: [...this.permissions],
    newPermissions: [...newPermissions],
    reason: reason || 'Permission update'
  });
  
  // Update permissions
  this.permissions = newPermissions;
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
