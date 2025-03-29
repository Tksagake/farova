"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/app/components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Loan {
  id: string;
  amount_requested: number;
  amount_disbursed: number;
  status: string;
  purpose: string;
  repayment_period: number;
  monthly_installment: number;
  total_due: number;
  balance_due: number;
}

export default function PaymentUploadPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  // Handle sidebar collapse state
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    } else if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }, []);

  // Sync sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Fetch user and their loans
  useEffect(() => {
    const fetchUserAndLoans = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        setUserId(user.id);
        const userLoans = await fetchLoans(user.id);
        setLoans(userLoans);

        if (userLoans.length > 0) {
          setSelectedLoanId(userLoans[0].id);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage({ text: "Failed to load user data", type: "error" });
      }
    };

    fetchUserAndLoans();
  }, []);

  // Fetch all loans linked to a user
  const fetchLoans = async (userId: string) => {
    const { data, error } = await supabase
      .from("loans")
      .select(`
        id,
        amount_requested,
        amount_disbursed,
        status,
        purpose,
        repayment_period,
        monthly_installment,
        total_due,
        balance_due
      `)
      .eq("member_id", userId)
      .in("status", ["approved", "disbursed", "partially_repaid"]);

    if (error) throw error;

    // Calculate balance_due dynamically
    const loansWithBalance = await Promise.all(
      data.map(async (loan) => {
        const totalAmountPaid = await calculateAmountPaid(loan.id);
        return {
          ...loan,
          balance_due: loan.total_due - totalAmountPaid,
        };
      })
    );

    return loansWithBalance;
  };

  // Calculate the total amount paid for a loan
  const calculateAmountPaid = async (loanId: string) => {
    const { data, error } = await supabase
      .from("repayments")
      .select("amount_paid")
      .eq("loan_id", loanId)
      .eq("status", "approved");

    if (error) throw error;

    // Sum up the amount_paid from all approved repayments
    const totalAmountPaid = data.reduce((sum, repayment) => sum + repayment.amount_paid, 0);
    return totalAmountPaid;
  };

  // Get the selected loan details
  const selectedLoan = loans.find((loan) => loan.id === selectedLoanId);

  // Helper function to safely format amounts
  const formatAmount = (amount: number | null | undefined) => {
    return amount?.toLocaleString() ?? "0";
  };

  // Handle payment and proof upload
  const handleFileUpload = async () => {
    if (!amount || !file || !selectedLoanId) {
      setMessage({ text: "Please complete all fields", type: "error" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      // Upload proof of payment
      const fileExt = file.name.split(".").pop();
      const fileName = `pop_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("pop").upload(fileName, file);

      if (uploadError) throw uploadError;

      const proofUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pop/${fileName}`;

      // Get current loan data
      const { data: loanData, error: loanError } = await supabase
        .from("loans")
        .select("total_due, balance_due, status")
        .eq("id", selectedLoanId)
        .single();

      if (loanError || !loanData) throw loanError || new Error("Loan not found");

      const totalAmountPaid = await calculateAmountPaid(selectedLoanId);
      const newAmountPaid = totalAmountPaid + amount;
      const newBalanceDue = loanData.total_due - newAmountPaid;

      // Determine new loan status
      let newStatus = loanData.status;
      if (newAmountPaid >= loanData.total_due) {
        newStatus = "fully_repaid";
      } else if (newAmountPaid > 0) {
        newStatus = "partially_repaid";
      }

      // Create repayment record
      const { error: repaymentError } = await supabase.from("repayments").insert({
        loan_id: selectedLoanId,
        amount_paid: amount,
        proof_url: proofUrl,
        status: "pending",
        user_id: userId,
      });

      if (repaymentError) throw repaymentError;

      // Update loan record
      const { error: updateError } = await supabase
        .from("loans")
        .update({
          balance_due: newBalanceDue,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedLoanId);

      if (updateError) throw updateError;

      setMessage({ text: "Payment uploaded successfully. Pending admin approval.", type: "success" });
      setAmount(0);
      setFile(null);

      // Refresh loan data
      const updatedLoans = await fetchLoans(userId);
      setLoans(updatedLoans);
    } catch (error) {
      console.error("Payment processing error:", error);
      setMessage({ text: "Failed to process payment. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow`}>
        <Navbar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-8`}>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-blue-950">Upload Proof of Payment</h2>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                message.type === "success"
                  ? "bg-green-100 border-green-400 text-green-800"
                  : "bg-red-100 border-red-400 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* Loan Selection */}
            {loans.length > 0 ? (
              <select
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                {loans.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    {loan.purpose} (KES {formatAmount(loan.amount_requested)}) - {loan.status}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-yellow-700">No approved loans found. Please apply for a loan.</p>
            )}

            {/* Balance Display */}
            {selectedLoan && (
              <p className="text-lg font-semibold">
                Balance Due: KES {formatAmount(selectedLoan.balance_due)}
              </p>
            )}

            {/* Payment Amount */}
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              placeholder="Enter amount (KES)"
              className="w-full p-3 border border-gray-300 rounded-md"
            />

            {/* File Upload */}
            <input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png" 
              className="w-full p-3 border border-gray-300 rounded-md" 
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} 
            />

            {/* Submit Button */}
            <button
              onClick={handleFileUpload}
              disabled={loading || loans.length === 0}
              className={`w-full bg-blue-600 text-white py-3 rounded-md ${loading ? "opacity-70" : "hover:bg-blue-700"}`}
            >
              {loading ? "Processing..." : "Submit Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}