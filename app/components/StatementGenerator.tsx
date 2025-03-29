import { jsPDF } from "jspdf";
import { Workbook } from 'exceljs';

interface Loan {
  id: string;
  amount_requested: number;
  purpose: string;
  repayment_period: number;
  total_due: number;
  amount_paid: number;
  balance_due?: number; // Optional, will be calculated
}

interface Payment {
  loan_id: string;
  amount_paid: number | null;
  created_at: string;
}

interface StatementProps {
  loans: Loan[];
  payments: Record<string, Payment[]>;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
}

export const StatementGenerator = ({ loans, payments, memberName, memberEmail, memberPhone }: StatementProps) => {
  const calculateTotalPaid = (loanId: string): number => {
    return (payments[loanId] || []).reduce((total, payment) => total + (payment.amount_paid ?? 0), 0);
  };

  const calculateBalanceDue = (loan: Loan): number => {
    const totalPaid = calculateTotalPaid(loan.id);
    return loan.total_due - totalPaid;
  };

  const generatePDFStatement = () => {
    const doc = new jsPDF();
    let pageNumber = 1;

    const addFooter = (page: number) => {
      doc.setFontSize(10);
      doc.setTextColor(100); // Gray color
      doc.text('Farova Welfare - Here for you!', 20, doc.internal.pageSize.height - 20);
      doc.text(`Page ${page}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 20);
    };

    // Add logo with controlled dimensions
    const logoUrl = '/logo.png'; // Update with actual path
    doc.addImage(logoUrl, 'PNG', 20, 10, 75, 55); // Width: 80, Height: 60

    // Letterhead with color scheme
    doc.setFontSize(14);
    doc.setTextColor(17, 36, 68); // Navy Blue
    doc.text('Farova Welfare', 90, 30);
    doc.setTextColor(100); // Gray
    doc.setFontSize(10);
    doc.text('Address: 123 Main St, Nairobi, Kenya', 90, 38);
    doc.text('Email: info@farova.com', 90, 46);
    doc.text('Phone: +254 123 456 789', 90, 54);

    // Document title
    doc.setFontSize(20);
    doc.setTextColor(17, 36, 68); // Navy Blue
    doc.text('Loan Statement', 20, 80);

    // Member details
    doc.setFontSize(12);
    doc.setTextColor(0); // Black
    doc.text(`Member Name: ${memberName}`, 20, 90);
    doc.line(20, 115, 190, 115); // Line under member details

    let yOffset = 120;
    loans.forEach((loan, index) => {
      const totalPaid = calculateTotalPaid(loan.id);
      const balanceDue = calculateBalanceDue(loan);

      // Check if adding this loan will exceed the page height
      if (yOffset + 100 > doc.internal.pageSize.height - 40) {
        addFooter(pageNumber);
        doc.addPage();
        pageNumber += 1;
        yOffset = 20;
        addFooter(pageNumber);
      }

      // Loan table
      doc.setTextColor(17, 36, 68); // Navy Blue text
      doc.text(`Loan ${index + 1}: ${loan.purpose}`, 20, yOffset);
      yOffset += 10;

      // Table header
      doc.setTextColor(0); // Black text
      doc.setFontSize(10);
      doc.text('Description', 20, yOffset);
      doc.text('Amount (KES)', 120, yOffset);
      doc.line(20, yOffset + 2, 190, yOffset + 2); // Line under header

      yOffset += 10;
      doc.text('Opening Balance', 20, yOffset);
      doc.text((loan.amount_requested || 0).toFixed(2), 120, yOffset);
      doc.line(20, yOffset + 2, 190, yOffset + 2); // Line under opening balance

      (payments[loan.id] || []).forEach((payment, pIndex) => {
        yOffset += 10;
        doc.text(`Payment ${pIndex + 1}`, 20, yOffset);
        doc.text((payment.amount_paid || 0).toFixed(2), 120, yOffset);
        doc.line(20, yOffset + 2, 190, yOffset + 2); // Line under each payment
      });

      yOffset += 10;
      doc.setTextColor(17, 36, 68); // Navy Blue text
      doc.text('Total Paid', 20, yOffset);
      doc.text(totalPaid.toFixed(2), 120, yOffset);
      doc.line(20, yOffset + 2, 190, yOffset + 2); // Line under total paid

      yOffset += 10;
      doc.text('Balance Due', 20, yOffset);
      doc.text(balanceDue.toFixed(2), 120, yOffset);
      doc.line(20, yOffset + 2, 190, yOffset + 2); // Line under balance due

      yOffset += 20;
    });

    // Add footer to the last page
    addFooter(pageNumber);

    // Disclaimer
    doc.setFontSize(10);
    doc.setTextColor(100); // Gray
    doc.text('Disclaimer: This statement is computer-generated and does not require a signature.', 20, doc.internal.pageSize.height - 30);

    // Save the PDF
    doc.save(`statement_${memberName}.pdf`);
  };

  const generateExcelStatement = async () => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Loan Statement');

    // Add headers
    worksheet.columns = [
      { header: 'Loan ID', key: 'id', width: 10 },
      { header: 'Purpose', key: 'purpose', width: 30 },
      { header: 'Amount Requested', key: 'amount_requested', width: 20 },
      { header: 'Total Due', key: 'total_due', width: 15 },
      { header: 'Amount Paid', key: 'amount_paid', width: 15 },
      { header: 'Balance Due', key: 'balance_due', width: 15 },
    ];

    // Letterhead
    worksheet.addRow(['Farova Welfare']);
    worksheet.addRow(['Address: 123 Main St, Nairobi, Kenya']);
    worksheet.addRow(['Email: info@farova.com']);
    worksheet.addRow(['Phone: +254 123 456 789']);
    worksheet.addRow([]); // Empty row for spacing

    // Member details
    worksheet.addRow(['Member Name:', memberName]);
    worksheet.addRow(['Member Email:', memberEmail]);
    worksheet.addRow(['Member Phone:', memberPhone]);
    worksheet.addRow([]); // Empty row for spacing

    // Add data
    loans.forEach(loan => {
      const totalPaid = calculateTotalPaid(loan.id);
      const balanceDue = calculateBalanceDue(loan);
      worksheet.addRow({
        id: loan.id,
        purpose: loan.purpose,
        amount_requested: (loan.amount_requested || 0).toFixed(2),
        total_due: (loan.total_due || 0).toFixed(2),
        amount_paid: totalPaid.toFixed(2),
        balance_due: balanceDue.toFixed(2),
      });

      // Add payments as separate rows
      (payments[loan.id] || []).forEach((payment, index) => {
        worksheet.addRow({
          purpose: `Payment ${index + 1}`,
          amount_paid: (payment.amount_paid || 0).toFixed(2),
        });
      });

      worksheet.addRow([]); // Empty row for spacing between loans
    });

    // Footer and Disclaimer
    worksheet.addRow([]); // Empty row for spacing
    worksheet.addRow(['Disclaimer: This statement is computer-generated and does not require a signature.']);

    // Generate Excel file
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement_${memberName}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div>
      <button onClick={generatePDFStatement} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mr-2">
        Generate PDF Statement
      </button>
      <button onClick={generateExcelStatement} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
        Generate Excel Statement
      </button>
    </div>
  );
};
