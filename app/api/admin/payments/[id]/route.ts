import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { action } = await req.json();

  if (action === "approve") {
    await supabase.from("repayments").update({ status: "approved" }).eq("id", id);
  } else if (action === "reject") {
    await supabase.from("repayments").delete().eq("id", id);
  }

  return NextResponse.json({ success: true });
}
