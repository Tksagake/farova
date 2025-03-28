"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateMonthlyInstallment } from '../../../utils/loanCalculations';
import Navbar from '../../../components/Navbar';
import { useRouter } from 'next/navigation';

interface Profile {
  occupation: string;
  disability: string;
  kra_pin: string;
  national_id: string;
  full_name: string;
  phone_number: string;
  email: string;
  user_id: string;
  status: string;
}

interface Guarantor {
  id: string;
  full_name: string;
  email: string;
}

interface LoanType {
  type: string;
  interest_rate: number;
  min_repayment_period: number;
  max_repayment_period: number;
}

const loanTypes: LoanType[] = [
  { type: 'Personal', interest_rate: 10, min_repayment_period: 6, max_repayment_period: 24 },
  { type: 'Business', interest_rate: 12, min_repayment_period: 12, max_repayment_period: 60 },
  { type: 'Education', interest_rate: 8, min_repayment_period: 24, max_repayment_period: 48 },
];

const LoanApplicationForm = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    amount_requested: 0,
    purpose: '',
    repayment_period: 12,
    loan_type: 'Personal',
    existing_loan_balance: 0,
    guarantor_id: '',
  });

  const [monthlyInstallment, setMonthlyInstallment] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [guarantors, setGuarantors] = useState<Guarantor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileAndGuarantors = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, phone_number, email, user_id, status, national_id, kra_pin, disability, occupation")
          .eq("user_id", user.id)
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error("Profile not found");

        const { data: guarantorsData, error: guarantorsError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .neq("user_id", user.id);

        if (guarantorsError) throw guarantorsError;

        const { data: loansData, error: loansError } = await supabase
          .from("loans")
          .select("amount_requested, amount_paid")
          .eq("member_id", user.id)
          .neq("status", "fully_repaid");

        if (loansError) throw loansError;

        const existingLoanBalance = loansData.reduce((total, loan) => {
          return total + (loan.amount_requested - loan.amount_paid);
        }, 0);

        setProfile(profileData);
        setGuarantors(guarantorsData || []);
        setForm((prev) => ({ ...prev, existing_loan_balance: existingLoanBalance }));
      } catch (err: any) {
        console.error("Error fetching data:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndGuarantors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'amount_requested' || name === 'repayment_period' || name === 'loan_type') {
      const loanType = loanTypes.find(lt => lt.type === form.loan_type);
      const amount = name === 'amount_requested' ? parseFloat(value) : form.amount_requested;
      const months = name === 'repayment_period' ? parseInt(value) : form.repayment_period;
      const rate = loanType ? loanType.interest_rate : 0;
      setMonthlyInstallment(calculateMonthlyInstallment(amount, rate, months));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || profile.status !== "approved") {
      alert("Your profile is not approved yet. Please wait for admin approval.");
      return;
    }

    const memberId = profile.user_id; // Use the actual user_id from the profile

    const loanType = loanTypes.find(lt => lt.type === form.loan_type);
    if (!loanType) {
      alert("Invalid loan type selected.");
      return;
    }

    const totalDue = monthlyInstallment * form.repayment_period;

    const { data: loanData, error: loanError } = await supabase.from('loans').insert([
      {
        member_id: memberId,
        amount_requested: form.amount_requested,
        purpose: form.purpose,
        repayment_period: form.repayment_period,
        interest_rate: loanType.interest_rate,
        repayment_method: 'checkoff',
        existing_loan_balance: form.existing_loan_balance,
        monthly_installment: monthlyInstallment,
        total_due: totalDue,
      },
    ]).select();

    if (loanError) {
      console.error('Error applying for loan:', loanError);
      alert('Failed to submit application');
      return;
    }

    const loanId = loanData?.[0]?.id;

    const { error: guarantorError } = await supabase.from('guarantors').insert([
      {
        loan_id: loanId,
        guarantor_id: form.guarantor_id,
      },
    ]);

    if (guarantorError) {
      console.error('Error adding guarantor:', guarantorError);
      alert('Failed to add guarantor');
      return;
    }

    // Notify the guarantor via email (assuming a function `sendEmail` exists)
    const guarantor = guarantors.find(g => g.id === form.guarantor_id);
    if (guarantor) {
      await sendEmail(guarantor.email, 'Guarantor Notification', `You have been selected as a guarantor for a loan application.`);
    }

    alert('Loan application submitted successfully!');
    router.push('/dashboard/loans');
  };

  const sendEmail = async (to: string, subject: string, body: string) => {
    // Implement email sending logic here
    console.log(`Sending email to ${to} with subject "${subject}" and body "${body}"`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="w-64">
          <Navbar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700 mb-4"></div>
            <h2 className="text-xl font-semibold text-blue-950">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="w-64">
          <Navbar />
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

  const selectedLoanType = loanTypes.find(lt => lt.type === form.loan_type);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-blue-950">Apply for a Loan</h2>

        {profile && profile.status !== "approved" && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
            <strong>Notice:</strong> Your profile is not approved yet. Please wait for admin approval to apply for a loan.
          </div>
        )}

        {profile && profile.status === "approved" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-blue-950">Personal Information</h3>
              <p><strong>Full Name:</strong> {profile.full_name}</p>
              <p><strong>Phone Number:</strong> {profile.phone_number}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Status:</strong> {profile.status}</p>
              <p><strong>National ID:</strong> {profile.national_id || 'N/A'}</p>
              <p><strong>KRA PIN:</strong> {profile.kra_pin || 'N/A'}</p>
              <p><strong>Disability:</strong> {profile.disability || 'N/A'}</p>
              <p><strong>Employment:</strong> {profile.occupation || 'N/A'}</p>
            </div>

            {/* Loan Amount */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-950">Loan Amount (KES)</label>
              <input
                type="number"
                name="amount_requested"
                value={form.amount_requested}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg"
                placeholder="Enter amount (e.g., 50000)"
              />
            </div>

            {/* Loan Purpose */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-950">Purpose</label>
              <input
                type="text"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg"
                placeholder="E.g., Business, School Fees"
              />
            </div>

            {/* Loan Type */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-950">Loan Type</label>
              <select
                name="loan_type"
                value={form.loan_type}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                {loanTypes.map((lt) => (
                  <option key={lt.type} value={lt.type}>
                    {lt.type}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Interest Rate */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-lg font-medium text-blue-950">
                Interest Rate: {selectedLoanType?.interest_rate}%
              </p>
            </div>

            {/* Repayment Period */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-950">Repayment Period (Months)</label>
              <input
                type="number"
                name="repayment_period"
                value={form.repayment_period}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg"
                min={selectedLoanType?.min_repayment_period}
                max={selectedLoanType?.max_repayment_period}
              />
            </div>

            {/* Existing Loan Balance */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-950">Existing Loan Balance (KES)</label>
              <input
                type="number"
                name="existing_loan_balance"
                value={form.existing_loan_balance}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                placeholder="Enter outstanding balance (if any)"
                disabled
              />
            </div>

            {/* Select Guarantor */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-950">Select Guarantor</label>
              <select
                name="guarantor_id"
                value={form.guarantor_id}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select a guarantor</option>
                {guarantors.map((guarantor) => (
                  <option key={guarantor.id} value={guarantor.id}>
                    {guarantor.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Installment (Dynamic Calculation) */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-lg font-medium text-blue-950">
                Estimated Monthly Installment: KES{' '}
                <span className="text-blue-600">{monthlyInstallment.toFixed(2)}</span>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Loan Application
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoanApplicationForm;
