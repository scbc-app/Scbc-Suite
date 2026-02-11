
import React from 'react';
import { Globe, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { Client, AppState, InvoiceStatus } from '../../types';

interface PortalHeaderProps {
  client?: Client;
  invoices?: any[];
}

const TRACKING_WEB_URL = "https://www.overseetracking.com/index.aspx";
const TRACKING_APP_URL = "https://play.google.com/store/apps/details?id=com.myrope.icruises2&hl=en";

const PortalHeader: React.FC<PortalHeaderProps> = ({ client, invoices = [] }) => {
  const hasOverdue = invoices.some(i => i.Status === InvoiceStatus.Overdue || (i.BalanceDue > 0 && new Date(i.DueDate) < new Date()));
  const totalBalance = invoices.reduce((acc, curr) => acc + (curr.BalanceDue || 0), 0);

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome, {client?.CompanyName}</h1>
        <div className="flex items-center gap-4">
           {totalBalance > 0 ? (
             <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${hasOverdue ? 'bg-rose-50 border-rose-100 text-rose-600 animate-pulse' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                <AlertCircle size={12} /> {hasOverdue ? 'Action Required: Payment Overdue' : 'Balance Due'}
             </div>
           ) : (
             <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle size={12} /> Account in Good Standing
             </div>
           )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 w-full lg:w-auto">
        <a 
          href={TRACKING_WEB_URL} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] sm:text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 text-center"
        >
          <Globe size={14} className="shrink-0" /> Tracking Web
        </a>
        <a 
          href={TRACKING_APP_URL} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] sm:text-xs font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 text-center"
        >
          <Smartphone size={14} className="shrink-0" /> Tracking App
        </a>
      </div>
    </div>
  );
};

export default PortalHeader;
