import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

/* ROUTES */
import superAdminRoutes from "./routes/superAdmin.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import communityRoutes from "./routes/community.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import memberRoutes from "./routes/member.routes.js";
import contributionRoutes from "./routes/contribution.routes.js";
import loanRoutes from "./routes/loan.routes.js";
import ledgerRoutes from "./routes/ledger.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import platformRoutes from "./routes/platform.routes.js";
import withdrawalRoutes from "./routes/withdrawal.routes.js";
import charityRoutes from "./routes/charity.routes.js";
import socialfundRoutes from "./routes/socialfund.routes.js";

dotenv.config();

const app = express();

/* DB */
connectDB();

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* ROUTES REGISTER */
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admins", adminRoutes);  // ✅ ADD THIS FOR /api/admins endpoint
app.use("/api/communities", communityRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/member", memberRoutes);  // ✅ ADD SINGULAR ROUTE FOR MEMBER LOGIN
app.use("/api/members", memberRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/platform", platformRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/charity", charityRoutes);
app.use("/api/socialfunds", socialfundRoutes);

/* ROOT ROUTE - Server Status */
app.get("/", (req, res) => {
  res.json({
    status: "✅ Server is running",
    message: "Community SaaS Backend API",
    version: "1.0.0",
    endpoints: {
      test: "/test - Basic server test",
      testDb: "/test-db - Database connection test",
      health: "/health - Health check endpoint",
      api: {
        superadmin: "/api/superadmin/*",
        admin: "/api/admin/*",
        admins: "/api/admins/*",
        communities: "/api/communities/*",
        sessions: "/api/sessions/*",
        members: "/api/members/*",
        contributions: "/api/contributions/*",
        loans: "/api/loans/*",
        ledger: "/api/ledger/*",
        dashboard: "/api/dashboard/*",
        payments: "/api/payments/*",
        platform: "/api/platform/*",
        withdrawals: "/api/withdrawals/*",
        charity: "/api/charity/*",
        socialfunds: "/api/socialfunds/*"
      }
    },
    timestamp: new Date().toISOString()
  });
});

/* HEALTH CHECK ROUTE */
app.get("/health", async (req, res) => {
  try {
    const mongoose = (await import("mongoose")).default;
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.json({
      status: "healthy",
      server: "running",
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message
    });
  }
});

/* TEST ROUTE */
app.get("/test", (req, res) => {
  res.json({ message: "Server OK" });
});

/* DEBUG AUTH ENDPOINT */
app.get("/debug-auth", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔍 Debug Auth - Authorization header:', authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header" });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    const token = authHeader.split(' ')[1];
    console.log('🎫 Debug Auth - Token:', token.substring(0, 50) + '...');
    console.log('🎫 Debug Auth - Token length:', token.length);

    const jwt = (await import("jsonwebtoken")).default;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Debug Auth - Token decoded:', decoded);

    const SuperAdmin = (await import("./src/models/SuperAdmin.js")).default;
    const admin = await SuperAdmin.findById(decoded.id).select("-password");
    console.log('👤 Debug Auth - User found:', admin ? 'YES' : 'NO');

    if (admin) {
      console.log('📋 Debug Auth - User details:', {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      });
    }

    res.json({
      message: "Debug auth successful",
      tokenLength: token.length,
      decoded: decoded,
      userFound: !!admin,
      user: admin ? {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      } : null
    });

  } catch (error) {
    console.error('❌ Debug Auth error:', error.message);
    res.status(500).json({
      message: "Debug auth failed",
      error: error.message
    });
  }
});

