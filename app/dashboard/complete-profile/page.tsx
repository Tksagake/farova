"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

// Define form structure
type FormState = {
  full_name: string;
  email: string;
  phone_number: string;
  secondary_phone: string;
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
};

export default function CompleteProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    phone_number: "",
    secondary_phone: "",
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
  const [isExistingUser, setIsExistingUser] = useState(false);

  const fileInputRefs = {
    passport: useRef<HTMLInputElement>(null),
    id: useRef<HTMLInputElement>(null),
    kra: useRef<HTMLInputElement>(null),
  };

  // Fetch user data on page load
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("User not found");

        const { email, user_metadata } = user;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") throw new Error(profileError.message);

        setForm((prev) => ({
          ...prev,
          full_name: user_metadata?.full_name || "",
          email: email || "",
          ...(profile || {}),
        }));

        if (profile) setIsExistingUser(true);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: any) => {
    if (e.target.files?.[0]) setter(e.target.files[0]);
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("userdata") // Use the correct bucket name
      .upload(path, file, { upsert: true }); // Allows overwriting if a file already exists

    if (error) {
      console.error("Upload Error:", error);
      throw new Error(error.message);
    }
    return data?.path;
  };

  // Ensure all fields are filled
  const isFormComplete = () => {
    return Object.values(form).every((value) => value !== "") &&
      passportImage && idImage && kraImage;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete()) {
      setError("Please fill all fields and upload required images.");
      return;
    }

    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      const userId = user.data.user?.id;

      // Upload images with consistent paths
      const passportImagePath = passportImage
        ? await uploadFile(passportImage, `passport/${userId}/passport.jpg`)
        : null;
      const idImagePath = idImage
        ? await uploadFile(idImage, `id/${userId}/id.jpg`)
        : null;
      const kraImagePath = kraImage
        ? await uploadFile(kraImage, `kra/${userId}/kra.jpg`)
        : null;

      const payload = {
        user_id: userId,
        ...form,
        passport_image: passportImagePath,
        id_image: idImagePath,
        kra_image: kraImagePath,
        status: "pending",
      };

      // Insert or Update
      if (isExistingUser) {
        const { error } = await supabase.from("profiles").update(payload).eq("user_id", userId);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("profiles").insert(payload);
        if (error) throw new Error(error.message);
      }

      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-blue-950">Loading...</h2>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 bg-white rounded-lg shadow-md text-sm">
        <h2 className="text-2xl font-bold mb-4 text-blue-950">Complete Your Profile</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Information Section */}
          <div className="border p-3 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-blue-950">Personal Information</h3>
            {["full_name", "email", "phone_number", "secondary_phone"].map((field) => (
              <div className="text-blue-950" key={field}>
                <label className="block text-xs font-medium text-blue-950">
                  {field.replace("_", " ").toUpperCase()}
                </label>
                <input
                  type="text"
                  name={field}
                  value={form[field as keyof FormState]}
                  onChange={handleChange}
                  className="w-full max-w-md p-1 border rounded-md"
                  disabled={field === "full_name" || field === "email"} // Disable only name and email
                />
              </div>
            ))}
          </div>

          {/* Identification Section */}
          <div className="border p-3 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-blue-950">Identification</h3>
            {["national_id", "kra_pin"].map((field) => (
              <div className="text-blue-950" key={field}>
                <label className="block text-xs font-medium text-blue-950">
                  {field.replace("_", " ").toUpperCase()}
                </label>
                <input
                  type="text"
                  name={field}
                  value={form[field as keyof FormState]}
                  onChange={handleChange}
                  className="w-full max-w-md p-1 border rounded-md"
                />
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRefs[field === "national_id" ? "id" : "kra"].current?.click()}
                    className="bg-blue-950 text-white px-2 py-1 rounded-lg hover:bg-blue-900"
                  >
                    Choose File
                  </button>
                  {(field === "national_id" ? idImage : kraImage) && (
                    <span className="ml-2 text-gray-600">
                      {(field === "national_id" ? idImage : kraImage)?.name}
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRefs[field === "national_id" ? "id" : "kra"]}
                  onChange={(e) => handleFileChange(e, field === "national_id" ? setIdImage : setKraImage)}
                  className="hidden"
                />
              </div>
            ))}
            <div className="text-blue-950">
              <label className="block text-xs font-medium text-blue-950">PROFILE PICTURE</label>
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => fileInputRefs.passport.current?.click()}
                  className="bg-blue-950 text-white px-2 py-1 rounded-lg hover:bg-blue-900"
                >
                  Choose File
                </button>
                {passportImage && (
                  <span className="ml-2 text-gray-600">
                    {passportImage.name}
                  </span>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRefs.passport}
                onChange={(e) => handleFileChange(e, setPassportImage)}
                className="hidden"
              />
            </div>
          </div>

          {/* Residential Information Section */}
          <div className="border p-3 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-blue-950">Residential Information</h3>
            {["town_residence", "zip_code", "country"].map((field) => (
              <div className="text-blue-950" key={field}>
                <label className="block text-xs font-medium text-blue-950">
                  {field.replace("_", " ").toUpperCase()}
                </label>
                <input
                  type="text"
                  name={field}
                  value={form[field as keyof FormState]}
                  onChange={handleChange}
                  className="w-full max-w-md p-1 border rounded-md"
                />
              </div>
            ))}
          </div>

          {/* Additional Information Section */}
          <div className="border p-3 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-blue-950">Additional Information</h3>
            <div className="text-blue-950">
              <label className="block text-xs font-medium text-blue-950">MARITAL STATUS</label>
              <select
                name="marital_status"
                value={form.marital_status}
                onChange={handleChange}
                className="w-full max-w-md p-1 border rounded-md"
              >
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            {form.marital_status !== "single" && form.marital_status !== "divorced" && (
              <div className="text-blue-950">
                <label className="block text-xs font-medium text-blue-950">SPOUSE'S NAME</label>
                <input
                  type="text"
                  name="spouse_name"
                  value={form.spouse_name}
                  onChange={handleChange}
                  className="w-full max-w-md p-1 border rounded-md"
                />
              </div>
            )}
            {["religion", "disability", "occupation", "salary_type"].map((field) => (
              <div className="text-blue-950" key={field}>
                <label className="block text-xs font-medium text-blue-950">
                  {field.replace("_", " ").toUpperCase()}
                </label>
                <input
                  type="text"
                  name={field}
                  value={form[field as keyof FormState]}
                  onChange={handleChange}
                  className="w-full max-w-md p-1 border rounded-md"
                />
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-900"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
