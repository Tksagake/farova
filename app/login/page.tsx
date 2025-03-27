"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-4">
      <div className="backdrop-blur-lg bg-white/10 shadow-lg rounded-lg p-6 max-w-sm w-full animate-fade-in">

        {/* Logo & Brand Name */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logoh.png" alt="Farova Logo" className="w-46 h-26" />
          
          <h3 className="text-yellow-300">Welcome Back</h3>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-yellow-400 text-sm mb-1 block">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border-none outline-none focus:ring-2 focus:ring-yellow-500 bg-white/20 text-white placeholder-gray-300"
            />
          </div>

          <div>
            <label className="text-yellow-400 text-sm mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border-none outline-none focus:ring-2 focus:ring-yellow-500 bg-white/20 text-white placeholder-gray-300"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-yellow-500 text-gray-900 py-3 rounded-lg font-bold text-lg transition-transform hover:scale-105 active:scale-95"
          >
            Login
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-4 text-center text-yellow-300">
          Don't have an account?{" "}
          <a href="/register" className="underline hover:text-yellow-400">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
