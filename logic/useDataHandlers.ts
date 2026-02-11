
import React from 'react';
import { AppState, Vehicle, Referral } from '../types';
import { syncRow } from '../services/googleSheetsService';
import { DEFAULT_SCRIPT_URL } from '../constants';
import { createBusinessHandlers } from './businessHandlers';
import { createSupportHandlers } from './supportHandlers';
import { createStaffHandlers } from './staffHandlers';

export const useDataHandlers = (
  appState: AppState, 
  setAppState: React.Dispatch<React.SetStateAction<AppState>>, 
  loadData: (initial?: boolean, force?: boolean) => Promise<void>, 
  setSyncing: (val: boolean) => void
) => {
  const url = localStorage.getItem('omni_script_url') || DEFAULT_SCRIPT_URL;

  // Domain Specialized Handlers
  const business = createBusinessHandlers(appState, loadData, setSyncing);
  const support = createSupportHandlers(appState, loadData, setSyncing);
  const staff = createStaffHandlers(appState, loadData, setSyncing);

  const handleSaveVehicle = async (vehicle: Vehicle) => {
    try { 
      setSyncing(true); 
      await syncRow(url, 'Vehicles', 'update', vehicle, 'VehicleID'); 
      await loadData(false, true); 
    } catch (e) { 
      console.error("Save Vehicle Error:", e); 
    } finally { 
      setSyncing(false); 
    }
  };

  const handleSaveReferral = async (referral: Referral) => {
    try {
      setSyncing(true);
      await syncRow(url, 'Referrals', 'create', referral, 'ID');
      await loadData(false, true);
    } catch (e) {
      console.error("Save Referral Error:", e);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => setAppState(prev => ({ ...prev, currentUser: null }));

  return { 
    ...staff,
    ...support,
    ...business,
    handleSaveVehicle,
    handleSaveReferral,
    handleLogout,
    handleAutomationWorkflows: business.handleAutomationWorkflows
  };
};
