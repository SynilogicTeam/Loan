import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, CreditCard, Zap, AlertTriangle } from "lucide-react";
import RazorpayPayment from "../../components/Payment/RazorpayPayment";

export default function MyLoans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmi, setSelectedEmi] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState("emi"); // "emi" or "full"

  useEffect(() => {
    loadLoansAndEmis();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadLoansAndEmis();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadLoansAndEmis = async () => {
    try {
      setLoading(true);
      
      // Get member loans
      const loansResponse = await fetch('/api/members/loans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('memberToken') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (loansResponse.ok) {
        const loansData = await loansResponse.json();
        setLoans(loansData);
      } else {
        setLoans([]);
      }
      
      // Get member EMIs
      const emisResponse = await fetch('/api/members/emis', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('memberToken') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (emisResponse.ok) {
        const emisData = await emisResponse.json();
        setEmis(emisData);
      } else {
        setEmis([]);
      }
      
    } catch (error) {
      console.error('Error loading loans and EMIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmiPayment = (emi) => {
    setSelectedEmi(emi);
    setPaymentType("emi");
    setShowPayment(true);
  };

  const handleFullLoanPayment = (loan) => {
    setSelectedLoan(loan);
    setPaymentType("full");
    setShowPayment(true);
  };

  const calculatePrepaymentAmount = (loan) => {
    const remainingAmount = loan.outstandingAmount || loan.principalAmount;
    const prepaymentCharge = Math.round(remainingAmount * 0.02); // 2% charge
    return {
      remainingAmount,
      prepaymentCharge,
      totalAmount: remainingAmount + prepaymentCharge
    };
  };

  const handlePaymentSuccess = async (paymentResponse, verificationData) => {
    console.log("🎉 PAYMENT SUCCESS:", { paymentResponse, verificationData });
    
    if (paymentType === "emi") {
      const message = verificationData.isDemoMode 
        ? `✅ Demo EMI Payment Successful!\n\nPayment ID: ${paymentResponse.razorpay_payment_id}\nAmount Paid: ₹${verificationData.totalAmountPaid || selectedEmi.amount}\n\nYour EMI has been marked as paid.`
        : `✅ EMI Payment Successful!\n\nPayment ID: ${paymentResponse.razorpay_payment_id}\nAmount Paid: ₹${verificationData.totalAmountPaid || selectedEmi.amount}\n\nYour EMI has been paid successfully.`;
      
      alert(message);
    } else {
      const message = verificationData.isDemoMode
        ? `✅ Demo Full Loan Payment Successful!\n\nPayment ID: ${paymentResponse.razorpay_payment_id}\nAmount Paid: ₹${verificationData.prepaymentDetails?.totalAmount || 'N/A'}\n\nYour loan has been closed.`
        : `✅ Full Loan Payment Successful!\n\nPayment ID: ${paymentResponse.razorpay_payment_id}\nAmount Paid: ₹${verificationData.prepaymentDetails?.totalAmount || 'N/A'}\n\nYour loan has been paid in full.`;
      
      alert(message);
    }
    
    setShowPayment(false);
    setSelectedEmi(null);
    setSelectedLoan(null);
    
    // Force refresh data immediately
    console.log("🔄 Refreshing data after payment...");
    await loadLoansAndEmis();
    
    // Also refresh after a short delay to ensure backend processing is complete
    setTimeout(async () => {
      console.log("🔄 Second refresh after delay...");
      await loadLoansAndEmis();
    }, 2000);
  };

  const handlePaymentError = (error) => {
    alert(`❌ Payment Failed: ${error}\n\nPlease try again or contact admin for assistance.`);
    setShowPayment(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'OVERDUE': return 'bg-red-100 text-red-700';
      case 'CANCELLED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'OVERDUE': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  // Payment component for EMI
  if (showPayment && paymentType === "emi" && selectedEmi) {
    const totalAmount = selectedEmi.amount + (selectedEmi.lateFee || 0);
    
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => setShowPayment(false)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to EMI List
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-slate-200">
              <h1 className="text-xl font-semibold text-slate-900">
                Pay EMI - Month {selectedEmi.month}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Due Date: {new Date(selectedEmi.dueDate).toLocaleDateString()}
                {isOverdue(selectedEmi.dueDate) && (
                  <span className="ml-2 text-red-600 font-medium">OVERDUE</span>
                )}
              </p>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">EMI Payment Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">EMI Amount:</span>
                    <span className="font-medium text-blue-900">₹{selectedEmi.amount}</span>
                  </div>
                  {selectedEmi.lateFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-700">Late Fee:</span>
                      <span className="font-medium text-red-900">₹{selectedEmi.lateFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-blue-200 pt-1">
                    <span className="text-blue-700 font-medium">Total Amount:</span>
                    <span className="font-bold text-blue-900">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              <RazorpayPayment
                amount={totalAmount}
                description={`EMI Payment - Month ${selectedEmi.month}`}
                emiId={selectedEmi._id}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                buttonText={`Pay ₹${totalAmount} EMI`}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Payment component for full loan
  if (showPayment && paymentType === "full" && selectedLoan) {
    const prepayment = calculatePrepaymentAmount(selectedLoan);
    
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => setShowPayment(false)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Loans
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-slate-200">
              <h1 className="text-xl font-semibold text-slate-900">
                Pay Full Loan - #{selectedLoan._id.slice(-6)}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Close your loan with prepayment
              </p>
            </div>

            <div className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-green-900 mb-2">Full Payment Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Remaining Principal:</span>
                    <span className="font-medium text-green-900">₹{prepayment.remainingAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">Prepayment Charge (2%):</span>
                    <span className="font-medium text-orange-900">₹{prepayment.prepaymentCharge}</span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 pt-1">
                    <span className="text-green-700 font-medium">Total Amount:</span>
                    <span className="font-bold text-green-900">₹{prepayment.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Prepayment Benefits:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Save on future interest payments</li>
                      <li>• Close loan early and improve credit score</li>
                      <li>• Only 2% prepayment charge</li>
                    </ul>
                  </div>
                </div>
              </div>

              <RazorpayPayment
                amount={prepayment.totalAmount}
                description={`Full Loan Payment - ${selectedLoan.purpose}`}
                loanId={selectedLoan._id}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                buttonText={`Pay ₹${prepayment.totalAmount} (Close Loan)`}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate("/member/dashboard")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Loans & EMIs</h1>
              <p className="text-slate-600 mt-1">Manage your loans and EMI payments</p>
            </div>
            <button
              onClick={loadLoansAndEmis}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="text-slate-500">Loading loans and EMIs...</div>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            {/* Active Loans */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Active Loans</h2>
              </div>
              <div className="p-6">
                {loans.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No active loans found</p>
                ) : (
                  <div className="grid gap-4">
                    {loans.map((loan) => {
                      const prepayment = calculatePrepaymentAmount(loan);
                      return (
                        <div key={loan._id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium text-slate-900">Loan #{loan._id.slice(-6)}</h3>
                              <p className="text-sm text-slate-600">{loan.purpose}</p>
                            </div>
                            <div className="flex gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(loan.status)}`}>
                                {loan.status}
                              </span>
                              {(loan.status === "APPROVED" || loan.status === "ACTIVE") && (
                                <button
                                  onClick={() => handleFullLoanPayment(loan)}
                                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                >
                                  <Zap className="w-3 h-3" />
                                  Pay Full (₹{prepayment.totalAmount})
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500">Principal Amount</p>
                              <p className="font-medium">₹{loan.principalAmount}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Monthly EMI</p>
                              <p className="font-medium">₹{loan.monthlyEMI}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Duration</p>
                              <p className="font-medium">{loan.duration} months</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Interest Rate</p>
                              <p className="font-medium">{loan.interestRate}%</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* EMI Schedule */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">EMI Schedule</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Late fee: ₹100 per day after due date
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-slate-900">Month</th>
                      <th className="px-6 py-3 text-left font-medium text-slate-900">Due Date</th>
                      <th className="px-6 py-3 text-left font-medium text-slate-900">Amount</th>
                      <th className="px-6 py-3 text-left font-medium text-slate-900">Late Fee</th>
                      <th className="px-6 py-3 text-left font-medium text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-slate-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {emis.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No EMI records found
                        </td>
                      </tr>
                    ) : (
                      emis.map((emi) => (
                        <tr key={emi._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium">Month {emi.month}</td>
                          <td className="px-6 py-4 text-slate-600">
                            {new Date(emi.dueDate).toLocaleDateString()}
                            {isOverdue(emi.dueDate) && emi.status === 'PENDING' && (
                              <span className="ml-2 text-red-600 text-xs">OVERDUE</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium">₹{emi.amount}</td>
                          <td className="px-6 py-4">
                            {emi.lateFee > 0 ? (
                              <span className="text-red-600 font-medium">₹{emi.lateFee}</span>
                            ) : (
                              <span className="text-slate-400">₹0</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(emi.status)}`}>
                              {getStatusIcon(emi.status)}
                              {emi.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {(emi.status === 'PENDING' || emi.status === 'OVERDUE') && (
                              <button
                                onClick={() => handleEmiPayment(emi)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                              >
                                <CreditCard className="w-4 h-4" />
                                Pay Now
                                {emi.lateFee > 0 && (
                                  <span className="text-red-600">(+₹{emi.lateFee})</span>
                                )}
                              </button>
                            )}
                            {emi.status === 'PAID' && (
                              <span className="text-green-600 text-sm">✓ Paid</span>
                            )}
                            {emi.status === 'CANCELLED' && (
                              <span className="text-gray-600 text-sm">Cancelled</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}