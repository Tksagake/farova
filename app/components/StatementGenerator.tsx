import { jsPDF } from "jspdf";
import { Excel } from "exceljs";

interface Loan {
  id: string;
  amount_requested: number;
  purpose: string;
  repayment_period: number;
  total_due: number;
  amount_paid: number;
  balance_due: number;
}

interface StatementProps {
  loans: Loan[];
  memberName: string;
}

export const StatementGenerator = ({ loans, memberName }: StatementProps) => {
  const generatePDFStatement = () => {
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
      title: `Loan Statement - ${memberName}`,
      subject: `Loan Statement for ${memberName}`,
      author: 'Farova Welfare',
      keywords: 'statement, loan',
      creator: 'YourApp'
    });

    // Add content to the PDF
    doc.setFontSize(20);
    doc.text('Loan Statement', 20, 30);

    doc.setFontSize(12);
    doc.text(`Member Name: ${memberName}`, 20, 40);

    let yOffset = 50;
    loans.forEach((loan, index) => {
      doc.text(`Loan ${index + 1}:`, 20, yOffset);
      doc.text(`Purpose: ${loan.purpose}`, 20, yOffset + 10);
      doc.text(`Amount Requested: KES ${loan.amount_requested.toFixed(2)}`, 20, yOffset + 20);
      doc.text(`Total Due: KES ${loan.total_due.toFixed(2)}`, 20, yOffset + 30);
      doc.text(`Amount Paid: KES ${loan.amount_paid.toFixed(2)}`, 20, yOffset + 40);
      doc.text(`Balance Due: KES ${loan.balance_due.toFixed(2)}`, 20, yOffset + 50);
      yOffset += 60;
    });

    // Save the PDF
    doc.save(`statement_${memberName}.pdf`);
  };

  const generateExcelStatement = () => {
    const workbook = new Excel.Workbook();
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

    // Add data
    loans.forEach(loan => {
      worksheet.addRow({
        id: loan.id,
        purpose: loan.purpose,
        amount_requested: loan.amount_requested.toFixed(2),
        total_due: loan.total_due.toFixed(2),
        amount_paid: loan.amount_paid.toFixed(2),
        balance_due: loan.balance_due.toFixed(2),
      });
    });

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
