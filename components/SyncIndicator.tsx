
import React, { useState, useEffect } from 'react';
import { Loader2, WifiOff } from 'lucide-react';

interface SyncIndicatorProps {
  isVisible: boolean;
}

const SyncIndicator: React.FC<SyncIndicatorProps> = ({ isVisible }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-4 right-1/2 translate-x-1/2 z-[100] bg-rose-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center shadow-2xl animate-in fade-in slide-in-from-top-4 border border-rose-500">
        <WifiOff size={12} className="mr-2" />
        Offline Mode (Read Only)
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-1/2 translate-x-1/2 z-[100] bg-slate-900 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] flex items-center shadow-2xl animate-in slide-in-from-top-4 border border-slate-800">
      <Loader2 size={12} className="animate-spin mr-2" />
      Synchronizing...
    </div>
  );
};

export default SyncIndicator;
