# Community Fund SaaS - Quick Reference Guide

## SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                     COMMUNITY FUND SAAS PLATFORM                │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   MOBILE APP         │         │   BACKEND SERVER     │
│  (React Native)      │◄───────►│  (Node.js/Express)   │
│                      │  HTTP   │                      │
│  - Admin Dashboard   │  REST   │  - API Routes        │
│  - Member Dashboard  │  API    │  - Controllers       │
│  - Super Admin       │         │  - Middleware        │
│  - Analytics         │         │  - Models            │
└──────────────────────┘         └──────────────────────┘
         │                                  │
         │                                  │
         ▼                                  ▼
    ┌─────────────┐              ┌──────────────────┐
    │ AsyncStorage│              │   MongoDB        │
    │  (Local)    │              │   Database       │
    └─────────────┘              └──────────────────┘
                                        │
                                        ├─ Members
                                        ├─ Admins
                                        ├─ Communities
                                        ├─ Loans
                                        ├─ Contributions
                                        ├─ Withdrawals
                                        ├─ EMIs
                                        ├─ Sessions
                                        ├─ Ledgers
                                        └─ Subscriptions

         │
         ▼
    ┌──────────────┐
    │  Razorpay    │
    │  Payment     │
    │  Gateway     │
    └──────────────┘
```

---

## USER ROLES & PERMISSIONS

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ROLES HIERARCHY                     │
└─────────────────────────────────────────────────────────────┘

SUPER_ADMIN (Platform Level)
├── Create/Manage Communities
├── Create/Manage Admins
├── Update Admin Permissions
├── Manage Subscriptions
├── View Platform Statistics
├── System Logs & Backups
└── Security Settings

ADMIN (Community Level)
├── Manage Members (with permissions)
├── Manage Loans (with permissions)
├── Manage Contributions (with permissions)
├── Manage Withdrawals (with permissions)
├── Manage Sessions (with permissions)
├── View Reports (with permissions)
├── Manage Social Fund (with permissions)
└── Configure Settings (with permissions)

MEMBER (Individual Level)
├── Make Contributions
├── Apply for Loans
├── Pay EMIs
├── Request Withdrawals
├── View Profile
├── View Transactions
├── Contact Admin
└── Donate to Charity
```

---

## FEATURE WORKFLOWS

### CONTRIBUTION WORKFLOW
```
Member Dashboard
    ↓
Make Contribution Button
    ↓
Select Month & Amount
    ↓
Choose Payment Method
    ├─ Cash
    │   ├─ Submit
    │   └─ POST /api/members/contribution
    │       └─ Status: PAID
    │
    └─ Online
        ├─ Pay Online Button
        ├─ POST /api/payments/create-order
        ├─ Razorpay Payment Form
        ├─ User Enters Payment Details
        ├─ POST /api/payments/verify
        ├─ POST /api/members/contribution
        └─ Status: PAID
            ├─ Create Ledger Entry
            └─ Update Session Balance
```

### LOAN WORKFLOW
```
Member Dashboard
    ↓
Apply for Loan Button
    ↓
Fill Loan Application Form
├─ Amount
├─ Purpose
├─ Duration
├─ Guarantors
└─ Monthly Income
    ↓
POST /api/members/loan-application
    ↓
Loan Created (Status: PENDING)
    ↓
Admin Reviews
    ├─ Approve Button
    │   ├─ PUT /api/loans/:id/approve
    │   ├─ Create EMI Schedule
    │   └─ Status: APPROVED
    │
    └─ Reject Button
        ├─ PUT /api/loans/:id/reject
        └─ Status: REJECTED
            ↓
        Member Can Apply Again
    ↓
Member Pays EMIs
    ├─ View EMI Schedule
    ├─ Pay EMI Button
    ├─ Razorpay Payment
    ├─ POST /api/members/pay-emi/:emiId
    └─ Status: PAID
        ├─ Create Ledger Entry
        └─ Update Session Balance
```

### WITHDRAWAL WORKFLOW
```
Member Dashboard
    ↓
Request Withdrawal Button
    ↓
Fill Withdrawal Form
├─ Amount (Max: 80% of contributions)
├─ Reason
├─ Urgency (Normal/Emergency)
├─ Guarantor
└─ Repayment Plan
    ↓
POST /api/members/withdrawal-request
    ↓
Withdrawal Created (Status: PENDING)
    ├─ Processing Fee: 1% (if emergency)
    └─ Eligible Amount: 80% of contributions
    ↓
Admin Reviews
    ├─ Approve Button
    │   ├─ PUT /api/withdrawals/:id/approve
    │   └─ Status: APPROVED
    │
    └─ Reject Button
        ├─ PUT /api/withdrawals/:id/reject
        └─ Status: REJECTED
            ↓
        Member Can Request Again
    ↓
Admin Disburses
    ├─ Disburse Button
    ├─ PUT /api/withdrawals/:id/disburse
    ├─ Status: DISBURSED
    ├─ Create Ledger Entry
    └─ Update Session Balance
```

