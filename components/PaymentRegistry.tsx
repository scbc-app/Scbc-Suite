
import React, { useState } from 'react';
import { Search, Plus, CreditCard } from 'lucide-react';
import { Payment } from '../types';
import PaymentCard from './registry/PaymentCard';

interface PaymentRegistryProps {
  payments: Payment[];
  onAdd: () => void;
  onView: (payment: Payment) => void;
  onEdit: (payment: Payment) => void;
  onDelete: (paymentId: string) => void;
}

const PaymentRegistry: React.FC<PaymentRegistryProps> = ({ payments, onAdd, onView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string | 'All'>('All');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredPayments = payments
    .filter(p => {
      const matchesSearch = 
        p.ClientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.PaymentID.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      if (filterMethod !== 'All' && p.Method !== filterMethod) return false;

      return true;
    })
    .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 overflow-hidden" onClick={() => setActiveMenu(null)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 shrink-0">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-2xl w-fit overflow-x-auto no-scrollbar max-w-full">
          {['All', 'Bank Transfer', 'Mobile Money', 'Cash', 'Card'].map(m => (
            <button 
              key={m}
              onClick={() => setFilterMethod(m)}
              className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${filterMethod === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex w-full md:max-w-lg items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="SEARCH PAYMENTS & REF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-600 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-slate-100/50 transition-all uppercase tracking-widest"
            />
          </div>
          <button onClick={onAdd} className="p-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg active:scale-90 flex-shrink-0">
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 md:gap-x-8 gap-y-10 md:gap-y-16">
          {filteredPayments.length > 0 ? (
            filteredPayments.map((pay) => (
              <PaymentCard 
                key={pay.PaymentID}
                pay={pay}
                activeMenu={activeMenu}
                onView={() => onView(pay)}
                onToggleMenu={setActiveMenu}
                onDelete={(id) => { if (confirm(`Delete transaction ${id}?`)) onDelete(id); }}
              />
            ))
          ) : (
            <div className="col-span-full py-24 flex flex-col items-center opacity-10">
              <CreditCard size={50} className="mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.8em]">No payments recorded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentRegistry;
