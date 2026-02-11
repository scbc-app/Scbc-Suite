
import { AppState } from '../types';
import { DEFAULT_SCRIPT_URL } from '../constants';
import { createClientHandlers } from './handlers/clientHandlers';
import { createContractHandlers } from './handlers/contractHandlers';
import { createInvoiceHandlers } from './handlers/invoiceHandlers';
import { createPaymentHandlers } from './handlers/paymentHandlers';
import { createAutomationWatchdog } from './handlers/automationWatchdog';

/**
 * OmniTrack Business Handler Entry Point (Refactored for Modularity)
 * Aggregates specialized logic for Clients, Contracts, Invoices, Payments and Automation.
 */
export const createBusinessHandlers = (
  appState: AppState,
  loadData: (initial?: boolean, force?: boolean) => Promise<void>,
  setSyncing: (val: boolean) => void
) => {
  const url = localStorage.getItem('omni_script_url') || DEFAULT_SCRIPT_URL;

  // Initialize modular handlers
  const handleSaveClient = createClientHandlers(appState, loadData, setSyncing, url);
  const handleSaveContract = createContractHandlers(appState, loadData, setSyncing, url);
  const handleSaveInvoice = createInvoiceHandlers(appState, loadData, setSyncing, url);
  const handleSavePayment = createPaymentHandlers(appState, loadData, setSyncing, url);
  const handleAutomationWorkflows = createAutomationWatchdog(appState, loadData, url);

  return { 
    handleSaveClient, 
    handleSaveContract, 
    handleSaveInvoice, 
    handleSavePayment, 
    handleAutomationWorkflows 
  };
};
