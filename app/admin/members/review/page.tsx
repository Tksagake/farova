"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import AdminNavBar from "@/app/components/AdminNavBar";

interface Profile {
  created_at: string | number | Date;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  national_id: string;
  status: string;
  metadata: {
    usertype?: string;
  };
}

export default function AdminDashboard() {
  const [pendingProfiles, setPendingProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPendingProfiles = async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: true });

        if (error) throw error;
        
        console.log("Pending profiles:", data);
        setPendingProfiles(data || []);
      } catch (error: any) {
        console.error("Error:", error);
        setError(`Failed to load profiles: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingProfiles();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow">
        <AdminNavBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-blue-950">Pending Member Approvals</h2>
            <div className="flex items-center space-x-2 text-blue-950" >
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {pendingProfiles.length} Pending
              </span>
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Refresh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center p-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2">Loading pending members...</p>
            </div>
          ) : pendingProfiles.length === 0 ? (
            <div className="p-6 bg-white rounded-lg shadow">
              <p className="text-gray-600">No pending members requiring approval.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProfiles.map((profile) => (
                <div key={profile.user_id} className="border p-6 rounded-lg shadow-sm bg-white text-blue-950">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="font-semibold">Name:</p>
                      <p>{profile.full_name || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Email:</p>
                      <p>{profile.email || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">User Type:</p>
                      <p className="capitalize">{profile.metadata?.usertype || "regular"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Application Date:</p>
                      <p>{new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Link
                      href={`/admin/members/${profile.user_id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <span>Review Application</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}