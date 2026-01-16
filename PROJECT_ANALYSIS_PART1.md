# Community Fund SaaS - Complete Project Analysis

## 1. PROJECT OVERVIEW

**Project Name:** Community Fund SaaS Platform
**Type:** Full-stack mobile and web application for community financial management
**Tech Stack:**
- **Backend:** Node.js + Express.js + MongoDB
- **Mobile:** React Native + Expo
- **Payment:** Razorpay Integration
- **Authentication:** JWT-based

---

## 2. BACKEND STRUCTURE

### 2.1 Database Models (15 Models)

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **Member** | Community members | name, email, password, phone, communityId, address, occupation, monthlyIncome, aadharNumber, panNumber, bankAccount, ifscCode, nomineeName, nomineeRelation |
| **Admin** | Community administrators | name, email, password, role, communityId, permissions, subscription (plan, status, dates), permissionHistory, lastLoginDate |
| **SuperAdmin** | Platform super administrators | name, email, password, role |
| **Community** | Community groups | name, address, location, admin, currentPlan, subscriptionStatus, settings (branding, features, limits), memberCount, totalBalance |
| **Contribution** | Member monthly contributions | memberId, communityId, sessionId, amount, month, paymentMethod, status, paidAt, paymentId, orderId |
| **Loan** | Member loan applications | memberId, communityId, sessionId, principalAmount, interestRate, duration, monthlyEMI, totalAmount, purpose, guarantor1, guarantor2, monthlyIncome, status, approvedAt, approvedBy |
| **EMI** | Loan installment records | loanId, memberId, communityId, sessionId, amount, dueDate, month, status, paidDate, lateFee |
| **Session** | Community financial sessions | communityId, name, startDate, endDate, openingBalance, closingBalance, isActive |
| **Ledger** | Financial transaction log | communityId, sessionId, memberId, type (CREDIT/DEBIT), category, amount, description, balance |
| **Withdrawal** | Member withdrawal requests | memberId, communityId, sessionId, amount, reason, urgency, guarantor, repaymentPlan, status, requestDate, approvedDate, disbursedDate |
| **Plan** | Subscription plans | name, price, features, duration |
| **Subscription** | Admin subscriptions | adminId, planType, startDate, endDate, status, paymentHistory, autoRenewal |
| **AuditLog** | System audit trail | userId, action, details, timestamp |
| **Charity** | Charity/social fund | name, description, targetAmount, currentAmount, status |
| **SocialFund** | Community social fund | communityId, name, purpose, targetAmount, currentAmount, status |

### 2.2 API Routes (14 Route Files)

#### Authentication Routes
- `POST /api/admin/login` - Admin login
- `POST /api/admin/register` - Admin registration
- `POST /api/members/login` - Member login
- `POST /api/members/register` - Member registration
- `POST /api/superadmin/login` - Super Admin login

#### Admin Management Routes (`/api/admin`)
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `GET /api/admin/members` - Get community members
- `GET /api/admin/contributions` - Get community contributions
- `PUT /api/admin/members/:memberId` - Update member details
- `PUT /api/admin/members/:memberId/status` - Suspend/activate member
- `DELETE /api/admin/members/:memberId` - Remove member
- `GET /api/admin/members/:id/password` - Get member password
- `PUT /api/admin/members/:id/password` - Update member password
- `GET /api/admin/loans` - Get community loans
- `POST /api/admin/loans/:loanId/approve` - Approve loan
- `POST /api/admin/loans/:loanId/reject` - Reject loan
- `GET /api/admin/withdrawals` - Get withdrawal requests
- `POST /api/admin/withdrawals/:withdrawalId/approve` - Approve withdrawal
- `POST /api/admin/withdrawals/:withdrawalId/reject` - Reject withdrawal

#### Super Admin Routes (`/api/superadmin`)
- `GET /api/superadmin` - Get all admins
- `POST /api/superadmin` - Create admin
- `PUT /api/superadmin/:adminId/status` - Update admin status
- `PUT /api/superadmin/:adminId/reset-password` - Reset admin password
- `PUT /api/superadmin/:adminId/permissions` - Update admin permissions
- `PUT /api/superadmin/:adminId/subscription` - Renew admin subscription
- `GET /api/superadmin/:adminId/subscription` - Get subscription details

