
import { AppState, Client, LoginRecord, AppNotification, NotificationPriority, ClientStatus } from '../../types';
import { generateOnboardingEmailHTML, generateClientUpdateEmailHTML, generateAgentReassignEmailHTML } from '../../services/onboardingEmailService';
import { generateAgentAssignmentEmailHTML } from '../../services/agentNotificationService';
import { syncRow, SyncOptions } from '../../services/googleSheetsService';
import { normalizeID, getAgentEmail, SENDER_NAME, SUPPORT_EMAIL, MASTER_BCC } from '../handlerUtils';

export const createClientHandlers = (appState: AppState, loadData: any, setSyncing: any, url: string) => {
  return async (client: Client, email?: boolean) => {
    try { 
      setSyncing(true); 
      const existing = appState.clients.find(c => normalizeID(c.ClientID) === normalizeID(client.ClientID));
      const isNew = !existing; 
      const isReassigned = existing && normalizeID(existing.AssignedAgentID) !== normalizeID(client.AssignedAgentID);
      const effectiveEmailTrigger = email || isReassigned;

      const agentObj = appState.agents.find(a => normalizeID(a.AgentID) === normalizeID(client.AssignedAgentID));
      const agentEmail = getAgentEmail(appState.agents, client.AssignedAgentID);

      let clientOptions: SyncOptions = { recipientEmail: client.Email, emailCc: MASTER_BCC };
      if (effectiveEmailTrigger && client.Email) {
        clientOptions.sendEmail = true;
        clientOptions.senderName = appState.systemSettings?.CompanyName || SENDER_NAME;
        clientOptions.senderEmail = appState.systemSettings?.Email || SUPPORT_EMAIL;
        clientOptions.emailSubject = isNew ? `Welcome to ${appState.systemSettings?.CompanyName || 'Our Platform'}` : isReassigned ? `Account Manager Update: ${agentObj?.AgentName || 'New Assignment'}` : `Profile Updated`;
        clientOptions.emailHtml = isNew ? generateOnboardingEmailHTML(client, agentObj, appState.systemSettings) : isReassigned && agentObj ? generateAgentReassignEmailHTML(client, agentObj, appState.systemSettings) : generateClientUpdateEmailHTML(client, appState.systemSettings);
      }
      
      await syncRow(url, 'Clients', isNew ? 'create' : 'update', client, 'ClientID', clientOptions); 

      if (client.PortalEnabled && client.Email) {
        const loginData: Partial<LoginRecord> = {
          Email: client.Email.trim(),
          Password: client.TempPassword || (existing?.TempPassword) || 'Client123',
          AgentID: client.ClientID,
          Role: 'client',
          Status: client.Status === ClientStatus.Active ? 'Active' : 'Inactive',
          LoginAttempts: 0,
          LastLogin: new Date().toISOString()
        };
        await syncRow(url, 'Logins', appState.loginRecords.some(l => normalizeID(l.Email) === normalizeID(client.Email)) ? 'update' : 'create', loginData, 'Email');
      }

      if (effectiveEmailTrigger && (isNew || isReassigned) && agentObj) {
        const agentNotifOptions: SyncOptions = { sendEmail: true, recipientEmail: agentEmail, emailSubject: isReassigned ? `URGENT: Client Reassigned to You - ${client.CompanyName}` : `New Client Assignment: ${client.CompanyName}`, emailHtml: generateAgentAssignmentEmailHTML(client, agentObj, appState.systemSettings) };
        const notification: AppNotification = {
          ID: `ASSIGN-${client.ClientID}-${Date.now()}`, Time: new Date().toISOString(), Type: 'ASSIGNMENT', Priority: NotificationPriority.Normal, ClientID: client.ClientID, ClientName: client.CompanyName, ContractID: '', Message: isReassigned ? `Reassignment: You have taken over management for ${client.CompanyName}.` : `New assignment: ${client.CompanyName} (${client.ClientType})`, DueDate: new Date().toISOString(), Status: 'Unread', AssignedTo: client.AssignedAgentID, Sent: true
        };
        await syncRow(url, 'Notifications', 'create', notification, 'ID', agentNotifOptions);
      }
      await loadData(false, true); 
    } catch (e) { console.error("Client Sync Error:", e); throw e; } finally { setSyncing(false); }
  };
};
