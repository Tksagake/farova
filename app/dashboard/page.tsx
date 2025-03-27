"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data) setUser(data.user);
    };
    fetchUser();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
      <p>Your loan status will appear here.</p>
    </div>
  );
}
