
import { AppState, Ticket, TicketStatus, MaintenanceRecord, MaintenanceStatus, SimTopup } from '../types';
import { generateTicketNewEmailHTML, generateTicketUpdateEmailHTML, generateTicketResolvedEmailHTML } from '../services/ticketEmailService';
import { generateMaintenanceCompletionEmailHTML, generateSimRenewalEmailHTML, generateBulkSimRenewalEmailHTML } from '../services/maintenanceEmailService';
import { syncRow, SyncOptions } from '../services/googleSheetsService';
import { DEFAULT_SCRIPT_URL } from '../constants';
import { normalizeID, getAgentEmail, SENDER_NAME, SUPPORT_EMAIL, MASTER_BCC } from './handlerUtils';

export const createSupportHandlers = (
  appState: AppState,
  loadData: (initial?: boolean, force?: boolean) => Promise<void>,
  setSyncing: (val: boolean) => void
) => {
  const url = localStorage.getItem('omni_script_url') || DEFAULT_SCRIPT_URL;

  const handleSaveTicket = async (ticket: Ticket) => {
    const settings = appState.systemSettings;
    const now = new Date().toISOString();
    try {
      setSyncing(true);
      const existingTicket = appState.tickets.find(t => normalizeID(t.TicketID) === normalizeID(ticket.TicketID));
      const isNew = !existingTicket;
      const client = appState.clients.find(c => normalizeID(c.ClientID) === normalizeID(ticket.ClientID));
      const ticketToSync = { ...ticket, Email: client?.Email || ticket.Email, UpdatedAt: now, CreatedAt: isNew ? now : (existingTicket.CreatedAt || now) };
      
      let options: SyncOptions = { 
        senderName: settings?.CompanyName || SENDER_NAME, 
        senderEmail: settings?.Email || SUPPORT_EMAIL, 
        replyTo: settings?.Email || SUPPORT_EMAIL 
      };

      const destinationEmail = String(client?.Email || ticket.Email || '').trim();
      if (destinationEmail.includes('@')) {
          options.recipientEmail = destinationEmail;
          const agentEmail = getAgentEmail(appState.agents, ticket.AssignedAgentID || client?.AssignedAgentID);
          options.emailCc = `${settings?.Email || SUPPORT_EMAIL},${MASTER_BCC},${agentEmail}`;
          
          if (isNew) {
              if (settings?.EmailTicketNewEnabled !== false) { 
                options.sendEmail = true; 
                options.emailSubject = `Support Acknowledgment: Ticket #${ticket.TicketID}`; 
                options.emailHtml = generateTicketNewEmailHTML(ticketToSync, client!, settings); 
              }
          } else {
              if (ticket.Status === TicketStatus.Resolved && existingTicket.Status !== TicketStatus.Resolved) {
                  if (settings?.EmailTicketResolvedEnabled !== false) { 
                    options.sendEmail = true; 
                    options.emailSubject = `Resolution Confirmation: Ticket #${ticket.TicketID}`; 
                    options.emailHtml = generateTicketResolvedEmailHTML(ticketToSync, client!, settings); 
                  }
              } else if (settings?.EmailTicketUpdateEnabled !== false) {
                  options.sendEmail = true; 
                  options.emailSubject = `Ticket Activity Update: #${ticket.TicketID}`; 
                  options.emailHtml = generateTicketUpdateEmailHTML(ticketToSync, client!, settings);
              }
          }
      }
      await syncRow(url, 'Tickets', isNew ? 'create' : 'update', ticketToSync, 'TicketID', options);
      await loadData(false, true);
    } catch (e) { console.error("Save Ticket Dispatch Error:", e); } finally { setSyncing(false); }
  };

  const handleSaveMaintenance = async (record: MaintenanceRecord, triggerEmail: boolean = false) => {
    const settings = appState.systemSettings;
    try {
      setSyncing(true);
      const isNew = !appState.maintenance.find(m => normalizeID(m.ID) === normalizeID(record.ID));
      const client = appState.clients.find(c => normalizeID(c.ClientID) === normalizeID(record.ClientID));
      let options: SyncOptions = {};
      
      const dataToSync = { 
        ...record, 
        AssetIDs: record.AssetIDs.join(', '),
        Email: client?.Email || record.Email 
      };

      if (triggerEmail && record.Status === MaintenanceStatus.Completed && client) {
          const agentEmail = getAgentEmail(appState.agents, client.AssignedAgentID);
          const servicedVehicles = appState.vehicles.filter(v => record.AssetIDs.some(id => normalizeID(id) === normalizeID(v.VehicleID)));
          options.sendEmail = true;
          options.recipientEmail = client.Email; 
          options.senderName = settings?.CompanyName || SENDER_NAME;
          options.senderEmail = settings?.Email || SUPPORT_EMAIL;
          options.emailCc = `${agentEmail},${MASTER_BCC}`; 
          options.emailSubject = `Maintenance Completed: Assets for ${client.CompanyName}`;
          options.emailHtml = generateMaintenanceCompletionEmailHTML(record, client, servicedVehicles, settings);
      }
      await syncRow(url, 'Maintenance', isNew ? 'create' : 'update', dataToSync, 'ID', options);
      await loadData(false, true);
    } catch (e) { console.error("Save Maintenance Error:", e); } finally { setSyncing(false); }
  };

  const handleSimTopUpAction = async (topup: SimTopup, triggerEmail: boolean = false) => {
    const settings = appState.systemSettings;
    try {
      setSyncing(true);
      const vehicle = appState.vehicles.find(v => normalizeID(v.VehicleID) === normalizeID(topup.VehicleID)) || appState.vehicles.find(v => normalizeID(v.NumberPlate) === normalizeID(topup.Plate));
      if (!vehicle) return;
      const client = appState.clients.find(c => normalizeID(c.ClientID) === normalizeID(vehicle.ClientID));
      const agentEmail = getAgentEmail(appState.agents, client?.AssignedAgentID || appState.currentUser?.id);
      let options: SyncOptions = {};
      
      if (triggerEmail && client && client.Email) {
        options.sendEmail = true; 
        options.recipientEmail = client.Email; // Inform the client directly
        options.emailCc = `${agentEmail},${MASTER_BCC}`; // CC Agent and Admin
        options.senderName = settings?.CompanyName || SENDER_NAME;
        options.emailSubject = `Connectivity Renewed: ${vehicle.NumberPlate}`; 
        options.emailHtml = generateSimRenewalEmailHTML(topup, client, vehicle, settings);
      }
      
      await syncRow(url, 'SimTopups', 'create', { ...topup, Email: client?.Email || '' }, 'ID', options);
      await loadData(false, true);
    } catch (e) { console.error("SIM Maintenance Error:", e); } finally { setSyncing(false); }
  };

  const handleBulkSimTopUpAction = async (topups: SimTopup[], triggerEmail: boolean = false) => {
    const settings = appState.systemSettings;
    if (topups.length === 0) return;
    try {
      setSyncing(true);
      const firstTopup = topups[0];
      const referenceVehicle = appState.vehicles.find(v => normalizeID(v.VehicleID) === normalizeID(firstTopup.VehicleID)) || appState.vehicles.find(v => normalizeID(v.NumberPlate) === normalizeID(firstTopup.Plate));
      const targetClient = referenceVehicle ? appState.clients.find(c => normalizeID(c.ClientID) === normalizeID(referenceVehicle.ClientID)) : null;
      const agentEmail = getAgentEmail(appState.agents, targetClient?.AssignedAgentID || appState.currentUser?.id);
      const targetVehicles = appState.vehicles.filter(v => topups.some(t => normalizeID(t.VehicleID) === normalizeID(v.VehicleID) || normalizeID(t.Plate) === normalizeID(v.NumberPlate)));
      
      for (let i = 0; i < topups.length; i++) {
        const topup = topups[i];
        let options: SyncOptions = {};
        
        // Only trigger one consolidated email for the bulk batch at the end of the loop
        if (i === topups.length - 1 && triggerEmail && targetClient && targetClient.Email) {
           options.sendEmail = true; 
           options.recipientEmail = targetClient.Email; // Inform the client directly
           options.emailCc = `${agentEmail},${MASTER_BCC}`; // CC Agent and Admin
           options.senderName = settings?.CompanyName || SENDER_NAME;
           options.emailSubject = `Fleet Connectivity Service Notice: ${targetClient.CompanyName}`; 
           options.emailHtml = generateBulkSimRenewalEmailHTML(topups, targetClient, targetVehicles, settings);
        }
        
        const currentVehicle = appState.vehicles.find(v => normalizeID(v.VehicleID) === normalizeID(topup.VehicleID)) || appState.vehicles.find(v => normalizeID(v.NumberPlate) === normalizeID(topup.Plate));
        const currentClient = currentVehicle ? appState.clients.find(c => normalizeID(c.ClientID) === normalizeID(currentVehicle.ClientID)) : null;
        await syncRow(url, 'SimTopups', 'create', { ...topup, Email: currentClient?.Email || '' }, 'ID', options);
      }
      await loadData(false, true);
    } catch (e) { console.error("Bulk SIM Maintenance Error:", e); } finally { setSyncing(false); }
  };

  return { handleSaveTicket, handleSaveMaintenance, handleSimTopUpAction, handleBulkSimTopUpAction };
};
