"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { UserPlusIcon } from "lucide-react";
import { DocumentPlusIcon, EnvelopeOpenIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import Navbar from "../components/AdminNavBar";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login");
        return;
      }

      setUser(data.user);
      setLoading(false);

      // Redirect members away
      if (data.user.user_metadata.role !== "admin") {
        router.push("/members");
      }
    };

    getUser();
  }, [router]);

  const quickActions = [
    {
      name: 'New Payment',
      description: 'Generate a new receipt for a student',
      href: '/admin/payments/new',
      icon: BanknotesIcon,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      name: 'Send Communication',
      description: 'Send emails or notifications',
      href: '/admin/communications/new',
      icon: EnvelopeOpenIcon,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      name: 'Members',
      description: 'Approve new registrarion',
      href: '/admin/members/new',
      icon: UserPlusIcon,
      color: 'bg-blue-100 text-blue-700',
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
      {/* Navbar fixed on the left */}
      <div className="fixed left-0 top-0 h-full w-64">
        <Navbar />
      </div>
      
      {/* Main content area with left margin */}
      <div className="ml-64 flex-1 p-8 bg-white">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4 text-blue-950">Admin Dashboard</h1>
          
      
          {/* Quick Actions Grid */}
          <div className="mt-8 w-full">
            <h2 className="text-xl font-semibold mb-6 text-blue-950">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action) => (
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