import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Razorpay with your actual test credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("🔧 Razorpay initialized with:", {
  key_id: process.env.RAZORPAY_KEY_ID,
  hasSecret: !!process.env.RAZORPAY_KEY_SECRET
});

/* =========================
   CREATE PAYMENT ORDER
========================= */
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes } = req.body;

    console.log("💳 Creating payment order:", { amount, currency, notes });

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    // Check if we have valid Razorpay credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        success: false,
        message: "Razorpay credentials not configured. Please add your test keys to .env file." 
      });
    }

    if (!process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_')) {
      return res.status(500).json({ 
        success: false,
        message: "Please use Razorpay test keys (starting with rzp_test_)" 
      });
    }

    console.log("🔍 Using Razorpay credentials:", { 
      keyId: process.env.RAZORPAY_KEY_ID,
      hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
    });

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    console.log("🚀 Creating Razorpay order with options:", options);

    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay order created successfully:", order.id);

    res.status(201).json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error("❌ Razorpay order creation error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create payment order",
      error: error.message 
    });
  }
};

/* =========================
   VERIFY PAYMENT
========================= */
export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      contribution_id,
      loan_id
    } = req.body;

    console.log("🔍 Payment verification request:", { 
      razorpay_order_id, 
      razorpay_payment_id: razorpay_payment_id?.substring(0, 10) + "...",
      contribution_id,
      loan_id
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment details (order_id, payment_id, signature)"
      });
    }

    // Verify signature
    console.log("🔐 Verifying Razorpay payment signature");
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isPaymentValid = expectedSignature === razorpay_signature;

    if (!isPaymentValid) {
      console.log("❌ Payment signature verification failed");
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed"
      });
    }
    
    console.log("✅ Payment signature verification successful");

    // Payment is verified, update the contribution or loan status
    if (contribution_id) {
      console.log("💰 Processing contribution payment:", contribution_id);
      
      const Contribution = (await import("../models/Contribution.js")).default;
      const contribution = await Contribution.findByIdAndUpdate(contribution_id, {
        status: "PAID",
        paidAt: new Date(),
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      }, { new: true });

      if (!contribution) {
        return res.status(404).json({
          success: false,
          message: "Contribution not found"
        });
      }

      // Create ledger entry and update session balance
      const Member = (await import("../models/Member.js")).default;
      const Session = (await import("../models/Session.js")).default;
      const Ledger = (await import("../models/Ledger.js")).default;

      const member = await Member.findById(contribution.memberId);
      const session = await Session.findById(contribution.sessionId);

      if (member && session) {
        const newBalance = session.closingBalance + contribution.amount;
        
        await Ledger.create({
          communityId: member.communityId,
          sessionId: session._id,
          memberId: member._id,
          type: "CREDIT",
          category: "CONTRIBUTION",
          amount: contribution.amount,
          description: `Online contribution payment - ${contribution.month}`,
          balance: newBalance
        });

        session.closingBalance = newBalance;
        await session.save();
        
        console.log("✅ Contribution payment processed and ledger updated");
      }
    }

    if (loan_id) {
      console.log("🏦 Processing loan payment:", loan_id);
      
      const Loan = (await import("../models/Loan.js")).default;
      const loan = await Loan.findByIdAndUpdate(loan_id, {
        status: "APPROVED",
        approvedAt: new Date(),
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      }, { new: true });

      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Loan not found"
        });
      }
      
      console.log("✅ Loan payment processed");
    }

    console.log("✅ Payment verification completed successfully");

    res.json({
      success: true,
      message: "Payment verified successfully",
      payment_id: razorpay_payment_id,
    });

  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Payment verification failed",
      error: error.message 
    });
  }
};

/* =========================
   GET PAYMENT DETAILS
========================= */
export const getPaymentDetails = async (req, res) => {
  try {
    const { payment_id } = req.params;

    console.log("🔍 Fetching payment details for:", payment_id);

    const payment = await razorpay.payments.fetch(payment_id);

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get payment details error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch payment details",
      error: error.message 
    });
  }
};