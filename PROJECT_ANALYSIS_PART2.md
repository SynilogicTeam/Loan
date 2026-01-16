# Community Fund SaaS - Complete Project Analysis (Part 2)

## 7. MOBILE APP STRUCTURE

### 7.1 App Navigation Architecture

```
Root Layout (_layout.tsx)
├── Auth Screens
│   ├── /auth/login - Login screen
│   └── /auth/register - Registration screen
├── Tabs Layout ((tabs)/_layout.tsx)
│   ├── Admin Dashboard (admin.tsx)
│   ├── Member Dashboard (member.tsx)
│   ├── Super Admin Dashboard (superadmin.tsx)
│   ├── Members Management (members.tsx)
│   ├── Contributions (contributions.tsx)
│   ├── Loans (loans.tsx)
│   ├── Withdrawals (withdrawals.tsx)
│   ├── Sessions (sessions.tsx)
│   ├── Profile (profile.tsx)
│   ├── Communities (communities.tsx)
│   ├── Analytics (analytics.tsx)
│   ├── Reports (reports.tsx)
│   ├── Settings (settings.tsx)
│   ├── Fund (social fund) (fund.tsx)
│   └── Approvals (approvals.tsx)
├── Modal Screens
│   ├── /statement - Financial statement
│   ├── /contact - Contact admin
│   ├── /request-withdrawal - Withdrawal request
│   ├── /charity-donation - Charity donation
│   ├── /admin-withdrawals - Admin withdrawal management
│   ├── /admin-charity - Admin charity management
│   ├── /community-details - Community details
│   ├── /community-manage - Community management
│   ├── /community-create-advanced - Advanced community creation
│   ├── /admin-management - Admin management
│   ├── /admin-management-advanced - Advanced admin management
│   ├── /super-admin-profile - Super Admin profile
│   ├── /admin-profile - Admin profile
│   ├── /admin-password-management - Password management
│   ├── /admin-password-reset - Password reset
│   ├── /admin-permissions-edit - Permission editing
│   ├── /admin-subscription - Subscription management
│   ├── /member-profile-edit - Member profile editing
│   ├── /security-settings - Security settings
│   ├── /platform-settings - Platform settings
│   ├── /backup-restore - Backup and restore
│   ├── /system-logs - System logs
│   ├── /analytics-trends - Analytics trends
│   ├── /analytics-insights - Analytics insights
│   ├── /analytics-benchmarks - Analytics benchmarks
│   ├── /analytics-report - Analytics report
│   └── /community-analytics - Community analytics
└── Welcome Screen (index.tsx)
```

### 7.2 Screen Components (35+ Screens)

#### Authentication Screens
1. **Welcome Screen (index.tsx)**
   - Login button → /auth/login
   - Register button → /auth/register

2. **Login Screen (auth/login.tsx)**
   - Email input
   - Password input
   - Role selector (Admin/Member/Super Admin)
   - Login button → API call to /api/admin/login or /api/members/login
   - Register link → /auth/register

3. **Registration Screen (auth/register.tsx)**
   - Name, email, phone, password inputs
   - Community selector
   - Register button → API call to /api/members/register

#### Admin Screens
4. **Admin Dashboard (admin.tsx)**
   - Menu button → Opens drawer
   - Logout button
   - Stats cards: Total Members, Contributions, Loans, Pending Approvals
   - Quick Actions (permission-based):
     - Manage Members → /(tabs)/members
     - Loan Management → /(tabs)/loans
     - Manage Contributions → /(tabs)/contributions
     - View Reports → /(tabs)/reports
     - Withdrawals → /(tabs)/withdrawals
     - Sessions → /(tabs)/sessions
     - Social Fund → /(tabs)/fund
     - Settings → /(tabs)/settings
     - My Profile → /admin-profile

5. **Members Management (members.tsx)**
   - List of community members
   - Add Member button → Opens form
   - Edit Member button → /member-profile-edit
   - Delete Member button → Confirmation dialog
   - Suspend/Activate Member button
   - View Member Details button

6. **Loans Management (loans.tsx)**
   - List of loan applications
   - Approve button → Updates loan status
   - Reject button → Rejection form
   - Cancel button → Cancellation form
   - View Details button
   - EMI Schedule button