#### Community Routes (`/api/communities`)
- `POST /api/communities` - Create community (Super Admin)
- `GET /api/communities` - Get all communities (Super Admin)

#### Member Routes (`/api/members`)
- `GET /api/members` - Get all members (Admin)
- `POST /api/members` - Create member (Admin)
- `GET /api/members/profile` - Get member profile
- `PUT /api/members/profile` - Update member profile
- `POST /api/members/contribution` - Make contribution
- `GET /api/members/contributions` - Get member contributions
- `POST /api/members/loan-application` - Apply for loan
- `GET /api/members/loans` - Get member loans
- `GET /api/members/emis` - Get member EMIs
- `POST /api/members/pay-emi/:emiId` - Pay EMI
- `POST /api/members/withdrawal-request` - Request withdrawal
- `GET /api/members/withdrawals` - Get member withdrawals
- `GET /api/members/transactions` - Get member transactions
- `POST /api/members/contact-admin` - Contact admin

#### Loan Routes (`/api/loans`)
- `POST /api/loans` - Create loan (Admin)
- `GET /api/loans` - Get all loans (Admin)
- `PUT /api/loans/:id/approve` - Approve loan
- `PUT /api/loans/:id/reject` - Reject loan
- `PUT /api/loans/:id/cancel` - Cancel loan
- `PUT /api/loans/emi/pay/:id` - Pay EMI

#### Contribution Routes (`/api/contributions`)
- `POST /api/contributions` - Create contribution (Admin)
- `PUT /api/contributions/pay/:id` - Pay contribution
- `GET /api/contributions/my` - Get member contributions
- `GET /api/contributions` - Get all contributions (Admin)

#### Withdrawal Routes (`/api/withdrawals`)
- `GET /api/withdrawals` - Get withdrawal requests (Admin)
- `PUT /api/withdrawals/:withdrawalId/approve` - Approve withdrawal
- `PUT /api/withdrawals/:withdrawalId/reject` - Reject withdrawal
- `PUT /api/withdrawals/:withdrawalId/disburse` - Disburse withdrawal
- `GET /api/withdrawals/stats` - Get withdrawal statistics

#### Dashboard Routes (`/api/dashboard`)
- `GET /api/dashboard` - Get admin dashboard stats
- `GET /api/dashboard/community-stats` - Get community statistics (Super Admin)

#### Payment Routes (`/api/payments`)
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/payment/:paymentId` - Get payment details
- `POST /api/payments/refund` - Process refund

#### Other Routes
- `/api/sessions` - Session management
- `/api/ledger` - Ledger entries
- `/api/platform` - Platform settings
- `/api/charity` - Charity management
- `/api/socialfunds` - Social fund management

### 2.3 Controllers (11 Controllers)

1. **admin.controller.js** - Admin login, registration, profile management
2. **member.controller.js** - Member creation, login, profile management
3. **loan.controller.js** - Loan creation, EMI payment, approval/rejection
4. **contribution.controller.js** - Contribution creation and payment
5. **dashboard.controller.js** - Dashboard statistics
6. **session.controller.js** - Session management
7. **ledger.controller.js** - Ledger entry management
8. **payment.controller.js** - Payment processing
9. **community.controller.js** - Community management
10. **superAdmin.controller.js** - Super Admin operations
11. **withdrawal.controller.js** - Withdrawal request handling

### 2.4 Middleware (3 Middleware)

1. **auth.js** - JWT authentication middleware
2. **isAdmin.js** - Admin role verification
3. **isSuperAdmin.js** - Super Admin role verification
4. **checkPermission.js** - Permission-based access control

---

## 3. AUTHENTICATION FLOWS

### 3.1 Member Authentication Flow
```
1. Member Registration (Public)
   - POST /api/members/register
   - Input: name, email, phone, password, communityId
   - Output: token, member data

