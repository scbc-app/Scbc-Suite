
import React from 'react';
import { FileText, Calendar, Clock, DollarSign, User, CreditCard, Eye, ArrowRight, Layers, Calculator } from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types';
import { formatDate, formatCurrency } from '../constants';

interface InvoiceViewProps {
  invoice: Partial<Invoice>;
  onPreview: () => void;
}

const MiniStat = ({ icon: Icon, label, value, colorClass = "text-slate-700" }: { icon: any, label: string, value: string | number | undefined, colorClass?: string }) => (
  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl flex-1 min-w-[140px]">
    <div className="p-2 bg-white rounded-lg text-slate-400 border border-slate-100 shadow-sm"><Icon size={14} /></div>
    <div className="min-w-0">
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{label}</p>
      <p className={`text-xs font-bold truncate ${colorClass}`}>{value || '—'}</p>
    </div>
  </div>
);

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice, onPreview }) => {
  const getStatusColor = (status?: InvoiceStatus) => {
    switch(status) {
      case InvoiceStatus.Paid: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case InvoiceStatus.Overdue: return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* 1. HEADER SUMMARY */}
      <div className="flex items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getStatusColor(invoice.Status)}`}>
                {invoice.Status}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Document Node: {invoice.InvoiceID}</span>
           </div>
           <h3 className="text-lg font-black text-slate-900 leading-none uppercase tracking-tight">{invoice.ClientName}</h3>
        </div>
        <div className="text-right">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Unsettled Balance</p>
           <h4 className={`text-2xl font-black tracking-tighter leading-none ${invoice.Status === InvoiceStatus.Overdue ? 'text-rose-600' : 'text-indigo-600'}`}>K{formatCurrency(invoice.BalanceDue)}</h4>
        </div>
      </div>

      {/* 2. CORE LOGISTICS */}
      <div className="flex flex-wrap gap-3">
        <MiniStat icon={Calendar} label="Date Issued" value={formatDate(invoice.InvoiceDate)} />
        <MiniStat icon={Clock} label="Settlement Goal" value={formatDate(invoice.DueDate)} colorClass={invoice.Status === InvoiceStatus.Overdue ? 'text-rose-600' : 'text-slate-900'} />
        <MiniStat icon={Layers} label="Billing Period" value={`${invoice.PeriodMonths || 1} Month(s)`} />
      </div>

      {/* 3. STRUCTURED LEDGER TABLE */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Service Line Entry</h4>
          </div>
          <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                  <thead className="bg-white text-[8px] uppercase tracking-widest text-slate-400 border-b border-slate-50">
                      <tr>
                          <th className="px-6 py-4 font-black">Description of Service</th>
                          <th className="px-6 py-4 font-black text-right">Rate</th>
                          <th className="px-6 py-4 font-black text-center">Qty</th>
                          <th className="px-6 py-4 font-black text-center">Months</th>
                          <th className="px-6 py-4 font-black text-right">Total</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                      <tr>
                          <td className="px-6 py-5 font-bold text-slate-900 uppercase leading-relaxed max-w-[200px]">
                            {invoice.Description || 'Unified Fleet Connectivity Services'}
                          </td>
                          <td className="px-6 py-5 text-right font-mono text-slate-500">K{formatCurrency(invoice.UnitPrice)}</td>
                          <td className="px-6 py-5 text-center font-bold">{invoice.NoOfUnits}</td>
                          <td className="px-6 py-5 text-center font-black text-indigo-600">{invoice.PeriodMonths || 1}</td>
                          <td className="px-6 py-5 text-right font-black text-slate-900 text-sm">K{formatCurrency(invoice.TotalAmount)}</td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>

      {/* 4. SETTLEMENT STATUS */}
      <div className="bg-slate-900 rounded-3xl p-5 flex justify-between items-center text-white shadow-xl relative overflow-hidden">
         <div className="absolute right-0 top-0 p-5 opacity-5 rotate-12"><CreditCard size={60} /></div>
         <div className="flex items-center gap-8 relative z-10">
            <div>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Amount Settled</p>
               <p className="text-base font-bold text-emerald-400 tracking-tight">K{formatCurrency(invoice.AmountPaid)}</p>
            </div>
            <div className="h-10 w-px bg-slate-800"></div>
            <div>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">System Entity</p>
               <p className="text-xs font-bold text-indigo-300 tracking-tight">#{invoice.InvoiceID}</p>
            </div>
         </div>
         <div className="text-right">
            <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-lg border ${invoice.Status === InvoiceStatus.Paid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'}`}>
               Registry Record
            </span>
         </div>
      </div>

      <button 
        onClick={onPreview} 
        className="w-full group bg-white hover:bg-slate-50 border border-slate-200 p-6 rounded-[2.5rem] flex items-center justify-between transition-all active:scale-[0.98] shadow-sm"
      >
        <div className="flex items-center gap-4">
           <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <FileText size={20} />
           </div>
           <div className="text-left">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Generate Print Artifact</h4>
              <p className="text-[9px] text-slate-400 font-medium uppercase mt-1">Official A4 Document for Client Dispatch</p>
           </div>
        </div>
        <div className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-2 transition-all">
           <ArrowRight size={24} />
        </div>
      </button>
    </div>
  );
};

export default InvoiceView;