7. **Contributions Management (contributions.tsx)**
   - List of member contributions
   - Filter by status (Paid/Pending)
   - View Details button
   - Mark as Paid button

8. **Withdrawals Management (withdrawals.tsx)**
   - List of withdrawal requests
   - Approve button → Approval form
   - Reject button → Rejection form
   - Disburse button → Disbursement form
   - View Details button

9. **Sessions Management (sessions.tsx)**
   - List of community sessions
   - Create Session button
   - Edit Session button
   - Close Session button
   - View Balance button

10. **Admin Profile (admin-profile.tsx)**
    - Display admin details
    - Edit Profile button → Edit form
    - Change Password button → Password form
    - View Subscription button → /admin-subscription
    - Logout button

11. **Admin Management (admin-management.tsx)**
    - List of all admins (Super Admin only)
    - Create Admin button
    - Edit Admin button
    - Reset Password button
    - Update Permissions button → /admin-permissions-edit
    - Deactivate/Activate button
    - View Subscription button

12. **Admin Permissions Edit (admin-permissions-edit.tsx)**
    - Checkboxes for each permission
    - Save button → Updates permissions
    - Cancel button

13. **Admin Subscription (admin-subscription.tsx)**
    - Display current plan
    - Upgrade Plan button
    - Renew Subscription button
    - View Payment History button

#### Member Screens
14. **Member Dashboard (member.tsx)**
    - Menu button → Opens drawer
    - Logout button
    - Member info: Name, Balance, Trust Score
    - Quick Actions:
      - Make Contribution → /(tabs)/contributions
      - Request Withdrawal → /request-withdrawal
      - Apply for Loan → /(tabs)/loans
      - Charity Donation → /charity-donation
      - My Profile → /(tabs)/profile
      - View Statement → /statement
      - Contact Admin → /contact

15. **Member Profile (profile.tsx)**
    - Display member details
    - Edit Profile button → /member-profile-edit
    - View Contributions button
    - View Loans button
    - View EMIs button
    - View Withdrawals button

16. **Member Profile Edit (member-profile-edit.tsx)**
    - Edit name, email, phone
    - Change password
    - Save button → Updates profile
    - Cancel button

17. **Make Contribution (contributions.tsx - Member)**
    - Month selector
    - Amount input
    - Payment method selector (Cash/Online)
    - If Online: Razorpay payment form
    - Submit button → Creates contribution

18. **Request Withdrawal (request-withdrawal.tsx)**
    - Amount input (with max limit calculation)
    - Reason selector
    - Urgency selector
    - Guarantor input
    - Repayment plan input
    - Submit button → Creates withdrawal request

19. **Apply for Loan (loans.tsx - Member)**
    - Amount input
    - Purpose input
    - Duration selector
    - Guarantor 1 input
    - Guarantor 2 input
    - Monthly income input
    - Submit button → Creates loan application

20. **Pay EMI (emis.tsx)**
    - List of EMIs
    - Due date display
    - Amount display
    - Late fee display (if overdue)
    - Pay button → Razorpay payment
    - View Details button

21. **Charity Donation (charity-donation.tsx)**
    - List of charity projects
    - Amount input
    - Donation button → Razorpay payment
    - View Details button

22. **View Statement (statement.tsx)**
    - Date range selector
    - Transaction list
    - Filter by type
    - Download button

23. **Contact Admin (contact.tsx)**
    - Subject input
    - Category selector
    - Message input
    - Priority selector
    - Submit button → Creates support ticket

#### Super Admin Screens
24. **Super Admin Dashboard (superadmin.tsx)**
    - Menu button → Opens drawer
    - Logout button
    - Platform stats: Communities, Members, Admins, Balance, Revenue
    - Quick Actions:
      - Manage Admins → /admin-management-advanced
      - Create Community → /community-create-advanced
      - Platform Settings → /platform-settings
      - System Logs → /system-logs
      - Backup & Restore → /backup-restore
      - Security Settings → /security-settings
      - Super Admin Profile → /super-admin-profile

