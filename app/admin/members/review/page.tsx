"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Navbar from "@/app/components/Navbar";

interface Profile {
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
  const [success, setSuccess] = useState("");

  // Fetch Pending Profiles with proper filtering
  useEffect(() => {
    const fetchPendingProfiles = async () => {
      setLoading(true);
      setError("");
      try {
        // Query with both status and metadata.usertype conditions
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("status", "pending")

          .order("created_at", { ascending: true });

        if (error) throw error;
        
        console.log("Fetched profiles:", {
          count: data?.length,
          profiles: data?.map((p: { user_id: any; status: any; metadata: { usertype: any; }; }) => ({
            id: p.user_id,
            status: p.status,
            usertype: p.metadata?.usertype
          }))
        });

        setPendingProfiles(data || []);
      } catch (error: any) {
        console.error("Full error details:", error);
        setError(`Error fetching profiles: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingProfiles();
  }, []);

  // Approve or Reject User with proper type checking
  const updateStatus = async (userId: string, newStatus: "approved" | "rejected") => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Verify the profile exists before updating
      const profileToUpdate = pendingProfiles.find(p => p.user_id === userId);
      if (!profileToUpdate) {
        throw new Error("Profile not found");
      }

      // Verify usertype is regular
      if (profileToUpdate.metadata?.usertype !== "regular") {
        throw new Error("Can only update regular users");
      }

      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("user_id", userId);

      if (error) throw error;

      setPendingProfiles(prev => prev.filter(p => p.user_id !== userId));
      setSuccess(`User ${newStatus} successfully!`);
    } catch (error: any) {
      console.error("Update error:", error);
      setError(`Failed to update status: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-blue-950">Admin Dashboard</h2>
            <div className="flex items-center space-x-2">
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

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {loading ? (
            <div className="text-center p-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2">Processing...</p>
            </div>
          ) : pendingProfiles.length === 0 ? (
            <div className="p-6 bg-white rounded-lg shadow">
              <p className="text-gray-600">No pending regular user profiles to approve.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProfiles.map((profile) => (
                <div key={profile.user_id} className="border p-6 rounded-lg shadow-sm bg-white">
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
                      <p className="font-semibold">Phone:</p>
                      <p>{profile.phone_number || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">National ID:</p>
                      <p>{profile.national_id || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">User Type:</p>
                      <p>{profile.metadata?.usertype || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={() => updateStatus(profile.user_id, "approved")}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                      disabled={loading || profile.metadata?.usertype !== "regular"}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(profile.user_id, "rejected")}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                      disabled={loading || profile.metadata?.usertype !== "regular"}
                    >
                      Reject
                    </button>
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