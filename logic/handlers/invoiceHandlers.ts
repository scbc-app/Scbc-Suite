
import { AppState, Invoice } from '../../types';
import { generateInvoiceDispatchEmailHTML } from '../../services/invoiceEmailService';
import { generateInvoiceHTML } from '../../services/invoicePdfService';
import { syncRow, SyncOptions } from '../../services/googleSheetsService';
import { normalizeID, getAgentEmail, SENDER_NAME, SUPPORT_EMAIL, MASTER_BCC } from '../handlerUtils';

export const createInvoiceHandlers = (appState: AppState, loadData: any, setSyncing: any, url: string) => {
  return async (invoice: Invoice, email?: boolean) => {
    try { 
      setSyncing(true); 
      const isNew = !appState.invoices.some(i => normalizeID(i.InvoiceID) === normalizeID(invoice.InvoiceID));
      const client = appState.clients.find(c => normalizeID(c.ClientID) === normalizeID(invoice.ClientID)); 
      const agentEmail = getAgentEmail(appState.agents, client?.AssignedAgentID);
      
      let options: SyncOptions = { recipientEmail: client?.Email, senderName: appState.systemSettings?.CompanyName || SENDER_NAME, senderEmail: appState.systemSettings?.Email || SUPPORT_EMAIL, emailCc: `${agentEmail},${MASTER_BCC}` };

      if (email && client?.Email) {
        options.sendEmail = true;
        options.pdfAttachmentHtml = generateInvoiceHTML(invoice, client, appState.systemSettings);
        options.pdfFileName = `Invoice_${invoice.InvoiceID}.pdf`;
        options.emailSubject = `Invoice: ${invoice.InvoiceID}`;
        options.emailHtml = generateInvoiceDispatchEmailHTML(invoice, client, appState.systemSettings);
      }
      await syncRow(url, 'Invoices', isNew ? 'create' : 'update', { ...invoice, Email: client?.Email }, 'InvoiceID', options); 
      await loadData(false, true); 
    } catch (e) { console.error("Invoice Sync Error:", e); } finally { setSyncing(false); }
  };
};
