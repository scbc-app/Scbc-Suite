
import React from 'react';
import ClientModal from './ClientModal';
import ContractModal from './ContractModal';
import InvoiceModal from './InvoiceModal';
import VehicleModal from './VehicleModal';
import PaymentModal from './PaymentModal';
import AgentModal from './AgentModal';
import MaintenanceModal from './MaintenanceModal';
import { AppState, Client, Contract, Invoice, Vehicle, Payment, Agent, DocumentType, MaintenanceRecord } from '../types';

interface AppModalsProps {
  appState: AppState;
  modals: {
    client: { isOpen: boolean; mode: 'view' | 'edit' | 'add'; selected: Client | null; close: () => void };
    contract: { isOpen: boolean; mode: 'view' | 'edit' | 'add'; selected: Contract | null; close: () => void };
    invoice: { isOpen: boolean; mode: 'view' | 'edit' | 'add'; selected: Invoice | null; type: DocumentType; close: () => void };
    vehicle: { isOpen: boolean; mode: 'view' | 'edit' | 'add'; selected: Vehicle | null; close: () => void };
    payment: { isOpen: boolean; mode: 'view' | 'edit' | 'add'; selected: Payment | null; close: () => void };
    agent: { isOpen: boolean; mode: 'view' | 'edit' | 'add'; selected: Agent | null; close: () => void };
    maintenance: { isOpen: boolean; mode: 'view' | 'edit' | 'add'; selected: MaintenanceRecord | null; close: () => void };
  };
  handlers: {
    onSaveClient: (c: Client, email?: boolean) => Promise<void>;
    onSaveContract: (c: Contract, email?: boolean) => Promise<void>;
    onSaveInvoice: (i: Invoice, email?: boolean) => Promise<void>;
    onSaveVehicle: (v: Vehicle) => Promise<void>;
    onSavePayment: (p: Payment, email?: boolean) => Promise<void>;
    onSaveAgent: (a: Agent, email?: boolean) => Promise<void>;
    onSaveMaintenance: (m: MaintenanceRecord, email?: boolean) => Promise<void>;
  };
}

const AppModals: React.FC<AppModalsProps> = ({ appState, modals, handlers }) => {
  if (!appState.currentUser) return null;

  return (
    <>
      <ClientModal 
        isOpen={modals.client.isOpen} onClose={modals.client.close} 
        mode={modals.client.mode} client={modals.client.selected} 
        agents={appState.agents} currentUser={appState.currentUser} 
        onSave={handlers.onSaveClient} 
      />
      
      <ContractModal 
        isOpen={modals.contract.isOpen} onClose={modals.contract.close} 
        mode={modals.contract.mode} contract={modals.contract.selected} 
        clients={appState.clients} agents={appState.agents} 
        servicePlans={appState.servicePlans} vehicles={appState.vehicles} 
        companySettings={appState.systemSettings} userRole={appState.currentUser.role} 
        currentUser={appState.currentUser} onSave={handlers.onSaveContract} 
        onCreateServicePlan={() => {}} 
      />
      
      <InvoiceModal 
        isOpen={modals.invoice.isOpen} onClose={modals.invoice.close} 
        mode={modals.invoice.mode} invoice={modals.invoice.selected} 
        clients={appState.clients} contracts={appState.contracts} 
        systemSettings={appState.systemSettings}
        onSave={handlers.onSaveInvoice} type={modals.invoice.type} 
      />
      
      <VehicleModal 
        isOpen={modals.vehicle.isOpen} onClose={modals.vehicle.close} 
        mode={modals.vehicle.mode} vehicle={modals.vehicle.selected} 
        clients={appState.clients} onSave={handlers.onSaveVehicle} 
      />
      
      <PaymentModal 
        isOpen={modals.payment.isOpen} onClose={modals.payment.close} 
        mode={modals.payment.mode} payment={modals.payment.selected} 
        payments={appState.payments}
        invoices={appState.invoices} contracts={appState.contracts} 
        agents={appState.agents} clients={appState.clients} 
        currentUser={appState.currentUser} onSave={handlers.onSavePayment} 
        onSaveInvoice={handlers.onSaveInvoice} 
      />
      
      <AgentModal 
        isOpen={modals.agent.isOpen} onClose={modals.agent.close} 
        mode={modals.agent.mode} agent={modals.agent.selected} 
        agents={appState.agents}
        currentUser={appState.currentUser}
        onSave={handlers.onSaveAgent} 
      />

      <MaintenanceModal
        isOpen={modals.maintenance.isOpen} onClose={modals.maintenance.close}
        mode={modals.maintenance.mode} record={modals.maintenance.selected}
        clients={appState.clients} vehicles={appState.vehicles}
        onSave={handlers.onSaveMaintenance}
      />
    </>
  );
};

export default AppModals;
