"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AdminNavBar from "@/app/components/AdminNavBar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Repayment {
  id: string;
  amount_paid: number;
  proof_url: string;
  loan_id: string;
  created_at: string;
  status: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
}

export default function AdminRepayments() {
  const [payments, setPayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        // First get repayments with user_id
        const { data: repaymentsData, error: repaymentsError } = await supabase
          .from("repayments")
          .select("id, amount_paid, proof_url, loan_id, created_at, status, user_id")
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (repaymentsError) {
          throw repaymentsError;
        }

        if (!repaymentsData || repaymentsData.length === 0) {
          setPayments([]);
          return;
        }

        // Then get all user profiles in one query
        const userIds = repaymentsData.map(r => r.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, phone_number")
          .in("user_id", userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const paymentsWithUserDetails = repaymentsData.map(payment => {
          const profile = profilesData?.find(p => p.user_id === payment.user_id);
          return {
            ...payment,
            full_name: profile?.full_name || "N/A",
            email: profile?.email || "N/A",
            phone_number: profile?.phone_number || "N/A"
          };
        });

        setPayments(paymentsWithUserDetails);
      } catch (err: any) {
        console.error("Error fetching payments:", {
          message: err.message,
          details: err.details,
          code: err.code
        });
        setError(err.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handlePaymentUpdate = (id: string) => {
    setPayments(payments.filter(payment => payment.id !== id));
  };

  return (
    <div className="flex min-h-screen">
      <AdminNavBar />
      
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Pending Payments</h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">No pending payments to review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {payments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onUpdate={handlePaymentUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentCard({
  payment,
  onUpdate
}: {
  payment: Repayment,
  onUpdate: (id: string) => void
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: "approve" | "reject") => {
    setProcessing(true);
    setError(null);
    try {
      console.log(`Attempting to ${action} payment:`, payment.id);

      const { data, error: updateError } = await supabase
        .from("repayments")
        .update({
          status: action === "approve" ? "approved" : "rejected",
          updated_at: new Date().toISOString()
        })
        .eq("id", payment.id)
        .select();

      if (updateError) {
        throw updateError;
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned from update");
      }

      console.log(`Successfully ${action}d payment:`, data[0]);
      onUpdate(payment.id);
    } catch (err: any) {
      console.error(`Error ${action}ing payment:`, {
        message: err.message,
        details: err.details,
        code: err.code
      });
      setError(err.message || `Failed to ${action} payment`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 flex flex-col justify-between">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Payment #{payment.id.slice(0, 6)}
          </h3>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Pending
          </span>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-semibold">KES {payment.amount_paid.toLocaleString()}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Date Submitted</p>
            <p>{new Date(payment.created_at).toLocaleDateString()}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Member Name</p>
            <p>{payment.full_name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p>{payment.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Phone Number</p>
            <p>{payment.phone_number}</p>
          </div>

          {payment.proof_url && (
            <div>
              <p className="text-sm text-gray-500">Proof</p>
              <a
                href={payment.proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View Receipt
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 p-4 border-t border-gray-200">
        {error && (
          <div className="mb-3 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}
        <div className="flex space-x-3">
          <button
            onClick={() => handleAction("approve")}
            disabled={processing}
            className={`flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition ${
              processing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {processing ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={() => handleAction("reject")}
            disabled={processing}
            className={`flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition ${
              processing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {processing ? 'Processing...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}