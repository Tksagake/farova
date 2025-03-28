"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "member",
          full_name: name,
          email: email  // Explicitly include in metadata
        }
      }
    });
  
    if (authError) return setError(authError.message);
  
    // 2. Then directly create the profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user?.id,
        user_id: authData.user?.id,
        email: email,
        full_name: name,
        status: 'pending'
      });
  
    if (profileError) return setError(profileError.message);
  
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-950 to-[#16213e] p-4">
      <div className="backdrop-blur-lg bg-white/10 shadow-lg rounded-lg p-6 max-w-sm w-full animate-fade-in">

        {/* Logo & Welcome */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logoh.png" alt="Farova Logo" className="w-46 h-26" />
          <h3 className="text-yellow-400">Join Farova Today</h3>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-yellow-400 text-sm mb-1 block">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg border-none outline-none focus:ring-2 focus:ring-yellow-400 bg-white/20 text-white placeholder-gray-300"
            />
            <label className="text-yellow-400 text-sm mb-1 block">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border-none outline-none focus:ring-2 focus:ring-yellow-400 bg-white/20 text-white placeholder-gray-300"
            />
          </div>

          <div>
            <label className="text-yellow-400 text-sm mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border-none outline-none focus:ring-2 focus:ring-yellow-400 bg-white/20 text-white placeholder-gray-300"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-yellow-400 text-blue-950 py-3 rounded-lg font-bold text-lg transition-transform hover:scale-105 active:scale-95"
          >
            Register
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-4 text-center text-yellow-400">
          Already have an account?{" "}
          <a href="/login" className="underline hover:text-yellow-300">
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
}
