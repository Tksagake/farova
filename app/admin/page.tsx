"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    const fetchLoans = async () => {
      const { data, error } = await supabase.from("loans").select("*");
      if (data) setLoans(data);
    };
    fetchLoans();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <table className="w-full border mt-5">
        <thead>
          <tr className="border-b">
            <th className="p-2">Member</th>
            <th className="p-2">Loan Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id} className="border-b">
              <td className="p-2">{loan.member_email}</td>
              <td className="p-2">{loan.amount}</td>
              <td className="p-2">{loan.status}</td>
              <td className="p-2">
                <button className="bg-green-500 text-white px-2 py-1 mr-2">Approve</button>
                <button className="bg-red-500 text-white px-2 py-1">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
