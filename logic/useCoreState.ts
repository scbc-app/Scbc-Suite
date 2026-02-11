
import { useState, useCallback } from 'react';
import { AppState } from '../types';
import { fetchSpreadsheetData } from '../services/googleSheetsService';
import { DEFAULT_SCRIPT_URL } from '../constants';

const CACHE_KEY = 'sally_chanza_db_cache';
const CACHE_TIME_KEY = 'sally_chanza_last_fetch';
const THROTTLE_MS = 300000; // 5 minutes cache validity

export const useCoreState = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem(CACHE_KEY);
    return saved ? JSON.parse(saved) : {
      clients: [], assets: [], vehicles: [], maintenance: [], simTopups: [], contracts: [], invoices: [], payments: [], commissions: [], notifications: [], tickets: [], agents: [], servicePlans: [], loginRecords: [], systemSettings: null, currentUser: null
    };
  });
  
  const [loading, setLoading] = useState(!localStorage.getItem(CACHE_KEY));
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(() => {
    const savedTime = localStorage.getItem(CACHE_TIME_KEY);
    if (!savedTime || savedTime === 'null' || savedTime === 'undefined') return null;
    const d = new Date(Number(savedTime));
    return isNaN(d.getTime()) ? null : d;
  });

  const loadData = useCallback(async (isInitial: boolean = false, force: boolean = false) => {
    const now = Date.now();
    const lastFetch = Number(localStorage.getItem(CACHE_TIME_KEY) || 0);
    
    if (!force && !isInitial && (now - lastFetch < THROTTLE_MS)) {
      return;
    }

    if (!navigator.onLine) {
      setLoading(false);
      setSyncing(false);
      return;
    }

    if (isInitial && !appState.clients.length) setLoading(true);
    else setSyncing(true);

    const rawUrl = localStorage.getItem('omni_script_url') || DEFAULT_SCRIPT_URL;
    const url = rawUrl.trim();

    try {
      const sheetData = await fetchSpreadsheetData(url);
      if (sheetData) {
        setAppState(prev => ({ ...prev, ...sheetData }));
        const syncDate = new Date();
        setLastSync(syncDate);
        localStorage.setItem(CACHE_KEY, JSON.stringify(sheetData));
        localStorage.setItem(CACHE_TIME_KEY, String(syncDate.getTime()));
      }
    } catch (error: any) { 
      console.error("Database connection failed. Reverting to local cache.", error.message);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [appState.clients.length]);

  return { appState, setAppState, loading, syncing, setSyncing, lastSync, loadData };
};
