
import React from 'react';
import { MoreVertical, AlertCircle, CheckCircle2, FileCode, FileSpreadsheet, FileText, Zap, Clock, CalendarRange } from 'lucide-react';
import { Invoice, InvoiceStatus, DocumentType, Payment } from '../../types';
import { formatDate, formatCurrency } from '../../constants';

interface InvoiceCardProps {
  inv: Invoice;
  lastPayment?: Payment;
  activeMenu: string | null;
  onView: (inv: Invoice) => void;
  onToggleMenu: (id: string) => void;
  onDelete: (id: string) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ inv, lastPayment, activeMenu, onView, onToggleMenu, onDelete }) => {
  const today = new Date();
  const dueDate = new Date(inv.DueDate);
  const isOverdue = inv.BalanceDue > 0 && dueDate < today && inv.DocType === DocumentType.Invoice;
  const isRecentlyPaid = lastPayment && (new Date().getTime() - new Date(lastPayment.Date).getTime()) < (48 * 60 * 60 * 1000);
  const isUpcoming = !isOverdue && dueDate > today && inv.Status !== InvoiceStatus.Paid;

  // Calculate days remaining/past
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const getStatusStyle = () => {
    if (inv.Status === InvoiceStatus.Paid) return 'bg-emerald-500 text-white ring-4 ring-emerald-500/20';
    if (isOverdue) return 'bg-rose-600 text-white ring-4 ring-rose-500/20 animate-pulse';
    if (inv.Status === InvoiceStatus.Partial) return 'bg-amber-500 text-white ring-4 ring-amber-500/20';
    return 'bg-indigo-400 text-white ring-4 ring-indigo-500/10';
  };

  return (
    <div onClick={() => onView(inv)} className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1">
      <div className="absolute -right-1 -top-1 z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleMenu(inv.InvoiceID); }} 
          className={`p-2 rounded-full transition-all ${activeMenu === inv.InvoiceID ? 'bg-slate-900 text-white' : 'text-slate-200 hover:text-slate-900'}`}
        >
          <MoreVertical size={18} />
        </button>
        {activeMenu === inv.InvoiceID && (
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <button onClick={(e) => { e.stopPropagation(); onDelete(inv.InvoiceID); }} className="w-full flex items-center gap-2 px-4 py-3 text-rose-600 hover:bg-rose-50 text-[9px] font-black uppercase tracking-widest">Delete</button>
          </div>
        )}
      </div>
      
      {isOverdue && (
        <div className="absolute -left-2 -top-2 z-30">
          <div className="bg-rose-700 text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase shadow-xl flex items-center gap-1 border border-white/20">
            <AlertCircle size={10} /> {Math.abs(diffDays)} DAYS OVERDUE
          </div>
        </div>
      )}

      <div className="relative mb-4 md:mb-6">
        <div className={`w-24 h-24 md:w-36 md:h-36 rounded-full border border-slate-100 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl bg-white text-slate-200 ring-8 ${isOverdue ? 'ring-rose-50' : (isUpcoming ? 'ring-indigo-50/50' : 'ring-slate-50/50')}`}>
          {inv.DocType === DocumentType.Quotation ? <FileCode size={24} /> : inv.DocType === DocumentType.Proforma ? <FileSpreadsheet size={24} /> : <FileText size={24} />}
        </div>
        <div className={`absolute bottom-0.5 right-0.5 md:bottom-3 md:right-3 px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg border-2 border-white ${getStatusStyle()}`}>
          {isOverdue ? 'OVERDUE' : inv.Status}
        </div>
        <div className={`absolute -top-1 -right-2 px-3 py-1.5 text-white rounded-xl border border-white/10 flex items-center shadow-2xl transition-colors ${isOverdue ? 'bg-rose-700' : (inv.Status === 'Paid' ? 'bg-emerald-600' : (isUpcoming ? 'bg-indigo-600' : 'bg-slate-900'))}`}>
          <span className="text-[8px] md:text-[10px] font-black leading-none uppercase tracking-tighter">K{formatCurrency(isOverdue ? inv.BalanceDue : inv.TotalAmount)}</span>
        </div>
        
        {/* Coverage Label */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1 shadow-sm">
           <CalendarRange size={10} className="text-indigo-400" />
           <span className="text-[8px] font-black uppercase whitespace-nowrap">{inv.PeriodMonths || 1} Mo Subscription</span>
        </div>
      </div>

      <div className="text-center space-y-1 px-1 w-full">
        <h3 className={`text-[11px] md:text-xs font-black uppercase tracking-widest transition-colors line-clamp-1 ${isOverdue ? 'text-rose-700' : 'text-slate-900 group-hover:text-indigo-600'}`}>{inv.InvoiceID}</h3>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] leading-none text-slate-400 opacity-80">{inv.ClientName}</p>
          <div className={`flex items-center gap-2 mt-1.5 py-1 px-2 rounded-lg ${isOverdue ? 'bg-rose-50 text-rose-600' : (isUpcoming ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-50 text-slate-400')}`}>
            <Clock size={10} className={isOverdue ? 'text-rose-400' : (isUpcoming ? 'text-indigo-300' : 'text-slate-300')} />
            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">
              {isOverdue ? 'EXPIRED' : (isUpcoming ? `DUE IN ${diffDays}D` : 'DUE')}: {formatDate(inv.DueDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
