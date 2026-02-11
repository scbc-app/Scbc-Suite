
import React from 'react';
import { MoreVertical, CheckCircle2, Clock, Wallet, CreditCard, Hash, DollarSign, CalendarRange } from 'lucide-react';
import { Payment, PaymentStatus } from '../../types';
import { formatDate, formatCurrency } from '../../constants';

interface PaymentCardProps {
  pay: Payment;
  activeMenu: string | null;
  onView: (pay: Payment) => void;
  onToggleMenu: (id: string) => void;
  onDelete: (id: string) => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ pay, activeMenu, onView, onToggleMenu, onDelete }) => {
  const getStatusStyle = () => {
    switch(pay.Status) {
      case PaymentStatus.Completed: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case PaymentStatus.Pending: return 'bg-amber-50 text-amber-700 border-amber-100';
      case PaymentStatus.Failed: return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-400 text-white ring-4 ring-slate-400/20';
    }
  };

  const getMethodIcon = () => {
    switch(pay.Method) {
      case 'Bank Transfer': return <Hash size={24} />;
      case 'Mobile Money': return <Wallet size={24} />;
      case 'Card': return <CreditCard size={24} />;
      default: return <DollarSign size={24} />;
    }
  };

  return (
    <div onClick={() => onView(pay)} className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1">
      <div className="absolute -right-1 -top-1 z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleMenu(pay.PaymentID); }} 
          className={`p-2 rounded-full transition-all ${activeMenu === pay.PaymentID ? 'bg-slate-900 text-white' : 'text-slate-200 hover:text-slate-900'}`}
        >
          <MoreVertical size={18} />
        </button>
        {activeMenu === pay.PaymentID && (
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <button onClick={(e) => { e.stopPropagation(); onDelete(pay.PaymentID); }} className="w-full flex items-center gap-2 px-4 py-3 text-rose-600 hover:bg-rose-50 text-[9px] font-black uppercase tracking-widest transition-colors">Delete</button>
          </div>
        )}
      </div>

      <div className="relative mb-4 md:mb-6">
        <div className={`w-24 h-24 md:w-36 md:h-36 rounded-full border border-slate-100 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl bg-white text-slate-200 ring-8 ring-slate-50/50`}>
          {getMethodIcon()}
        </div>
        <div className={`absolute bottom-0.5 right-0.5 md:bottom-3 md:right-3 px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg border-2 border-white ${getStatusStyle()}`}>
          {pay.Status === PaymentStatus.Completed ? <CheckCircle2 size={10} className="inline mr-1" /> : null}
          {pay.Status}
        </div>
        <div className="absolute -top-1 -right-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl border border-white/10 flex items-center shadow-2xl">
          <span className="text-[8px] md:text-[10px] font-bold leading-none uppercase tracking-tighter">K{formatCurrency(pay.Amount)}</span>
        </div>
        
        {/* Coverage Badge */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1 shadow-sm">
           <CalendarRange size={10} />
           <span className="text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">{pay.MonthsCovered || 1} Mo Paid</span>
        </div>
      </div>

      <div className="text-center space-y-1 px-1 w-full">
        {/* Fix: Prioritize showing the Remarks (The Description) over the internal Reference ID; Remarks is now properly typed on Payment */}
        <h3 className="text-[11px] md:text-xs font-black text-slate-900 uppercase tracking-widest group-hover:text-indigo-600 transition-colors line-clamp-1">
          {pay.Remarks || pay.Reference}
        </h3>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] leading-none text-slate-400 opacity-80">{pay.ClientName}</p>
          <div className="flex items-center gap-2 mt-1.5 py-1 px-2 bg-slate-50 rounded-lg">
             <Clock size={10} className="text-slate-300" />
             <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-slate-400">{formatDate(pay.Date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;
