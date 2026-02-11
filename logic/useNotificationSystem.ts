
import { useState, useMemo } from 'react';
import { AppState, AppNotification, NotificationPriority, DocumentType, InvestmentStatus } from '../types';
import { syncRow } from '../services/googleSheetsService';
import { DEFAULT_SCRIPT_URL } from '../constants';

export const useNotificationSystem = (appState: AppState, loadData: (initial?: boolean) => Promise<void>, setSyncing: (val: boolean) => void) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const augmentedNotifications = useMemo(() => {
    const today = new Date();
    const alerts: AppNotification[] = [];
    const { currentUser } = appState;
    if (!currentUser) return [];

    const isAdmin = currentUser.role === 'Admin';
    const isAgent = currentUser.role === 'Agent';
    const userId = String(currentUser.id).trim();

    const isUserDismissed = (baseId: string) => {
        const scopedId = `${baseId}_${userId}`;
        if (dismissedAlerts.includes(scopedId)) return true;
        return appState.notifications.some(n => 
          (String(n.ID).trim() === scopedId || String(n.ID).trim() === baseId) && 
          n.Status === 'Read' && 
          String(n.AssignedTo).trim() === userId
        );
    };

    // 1. DATABASE NOTIFICATIONS (Admin/Agent relevant)
    appState.notifications.forEach(n => {
       if (n.Status === 'Read') return;
       const isForMe = n.AssignedTo === 'GLOBAL' || n.AssignedTo === userId || (isAdmin && n.AssignedTo === 'ADMIN');
       if (isForMe && !isUserDismissed(n.ID)) {
          alerts.push(n);
       }
    });

    // 2. RUNTIME LOGIC NOTIFICATIONS (Fleet & Expiry)
    const getLatestExpiryForVehicle = (vehicleId: string) => {
      const history = appState.simTopups
        .filter(t => t.VehicleID === vehicleId)
        .sort((a, b) => new Date(b.ExpiryDate).getTime() - new Date(a.ExpiryDate).getTime());
      return history.length > 0 ? history[0].ExpiryDate : null;
    };

    appState.vehicles.forEach(v => {
      const isAssignedToMe = appState.clients.some(c => c.ClientID === v.ClientID && String(c.AssignedAgentID).trim() === userId);
      if (isAdmin || (isAgent && isAssignedToMe)) {
        const latestExpiry = getLatestExpiryForVehicle(v.VehicleID);
        if (latestExpiry) {
          const expiryDate = new Date(latestExpiry);
          if (!isNaN(expiryDate.getTime())) {
            const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const id = `AUTO-SIM-${v.VehicleID}-${latestExpiry}`;

            if (diffDays <= 7 && !isUserDismissed(id)) {
              alerts.push({
                ID: id, Time: new Date().toISOString(), Type: 'SIM_ASSET',
                Priority: diffDays <= 0 ? NotificationPriority.Critical : NotificationPriority.High,
                ClientID: v.ClientID, ClientName: v.ClientName, ContractID: '',
                Message: `Connectivity Warning: ${v.NumberPlate} expires in ${diffDays} days.`,
                DueDate: latestExpiry, Status: 'Unread', AssignedTo: userId, Sent: true
              });
            }
          }
        }
      }
    });

    return alerts.sort((a, b) => new Date(b.Time).getTime() - new Date(a.Time).getTime());
  }, [appState, dismissedAlerts]);

  const handleDismissNotification = async (id: string) => {
    const url = localStorage.getItem('omni_script_url') || DEFAULT_SCRIPT_URL;
    const userId = appState.currentUser?.id || 'SYSTEM';
    const scopedId = id.includes('_') ? id : `${id}_${userId}`;
    
    setSyncing(true);
    setDismissedAlerts(prev => [...prev, scopedId]);
    
    try {
        await syncRow(url, 'Notifications', 'create', { 
          ID: scopedId, Status: 'Read', Time: new Date().toISOString(),
          Message: 'User Dismissed', Type: 'DISMISSAL', Priority: 'Low',
          ClientID: 'SYSTEM', AssignedTo: userId, Sent: true
        }, 'ID');
        await loadData(false);
    } catch (e) { console.error("Dismissal Error:", e); } finally { setSyncing(false); }
  };

  const handleClearNotifications = async () => {
    if (!appState.currentUser) return;
    for (const n of augmentedNotifications) {
        await handleDismissNotification(n.ID);
    }
  };

  return { augmentedNotifications, handleDismissNotification, handleClearNotifications };
};
