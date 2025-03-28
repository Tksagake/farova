"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { UserIcon, BanknotesIcon, DocumentTextIcon, BellIcon } from "@heroicons/react/24/outline";
import Navbar from "../components/Navbar";

interface Profile {
  full_name: string;
}

export default function MemberDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login");
        return;
      }

      setUser(data.user);

      // Check if the name is in user_metadata
      if (data.user.user_metadata.name) {
        setUserName(data.user.user_metadata.name);
        setLoading(false);
      } else {
        // Fetch the name from the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profileData) {
          setUserName(data.user.email || null); // Ensure email is a string or null
        } else {
          setUserName(profileData.full_name);
        }
        setLoading(false);
      }

      // Redirect admins to their dashboard
      if (data.user.user_metadata.role === "admin") {
        router.push("/dashboard");
      }
    };

    getUser();
  }, [router]);

  const memberActions = [
    {
      name: "Complete Profile",
      description: "Update your personal and financial information",
      href: "/dashboard/complete-profile",
      icon: UserIcon,
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Request Loan",
      description: "Apply for a loan once your profile is approved",
      href: "/dashboard/loan-request",
      icon: BanknotesIcon,
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "My Profile",
      description: "View and edit your submitted details",
      href: `/dashboard/member/${user?.id}`,
      icon: DocumentTextIcon,
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Loan History",
      description: "Check your previous and pending loan applications",
      href: "/dashboard/loans",
      icon: DocumentTextIcon,
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Statements",
      description: "View your loan history and payments",
      href: "/dashboard/reports/statements",
      icon: BellIcon,
      color: "bg-blue-100 text-blue-700",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative h-16 w-16 mx-auto mb-4">
            <div className="absolute animate-spin rounded-full h-16 w-16 border-b-2 border-blue-950"></div>
            <div className="absolute animate-spin rounded-full h-16 w-16 border-r-2 border-yellow-400" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute animate-spin rounded-full h-16 w-16 border-t-2 border-black" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <h2 className="text-xl font-semibold text-blue-950">Loading ...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="fixed left-0 top-0 h-full w-64">
        <Navbar />
      </div>

      <div className="ml-64 flex-1 p-8 bg-white">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4 text-blue-950">Member Dashboard</h1>

          <p className="text-gray-600 mb-6">Welcome, {userName}</p>

          <div className="mt-8 w-full">
            <h2 className="text-xl font-semibold mb-6 text-blue-950">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memberActions.map((action) => (
                <div
                  key={action.name}
                  className={`${action.color} p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer`}
                  onClick={() => router.push(action.href)}
                >
                  <action.icon className="h-8 w-8 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{action.name}</h3>
                  <p className="text-sm opacity-80">{action.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