2. Member Login
   - POST /api/members/login
   - Input: email, password
   - Output: token, member data, role="MEMBER"
   - Storage: AsyncStorage (userToken, userData, userRole)

3. Member Profile Access
   - GET /api/members/profile (Protected)
   - Requires: Bearer token
   - Returns: member details, balance, trustScore
```

### 3.2 Admin Authentication Flow
```
1. Admin Registration (Super Admin Only)
   - POST /api/admin/register
   - Input: name, email, password, communityId
   - Output: token, admin data

2. Admin Login
   - POST /api/admin/login
   - Input: email, password
   - Output: token, admin data, role="ADMIN", permissions
   - Validation: Admin must be active, must have community assigned
   - Storage: AsyncStorage (userToken, userData, userRole, permissions)

3. Admin Profile Access
   - GET /api/admin/profile (Protected)
   - Requires: Bearer token + isAdmin middleware
   - Returns: admin details, community info, subscription status
```

### 3.3 Super Admin Authentication Flow
```
1. Super Admin Login
   - POST /api/superadmin/login
   - Input: email, password
   - Output: token, super admin data, role="SUPER_ADMIN"
   - No community requirement
   - Storage: AsyncStorage (userToken, userData, userRole)

2. Super Admin Access
   - All routes protected with isSuperAdmin middleware
   - Can access all communities and admins
   - Can create/manage admins and communities
```

---

## 4. PERMISSION SYSTEM

### 4.1 Available Permissions
- `manage_members` - Add, edit, remove members
- `manage_loans` - Create and manage loans
- `approve_loans` - Approve/reject loan applications
- `manage_contributions` - Create and manage contributions
- `manage_withdrawals` - Manage withdrawal requests
- `approve_withdrawals` - Approve/reject withdrawals
- `manage_sessions` - Create and manage sessions
- `manage_social_fund` - Manage social fund
- `manage_settings` - Configure community settings
- `view_reports` - View financial reports

### 4.2 Permission Assignment
- Super Admin assigns permissions to Admins
- Permissions stored in Admin model as array
- Permission history tracked for audit
- Permissions checked via `checkPermission` middleware

---

## 5. DATA FLOW & FEATURES

### 5.1 Contribution Flow
```
Member Makes Contribution:
1. Member selects month and amount
2. Chooses payment method (cash/online)
3. If online: Razorpay payment created
4. Contribution record created with status
5. If PAID: Ledger entry created, session balance updated
6. Admin can view all contributions
```

### 5.2 Loan Flow
```
Member Applies for Loan:
1. Member fills loan application form
2. Provides guarantors and income details
3. Loan created with status="PENDING"
4. Admin reviews and approves/rejects
5. If approved: EMI schedule created (12 months default)
6. Member can pay EMIs monthly
7. Late fees calculated for overdue EMIs
8. Admin can cancel loan if needed
```

### 5.3 Withdrawal Flow
```
Member Requests Withdrawal:
1. Member calculates eligible amount (80% of contributions)
2. Fills withdrawal form with reason and urgency
3. Withdrawal request created with status="PENDING"
4. Admin reviews and approves/rejects
5. If approved: Admin can disburse
6. Ledger entry created, session balance updated
7. Processing fee charged for emergency requests
```

### 5.4 Payment Flow
```
Online Payment Processing:
1. Create Razorpay order via /api/payments/create-order
2. Mobile app displays payment form
3. User completes payment
4. Verify payment via /api/payments/verify
5. Update contribution/EMI status to PAID
6. Create ledger entry
7. Update session balance
```

---

## 6. SUBSCRIPTION SYSTEM

### 6.1 Admin Subscription Plans
- **BASIC** - ₹999/month
- **PREMIUM** - ₹1999/month
- **ENTERPRISE** - ₹4999/month

### 6.2 Subscription Features
- Plan type and duration
- Start and end dates
- Auto-renewal option
- Payment history tracking
- Subscription status (ACTIVE, EXPIRED, CANCELLED, TRIAL)

### 6.3 Subscription Management
- Super Admin can renew subscriptions
- Track payment history
- Calculate days until expiry
- Check subscription status

