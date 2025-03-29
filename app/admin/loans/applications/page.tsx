"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminNavBar from '@/app/components/AdminNavBar';

interface Loan {
  id: string;
  member_id: string;
  amount_requested: number;
  purpose: string;
  repayment_period: number;
  interest_rate: number;
  status: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  national_id: string;
  kra_pin: string;
  occupation: string;
  disability: string;
}

const AdminLoanPage = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [memberDetails, setMemberDetails] = useState<Profile | null>(null);
  const [memberDetailsMap, setMemberDetailsMap] = useState<Map<string, Profile>>(new Map());

  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('loans')
          .select('*')
          .eq('status', 'pending') // Fetch only pending loans
          .order('created_at', { ascending: false });

        if (error) throw error;

        setLoans(data || []);

        // Fetch member details for each loan
        const memberDetailsPromises = data.map(async (loan) => {
          const { data: memberData, error: memberError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', loan.member_id)
            .single();

          if (memberError) throw memberError;

          return { member_id: loan.member_id, member_details: memberData };
        });

        const memberDetailsResults = await Promise.all(memberDetailsPromises);
        const memberDetailsMap = new Map(memberDetailsResults.map(result => [result.member_id, result.member_details]));
        setMemberDetailsMap(memberDetailsMap);
      } catch (err: any) {
        console.error('Error fetching loans:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const openModal = (loan: Loan) => {
    setSelectedLoan(loan);
    const memberDetails = memberDetailsMap.get(loan.member_id);
    if (memberDetails) {
      setMemberDetails(memberDetails);
    }
  };

  const closeModal = () => {
    setSelectedLoan(null);
    setMemberDetails(null);
  };

  const updateLoanStatus = async (loanId: string, newStatus: string) => {
    if (newStatus === 'rejected') {
      await deleteLoan(loanId);
    } else {
      const { error } = await supabase
        .from('loans')
        .update({ status: newStatus })
        .eq('id', loanId);

      if (error) {
        alert('Failed to update loan status');
        console.error(error);
        return;
      }

      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          loan.id === loanId ? { ...loan, status: newStatus } : loan
        ).filter((loan) => loan.status === 'pending') // Filter out non-pending loans
      );
      alert(`Loan marked as ${newStatus}`);
    }

    // Send email notification
    const memberDetails = memberDetailsMap.get(selectedLoan?.member_id || '');
    if (memberDetails) {
      await sendEmail(memberDetails.email, newStatus === 'approved' ? 'loan-approval' : 'loan-declined', loanId);
    }

    closeModal();
  };

  const deleteLoan = async (loanId: string) => {
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', loanId);

    if (error) {
      alert('Failed to delete loan');
      console.error(error);
      return false;
    } else {
      setLoans((prevLoans) => prevLoans.filter((loan) => loan.id !== loanId));
      alert('Loan deleted successfully');
      return true;
    }
  };

  const sendEmail = async (to: string, type: string, loanId?: string) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: to,
          type: type,
          loanId: loanId,
        }),
      });
  
      const data = await response.json();
      console.log('Response Status:', response.status);
      console.log('Response Data:', data);
  
      if (!response.ok) {
        throw new Error(`Failed to send email: ${data.error || response.statusText}`);
      }
  
      if (data.success) {
        console.log(`Email sent to ${to}`);
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };
  

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="w-64">
          <AdminNavBar />
        </div>
        <div className="flex-1 flex items-center justify-center">
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
        <div className="w-64">
          <AdminNavBar />
        </div>
        <div className="flex-1 p-8">
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
      <div className="w-64">
        <AdminNavBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-blue-950">Admin - Loan Management</h2>

        {loans.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Notice:</strong>
            <span className="block sm:inline"> No pending loans available.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Member Name</th>
                  <th className="py-3 px-4">Amount (KES)</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Repayment (Months)</th>
                  <th className="py-3 px-4">Interest (%)</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => {
                  const memberDetails = memberDetailsMap.get(loan.member_id);
                  return (
                    <tr key={loan.id} className="border-t">
                      <td className="py-4 px-4">{memberDetails?.full_name}</td>
                      <td className="py-4 px-4">{loan.amount_requested.toLocaleString()}</td>
                      <td className="py-4 px-4">{loan.purpose}</td>
                      <td className="py-4 px-4">{loan.repayment_period}</td>
                      <td className="py-4 px-4">{loan.interest_rate}%</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => openModal(loan)}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {selectedLoan && memberDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-950">Loan Details</h3>
              <p><strong>Loan Amount:</strong> KES {selectedLoan.amount_requested.toLocaleString()}</p>
              <p><strong>Purpose:</strong> {selectedLoan.purpose}</p>
              <p><strong>Repayment Period:</strong> {selectedLoan.repayment_period} months</p>
              <p><strong>Interest Rate:</strong> {selectedLoan.interest_rate}%</p>
              <p><strong>Status:</strong> {selectedLoan.status}</p>
              <h3 className="text-lg font-semibold mb-4 text-blue-950 mt-6">Member Details</h3>
              <p><strong>Full Name:</strong> {memberDetails.full_name}</p>
              <p><strong>Phone Number:</strong> {memberDetails.phone_number}</p>
              <p><strong>Email:</strong> {memberDetails.email}</p>
              <p><strong>National ID:</strong> {memberDetails.national_id}</p>
              <p><strong>KRA PIN:</strong> {memberDetails.kra_pin}</p>
              <p><strong>Occupation:</strong> {memberDetails.occupation}</p>
              <p><strong>Disability:</strong> {memberDetails.disability || 'N/A'}</p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => updateLoanStatus(selectedLoan.id, 'approved')}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateLoanStatus(selectedLoan.id, 'rejected')}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Reject
                </button>
                <button
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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
};

export default AdminLoanPage;
