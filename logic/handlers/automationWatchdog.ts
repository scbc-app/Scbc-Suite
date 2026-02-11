
import { AppState, DocumentType, InvoiceStatus, ContractStatus, NotificationPriority } from '../../types';
import { generateInvoiceReminderEmailHTML } from '../../services/invoiceEmailService';
import { generateExpirationEmailHTML } from '../../services/expirationEmailService';
import { syncRow, SyncOptions } from '../../services/googleSheetsService';
import { normalizeID, getAgentEmail, SENDER_NAME, SUPPORT_EMAIL, MASTER_BCC } from '../handlerUtils';

export const createAutomationWatchdog = (appState: AppState, loadData: any, url: string) => {
  return async () => {
    const today = new Date();
    const settings = appState.systemSettings;

    // 1. INVOICE DUE DATE WATCHDOG
    for (const inv of appState.invoices) {
      if (inv.DocType !== DocumentType.Invoice || inv.Status === InvoiceStatus.Paid) continue;
      const dueDate = new Date(inv.DueDate);
      if (isNaN(dueDate.getTime())) continue;

      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const client = appState.clients.find(c => normalizeID(c.ClientID) === normalizeID(inv.ClientID));
      const agentEmail = getAgentEmail(appState.agents, client?.AssignedAgentID);

      if (diffDays < 0) {
        const triggerID = `OVERDUE-${inv.InvoiceID}`;
        if (!appState.notifications.some(n => n.ID === triggerID)) {
          const opt: SyncOptions = { 
            sendEmail: true, 
            recipientEmail: client?.Email, 
            emailCc: `${agentEmail},${MASTER_BCC}`, 
            emailSubject: `URGENT: Invoice #${inv.InvoiceID} is OVERDUE`, 
            emailHtml: generateInvoiceReminderEmailHTML(inv, client!, true, settings) 
          };
          await syncRow(url, 'Notifications', 'create', { ID: triggerID, Time: today.toISOString(), Type: 'OVERDUE_ALERT', Priority: NotificationPriority.Critical, ClientID: inv.ClientID, ClientName: inv.ClientName, Message: `URGENT: Invoice #${inv.InvoiceID} is OVERDUE.`, DueDate: inv.DueDate, Status: 'Unread', AssignedTo: 'GLOBAL', Sent: true }, 'ID', opt);
        }
      }
    }

    // 2. CONTRACT VALIDITY WATCHDOG
    for (const contract of appState.contracts) {
      if (contract.ContractStatus !== ContractStatus.Active) continue;
      const expiryDate = new Date(contract.ExpiryDate);
      if (isNaN(expiryDate.getTime())) continue;

      const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const client = appState.clients.find(c => normalizeID(c.ClientID) === normalizeID(contract.ClientID));

      if (diffDays <= 0) {
        // TRIGGER EXPIRATION
        const triggerID = `EXP-MAIL-${contract.ContractID}-${contract.ExpiryDate}`;
        let opt: SyncOptions = {};
        
        if (client?.Email && !appState.notifications.some(n => n.ID === triggerID)) {
           opt = {
             sendEmail: true,
             recipientEmail: client.Email,
             emailCc: MASTER_BCC,
             emailSubject: `Service Agreement Expired: ${contract.ContractID}`,
             emailHtml: generateExpirationEmailHTML(contract, client, settings)
           };
        }

        await syncRow(url, 'Contracts', 'update', { ...contract, ContractStatus: ContractStatus.Expired }, 'ContractID', opt);
        
        if (opt.sendEmail) {
           await syncRow(url, 'Notifications', 'create', { ID: triggerID, Time: today.toISOString(), Type: 'CONTRACT_EXPIRED', Priority: NotificationPriority.High, ClientID: contract.ClientID, ClientName: contract.ClientName, Message: `Expiration notice sent to ${contract.ClientName}.`, DueDate: contract.ExpiryDate, Status: 'Read', AssignedTo: 'SYSTEM', Sent: true }, 'ID');
        }
      }
    }
  };
};