---

## API ENDPOINT SUMMARY

### Authentication Endpoints
```
POST /api/admin/login              - Admin login
POST /api/admin/register           - Admin registration
POST /api/members/login            - Member login
POST /api/members/register         - Member registration
POST /api/superadmin/login         - Super Admin login
```

### Member Endpoints
```
GET  /api/members/profile          - Get member profile
PUT  /api/members/profile          - Update member profile
POST /api/members/contribution     - Make contribution
GET  /api/members/contributions    - Get contributions
POST /api/members/loan-application - Apply for loan
GET  /api/members/loans            - Get loans
GET  /api/members/emis             - Get EMIs
POST /api/members/pay-emi/:emiId   - Pay EMI
POST /api/members/withdrawal-request - Request withdrawal
GET  /api/members/withdrawals      - Get withdrawals
GET  /api/members/transactions     - Get transactions
POST /api/members/contact-admin    - Contact admin
```

### Admin Endpoints
```
GET  /api/admin/profile            - Get admin profile
PUT  /api/admin/profile            - Update admin profile
GET  /api/admin/members            - Get community members
GET  /api/admin/contributions      - Get contributions
PUT  /api/admin/members/:id        - Update member
DELETE /api/admin/members/:id      - Delete member
GET  /api/admin/loans              - Get loans
POST /api/admin/loans/:id/approve  - Approve loan
POST /api/admin/loans/:id/reject   - Reject loan
GET  /api/admin/withdrawals        - Get withdrawals
POST /api/admin/withdrawals/:id/approve - Approve withdrawal
POST /api/admin/withdrawals/:id/reject  - Reject withdrawal
```

### Super Admin Endpoints
```
GET  /api/admin                    - Get all admins
POST /api/admin                    - Create admin
PUT  /api/admin/:id/status         - Update admin status
PUT  /api/admin/:id/reset-password - Reset password
PUT  /api/admin/:id/permissions    - Update permissions
PUT  /api/admin/:id/subscription   - Renew subscription
GET  /api/communities              - Get all communities
POST /api/communities              - Create community
```

### Payment Endpoints
```
POST /api/payments/create-order    - Create Razorpay order
POST /api/payments/verify          - Verify payment
GET  /api/payments/payment/:id     - Get payment details
POST /api/payments/refund          - Process refund
```

### Dashboard Endpoints
```
GET  /api/dashboard                - Get admin dashboard stats
GET  /api/dashboard/community-stats - Get community statistics
```

---

## DATABASE SCHEMA OVERVIEW

### Member Collection
```
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (default: "MEMBER"),
  communityId: ObjectId (ref: Community),
  isActive: Boolean (default: true),
  address: String,
  occupation: String,
  monthlyIncome: String,
  emergencyContact: String,
  emergencyPhone: String,
  aadharNumber: String,
  panNumber: String,
  bankAccount: String,
  ifscCode: String,
  nomineeName: String,
  nomineeRelation: String,
  nomineePhone: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Collection
```
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (default: "ADMIN"),
  communityId: ObjectId (ref: Community),
  permissions: [String],
  isActive: Boolean (default: true),
  subscription: {
    planType: String (BASIC/PREMIUM/ENTERPRISE),
    startDate: Date,
    endDate: Date,
    status: String (ACTIVE/EXPIRED/CANCELLED/TRIAL),
    paymentHistory: [{
      amount: Number,
      paymentDate: Date,
      paymentMethod: String,
      transactionId: String,
      status: String
    }],
    autoRenewal: Boolean,
    lastPaymentDate: Date,
    nextBillingDate: Date
  },
  permissionHistory: [{
    changedBy: ObjectId,
    changedAt: Date,
    oldPermissions: [String],
    newPermissions: [String],
    reason: String
  }],
  lastLoginDate: Date,
  loginCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Loan Collection