25. **Super Admin Profile (super-admin-profile.tsx)**
    - Display super admin details
    - Edit Profile button
    - Change Password button
    - Manage Admins button → /admin-management-advanced
    - Platform Settings button → /platform-settings
    - System Logs button → /system-logs
    - Backup & Restore button → /backup-restore
    - Security Settings button → /security-settings
    - Logout button

26. **Admin Management Advanced (admin-management-advanced.tsx)**
    - List of all admins
    - Create Admin button
    - Edit Admin button
    - Reset Password button
    - Update Permissions button
    - Update Subscription button
    - Deactivate/Activate button
    - Delete Admin button

27. **Community Create Advanced (community-create-advanced.tsx)**
    - Community name input
    - Location input
    - Description input
    - Admin selector
    - Create button → Creates community

28. **Community Management (community-manage.tsx)**
    - List of communities
    - Edit Community button
    - View Details button → /community-details
    - Manage Members button
    - View Analytics button → /community-analytics

29. **Community Details (community-details.tsx)**
    - Display community info
    - Member count
    - Total balance
    - Active sessions
    - Edit button
    - View Members button
    - View Analytics button

30. **Platform Settings (platform-settings.tsx)**
    - System configuration
    - Feature toggles
    - Save button

31. **System Logs (system-logs.tsx)**
    - List of system activities
    - Filter by level (Info/Warning/Error)
    - Filter by date range
    - View Details button

32. **Backup & Restore (backup-restore.tsx)**
    - Backup button → Creates backup
    - Restore button → Restores from backup
    - View Backups button
    - Delete Backup button

33. **Security Settings (security-settings.tsx)**
    - Two-factor authentication toggle
    - Session timeout settings
    - IP whitelist
    - Save button

#### Analytics Screens
34. **Analytics Dashboard (analytics.tsx)**
    - Overview stats
    - View Trends button → /analytics-trends
    - View Insights button → /analytics-insights
    - View Benchmarks button → /analytics-benchmarks
    - Generate Report button → /analytics-report

35. **Analytics Trends (analytics-trends.tsx)**
    - Line charts for contributions, loans, withdrawals
    - Date range selector
    - Export button

36. **Analytics Insights (analytics-insights.tsx)**
    - Key insights and recommendations
    - Member activity analysis
    - Loan performance analysis

37. **Analytics Benchmarks (analytics-benchmarks.tsx)**
    - Compare with other communities
    - Performance metrics
    - Ranking display

38. **Analytics Report (analytics-report.tsx)**
    - Comprehensive financial report
    - Generate PDF button
    - Email Report button

---

## 8. BUTTON FUNCTIONALITIES & BACKEND CONNECTIONS

### 8.1 Admin Dashboard Buttons

| Button | Action | Backend Endpoint | Data Flow |
|--------|--------|------------------|-----------|
| Menu | Open drawer | - | Local state |
| Logout | Clear storage, redirect to login | - | AsyncStorage.clear() |
| Manage Members | Navigate to members screen | - | router.push('/(tabs)/members') |
| Loan Management | Navigate to loans screen | - | router.push('/(tabs)/loans') |
| Manage Contributions | Navigate to contributions | - | router.push('/(tabs)/contributions') |
| View Reports | Navigate to reports | - | router.push('/(tabs)/reports') |
| Withdrawals | Navigate to withdrawals | - | router.push('/(tabs)/withdrawals') |
| Sessions | Navigate to sessions | - | router.push('/(tabs)/sessions') |
| Social Fund | Navigate to fund | - | router.push('/(tabs)/fund') |
| Settings | Navigate to settings | - | router.push('/(tabs)/settings') |
| My Profile | Navigate to admin profile | - | router.push('/admin-profile') |

### 8.2 Member Management Buttons

| Button | Action | Backend Endpoint | Data Flow |
|--------|--------|------------------|-----------|
| Add Member | Open form | - | Local state |
| Save Member | Create new member | POST /api/admin/members | Form data → API |
| Edit Member | Open edit form | - | Local state |
| Update Member | Save changes | PUT /api/admin/members/:memberId | Form data → API |
| Delete Member | Remove member | DELETE /api/admin/members/:memberId | Confirmation → API |
| Suspend Member | Deactivate member | PUT /api/admin/members/:memberId/status | {isActive: false} → API |
| Activate Member | Reactivate member | PUT /api/admin/members/:memberId/status | {isActive: true} → API |
| View Details | Show member info | - | Local state |
| Reset Password | Update member password | PUT /api/admin/members/:id/password | {newPassword} → API |

