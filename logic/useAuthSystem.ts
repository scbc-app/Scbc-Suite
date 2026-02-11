
import React, { useState, useEffect } from 'react';
import { AppState, UserPermissions, LoginRecord } from '../types';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60000; // 1 minute lockout

const normalize = (val: any): string => String(val || '').trim().toLowerCase();

const ADMIN_PERMISSIONS: UserPermissions = {
  dashboard: { view: true, create: true, update: true, delete: true },
  clients: { view: true, create: true, update: true, delete: true },
  vehicles: { view: true, create: true, update: true, delete: true },
  sim_manager: { view: true, create: true, update: true, delete: true },
  contracts: { view: true, create: true, update: true, delete: true },
  invoices: { view: true, create: true, update: true, delete: true },
  payments: { view: true, create: true, update: true, delete: true },
  commissions: { view: true, create: true, update: true, delete: true },
  support: { view: true, create: true, update: true, delete: true },
  agents: { view: true, create: true, update: true, delete: true },
  settings: { view: true, create: true, update: true, delete: true }
};

const OPERATIONS_PERMISSIONS: UserPermissions = {
  dashboard: { view: true, create: false, update: false, delete: false },
  clients: { view: true, create: true, update: true, delete: false },
  vehicles: { view: true, create: true, update: true, delete: false },
  sim_manager: { view: true, create: true, update: true, delete: false },
  contracts: { view: true, create: true, update: true, delete: false },
  invoices: { view: true, create: true, update: true, delete: false },
  payments: { view: true, create: true, update: true, delete: false },
  commissions: { view: true, create: false, update: false, delete: false },
  support: { view: true, create: true, update: true, delete: false },
  agents: { view: false, create: false, update: false, delete: false },
  settings: { view: false, create: false, update: false, delete: false }
};

export const useAuthSystem = (appState: AppState, setAppState: React.Dispatch<React.SetStateAction<AppState>>) => {
  const [authLoading, setAuthLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  useEffect(() => {
    if (lockoutUntil && Date.now() >= lockoutUntil) {
      setLockoutUntil(null);
      setAttempts(0);
    }
  }, [lockoutUntil]);

  const handleLogin = async (email: string, pass: string): Promise<string | null> => {
    if (lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      return `Security Lock: Try again in ${remaining}s.`;
    }

    setAuthLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      const userRecord = appState.loginRecords.find(u => normalize(u.Email) === normalize(email));
      
      // Strict string comparison for passwords
      if (!userRecord || String(userRecord.Password).trim() !== String(pass).trim()) { 
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_MS);
        }
        setAuthLoading(false); 
        return "Invalid credentials."; 
      }
      
      if (normalize(userRecord.Status) === 'inactive') { 
        setAuthLoading(false); 
        return "Account restricted."; 
      }

      const agentDetails = appState.agents.find(a => normalize(a.AgentID) === normalize(userRecord.AgentID));
      const clientDetails = appState.clients.find(c => normalize(c.ClientID) === normalize(userRecord.AgentID));
      
      const roleStr = normalize(userRecord.Role || (agentDetails ? agentDetails.Role : 'agent'));
      
      let sessionRole: 'Admin' | 'Agent' | 'Partner' | 'Client' = 'Agent';
      let perms: UserPermissions = { dashboard: { view: true, create: false, update: false, delete: false } }; 
      let userName = agentDetails?.AgentName || clientDetails?.CompanyName || userRecord.Email.split('@')[0];

      if (roleStr.includes('admin')) {
        sessionRole = 'Admin';
        perms = { ...ADMIN_PERMISSIONS };
      } else if (roleStr.includes('partner')) {
        sessionRole = 'Partner';
        perms = { ...OPERATIONS_PERMISSIONS };
      } else if (roleStr.includes('client')) {
        sessionRole = 'Client';
        perms = { dashboard: { view: true, create: false, update: false, delete: false } };
      } else {
        perms = { ...OPERATIONS_PERMISSIONS };
      }

      // Ensure lastLogin is strictly a string or null (not undefined)
      const lastLoginVal = userRecord.LastLogin ? String(userRecord.LastLogin).trim() : null;

      setAppState(prev => ({ 
        ...prev, 
        currentUser: { 
          id: userRecord.AgentID, 
          name: userName, 
          role: sessionRole, 
          permissions: perms,
          lastLogin: lastLoginVal || undefined
        } 
      }));
      
      setAuthLoading(false);
      setAttempts(0);
      return null;
    } catch (err) { 
      setAuthLoading(false); 
      return "Terminal connection error."; 
    }
  };

  const handleLogout = () => setAppState(prev => ({ ...prev, currentUser: null }));

  return { authLoading, handleLogin, handleLogout, lockoutTime: lockoutUntil ? Math.ceil((lockoutUntil - Date.now()) / 1000) : 0 };
};