```
{
  _id: ObjectId,
  memberId: ObjectId (ref: Member),
  communityId: ObjectId (ref: Community),
  sessionId: ObjectId (ref: Session),
  principalAmount: Number,
  interestRate: Number,
  duration: Number (months),
  monthlyEMI: Number,
  totalAmount: Number,
  purpose: String,
  guarantor1: String,
  guarantor2: String,
  monthlyIncome: Number,
  outstandingAmount: Number,
  status: String (PENDING/APPROVED/ACTIVE/COMPLETED/REJECTED/CANCELLED),
  appliedAt: Date,
  approvedAt: Date,
  approvedBy: ObjectId,
  rejectedAt: Date,
  rejectedBy: ObjectId,
  cancelledAt: Date,
  cancelledBy: ObjectId,
  adminRemarks: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Contribution Collection
```
{
  _id: ObjectId,
  memberId: ObjectId (ref: Member),
  communityId: ObjectId (ref: Community),
  sessionId: ObjectId (ref: Session),
  amount: Number,
  month: String,
  paymentMethod: String (cash/online),
  status: String (PAID/PENDING),
  remarks: String,
  paidAt: Date,
  paymentId: String,
  orderId: String,
  signature: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Withdrawal Collection
```
{
  _id: ObjectId,
  memberId: ObjectId (ref: Member),
  communityId: ObjectId (ref: Community),
  sessionId: ObjectId (ref: Session),
  amount: Number,
  reason: String,
  urgency: String (normal/emergency),
  guarantor: String,
  repaymentPlan: String,
  remarks: String,
  processingFee: Number,
  status: String (PENDING/APPROVED/REJECTED/DISBURSED),
  requestDate: Date,
  approvedDate: Date,
  reviewedBy: ObjectId,
  reviewedDate: Date,
  disbursedDate: Date,
  disbursementMethod: String,
  transactionId: String,
  adminRemarks: String,
  eligibleAmount: Number,
  contributionHistory: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## TESTING CREDENTIALS

```
SUPER ADMIN
Email: super@admin.com
Password: 123456

ADMIN
Email: admin@samiti.com
Password: 123456

MEMBER
Email: ramesh@gmail.com
Password: 123456
```

---

## ENVIRONMENT VARIABLES

### Backend (.env)
```
PORT=5001
MONGO_URI=mongodb+srv://saasadmin:Saas123@cluster0.uydgzb2.mongodb.net/?appName=Cluster0
JWT_SECRET=mySuperSecretKey1234567890abcdefghijklmnopqrstuvwxyz
NODE_ENV=development
RAZORPAY_KEY_ID=rzp_test_1234567890
RAZORPAY_KEY_SECRET=test_secret_key_1234567890
```

### Mobile App (config/api.ts)
```
BASE_URL: http://192.168.29.117:5001/api
TIMEOUT: 10000
```

---

## KEY CALCULATIONS

### EMI Calculation
```
Monthly EMI = (Principal × Rate × (1 + Rate)^Months) / ((1 + Rate)^Months - 1)
Where:
  Rate = Annual Rate / 12 / 100
  Default Annual Rate = 12%
  Default Duration = 12 months
```

### Trust Score
```
Base Score: 50
+ 20 if has contributions
+ 15 if contributions > ₹10,000
+ 15 if contributions > ₹25,000
Max Score: 100
```

### Withdrawal Eligibility
```
Max Withdrawal = 80% of Total Contributions
Processing Fee = 1% (for emergency requests only)
```

### Late Fee
```
Late Fee = ₹100 per day after due date
Status changes to OVERDUE if payment not made by due date
```

---

## COMMON ISSUES & SOLUTIONS

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Token expired or invalid | Clear AsyncStorage and login again |
| 403 Forbidden | Insufficient permissions | Contact Super Admin to update permissions |
| 404 Not Found | Resource doesn't exist | Verify resource ID and try again |
| Payment Failed | Network issue or invalid card | Retry payment or use different payment method |
| EMI Overdue | Payment not made by due date | Pay EMI with late fee |
| Withdrawal Rejected | Insufficient contributions | Make more contributions and try again |
| Loan Rejected | Insufficient income or guarantors | Reapply with better guarantors |

---

## QUICK NAVIGATION

### For Members
1. Login → Member Dashboard
2. Make Contribution → Contributions Screen
3. Apply for Loan → Loans Screen
4. Pay EMI → EMIs Screen
5. Request Withdrawal → Withdrawal Screen
6. View Profile → Profile Screen

### For Admins
1. Login → Admin Dashboard
2. Manage Members → Members Screen
3. Approve Loans → Loans Screen
4. Manage Contributions → Contributions Screen
5. Approve Withdrawals → Withdrawals Screen
6. View Reports → Reports Screen

### For Super Admins
1. Login → Super Admin Dashboard
2. Manage Admins → Admin Management Screen
3. Create Community → Community Creation Screen
4. View Platform Stats → Dashboard
5. System Logs → System Logs Screen
6. Security Settings → Security Settings Screen

---

## SUPPORT & DOCUMENTATION

- **Backend API**: http://192.168.29.117:5001/api
- **Database**: MongoDB Atlas
- **Payment Gateway**: Razorpay
- **Mobile Framework**: React Native + Expo
- **Backend Framework**: Node.js + Express.js

