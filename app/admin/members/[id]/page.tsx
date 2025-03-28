"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PencilIcon } from "@heroicons/react/24/outline";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import AdminNavBar from "@/app/components/AdminNavBar";

interface Profile {
  full_name: string;
  phone_number: string;
  secondary_phone: string;
  email: string;
  national_id: string;
  kra_pin: string;
  town_residence: string;
  zip_code: string;
  country: string;
  marital_status: string;
  spouse_name: string;
  religion: string;
  disability: string;
  occupation: string;
  salary_type: string;
  passport_image?: string;
  id_image?: string;
  kra_image?: string;
  status: string;
  user_id: string;
}

export default function MemberProfile() {
  const router = useRouter();
  const params = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!params?.id || typeof params.id !== "string") {
          throw new Error("Invalid user ID");
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.id);
        if (!isUUID) {
          throw new Error("Invalid UUID format");
        }

        const { data, error: supabaseError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", params.id)
          .single();

        if (supabaseError) throw supabaseError;
        if (!data) throw new Error("Profile not found");

        setProfile(data);
      } catch (err: any) {
        console.error("Error fetching profile:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params?.id, router]);

  const handleStatusUpdate = async (newStatus: "approved" | "rejected" | "inactive") => {
    if (!profile) return;

    setActionLoading(true);
    setActionSuccess(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("user_id", profile.user_id);

      if (error) throw error;

      setProfile({ ...profile, status: newStatus });
      setActionSuccess(`Profile ${newStatus} successfully!`);

      // Redirect back to admin dashboard after 2 seconds
      setTimeout(() => {
        router.push("/admin/members");
      }, 2000);
    } catch (err: any) {
      console.error("Error updating status:", err.message);
      setError(err.message);
    } finally {
      setActionLoading(false);
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
            <h2 className="text-xl font-semibold text-blue-950">Loading Profile...</h2>
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
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="mt-4 bg-blue-950 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="w-64">
          <AdminNavBar />
        </div>
        <div className="flex-1 p-8">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Notice</strong>
            <span className="block sm:inline"> Profile not found.</span>
            <button
              onClick={() => router.push("/admin/dashboard")}
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
      <div className="w-64">
        <AdminNavBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-white rounded-lg relative">
        {/* Profile Image (Top Right) */}
        {profile.passport_image && (
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/userdata/${profile.passport_image}`}
            alt="Profile Picture"
            className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-blue-950 object-cover"
          />
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-blue-950">
            {profile.full_name}'s Profile
          </h2>
          <button
            onClick={() => router.push(`/dashboard/complete-profile?id=${profile.user_id}`)}
            className="text-blue-950 hover:text-blue-700"
          >
            <PencilIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Admin Action Buttons */}
        <div className="flex justify-end gap-4 mb-6">
          <button
            onClick={() => handleStatusUpdate("rejected")}
            disabled={actionLoading || profile.status !== "pending"}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${profile.status !== "pending" ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            <XMarkIcon className="h-5 w-5" />
            Reject Application
          </button>
          <button
            onClick={() => handleStatusUpdate("approved")}
            disabled={actionLoading || profile.status !== "pending"}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${profile.status !== "pending" ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            <CheckIcon className="h-5 w-5" />
            Approve Application
          </button>
          <button
            onClick={() => handleStatusUpdate("inactive")}
            disabled={actionLoading || profile.status !== "approved"}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${profile.status !== "approved" ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}
          >
            <XMarkIcon className="h-5 w-5" />
            Deactivate Member
          </button>
          <button
            onClick={() => handleStatusUpdate("approved")}
            disabled={actionLoading || profile.status !== "inactive"}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${profile.status !== "inactive" ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            <CheckIcon className="h-5 w-5" />
            Reactivate Member
          </button>
        </div>

        {actionSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
            {actionSuccess}
          </div>
        )}

        {/* Profile Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-blue-950">
          {/* Contact Information */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Contact Information</h3>
            <div className="space-y-3">
              <p><strong>Full Name:</strong> {profile.full_name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Phone Number:</strong> {profile.phone_number}</p>
              <p><strong>Secondary Phone:</strong> {profile.secondary_phone || "N/A"}</p>
              <p><strong>Town of Residence:</strong> {profile.town_residence}</p>
              <p><strong>ZIP Code:</strong> {profile.zip_code}</p>
              <p><strong>Country:</strong> {profile.country}</p>
            </div>
          </section>

          {/* Personal Information */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Personal Information</h3>
            <div className="space-y-3">
              <p><strong>National ID:</strong> {profile.national_id}</p>
              <p><strong>KRA PIN:</strong> {profile.kra_pin}</p>
              <p><strong>Marital Status:</strong> {profile.marital_status}</p>
              <p><strong>Spouse's Name:</strong> {profile.spouse_name || "N/A"}</p>
              <p><strong>Religion:</strong> {profile.religion}</p>
              <p><strong>Disability:</strong> {profile.disability || "None"}</p>
            </div>
          </section>

          {/* Employment Information */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Employment Information</h3>
            <div className="space-y-3">
              <p><strong>Occupation:</strong> {profile.occupation}</p>
              <p><strong>Salary Type:</strong> {profile.salary_type}</p>
            </div>
          </section>

          {/* Uploaded Documents */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Uploaded Documents</h3>
            <div className="space-y-3">
              <p>
                <strong>ID Image:</strong>{" "}
                {profile.id_image ? (
                  <a
                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/userdata/${profile.id_image}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    View ID
                  </a>
                ) : (
                  <span className="text-gray-500">Not uploaded</span>
                )}
              </p>
              <p>
                <strong>KRA Certificate:</strong>{" "}
                {profile.kra_image ? (
                  <a
                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/userdata/${profile.kra_image}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    View KRA Certificate
                  </a>
                ) : (
                  <span className="text-gray-500">Not uploaded</span>
                )}
              </p>
              {profile.passport_image && (
                <p>
                  <strong>Passport Photo:</strong>{" "}
                  <a
                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/userdata/${profile.passport_image}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    View Photo
                  </a>
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