/* TEST DATABASE CONNECTION */
app.get("/test-db", async (req, res) => {
  try {
    const Member = (await import("./models/Member.js")).default;
    const Community = (await import("./models/Community.js")).default;

    const memberCount = await Member.countDocuments();
    const communityCount = await Community.countDocuments();

    res.json({
      message: "Database OK",
      memberCount,
      communityCount,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* CREATE SUPER ADMIN FOR TESTING */
app.post("/create-super-admin", async (req, res) => {
  try {
    const SuperAdmin = (await import("./models/SuperAdmin.js")).default;

    const exists = await SuperAdmin.findOne({ email: "super@admin.com" });
    if (exists) {
      return res.json({ message: "Super admin already exists" });
    }

    const superAdmin = await SuperAdmin.create({
      name: "Super Admin",
      email: "super@admin.com",
      password: "123456"
    });

    res.json({
      message: "Super admin created successfully",
      email: "super@admin.com",
      password: "123456"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* CREATE SAMPLE DATA FOR TESTING */
app.post("/create-sample-data", async (req, res) => {
  try {
    const Community = (await import("./models/Community.js")).default;
    const Admin = (await import("./models/Admin.js")).default;
    const Member = (await import("./models/Member.js")).default;
    const Session = (await import("./models/Session.js")).default;
    const Contribution = (await import("./models/Contribution.js")).default;
    const Loan = (await import("./models/Loan.js")).default;
    const Ledger = (await import("./models/Ledger.js")).default;
    const EMI = (await import("./models/EMI.js")).default;

    // 1. Create Communities
    const community1 = await Community.findOneAndUpdate(
      { name: "Shree Shyam Group" },
      {
        name: "Shree Shyam Group",
        description: "Community fund for Shree Shyam Group",
        location: "Mumbai"
      },
      { upsert: true, new: true }
    );

    const community2 = await Community.findOneAndUpdate(
      { name: "Mahadev Samiti" },
      {
        name: "Mahadev Samiti",
        description: "Community fund for Mahadev Samiti",
        location: "Delhi"
      },
      { upsert: true, new: true }
    );

    // 2. Create Admins - Delete existing and recreate to ensure password hashing
    await Admin.deleteMany({ email: "admin@samiti.com" });

    const admin1 = await Admin.create({
      name: "Admin One",
      email: "admin@samiti.com", // Changed to match login credentials
      password: "123456",
      communityId: community1._id
    });

    // 3. Create Sessions
    const session1 = await Session.findOneAndUpdate(
      { communityId: community1._id, isActive: true },
      {
        name: "Session 2025",
        communityId: community1._id,
        startDate: new Date(),
        openingBalance: 50000,
        closingBalance: 80000, // Updated to show real balance
        isActive: true
      },
      { upsert: true, new: true }
    );

    // 4. Create Members - Delete existing and recreate to ensure password hashing
    await Member.deleteMany({ email: { $in: ["ramesh@gmail.com", "member2@test.com"] } });

    const member1 = await Member.create({
      name: "Ramesh Kumar",
      email: "ramesh@gmail.com", // Changed to match login credentials
      phone: "9876543210",
      communityId: community1._id,
      password: "123456"
    });

    const member2 = await Member.create({
      name: "Suresh Sharma",
      email: "member2@test.com",
      phone: "9876543211",
      communityId: community1._id,
      password: "123456"
    });

    // 5. Create Contributions
    await Contribution.findOneAndUpdate(
      { memberId: member1._id, sessionId: session1._id },
      {
        memberId: member1._id,
        communityId: community1._id,
        sessionId: session1._id,
        amount: 5000,
        month: "January 2025",
        status: "PAID"
      },
      { upsert: true, new: true }
    );

    // 6. Create Loans
    const loan1 = await Loan.findOneAndUpdate(
      { memberId: member1._id, sessionId: session1._id },
      {
        memberId: member1._id,
        communityId: community1._id,
        sessionId: session1._id,
        principalAmount: 50000,
        interestRate: 12,
        duration: 12,
        monthlyEMI: 4442,
        totalAmount: 53304,
        purpose: "Business expansion",
        guarantor1: "John Doe",
        guarantor2: "Jane Smith",
        monthlyIncome: 25000,
        outstandingAmount: 50000,
        status: "APPROVED",
        approvedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // 7. Create EMI Records for the loan
    await EMI.deleteMany({ loanId: loan1._id }); // Clear existing EMIs

    const startDate = new Date();
    const emiRecords = [];

    for (let i = 1; i <= 12; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      emiRecords.push({
        loanId: loan1._id,
        memberId: member1._id,
        communityId: community1._id,
        sessionId: session1._id,
        amount: 4442,
        dueDate: dueDate,
        month: i,
        status: i <= 2 ? "PAID" : "PENDING", // First 2 EMIs paid
        paidDate: i <= 2 ? new Date() : null
      });
    }

    await EMI.insertMany(emiRecords);

    // 8. Create Ledger Entries
    await Ledger.findOneAndUpdate(
      { description: "Member contribution" },
      {
        communityId: community1._id,
        sessionId: session1._id,
        type: "CREDIT",
        category: "CONTRIBUTION",
        amount: 5000,
        description: "Member contribution - Ramesh Kumar",
        balance: 80000 // Updated to match session closing balance
      },
      { upsert: true, new: true }
    );

    res.json({
      message: "Sample data created successfully!",
      data: {
        communities: 2,
        admins: 1,
        members: 2,
        sessions: 1,
        contributions: 1,
        loans: 1,
        emis: emiRecords.length,
        ledgerEntries: 1
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* START */
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 COMMUNITY SAAS BACKEND SERVER');
  console.log('='.repeat(60));
  console.log(`✅ Server Status: RUNNING`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🌐 Network URL: http://0.0.0.0:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
  console.log('📡 AVAILABLE ENDPOINTS:');
  console.log('='.repeat(60));
  console.log(`   Root:        http://localhost:${PORT}/`);
  console.log(`   Health:      http://localhost:${PORT}/health`);
  console.log(`   Test:        http://localhost:${PORT}/test`);
  console.log(`   Test DB:     http://localhost:${PORT}/test-db`);
  console.log('');
  console.log('📋 API ROUTES:');
  console.log(`   Super Admin: http://localhost:${PORT}/api/superadmin/*`);
  console.log(`   Admin:       http://localhost:${PORT}/api/admin/*`);
  console.log(`   Communities: http://localhost:${PORT}/api/communities/*`);
  console.log(`   Members:     http://localhost:${PORT}/api/members/*`);
  console.log(`   Sessions:    http://localhost:${PORT}/api/sessions/*`);
  console.log(`   Loans:       http://localhost:${PORT}/api/loans/*`);
  console.log(`   Payments:    http://localhost:${PORT}/api/payments/*`);
  console.log(`   Dashboard:   http://localhost:${PORT}/api/dashboard/*`);
  console.log('='.repeat(60));
  console.log('💡 TIPS:');
  console.log(`   • Open http://localhost:${PORT}/ to see all endpoints`);
  console.log(`   • Use http://localhost:${PORT}/health for health checks`);
  console.log(`   • Press Ctrl+C to stop the server`);
  console.log('='.repeat(60) + '\n');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('\n' + '='.repeat(60));
    console.error(`❌ ERROR: Port ${PORT} is already in use!`);
    console.log('='.repeat(60));
    console.log(`💡 The backend server is already running on port ${PORT}`);
    console.log(`💡 Check your other terminals - server might be running there`);
    console.log('');
    console.log('🔍 To find the process using this port:');
    console.log(`   netstat -ano | findstr :${PORT}`);
    console.log('');
    console.log('🛑 To kill the process:');
    console.log(`   taskkill /PID <PID> /F`);
    console.log('');
    console.log('✅ Or simply use the already running server!');
    console.log(`   Open: http://localhost:${PORT}/`);
    console.log('='.repeat(60) + '\n');
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});
