import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import XLSX from 'xlsx';

/* =========================
   EXPORT MEMBER LEDGER TO PDF
========================= */
export const exportMemberLedgerToPDF = async (memberData, transactions) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Member Ledger Report', 20, 20);
    
    // Member Info
    doc.setFontSize(12);
    doc.text(`Member: ${memberData.name}`, 20, 40);
    doc.text(`Email: ${memberData.email}`, 20, 50);
    doc.text(`Phone: ${memberData.phone}`, 20, 60);
    doc.text(`Community: ${memberData.communityId?.name || 'N/A'}`, 20, 70);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 80);
    
    // Transactions Table
    const tableData = transactions.map(transaction => [
      new Date(transaction.createdAt).toLocaleDateString(),
      transaction.type,
      transaction.category,
      transaction.description,
      `₹${transaction.amount}`,
      `₹${transaction.balance}`
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Type', 'Category', 'Description', 'Amount', 'Balance']],
      body: tableData,
      startY: 90,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    return doc.output('arraybuffer');
  } catch (error) {
    console.error('Export member ledger to PDF error:', error);
    throw error;
  }
};

/* =========================
   EXPORT MEMBER LEDGER TO EXCEL
========================= */
export const exportMemberLedgerToExcel = async (memberData, transactions) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Member Info Sheet
    const memberInfo = [
      ['Member Information', ''],
      ['Name', memberData.name],
      ['Email', memberData.email],
      ['Phone', memberData.phone],
      ['Community', memberData.communityId?.name || 'N/A'],
      ['Report Date', new Date().toLocaleDateString()],
      ['', ''],
      ['Transaction Summary', ''],
      ['Total Transactions', transactions.length],
      ['Total Credits', transactions.filter(t => t.type === 'CREDIT').length],
      ['Total Debits', transactions.filter(t => t.type === 'DEBIT').length]
    ];
    
    const memberSheet = XLSX.utils.aoa_to_sheet(memberInfo);
    XLSX.utils.book_append_sheet(workbook, memberSheet, 'Member Info');
    
    // Transactions Sheet
    const transactionData = [
      ['Date', 'Type', 'Category', 'Description', 'Amount', 'Balance']
    ];
    
    transactions.forEach(transaction => {
      transactionData.push([
        new Date(transaction.createdAt).toLocaleDateString(),
        transaction.type,
        transaction.category,
        transaction.description,
        transaction.amount,
        transaction.balance
      ]);
    });
    
    const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData);
    XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transactions');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  } catch (error) {
    console.error('Export member ledger to Excel error:', error);
    throw error;
  }
};

/* =========================
   EXPORT SESSION SUMMARY TO PDF
========================= */
export const exportSessionSummaryToPDF = async (sessionData, summary) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Session Financial Summary', 20, 20);
    
    // Session Info
    doc.setFontSize(12);
    doc.text(`Session: ${sessionData.name}`, 20, 40);
    doc.text(`Community: ${sessionData.communityId?.name || 'N/A'}`, 20, 50);
    doc.text(`Start Date: ${new Date(sessionData.startDate).toLocaleDateString()}`, 20, 60);
    doc.text(`Status: ${sessionData.isActive ? 'Active' : 'Closed'}`, 20, 70);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 80);
    
    // Summary Table
    const summaryData = [
      ['Opening Balance', `₹${sessionData.openingBalance}`],
      ['Total Contributions', `₹${summary.totalContributions}`],
      ['Total Loans Disbursed', `₹${summary.totalLoansDisbursed}`],
      ['Total EMI Collected', `₹${summary.totalEMICollected}`],
      ['Total Interest Income', `₹${summary.totalInterestIncome}`],
      ['Total Late Fee Income', `₹${summary.totalLateFeeIncome}`],
      ['Current Balance', `₹${sessionData.closingBalance}`]
    ];
    
    autoTable(doc, {
      head: [['Description', 'Amount']],
      body: summaryData,
      startY: 90,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    return doc.output('arraybuffer');
  } catch (error) {
    console.error('Export session summary to PDF error:', error);
    throw error;
  }
};

