
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ClientRegistry from './components/ClientRegistry';
import VehicleRegistry from './components/VehicleRegistry';
import SimMaintenance from './components/SimMaintenance';
import MaintenanceRegistry from './components/MaintenanceRegistry';
import ContractRegistry from './components/ContractRegistry';
import InvoiceRegistry from './components/InvoiceRegistry';
import PaymentRegistry from './components/PaymentRegistry';
import CommissionRegistry from './components/CommissionRegistry';
import PartnerInvestmentHub from './components/PartnerInvestmentHub';
import AgentRegistry from './components/AgentRegistry';
import ClientPortal from './components/ClientPortal';
import SupportRegistry from './components/SupportRegistry';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { AppState, DocumentType } from './types';
import { DEFAULT_SCRIPT_URL } from './constants';
import { syncRow } from './services/googleSheetsService';

interface AppRouterProps {
  appState: AppState;
  visibleData: any;
  modals: any;
  handlers: any;
  lastSync: Date | null;
  setSyncing: (val: boolean) => void;
}

const AppRouter: React.FC<AppRouterProps> = ({ appState, visibleData, modals, handlers, lastSync, setSyncing }) => {
  
  const checkAccess = (moduleKey: string) => {
    const user = appState.currentUser;
    if (!user) return false;

    // Admin has universal access
    if (user.role === 'Admin') return true;

    // Staff core keys
    const agentCoreKeys = [
      'clients', 'vehicles', 'sim_manager', 'contracts', 
      'invoices', 'payments', 'commissions', 'support', 'dashboard'
    ];
    if (user.role === 'Agent' && agentCoreKeys.includes(moduleKey)) return true;

    // Team Leads get team management
    if (user.role === 'Agent' && moduleKey === 'agents') {
      const agentProfile = appState.agents.find(a => String(a.AgentID) === String(user.id));
      if (agentProfile?.ExperienceLevel === 'Lead' || agentProfile?.ExperienceLevel === 'Mentor') return true;
    }

    if (user.role === 'Partner' && moduleKey === 'partner_hub') return true;
    
    // Clients have no access to these staff modules
    if (user.role === 'Client') return false;

    return user.permissions?.[moduleKey]?.view || false;
  };

  return (
    <Routes>
      {/* Dynamic Root Route based on role */}
      <Route path="/" element={
        appState.currentUser?.role === 'Client' 
          ? <ClientPortal data={appState} onSignContract={handlers.handleSaveContract} onReportIssue={handlers.handleSaveTicket} /> 
          : <Dashboard data={appState} onClaimPayout={handlers.handleClaimPayout} onApplyForPartnership={handlers.handleApplyForPartnership} />
      } />
      
      <Route path="/clients" element={ checkAccess('clients') ? <ClientRegistry clients={visibleData.clients} agents={appState.agents} vehicles={visibleData.vehicles} onAdd={() => { modals.client.setSelected(null); modals.client.setMode('add'); modals.client.setOpen(true); }} onView={(c) => { modals.client.setSelected(c); modals.client.setMode('view'); modals.client.setOpen(true); }} onEdit={(c) => { modals.client.setSelected(c); modals.client.setMode('edit'); modals.client.setOpen(true); }} /> : <Navigate to="/" /> } />
      
      <Route path="/vehicles" element={ checkAccess('vehicles') ? <VehicleRegistry vehicles={visibleData.vehicles} agents={appState.agents} clients={appState.clients} onAdd={() => { modals.vehicle.setSelected(null); modals.vehicle.setMode('add'); modals.vehicle.setOpen(true); }} onView={(v) => { modals.vehicle.setSelected(v); modals.vehicle.setMode('view'); modals.vehicle.setOpen(true); }} onEdit={(v) => { modals.vehicle.setSelected(v); modals.vehicle.setMode('edit'); modals.vehicle.setOpen(true); }} /> : <Navigate to="/" /> } />

      <Route path="/sim-maintenance" element={ checkAccess('sim_manager') ? <SimMaintenance vehicles={visibleData.vehicles} simTopups={appState.simTopups} clients={appState.clients} currentUser={appState.currentUser!} onTopUp={handlers.handleBulkSimTopUpAction} /> : <Navigate to="/" /> } />
      
      <Route path="/maintenance" element={ checkAccess('sim_manager') ? <MaintenanceRegistry logs={appState.maintenance} onAdd={() => { modals.maintenance.setSelected(null); modals.maintenance.setMode('add'); modals.maintenance.setOpen(true); }} onView={(m) => { modals.maintenance.setSelected(m); modals.maintenance.setMode('view'); modals.maintenance.setOpen(true); }} /> : <Navigate to="/" /> } />

      <Route path="/contracts" element={ checkAccess('contracts') ? <ContractRegistry contracts={visibleData.contracts} onAdd={() => { modals.contract.setSelected(null); modals.contract.setMode('add'); modals.contract.setOpen(true); }} onView={(c) => { modals.contract.setSelected(c); modals.contract.setMode('view'); modals.contract.setOpen(true); }} onEdit={(c) => { modals.contract.setSelected(c); modals.contract.setMode('edit'); modals.contract.setOpen(true); }} /> : <Navigate to="/" /> } />
      
      <Route path="/invoices" element={ checkAccess('invoices') ? <InvoiceRegistry invoices={visibleData.invoices} onAdd={(type) => { modals.invoice.setType(type); modals.invoice.setSelected(null); modals.invoice.setMode('add'); modals.invoice.setOpen(true); }} onView={(i) => { modals.invoice.setSelected(i); modals.invoice.setMode('view'); modals.invoice.setOpen(true); }} onEdit={(i) => { modals.invoice.setSelected(i); modals.invoice.setMode('edit'); modals.invoice.setOpen(true); }} onDelete={async (id) => { setSyncing(true); await syncRow(localStorage.getItem('omni_script_url') || DEFAULT_SCRIPT_URL, 'Invoices', 'delete', {InvoiceID: id}, 'InvoiceID'); await handlers.loadData(false); setSyncing(false); }} /> : <Navigate to="/" /> } />
      
      <Route path="/payments" element={ checkAccess('payments') ? <PaymentRegistry payments={visibleData.payments} onAdd={() => { modals.payment.setSelected(null); modals.payment.setMode('add'); modals.payment.setOpen(true); }} onView={(p) => { modals.payment.setSelected(p); modals.payment.setMode('view'); modals.payment.setOpen(true); }} onEdit={(p) => { modals.payment.setSelected(p); modals.payment.setMode('edit'); modals.payment.setOpen(true); }} onDelete={async (id) => { setSyncing(true); await syncRow(localStorage.getItem('omni_script_url') || DEFAULT_SCRIPT_URL, 'Payments', 'delete', {PaymentID: id}, 'PaymentID'); await handlers.loadData(false); setSyncing(false); }} /> : <Navigate to="/" /> } />
      
      <Route path="/commissions" element={ checkAccess('commissions') ? <CommissionRegistry agents={visibleData.agents.length > 0 ? visibleData.agents : appState.agents} clients={appState.clients} contracts={appState.contracts} payments={appState.payments} vehicles={appState.vehicles} systemSettings={appState.systemSettings} currentUser={appState.currentUser!} /> : <Navigate to="/" /> } />
      
      <Route path="/support" element={ checkAccess('support') ? <SupportRegistry tickets={visibleData.tickets} clients={appState.clients} agents={appState.agents} onUpdateTicket={handlers.handleSaveTicket} currentUser={appState.currentUser!} /> : <Navigate to="/" /> } />
      
      <Route path="/partner-hub" element={ appState.currentUser?.role === 'Partner' ? <PartnerInvestmentHub data={appState} onUpdatePartner={handlers.handleSaveAgent} /> : <Navigate to="/" /> } />
      
      <Route path="/agents" element={ checkAccess('agents') ? <AgentRegistry agents={visibleData.agents.length > 0 ? visibleData.agents : appState.agents} onAdd={() => { modals.agent.setSelected(null); modals.agent.setMode('add'); modals.agent.setOpen(true); }} onView={(a) => { modals.agent.setSelected(a); modals.agent.setMode('view'); modals.agent.setOpen(true); }} onEdit={(a) => { modals.agent.setSelected(a); modals.agent.setMode('edit'); modals.agent.setOpen(true); }} /> : <Navigate to="/" /> } />
      
      <Route path="/reports" element={ checkAccess('dashboard') ? <Reports data={appState} /> : <Navigate to="/" /> } />
      
      <Route path="/settings" element={ appState.currentUser?.role === 'Admin' ? <Settings onSave={() => handlers.loadData(false)} onSync={() => handlers.loadData(false)} lastSyncTime={lastSync} appData={appState} /> : <Navigate to="/" /> } />
      
      {/* Catch-all to ensure we always have a landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
