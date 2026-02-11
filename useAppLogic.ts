
import { useState, useEffect, useMemo } from 'react';
import { Client, Vehicle, Contract, Invoice, Payment, Agent, DocumentType, MaintenanceRecord } from './types';
import { useCoreState } from './logic/useCoreState';
import { useAuthSystem } from './logic/useAuthSystem';
import { useNotificationSystem } from './logic/useNotificationSystem';
import { useDataHandlers } from './logic/useDataHandlers';

const norm = (id: any): string => String(id || '').trim().toLowerCase();

export const useAppLogic = () => {
  const { appState, setAppState, loading, syncing, setSyncing, lastSync, loadData } = useCoreState();
  const { authLoading, handleLogin, handleLogout, lockoutTime } = useAuthSystem(appState, setAppState);
  const { augmentedNotifications, handleDismissNotification, handleClearNotifications } = useNotificationSystem(appState, loadData, setSyncing);
  const handlers = useDataHandlers(appState, setAppState, loadData, setSyncing);

  useEffect(() => { 
    loadData(true).then(() => {
        handlers.handleAutomationWorkflows();
    });
  }, [loadData]);

  // Modal States
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientModalMode, setClientModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractModalMode, setContractModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceModalMode, setInvoiceModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceType, setInvoiceType] = useState<DocumentType>(DocumentType.Invoice);

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleModalMode, setVehicleModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalMode, setPaymentModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [agentModalMode, setAgentModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceModalMode, setMaintenanceModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRecord | null>(null);

  const visibleData = useMemo(() => {
    const { currentUser, clients, contracts, vehicles, invoices, payments, tickets, agents } = appState;
    if (!currentUser) return { clients: [], contracts: [], vehicles: [], invoices: [], payments: [], tickets: [], agents: [] };
    
    if (currentUser.role === 'Admin') {
      return { clients, contracts, vehicles, invoices, payments, tickets, agents };
    }
    
    const userID = norm(currentUser.id);

    if (currentUser.role === ('Client' as any)) {
       return {
          clients: clients.filter(c => norm(c.ClientID) === userID),
          contracts: contracts.filter(c => norm(c.ClientID) === userID),
          vehicles: vehicles.filter(v => norm(v.ClientID) === userID),
          invoices: invoices.filter(i => norm(i.ClientID) === userID),
          payments: payments.filter(p => norm(p.ClientID) === userID),
          tickets: tickets.filter(t => norm(t.ClientID) === userID),
          agents: []
       };
    }

    const mySubAgents = agents.filter(a => norm(a.ParentAgentID) === userID);
    const myTraineeIDs = mySubAgents.filter(a => a.ExperienceLevel === 'Trainee' || !a.ExperienceLevel).map(a => norm(a.AgentID));
    const myDirectClientIDs = clients.filter(c => norm(c.AssignedAgentID) === userID).map(c => norm(c.ClientID));
    const traineeClientIDs = clients.filter(c => myTraineeIDs.includes(norm(c.AssignedAgentID))).map(c => norm(c.ClientID));
    const allManageableClientIDs = [...new Set([...myDirectClientIDs, ...traineeClientIDs])];

    return {
      clients: clients.filter(c => allManageableClientIDs.includes(norm(c.ClientID))),
      contracts: contracts.filter(c => allManageableClientIDs.includes(norm(c.ClientID))),
      vehicles: vehicles.filter(v => allManageableClientIDs.includes(norm(v.ClientID))),
      invoices: invoices.filter(i => allManageableClientIDs.includes(norm(i.ClientID))),
      payments: payments.filter(p => norm(p.AgentID) === userID || allManageableClientIDs.includes(norm(p.ClientID))),
      tickets: tickets.filter(t => allManageableClientIDs.includes(norm(t.ClientID)) || norm(t.AssignedAgentID) === userID),
      agents: agents.filter(a => norm(a.AgentID) === userID || norm(a.ParentAgentID) === userID)
    };
  }, [appState]);

  return {
    appState, setAppState, loading, authLoading, syncing, lastSync, augmentedNotifications, visibleData, lockoutTime,
    modals: {
      client: { isOpen: isClientModalOpen, mode: clientModalMode, selected: selectedClient, setOpen: setIsClientModalOpen, setMode: setClientModalMode, setSelected: setSelectedClient },
      contract: { isOpen: isContractModalOpen, mode: contractModalMode, selected: selectedContract, setOpen: setIsContractModalOpen, setMode: setContractModalMode, setSelected: setSelectedContract },
      invoice: { isOpen: isInvoiceModalOpen, mode: invoiceModalMode, selected: selectedInvoice, type: invoiceType, setOpen: setIsInvoiceModalOpen, setMode: setInvoiceModalMode, setSelected: setSelectedInvoice, setType: setInvoiceType },
      vehicle: { isOpen: isVehicleModalOpen, mode: vehicleModalMode, selected: selectedVehicle, setOpen: setIsVehicleModalOpen, setMode: setVehicleModalMode, setSelected: setSelectedVehicle },
      payment: { isOpen: isPaymentModalOpen, mode: paymentModalMode, selected: selectedPayment, setOpen: setIsPaymentModalOpen, setMode: setPaymentModalMode, setSelected: setSelectedPayment },
      agent: { isOpen: isAgentModalOpen, mode: agentModalMode, selected: selectedAgent, setOpen: setIsAgentModalOpen, setMode: setAgentModalMode, setSelected: setSelectedAgent },
      maintenance: { isOpen: isMaintenanceModalOpen, mode: maintenanceModalMode, selected: selectedMaintenance, setOpen: setIsMaintenanceModalOpen, setMode: setMaintenanceModalMode, setSelected: setSelectedMaintenance }
    },
    handlers: {
      loadData, handleLogin, handleLogout, handleDismissNotification, handleClearNotifications,
      ...handlers
    }
  };
};
