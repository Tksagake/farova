"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function CompleteProfile() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    secondary_phone: "",
    email: "",
    national_id: "",
    kra_pin: "",
    town_residence: "",
    zip_code: "",
    country: "",
    marital_status: "",
    spouse_name: "",
    religion: "",
    disability: "",
    occupation: "",
    salary_type: "",
  });
  const [passportImage, setPassportImage] = useState<File | null>(null);
  const [idImage, setIdImage] = useState<File | null>(null);
  const [kraImage, setKraImage] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: any) => {
    if (e.target.files?.[0]) setter(e.target.files[0]);
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("profile_uploads")
      .upload(path, file);
    if (error) throw new Error(error.message);
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Upload files
      const passportImagePath = passportImage ? await uploadFile(passportImage, `passport/${user.data.user?.id}`) : null;
      const idImagePath = idImage ? await uploadFile(idImage, `id/${user.data.user?.id}`) : null;
      const kraImagePath = kraImage ? await uploadFile(kraImage, `kra/${user.data.user?.id}`) : null;

      // Insert into profiles table
      const { error } = await supabase
        .from("profiles")
        .insert({
          user_id: user.data.user?.id,
          ...form,
          passport_image: passportImagePath,
          id_image: idImagePath,
          kra_image: kraImagePath,
          status: "pending",
        });

      if (error) throw new Error(error.message);
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
         {/* Navbar fixed on the left */}
              <div className="fixed left-0 top-0 h-full w-64">
                <Navbar />
              </div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Complete Your Profile</h2>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(form).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700">
              {field.replace("_", " ").toUpperCase()}
            </label>
            <input
              type="text"
              name={field}
              value={form[field as keyof typeof form]}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        ))}

        {/* File Uploads */}
        <div>
          <label>Passport Image</label>
          <input type="file" onChange={(e) => handleFileChange(e, setPassportImage)} />
        </div>

        <div>
          <label>ID Image</label>
          <input type="file" onChange={(e) => handleFileChange(e, setIdImage)} />
        </div>

        <div>
          <label>KRA Certificate</label>
          <input type="file" onChange={(e) => handleFileChange(e, setKraImage)} />
        </div>

        <button
          type="submit"
          className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
        >
          Submit Profile
        </button>
      </form>
    </div>
  );
}
