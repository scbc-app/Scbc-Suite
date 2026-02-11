
import { AppState, Agent, LoginRecord, AppNotification, NotificationPriority } from '../types';
import { generateAgentInvitationEmailHTML } from '../services/agentNotificationService';
import { syncRow, SyncOptions } from '../services/googleSheetsService';
import { DEFAULT_SCRIPT_URL } from '../constants';
import { normalizeID } from './handlerUtils';

export const createStaffHandlers = (
  appState: AppState,
  loadData: (initial?: boolean, force?: boolean) => Promise<void>,
  setSyncing: (val: boolean) => void
) => {
  const url = localStorage.getItem('omni_script_url') || DEFAULT_SCRIPT_URL;

  const handleApplyForPartnership = async (agentId: string, agentName: string, pitch: string) => {
    try {
      setSyncing(true);
      const notification: AppNotification = {
        ID: `PARTNER-APP-${agentId}`, Time: new Date().toISOString(), Type: 'PARTNERSHIP_APPLICATION',
        Priority: NotificationPriority.Critical, ClientID: 'SYSTEM', ClientName: agentName, ContractID: '',
        Message: `SHAREHOLDER CANDIDACY: ${agentName} has applied for Partnership status. Pitch: ${pitch.substring(0, 50)}...`,
        DueDate: new Date(new Date().getTime() + (48 * 60 * 60 * 1000)).toISOString(), Status: 'Unread', AssignedTo: 'ADMIN', Sent: true, Notes: pitch
      };
      await syncRow(url, 'Notifications', 'create', notification, 'ID');
      await loadData(false, true);
    } catch (e) { console.error("Partnership Application Error:", e); } finally { setSyncing(false); }
  };

  const handleClaimPayout = async (agentId: string, agentName: string, amount: number, momoNumber: string) => {
    try {
      setSyncing(true);
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      const notification: AppNotification = {
        ID: `CLAIM-${agentId}-${month}-${year}`, Time: new Date().toISOString(), Type: 'PAYOUT_REQUEST',
        Priority: NotificationPriority.High, ClientID: 'SYSTEM', ClientName: agentName, ContractID: '',
        Message: `PAYOUT REQUEST: K${amount.toFixed(2)} to MoMo ${momoNumber} (Agt: ${agentName})`,
        DueDate: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)).toISOString(), Status: 'Unread', AssignedTo: 'ADMIN', Sent: true
      };
      await syncRow(url, 'Notifications', 'create', notification, 'ID');
      await loadData(false, true);
    } catch (e) { console.error("Payout Request Error:", e); } finally { setSyncing(false); }
  };

  const handleSaveAgent = async (agent: Agent, email?: boolean) => {
    try { 
      setSyncing(true); 
      if (!agent.AgentID) throw new Error("Unique AgentID is missing.");

      const normalizedAgentID = normalizeID(agent.AgentID);
      const existing = appState.agents.find(a => normalizeID(a.AgentID) === normalizedAgentID);
      const isNew = !existing;
      
      let options: SyncOptions = {};
      if (email && agent.Email) {
        options.sendEmail = true; options.recipientEmail = agent.Email;
        options.emailSubject = `Access Invitation: ${appState.systemSettings?.CompanyName || 'Sally Chanza Terminal'}`;
        options.emailHtml = generateAgentInvitationEmailHTML(agent, appState.systemSettings);
      }
      
      // Update the main Agents registry
      await syncRow(url, 'Agents', isNew ? 'create' : 'update', agent, 'AgentID', options); 
      
      // CRITICAL SECURITY FIX: Ensure the Logins table is synchronized with a valid LastLogin
      if (agent.Email) {
        const normalizedEmail = agent.Email.trim().toLowerCase();
        
        const loginData: Partial<LoginRecord> = {
          Email: agent.Email.trim(), 
          Password: agent.Password || (existing?.Password) || 'Sally123', 
          AgentID: agent.AgentID,
          Role: agent.Role.toLowerCase(), 
          Status: agent.Status as any, 
          LoginAttempts: 0, 
          LastLogin: new Date().toISOString() // This breaks the setup loop
        };

        const existingLogin = appState.loginRecords.find(l => l.Email.trim().toLowerCase() === normalizedEmail);
        await syncRow(url, 'Logins', existingLogin ? 'update' : 'create', loginData, 'Email');
      }

      await loadData(false, true); 
    } catch (e) { 
      console.error("Save Agent Sync Error:", e); 
      throw e; 
    } finally { 
      setSyncing(false); 
    }
  };

  return { handleApplyForPartnership, handleClaimPayout, handleSaveAgent };
};
