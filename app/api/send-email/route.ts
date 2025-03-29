import { NextRequest, NextResponse } from "next/server";
import { sendLoanApplicationEmail, sendCustomEmail, sendLoanApprovalEmail, sendDisbursementEmail, sendPaymentReceivedEmail } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email, type, loanId, approved, amount, subject, message } = await req.json();

    switch (type) {
      case "loan-application":
        await sendLoanApplicationEmail(email, loanId);
        break;
      case "loan-approval":
        await sendLoanApprovalEmail(email, approved);
        break;
      case "disbursement":
        await sendDisbursementEmail(email, amount);
        break;
      case "payment-received":
        await sendPaymentReceivedEmail(email, amount);
        break;
      case "custom":
        await sendCustomEmail(email, subject, message);
        break;
      default:
        throw new Error("Invalid email type");
    }

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
