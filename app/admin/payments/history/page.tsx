"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AdminNavBar from "@/app/components/AdminNavBar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Profile {
  full_name: string;
  email: string;
  phone_number: string;
}

interface Payment {
  id: string;
  loan_id: string;
  amount_paid: number;
  status: string;
  created_at: string;
  user_id: string;
  profiles: Profile; // Ensure profiles is typed as an object
  user_name: string;
  user_email: string;
  user_phone: string;
}

export default function AdminPaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all payments with profile information
        const { data: payments, error } = await supabase
          .from("repayments")
          .select(`
            id,
            loan_id,
            amount_paid,
            status,
            created_at,
            user_id,
            profiles (
              full_name,
              email,
              phone_number
            )
          `);

        if (error) throw error;

        // Map the payments with profile information
        const mappedPayments = payments?.map((payment) => ({
          ...payment,
          user_name: payment.profiles?.full_name || 'N/A',
          user_email: payment.profiles?.email || 'N/A',
          user_phone: payment.profiles?.phone_number || 'N/A',
        })) || [];

        setPayments(mappedPayments);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPayment(null);
    setModalOpen(false);
  };

  const handleApprove = async () => {
    if (selectedPayment) {
      await updatePaymentStatus(selectedPayment.id, "approved");
      setPayments((prevPayments) =>
        prevPayments.map((payment) =>
          payment.id === selectedPayment.id
            ? { ...payment, status: "approved" }
            : payment
        )
      );
      handleCloseModal();
    }
  };

  const handleReject = async () => {
    if (selectedPayment) {
      await updatePaymentStatus(selectedPayment.id, "rejected");
      setPayments((prevPayments) =>
        prevPayments.map((payment) =>
          payment.id === selectedPayment.id
            ? { ...payment, status: "rejected" }
            : payment
        )
      );
      handleCloseModal();
    }
  };

  const handleDelete = async () => {
    if (selectedPayment) {
      const { error } = await supabase
        .from("repayments")
        .delete()
        .eq("id", selectedPayment.id);

      if (error) {
        console.error("Error deleting payment:", error);
        return;
      }

      setPayments((prevPayments) =>
        prevPayments.filter((payment) => payment.id !== selectedPayment.id)
      );
      handleCloseModal();
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    const { error } = await supabase
      .from("repayments")
      .update({ status })
      .eq("id", paymentId);

    if (error) {
      console.error("Error updating payment status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 bg-white shadow">
          <AdminNavBar />
        </div>
        <div className="flex-1 p-8">
          <p className="text-gray-700">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 bg-white shadow">
          <AdminNavBar />
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
      <div className="w-64 bg-white shadow">
        <AdminNavBar />
      </div>
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-semibold mb-6 text-blue-950">Admin Payment Management</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Member Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Phone</th>
                <th className="py-3 px-6 text-left">Amount Paid</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left">{payment.user_name}</td>
                  <td className="py-3 px-6 text-left">{payment.user_email}</td>
                  <td className="py-3 px-6 text-left">{payment.user_phone}</td>
                  <td className="py-3 px-6 text-left">KES {payment.amount_paid.toLocaleString()}</td>
                  <td className="py-3 px-6 text-left">{payment.status}</td>
                  <td className="py-3 px-6 text-left">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleView(payment)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modalOpen && selectedPayment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow-lg w-1/3">
              <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
              <p>
                <strong>Member Name:</strong> {selectedPayment.user_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedPayment.user_email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedPayment.user_phone}
              </p>
              <p>
                <strong>Amount Paid:</strong> KES {selectedPayment.amount_paid.toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> {selectedPayment.status}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedPayment.created_at).toLocaleDateString()}
              </p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={handleApprove}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={handleCloseModal}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
