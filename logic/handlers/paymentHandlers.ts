
import { AppState, Payment, Invoice, InvoiceStatus, ContractStatus, NotificationPriority, DocumentType } from '../../types';
import { syncRow, SyncOptions } from '../../services/googleSheetsService';
import { generateInvoicePaidEmailHTML } from '../../services/invoiceEmailService';
import { generateInvoiceHTML } from '../../services/invoicePdfService';
import { normalizeID, getAgentEmail, SENDER_NAME, SUPPORT_EMAIL, MASTER_BCC } from '../handlerUtils';

export const createPaymentHandlers = (appState: AppState, loadData: any, setSyncing: any, url: string) => {
  return async (payment: Payment, email?: boolean) => {
    try { 
      setSyncing(true); 
      const client = appState.clients.find(c => normalizeID(c.ClientID) === normalizeID(payment.ClientID)); 
      const agentEmail = getAgentEmail(appState.agents, payment.AgentID || client?.AssignedAgentID);
      
      // AUTO-REFERENCE LOGIC: If reference is empty, generate one
      if (!payment.Reference || payment.Reference.trim() === '') {
        const timestamp = Date.now().toString().slice(-6);
        payment.Reference = `AUTO-REF-${payment.PaymentID.split('-')[1] || timestamp}`;
      }

      // 1. CALCULATE BILLING CYCLE NEXT DUE DATE
      const months = Number(payment.MonthsCovered) || 1;
      const payDate = new Date(payment.Date);
      const isValidPayDate = !isNaN(payDate.getTime());
      
      let rollingDueDate = payment.NextDueDate;
      
      if (!rollingDueDate && isValidPayDate) {
        const d = new Date(payDate);
        d.setMonth(d.getMonth() + months);
        rollingDueDate = d.toISOString().split('T')[0];
      }

      let linkedInvoice = appState.invoices.find(i => normalizeID(i.InvoiceID) === normalizeID(payment.InvoiceID));

      // 2. LEDGER SYNC (INVOICES)
      if (!linkedInvoice) {
        const unitCount = payment.NoOfUnits || 1;
        
        // Find active contract to pull ServiceType
        const activeContract = appState.contracts.find(c => 
          normalizeID(c.ClientID) === normalizeID(payment.ClientID) && 
          c.ContractStatus === 'Active'
        );

        const autoDescription = `Fleet Management Service (${unitCount} Units) for ${months} Month(s) - ${payment.ClientName}`;

        const newInvoice: Invoice = {
          InvoiceID: `INV-AUTO-${payment.PaymentID}`,
          InvoiceDate: payment.Date,
          DueDate: rollingDueDate || payment.Date, 
          ClientID: payment.ClientID,
          ClientName: payment.ClientName,
          ContractID: payment.ContractID || 'ADHOC',
          ServiceType: activeContract?.ServiceType || 'Unified Managed Fleet',
          Description: payment.Remarks || autoDescription,
          PeriodMonths: months,
          UnitPrice: payment.Amount / (months * unitCount),
          NoOfUnits: unitCount,
          TotalAmount: Number(payment.Amount),
          AmountPaid: Number(payment.Amount),
          BalanceDue: 0,
          Status: InvoiceStatus.Paid,
          DocType: DocumentType.Invoice
        };
        
        await syncRow(url, 'Invoices', 'create', newInvoice, 'InvoiceID');
        linkedInvoice = newInvoice;
        payment.InvoiceID = newInvoice.InvoiceID;
      } else {
        const newPaid = Number(linkedInvoice.AmountPaid) + Number(payment.Amount);
        const newBalance = Math.max(0, Number(linkedInvoice.TotalAmount) - newPaid);
        linkedInvoice = { 
          ...linkedInvoice, 
          AmountPaid: newPaid, 
          BalanceDue: newBalance, 
          Status: newBalance <= 0 ? InvoiceStatus.Paid : InvoiceStatus.Partial,
          DueDate: rollingDueDate || linkedInvoice.DueDate 
        };
        await syncRow(url, 'Invoices', 'update', linkedInvoice, 'InvoiceID');
      }

      // 3. MULTI-RECIPIENT EMAIL DISPATCH
      let options: SyncOptions = { 
        recipientEmail: client?.Email, 
        emailCc: `${agentEmail},${MASTER_BCC},${appState.systemSettings?.Email || SUPPORT_EMAIL}` 
      };

      if (email && client?.Email && linkedInvoice) {
          options.sendEmail = true;
          options.senderName = appState.systemSettings?.CompanyName || SENDER_NAME;
          options.senderEmail = appState.systemSettings?.Email || SUPPORT_EMAIL;
          options.emailSubject = `Official Receipt: ${payment.Reference || payment.PaymentID}`;
          options.emailHtml = generateInvoicePaidEmailHTML(linkedInvoice, client, appState.systemSettings);
          options.pdfAttachmentHtml = generateInvoiceHTML(linkedInvoice, client, appState.systemSettings);
          options.pdfFileName = `Receipt_${payment.PaymentID}.pdf`;
      }

      // 4. SYSTEM NOTIFICATION
      await syncRow(url, 'Notifications', 'create', { 
        ID: `PAY-LOG-${payment.PaymentID}`, 
        Time: new Date().toISOString(), 
        Type: 'PAYMENT_RECEIVED', 
        Priority: NotificationPriority.Normal, 
        ClientID: payment.ClientID, 
        ClientName: payment.ClientName, 
        Message: `Payment Processed: K${payment.Amount.toLocaleString()} from ${payment.ClientName}. Next billing cycle due: ${rollingDueDate}.`, 
        Status: 'Unread', AssignedTo: 'ADMIN', Sent: true 
      }, 'ID');

      // 5. FINAL TRANSACTION COMMIT
      await syncRow(url, 'Payments', 'create', { ...payment, NextDueDate: rollingDueDate, Email: client?.Email || '' }, 'PaymentID', options); 
      await loadData(false, true); 
    } catch (e) { 
      console.error("Payment Sync Error:", e); 
    } finally { 
      setSyncing(false); 
    }
  };
};
