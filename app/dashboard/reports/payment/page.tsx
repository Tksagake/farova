import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/app/components/Navbar";
import { StatementGenerator } from "@/app/components/StatementGenerator";

interface Loan {
  id: string;
  amount_requested: number;
  purpose: string;
  repayment_period: number;
  interest_rate: number;
  repayment_method: string;
  existing_loan_balance: number;
  status: string;
  monthly_installment: number;
  total_due: number;
  amount_paid: number;
  balance_due: number;
  due_date: string;
}

interface Payment {
  loan_id: string;
  amount_paid: number | null;
  created_at: string;
}

export default function LoansPage() {
  const router = useRouter();
  const params = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Record<string, Payment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true);
      setError(null);

      try {
        // Validate the ID parameter
        if (!params?.id || typeof params.id !== "string") {
          throw new Error("Invalid user ID");
        }

        // Check if the ID looks like a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.id);
        if (!isUUID) {
          throw new Error("Invalid UUID format");
        }

        // Fetch loans for the member
        const { data: loansData, error: loansError } = await supabase
          .from("loans")
          .select("*")
          .eq("member_id", params.id);

        if (loansError) throw loansError;

        // Fetch all approved payments related to these loans
        const { data: allPayments, error: paymentError } = await supabase
          .from("repayments")
          .select("loan_id, amount_paid, created_at")
          .in("loan_id", loansData?.map((loan) => loan.id) || [])
          .eq("status", "approved");

        if (paymentError) throw paymentError;

        // Organize payments by loan_id
        const paymentMap: Record<string, Payment[]> = {};
        (allPayments || []).forEach((payment) => {
          if (!paymentMap[payment.loan_id]) {
            paymentMap[payment.loan_id] = [];
          }
          paymentMap[payment.loan_id].push(payment);
        });

        setLoans(loansData || []);
        setPayments(paymentMap);
      } catch (err: any) {
        console.error("Error fetching loans:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [params?.id, router]);

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
      <div className="flex min-h-screen bg-white">
        <div className={`fixed left-0 top-0 h-full transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <Navbar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} flex items-center justify-center`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700 mb-4"></div>
            <h2 className="text-xl font-semibold text-blue-950">Loading Loans...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className={`fixed left-0 top-0 h-full transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <Navbar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-8`}>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 bg-blue-950 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <Navbar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-8 bg-white rounded-lg`}>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Loans</h3>
          <StatementGenerator loans={loans} memberName={""} memberEmail={""} memberPhone={""} payments={payments} />

          {loans.length === 0 ? (
            <p className="text-gray-600">No active loans found.</p>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.id} className="p-4 bg-white shadow rounded-lg border-l-4 border-blue-500">
                  <h4 className="text-lg font-semibold mb-2 text-blue-900">{loan.purpose || "Unspecified Loan"}</h4>
                  <p className="text-gray-700">
                    <strong>Loan Amount:</strong> KES {formatAmount(loan.amount_requested)}
                  </p>
                  <p className="text-gray-700">
                    <strong>Repayment Period:</strong> {loan.repayment_period} months
                  </p>
                  <p className="text-gray-700">
                    <strong>Total Paid:</strong> KES {formatAmount(calculateTotalPaid(loan.id))}
                  </p>
                  <p className="text-gray-700">
                    <strong>Balance Due:</strong> KES {formatAmount(calculateBalance(loan))}
                  </p>
                  <p className="text-gray-700">
                    <strong>Status:</strong> {loan.status}
                  </p>
                  <h5 className="mt-4 font-semibold text-gray-800">Payment History:</h5>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