### 8.3 Loan Management Buttons

| Button | Action | Backend Endpoint | Data Flow |
|--------|--------|------------------|-----------|
| Create Loan | Open form | - | Local state |
| Submit Loan | Create loan | POST /api/loans | Form data → API |
| Approve Loan | Approve application | PUT /api/loans/:id/approve | {approvalNotes} → API |
| Reject Loan | Reject application | PUT /api/loans/:id/reject | {rejectionReason} → API |
| Cancel Loan | Cancel approved loan | PUT /api/loans/:id/cancel | {adminRemarks} → API |
| View EMI Schedule | Show EMI details | GET /api/loans/:id | Fetch from API |
| Pay EMI | Process EMI payment | POST /api/members/pay-emi/:emiId | {paymentMethod, paymentId} → API |

### 8.4 Contribution Management Buttons

| Button | Action | Backend Endpoint | Data Flow |
|--------|--------|------------------|-----------|
| Make Contribution | Open form | - | Local state |
| Submit Contribution | Create contribution | POST /api/members/contribution | Form data → API |
| Pay Online | Razorpay payment | POST /api/payments/create-order | {amount} → Razorpay |
| Verify Payment | Confirm payment | POST /api/payments/verify | {paymentId, orderId, signature} → API |
| Mark as Paid | Manual payment | PUT /api/contributions/pay/:id | {paymentMethod} → API |
| View Details | Show contribution info | - | Local state |

### 8.5 Withdrawal Management Buttons

| Button | Action | Backend Endpoint | Data Flow |
|--------|--------|------------------|-----------|
| Request Withdrawal | Open form | - | Local state |
| Submit Request | Create withdrawal | POST /api/members/withdrawal-request | Form data → API |
| Approve Withdrawal | Approve request | PUT /api/withdrawals/:withdrawalId/approve | {adminRemarks} → API |
| Reject Withdrawal | Reject request | PUT /api/withdrawals/:withdrawalId/reject | {adminRemarks} → API |
| Disburse Amount | Process disbursement | PUT /api/withdrawals/:withdrawalId/disburse | {disbursementMethod, transactionId} → API |
| View Details | Show withdrawal info | - | Local state |

### 8.6 Profile Management Buttons

| Button | Action | Backend Endpoint | Data Flow |
|--------|--------|------------------|-----------|
| Edit Profile | Open edit form | - | Local state |
| Save Profile | Update profile | PUT /api/admin/profile or PUT /api/members/profile | Form data → API |
| Change Password | Open password form | - | Local state |
| Update Password | Change password | PUT /api/admin/profile or PUT /api/members/profile | {currentPassword, newPassword} → API |
| View Subscription | Navigate to subscription | - | router.push('/admin-subscription') |
| Logout | Clear storage | - | AsyncStorage.clear() |

### 8.7 Super Admin Buttons

| Button | Action | Backend Endpoint | Data Flow |
|--------|--------|------------------|-----------|
| Create Admin | Open form | - | Local state |
| Save Admin | Create admin | POST /api/admin | Form data → API |
| Edit Admin | Open edit form | - | Local state |
| Update Admin | Save changes | PUT /api/admin/:adminId | Form data → API |
| Reset Password | Update admin password | PUT /api/admin/:adminId/reset-password | {newPassword} → API |
| Update Permissions | Open permissions form | - | Local state |
| Save Permissions | Update permissions | PUT /api/admin/:adminId/permissions | {permissions, reason} → API |
| Renew Subscription | Update subscription | PUT /api/admin/:adminId/subscription | {planType, duration} → API |
| Create Community | Open form | - | Local state |
| Save Community | Create community | POST /api/communities | Form data → API |
| View Analytics | Navigate to analytics | - | router.push('/(tabs)/analytics') |

---

## 9. CONTEXT & STATE MANAGEMENT

