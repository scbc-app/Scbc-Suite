
import { AppState, Contract } from '../../types';
import { generateContractReviewEmailHTML } from '../../services/contractEmailService';
import { generateContractHTML } from '../../services/contractPdfService';
import { syncRow, SyncOptions } from '../../services/googleSheetsService';
import { normalizeID, getAgentEmail, SENDER_NAME, SUPPORT_EMAIL, MASTER_BCC } from '../handlerUtils';

export const createContractHandlers = (appState: AppState, loadData: any, setSyncing: any, url: string) => {
  return async (contract: Contract, email?: boolean) => {
    try { 
      setSyncing(true); 
      const isNew = !appState.contracts.some(c => normalizeID(c.ContractID) === normalizeID(contract.ContractID));
      const client = appState.clients.find(c => normalizeID(c.ClientID) === normalizeID(contract.ClientID)); 
      const agentEmail = getAgentEmail(appState.agents, contract.AssignedAgentID || client?.AssignedAgentID);
      
      let options: SyncOptions = { recipientEmail: client?.Email, senderName: appState.systemSettings?.CompanyName || SENDER_NAME, senderEmail: appState.systemSettings?.Email || SUPPORT_EMAIL, emailCc: `${agentEmail},${MASTER_BCC}` };

      if (email && client?.Email) {
        options.sendEmail = true;
        options.pdfAttachmentHtml = generateContractHTML(contract, client, appState.vehicles, appState.systemSettings, appState.agents);
        options.pdfFileName = `Agreement_${contract.ContractID}.pdf`;
        options.emailSubject = `Service Agreement: ${contract.ContractID}`;
        options.emailHtml = generateContractReviewEmailHTML(contract, client, appState.systemSettings);
      }
      await syncRow(url, 'Contracts', isNew ? 'create' : 'update', contract, 'ContractID', options); 
      await loadData(false, true); 
    } catch (e) { console.error("Contract Sync Error:", e); } finally { setSyncing(false); }
  };
};
