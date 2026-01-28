import { useState } from "react";
import api from "../../api/axios";

export default function RazorpayPayment({ 
  amount, 
  description, 
  onSuccess, 
  onError, 
  contributionId = null,
  loanId = null,
  emiId = null,
  buttonText = "Pay Now",
  buttonClass = "w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
}) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Validate required props with better error handling
      const numericAmount = parseFloat(amount);
      if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
        console.error("❌ Invalid amount:", { amount, numericAmount });
        throw new Error(`Invalid payment amount: ${amount}. Please enter a valid number.`);
      }

      console.log('💰 Payment Details:', {
        amount: numericAmount,
        description,
        contributionId,
        loanId,
        emiId
      });

      // Step 1: Create Razorpay order
      const orderResponse = await api.post("/payments/create-order", {
        amount: numericAmount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          description: description,
          contributionId: contributionId,
          loanId: loanId,
          emiId: emiId,
        },
      });

      const { order, key_id, isDemoMode } = orderResponse.data;

      if (isDemoMode || orderResponse.data.mock) {
        // Demo mode - simulate payment without Razorpay
        const demoPaymentResponse = {
          razorpay_order_id: orderResponse.data.orderId,
          razorpay_payment_id: `demo_${Date.now()}`,
          razorpay_signature: "demo_signature",
        };

        // Show demo payment dialog with better messaging
        const confirmPayment = window.confirm(
          `🎭 DEMO PAYMENT MODE\n\n` +
          `Amount: ₹${numericAmount}\n` +
          `Description: ${description}\n\n` +
          `⚠️ This is a demo payment because:\n` +
          `• Razorpay test credentials are not working\n` +
          `• Or there's an API connection issue\n\n` +
          `✅ Click OK to simulate successful payment\n` +
          `❌ Click Cancel to abort\n\n` +
          `Note: In demo mode, no real money is charged.`
        );

        if (!confirmPayment) {
          setLoading(false);
          onError && onError("Payment cancelled by user");
          return;
        }

        // Handle different payment types in demo mode
        await handlePaymentSuccess(demoPaymentResponse, { isDemoMode: true });
      } else {
        // Real Razorpay integration with your test keys
        console.log("🚀 Opening REAL Razorpay checkout with your test keys");
        
        const options = {
          key: orderResponse.data.key,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          name: "Community Fund Manager",
          description: description,
          order_id: orderResponse.data.orderId,
          handler: async function (response) {
            console.log("✅ Real Razorpay payment completed:", response);
            await handlePaymentSuccess(response, { isDemoMode: false });
          },
          prefill: {
            name: localStorage.getItem("userName") || "",
            email: localStorage.getItem("userEmail") || "",
            contact: localStorage.getItem("userPhone") || "",
          },
          notes: {
            address: "Community Fund Office",
          },
          theme: {
            color: "#16a34a", // Green color
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              onError && onError("Payment cancelled by user");
            },
          },
        };

        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => {
            const rzp = new window.Razorpay(options);
            rzp.open();
          };
          script.onerror = () => {
            setLoading(false);
            onError && onError("Failed to load payment gateway");
          };
          document.body.appendChild(script);
        } else {
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      setLoading(false);
      onError && onError(error.response?.data?.message || error.message || "Payment failed to initiate");
    }
  };

  const handlePaymentSuccess = async (paymentResponse, { isDemoMode }) => {
    try {
      if (emiId) {
        // Handle EMI payment
        const emiPaymentResponse = await api.post(`/members/pay-emi/${emiId}`, {
          paymentMethod: "online",
          paymentId: paymentResponse.razorpay_payment_id,
          orderId: paymentResponse.razorpay_order_id,
        });

        if (emiPaymentResponse.data) {
          onSuccess && onSuccess(paymentResponse, {
            success: true,
            message: emiPaymentResponse.data.message,
            isDemoMode,
            emi: emiPaymentResponse.data.emi,
            totalAmountPaid: emiPaymentResponse.data.totalAmountPaid
          });
        }
      } else if (loanId) {
        // Handle full loan payment
        const loanPaymentResponse = await api.post(`/members/pay-full-loan/${loanId}`, {
          paymentMethod: "online",
          paymentId: paymentResponse.razorpay_payment_id,
          orderId: paymentResponse.razorpay_order_id,
        });

        if (loanPaymentResponse.data) {
          onSuccess && onSuccess(paymentResponse, {
            success: true,
            message: loanPaymentResponse.data.message,
            isDemoMode,
            loan: loanPaymentResponse.data.loan,
            prepaymentDetails: loanPaymentResponse.data.prepaymentDetails
          });
        }
      } else {
        // Handle regular payment verification (contributions, etc.)
        const verifyResponse = await api.post("/payments/verify", {
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          contribution_id: contributionId,
          loan_id: loanId,
          isDemoMode: isDemoMode,
        });

        if (verifyResponse.data.success) {
          onSuccess && onSuccess(paymentResponse, verifyResponse.data);
        } else {
          onError && onError("Payment verification failed");
        }
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      onError && onError(error.response?.data?.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`${buttonClass} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? "Processing..." : buttonText}
    </button>
  );
}