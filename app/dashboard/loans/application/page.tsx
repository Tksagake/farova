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
  town_residence?: string;
  zip_code?: string;
  country?: string;
  marital_status?: string;
  spouse_name?: string;
  religion?: string;
  salary_type?: string;
  passport_image?: string;
  id_image?: string;
  kra_image?: string;
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
  { type: 'Personal', interest_rate: 10, min_repayment_period: 1, max_repayment_period: 24 },
  { type: 'Business', interest_rate: 12, min_repayment_period: 1, max_repayment_period: 60 },
  { type: 'Education', interest_rate: 8, min_repayment_period: 1, max_repayment_period: 48 },
];

const requiredProfileFields: (keyof Profile)[] = [
  'full_name', 'phone_number', 'email', 'national_id',
  'kra_pin', 'disability', 'occupation', 'town_residence',
  'zip_code', 'country', 'marital_status', 'religion',
  'passport_image', 'id_image', 'kra_image'
];

const LoanApplicationForm = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const [profileComplete, setProfileComplete] = useState(false);

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
    const fetchProfileAndGuarantors = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        // Fetch complete profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error("Profile not found");

        // Check profile completion
        const incompleteFields = requiredProfileFields.filter(
          field => !profileData[field]
        );

        if (incompleteFields.length > 0) {
          throw new Error(
            `Please complete your profile first`
          );
        }

        setProfileComplete(true);

        // Fetch guarantors (only approved members)
        const { data: guarantorsData, error: guarantorsError } = await supabase
          .from("profiles")
          .select("id, full_name, email, status")
          .neq("user_id", user.id)
          .eq("status", "approved");

        if (guarantorsError) throw guarantorsError;

        // Fetch loans and calculate balance from repayments
        const { data: loansData, error: loansError } = await supabase
          .from("loans")
          .select("id, amount_requested, status")
          .eq("member_id", user.id)
          .neq("status", "fully_repaid");

        if (loansError) throw loansError;

        // Fetch all approved repayments for these loans
        const { data: repaymentsData, error: repaymentsError } = await supabase
          .from("repayments")
          .select("loan_id, amount_paid")
          .in("loan_id", loansData?.map(loan => loan.id) || [])
          .eq("status", "approved");

        if (repaymentsError) throw repaymentsError;

        // Calculate total paid per loan
        const loanPayments = repaymentsData?.reduce((acc, payment) => {
          acc[payment.loan_id] = (acc[payment.loan_id] || 0) + (payment.amount_paid || 0);
          return acc;
        }, {} as Record<string, number>) || {};

        // Calculate existing loan balance
        const existingLoanBalance = loansData?.reduce((total, loan) => {
          const paid = loanPayments[loan.id] || 0;
          return total + (loan.amount_requested - paid);
        }, 0) || 0;

        setProfile(profileData);
        setGuarantors(guarantorsData || []);
        setForm(prev => ({ ...prev, existing_loan_balance: existingLoanBalance }));
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
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'amount_requested' || name === 'repayment_period' || name === 'loan_type') {
      const loanType = loanTypes.find(lt => lt.type === form.loan_type);
      const amount = name === 'amount_requested' ? parseFloat(value) : form.amount_requested;
      const months = name === 'repayment_period' ? parseInt(value) : form.repayment_period;
      const rate = loanType ? loanType.interest_rate : 0;
      setMonthlyInstallment(calculateMonthlyInstallment(amount, rate, months));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!profile || profile.status !== "approved") {
      alert("Your profile is not approved yet. Please wait for admin approval.");
      return;
    }
  
    if (!profileComplete) {
      alert("Please complete your profile before applying for a loan.");
      router.push('/dashboard/profile');
      return;
    }
  
    try {
      const loanType = loanTypes.find(lt => lt.type === form.loan_type);
      if (!loanType) throw new Error("Invalid loan type selected");
  
      const totalDue = monthlyInstallment * form.repayment_period;
  
      // Create the loan
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .insert([{
          member_id: profile.user_id,
          amount_requested: form.amount_requested,
          purpose: form.purpose,
          repayment_period: form.repayment_period,
          interest_rate: loanType.interest_rate,
          repayment_method: 'checkoff',
          existing_loan_balance: form.existing_loan_balance,
          monthly_installment: monthlyInstallment,
          total_due: totalDue,
          status: 'pending'
        }])
        .select();
  
      if (loanError) throw loanError;
  
      // Add guarantor if selected
      if (form.guarantor_id) {
        const { error: guarantorError } = await supabase
          .from('guarantors')
          .insert([{
            loan_id: loanData[0].id,
            guarantor_id: form.guarantor_id,
            status: 'pending'
          }]);
  
        if (guarantorError) throw guarantorError;
  
        // Notify guarantor
        const guarantor = guarantors.find(g => g.id === form.guarantor_id);
        if (guarantor) {
          await sendEmail(
            guarantor.email,
            'custom', // Use 'custom' type for guarantor notification
            `You have been requested to guarantee a loan application by ${profile.full_name}.`
          );
        }
      }
  
      // Send loan application email to the applicant
      await sendEmail(
        profile.email,
        'loan-application', // Ensure this matches the server-side expectation
        loanData[0].id
      );
  
      alert('Loan application submitted successfully!');
      router.push('/dashboard/loans');
    } catch (err) {
      console.error('Error submitting application:', err);
      alert(`Failed to submit application: ${err.message}`);
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
  
      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }
  
      const data = await response.json();
  
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
        <div className={`fixed left-0 top-0 h-full transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <Navbar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} flex items-center justify-center`}>
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
        <div className={`fixed left-0 top-0 h-full transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <Navbar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-8`}>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            {error.includes("Please complete your profile") && (
              <button
                onClick={() => router.push('/dashboard/complete-profile')}
                className="mt-4 bg-blue-950 text-white px-4 py-2 rounded-md hover:bg-white hover:text-blue-950"
              >
                Complete Profile
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const selectedLoanType = loanTypes.find(lt => lt.type === form.loan_type);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <Navbar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-8 bg-white rounded-lg shadow-lg`}>
        <h2 className="text-2xl font-semibold mb-6 text-blue-950">Apply for a Loan</h2>

        {!profileComplete && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
            <strong>Notice:</strong> Please complete your profile before applying for a loan.
          </div>
        )}

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