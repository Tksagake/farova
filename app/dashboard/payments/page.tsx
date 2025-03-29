"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '../../components/Navbar';

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

const LoansPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const { data: loansData, error: loansError } = await supabase
          .from("loans")
          .select("*")
          .eq("member_id", user.id);

        if (loansError) throw loansError;

        setLoans(loansData || []);
      } catch (err: any) {
        console.error("Error fetching loans:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const openModal = (loan: Loan) => {
    setSelectedLoan(loan);
  };

  const closeModal = () => {
    setSelectedLoan(null);
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
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-8 bg-white rounded-lg shadow-lg`}>
        <h2 className="text-2xl font-semibold mb-6 text-blue-950">Your Loans</h2>

        {loans.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Notice:</strong>
            <span className="block sm:inline"> You have no loans at the moment.</span>
          </div>
        ) : (
          <div className="space-y-6">
            {loans.map((loan) => (
              <div key={loan.id} className="bg-gray-100 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2 text-blue-950">Loan Details</h3>
                <p><strong>Loan Amount:</strong> KES {loan.amount_requested?.toFixed(2) || 'N/A'}</p>
                <p><strong>Purpose:</strong> {loan.purpose}</p>
                <p><strong>Repayment Period:</strong> {loan.repayment_period} months</p>
                <p><strong>Status:</strong> {loan.status}</p>
                <button
                  onClick={() => openModal(loan)}
                  className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  More Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedLoan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-950">Loan Details</h3>
              <p><strong>Loan Amount:</strong> KES {selectedLoan.amount_requested?.toFixed(2) || 'N/A'}</p>
              <p><strong>Purpose:</strong> {selectedLoan.purpose}</p>
              <p><strong>Repayment Period:</strong> {selectedLoan.repayment_period} months</p>
              <p><strong>Interest Rate:</strong> {selectedLoan.interest_rate}%</p>
              <p><strong>Repayment Method:</strong> {selectedLoan.repayment_method}</p>
              <p><strong>Monthly Installment:</strong> KES {selectedLoan.monthly_installment?.toFixed(2) || 'N/A'}</p>
              <p><strong>Total Due:</strong> KES {selectedLoan.total_due?.toFixed(2) || 'N/A'}</p>
              <p><strong>Amount Paid:</strong> KES {selectedLoan.amount_paid?.toFixed(2) || 'N/A'}</p>
              <p><strong>Balance Due:</strong> KES {selectedLoan.balance_due?.toFixed(2) || 'N/A'}</p>
              <p><strong>Status:</strong> {selectedLoan.status}</p>
              <p><strong>Next Due Date:</strong> {selectedLoan.due_date ? new Date(selectedLoan.due_date).toLocaleDateString() : 'N/A'}</p>
              <button
                onClick={closeModal}
                className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoansPage;