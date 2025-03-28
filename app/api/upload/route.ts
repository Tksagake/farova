import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ error: "File missing" }, { status: 400 });

  const filename = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from("proof_of_payment")
    .upload(filename, file);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proof_of_payment/${filename}`;

  return NextResponse.json({ url });
}