### 9.1 React Contexts

1. **ThemeContext** - Theme colors and styling
2. **GlobalDataContext** - Platform-wide data (stats, communities)
3. **RealTimeDataContext** - Real-time updates
4. **PermissionsContext** - User permissions and roles
5. **DrawerContext** - Navigation drawer state

### 9.2 AsyncStorage Keys

- `userToken` - JWT authentication token
- `userData` - User profile data
- `userRole` - User role (ADMIN/MEMBER/SUPER_ADMIN)
- `userPermissions` - Array of user permissions
- `communityId` - User's community ID

---

## 10. PAYMENT INTEGRATION

### 10.1 Razorpay Flow

```
1. Create Order
   - POST /api/payments/create-order
   - Input: {amount, currency, receipt, notes}
   - Output: {orderId, amount, currency, key}

2. Display Payment Form
   - Mobile app shows Razorpay payment form
   - User enters card/UPI details

3. Verify Payment
   - POST /api/payments/verify
   - Input: {razorpay_payment_id, razorpay_order_id, razorpay_signature}
   - Output: {success, verified}

4. Update Records
   - If verified: Update contribution/EMI status to PAID
   - Create ledger entry
   - Update session balance
```

### 10.2 Payment Methods Supported
- Credit/Debit Card
- UPI
- Net Banking
- Wallet

---

## 11. CRITICAL FEATURES & WORKFLOWS

### 11.1 Trust Score Calculation
```
Base Score: 50
+ 20 points if has contributions
+ 15 points if contributions > ₹10,000
+ 15 points if contributions > ₹25,000
Max Score: 100
```

### 11.2 Withdrawal Eligibility
```
Max Withdrawal = 80% of Total Contributions
Processing Fee = 1% (for emergency requests only)
```

### 11.3 EMI Calculation
```
Monthly EMI = (Principal × Rate × (1 + Rate)^Months) / ((1 + Rate)^Months - 1)
Where Rate = Annual Rate / 12 / 100
Default Interest Rate: 12% per annum
```

### 11.4 Late Fee Calculation
```
Late Fee = ₹100 per day after due date
Status changes to OVERDUE if payment not made by due date
```

---

## 12. DATABASE CONNECTIONS

### 12.1 Connection String
```
MongoDB URI: mongodb+srv://saasadmin:Saas123@cluster0.uydgzb2.mongodb.net/?appName=Cluster0
```

### 12.2 Collections
- members
- admins
- superadmins
- communities
- contributions
- loans
- emis
- sessions
- ledgers
- withdrawals
- plans
- subscriptions
- auditlogs
- charities
- socialfunds

---

## 13. ENVIRONMENT CONFIGURATION

### 13.1 Backend (.env)
```
PORT=5001
MONGO_URI=mongodb+srv://saasadmin:Saas123@cluster0.uydgzb2.mongodb.net/?appName=Cluster0
JWT_SECRET=mySuperSecretKey1234567890abcdefghijklmnopqrstuvwxyz
NODE_ENV=development
RAZORPAY_KEY_ID=rzp_test_1234567890
RAZORPAY_KEY_SECRET=test_secret_key_1234567890
```

### 13.2 Mobile App (config/api.ts)
```
BASE_URL: http://192.168.29.117:5001/api
TIMEOUT: 10000ms
```

---

## 14. TESTING CREDENTIALS

### 14.1 Super Admin
- Email: super@admin.com
- Password: 123456

### 14.2 Admin
- Email: admin@samiti.com
- Password: 123456

### 14.3 Member
- Email: ramesh@gmail.com
- Password: 123456

---

## 15. KEY INTEGRATION POINTS

### 15.1 Frontend to Backend
- All API calls use axios with JWT token in Authorization header
- Request interceptor adds token automatically
- Response interceptor handles 401 errors (token expiry)

### 15.2 Mobile to Payment Gateway
- Razorpay SDK integrated
- Order creation before payment
- Signature verification after payment
- Mock mode for development

### 15.3 Database to Backend
- Mongoose ODM for MongoDB
- Pre-save hooks for password hashing
- Aggregation pipelines for complex queries
- Transaction support for critical operations

