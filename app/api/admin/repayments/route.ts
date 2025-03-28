import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  const { data, error } = await supabase
    .from("repayments")
    .select(`
      id,
      loan_id,
      amount_paid,
      payment_date,
      payment_method,
      penalty_applied,
      payment_status,
      loans (user_id),
      profiles (full_name)
    `)
    .order("payment_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedData = data.map((payment) => ({
    id: payment.id,
    loan_id: payment.loan_id,
    //member_name: payment.profiles.full_name,
    amount_paid: payment.amount_paid,
    payment_date: payment.payment_date,
    payment_method: payment.payment_method,
    penalty_applied: payment.penalty_applied,
    payment_status: payment.payment_status,
  }));

  return NextResponse.json(formattedData);
}
