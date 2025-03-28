"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/app/components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Loan {
  id: string;
  purpose: string;
  amount_requested: number;
}

interface Payment {
  loan_id: string;
  amount_paid: number | null;
  created_at: string;
}

export default function PaymentSummaryPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Record<string, Payment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error("User not authenticated");

        // Fetch loans and payments together
        const { data: loans, error: loanError } = await supabase
          .from("loans")
          .select("id, purpose, amount_requested")
          .eq("member_id", user.id);

        if (loanError) throw loanError;

        // Fetch all approved payments related to these loans in one query
        const { data: allPayments, error: paymentError } = await supabase
          .from("repayments")
          .select("loan_id, amount_paid, created_at")
          .in("loan_id", loans?.map((loan) => loan.id) || [])
          .eq("status", "approved"); // Filter for approved payments

        if (paymentError) throw paymentError;

        // Organize payments by loan_id
        const paymentMap: Record<string, Payment[]> = {};
        (allPayments || []).forEach((payment) => {
          if (!paymentMap[payment.loan_id]) {
            paymentMap[payment.loan_id] = [];
          }
          paymentMap[payment.loan_id].push(payment);
        });

        setLoans(loans || []);
        setPayments(paymentMap);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load payment data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to safely format amounts
  const formatAmount = (amount: number | null | undefined) => {
    return amount?.toLocaleString() ?? "0";
  };

  // Calculate total paid dynamically
  const calculateTotalPaid = (loanId: string) => {
    return payments[loanId]?.reduce((total, payment) => total + (payment.amount_paid ?? 0), 0) ?? 0;
  };

  // Calculate balance dynamically
  const calculateBalance = (loan: Loan) => {
    const totalPaid = calculateTotalPaid(loan.id);
    return loan.amount_requested - totalPaid;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 bg-white shadow">
          <Navbar />
        </div>
        <div className="flex-1 p-8">
          <p className="text-gray-700">Loading payment summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 bg-white shadow">
          <Navbar />
        </div>
        <div className="flex-1 p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-semibold mb-6 text-blue-950">Payment Summary</h2>

        {loans.length === 0 ? (
          <p className="text-gray-600">No active loans found.</p>
        ) : (
          loans.map((loan) => (
            <div key={loan.id} className="mb-8 p-6 bg-white shadow rounded-lg border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold mb-2 text-blue-900">{loan.purpose || "Unspecified Loan"}</h3>
              <p className="text-gray-700">
                <strong>Loan Amount:</strong> KES {formatAmount(loan.amount_requested)}
              </p>
              <p className="text-gray-700">
                <strong>Total Paid:</strong> KES {formatAmount(calculateTotalPaid(loan.id))}
              </p>
              <p className="text-gray-700">
                <strong>Balance Due:</strong> KES {formatAmount(calculateBalance(loan))}
              </p>

              {/* Payment History */}
              <h4 className="mt-4 font-semibold text-gray-800">Payment History:</h4>
              {payments[loan.id]?.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {payments[loan.id].map((payment, index) => (
                    <li key={index} className="py-2 border-b border-gray-200">
                      KES {formatAmount(payment.amount_paid)} -{" "}
                      {payment.created_at
                        ? new Date(payment.created_at).toLocaleDateString()
                        : "Unknown date"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No payments made yet.</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