/* =========================
   EXPORT SESSION SUMMARY TO EXCEL
========================= */
export const exportSessionSummaryToExcel = async (sessionData, summary, contributions, loans) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Session Summary Sheet
    const summaryInfo = [
      ['Session Financial Summary', ''],
      ['Session Name', sessionData.name],
      ['Community', sessionData.communityId?.name || 'N/A'],
      ['Start Date', new Date(sessionData.startDate).toLocaleDateString()],
      ['Status', sessionData.isActive ? 'Active' : 'Closed'],
      ['Report Date', new Date().toLocaleDateString()],
      ['', ''],
      ['Financial Summary', ''],
      ['Opening Balance', sessionData.openingBalance],
      ['Total Contributions', summary.totalContributions],
      ['Total Loans Disbursed', summary.totalLoansDisbursed],
      ['Total EMI Collected', summary.totalEMICollected],
      ['Total Interest Income', summary.totalInterestIncome],
      ['Total Late Fee Income', summary.totalLateFeeIncome],
      ['Current Balance', sessionData.closingBalance]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryInfo);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Contributions Sheet
    if (contributions && contributions.length > 0) {
      const contributionData = [
        ['Date', 'Member', 'Amount', 'Month', 'Status', 'Late Fee']
      ];
      
      contributions.forEach(contribution => {
        contributionData.push([
          new Date(contribution.createdAt).toLocaleDateString(),
          contribution.memberId?.name || 'N/A',
          contribution.amount,
          contribution.month,
          contribution.status,
          contribution.lateFee || 0
        ]);
      });
      
      const contributionSheet = XLSX.utils.aoa_to_sheet(contributionData);
      XLSX.utils.book_append_sheet(workbook, contributionSheet, 'Contributions');
    }
    
    // Loans Sheet
    if (loans && loans.length > 0) {
      const loanData = [
        ['Date', 'Member', 'Amount', 'Interest Rate', 'Duration', 'EMI', 'Status']
      ];
      
      loans.forEach(loan => {
        loanData.push([
          new Date(loan.createdAt).toLocaleDateString(),
          loan.memberId?.name || 'N/A',
          loan.principalAmount,
          `${loan.interestRate}%`,
          `${loan.duration} months`,
          loan.monthlyEMI,
          loan.status
        ]);
      });
      
      const loanSheet = XLSX.utils.aoa_to_sheet(loanData);
      XLSX.utils.book_append_sheet(workbook, loanSheet, 'Loans');
    }
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  } catch (error) {
    console.error('Export session summary to Excel error:', error);
    throw error;
  }
};

/* =========================
   EXPORT INTEREST INCOME REPORT TO PDF
========================= */
export const exportInterestIncomeReportToPDF = async (reportData) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Interest Income Report', 20, 20);
    
    // Report Info
    doc.setFontSize(12);
    doc.text(`Period: ${reportData.startDate} to ${reportData.endDate}`, 20, 40);
    doc.text(`Community: ${reportData.communityName || 'All Communities'}`, 20, 50);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 60);
    
    // Summary
    doc.text(`Total Interest Income: ₹${reportData.totalInterestIncome}`, 20, 80);
    doc.text(`Total Late Fee Income: ₹${reportData.totalLateFeeIncome}`, 20, 90);
    doc.text(`Total Income: ₹${reportData.totalInterestIncome + reportData.totalLateFeeIncome}`, 20, 100);
    
    // Monthly Breakdown Table
    if (reportData.monthlyBreakdown && reportData.monthlyBreakdown.length > 0) {
      const tableData = reportData.monthlyBreakdown.map(month => [
        month.month,
        `₹${month.interestIncome}`,
        `₹${month.lateFeeIncome}`,
        `₹${month.totalIncome}`
      ]);
      
      autoTable(doc, {
        head: [['Month', 'Interest Income', 'Late Fee Income', 'Total Income']],
        body: tableData,
        startY: 110,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] }
      });
    }
    
    return doc.output('arraybuffer');
  } catch (error) {
    console.error('Export interest income report to PDF error:', error);
    throw error;
  }
};

/* =========================
   EXPORT EXTERNAL BORROWER LEDGER TO PDF
========================= */
export const exportExternalBorrowerLedgerToPDF = async (borrowerData, loans, emis) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('External Borrower Ledger', 20, 20);
    
    // Borrower Info
    doc.setFontSize(12);
    doc.text(`Borrower: ${borrowerData.name}`, 20, 40);
    doc.text(`Email: ${borrowerData.email}`, 20, 50);
    doc.text(`Phone: ${borrowerData.phone}`, 20, 60);
    doc.text(`Credit Score: ${borrowerData.creditScore}`, 20, 70);
    doc.text(`Risk Category: ${borrowerData.riskCategory}`, 20, 80);
    
    // Loans Summary
    let yPosition = 100;
    if (loans && loans.length > 0) {
      doc.text('Loan Summary:', 20, yPosition);
      yPosition += 10;
      
      const loanData = loans.map(loan => [
        loan.loanNumber,
        `₹${loan.principalAmount}`,
        `${loan.interestRate}%`,
        `${loan.duration} months`,
        `₹${loan.monthlyEMI}`,
        loan.status
      ]);
      
      autoTable(doc, {
        head: [['Loan No.', 'Amount', 'Rate', 'Duration', 'EMI', 'Status']],
        body: loanData,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      
      yPosition = doc.previousAutoTable.finalY + 20;
    }
    
    // EMI History
    if (emis && emis.length > 0) {
      doc.text('EMI Payment History:', 20, yPosition);
      yPosition += 10;
      
      const emiData = emis.map(emi => [
        `EMI ${emi.emiNumber}`,
        new Date(emi.dueDate).toLocaleDateString(),
        emi.paidDate ? new Date(emi.paidDate).toLocaleDateString() : 'Pending',
        `₹${emi.totalAmount}`,
        `₹${emi.lateFee}`,
        emi.status
      ]);
      
      autoTable(doc, {
        head: [['EMI', 'Due Date', 'Paid Date', 'Amount', 'Late Fee', 'Status']],
        body: emiData,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
    }
    
    return doc.output('arraybuffer');
  } catch (error) {
    console.error('Export external borrower ledger to PDF error:', error);
    throw error;
  }
};