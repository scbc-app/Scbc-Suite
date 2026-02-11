
import React from 'react';
import { MoreVertical, ShieldCheck, FileCheck, FileText, User, CreditCard, Clock } from 'lucide-react';
import { Contract, ContractStatus } from '../../types';
import { formatDate, formatCurrency } from '../../constants';

interface ContractCardProps {
  contract: Contract;
  onView: (c: Contract) => void;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract, onView }) => {
  const today = new Date();
  
  const isExpiringSoon = () => {
    const expiry = new Date(contract.ExpiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  const isAlreadyExpired = () => {
    const expiry = new Date(contract.ExpiryDate);
    return expiry < today;
  };

  const isFullyExecuted = !!contract.ProviderSign && !!contract.ClientSign;
  const clientFirstName = contract.ClientName.split(' ')[0];
  const expiring = isExpiringSoon();
  const expired = isAlreadyExpired();

  return (
    <div 
      onClick={() => onView(contract)}
      className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1"
    >
      <button className="absolute -right-1 -top-1 p-2 text-slate-200 hover:text-slate-400 transition-colors z-10">
        <MoreVertical size={14} />
      </button>

      <div className="relative mb-3 md:mb-5">
        <div className={`w-20 h-20 md:w-32 md:h-32 rounded-full border flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl bg-white
          ${isFullyExecuted ? 'border-indigo-100 text-indigo-300 ring-4 ring-indigo-50/50' : 
            contract.ContractStatus === ContractStatus.Active ? (expired ? 'border-rose-100 text-rose-300' : 'border-emerald-100 text-emerald-300') : 'border-slate-100 text-slate-300'}`}
        >
          {isFullyExecuted ? <FileCheck className="w-8 h-8 md:w-12 md:h-12" strokeWidth={1} /> : <FileText className="w-8 h-8 md:w-12 md:h-12" strokeWidth={1} />}
        </div>
        
        <div className={`absolute bottom-0.5 right-0.5 md:bottom-2 md:right-2 w-3.5 h-3.5 md:w-5 md:h-5 rounded-full border-2 md:border-4 border-white shadow-sm
          ${isFullyExecuted ? 'bg-indigo-500' : 
            contract.ContractStatus === ContractStatus.Active ? (expired ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500') : 'bg-slate-400'}`} 
        />

        <div className="absolute bottom-0 -left-1 px-1.5 py-0.5 bg-white/60 backdrop-blur-[2px] rounded-full border border-slate-100/30 flex items-center gap-1">
          <User size={8} className="text-slate-400" />
          <span className="text-[6px] md:text-[7px] font-black text-slate-400 uppercase tracking-tight truncate max-w-[50px] md:max-w-[80px]">
            {clientFirstName}
          </span>
        </div>

        <div className={`absolute -top-1 -right-1 px-2 py-1 text-white rounded-md border border-white/10 flex items-center animate-in zoom-in duration-500 shadow-lg ${isFullyExecuted ? 'bg-indigo-600' : 'bg-slate-900'}`}>
          <CreditCard size={8} className={isFullyExecuted ? 'text-indigo-200 mr-1' : 'text-emerald-400 mr-1'} />
          <span className="text-[7px] md:text-[9px] font-black leading-none uppercase tracking-tighter">
            K{formatCurrency(contract.TotalAmount)}
          </span>
        </div>

        {expiring && !expired && !isFullyExecuted && contract.ContractStatus === ContractStatus.Active && (
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 p-1.5 bg-amber-500 text-white rounded-full border-2 border-white shadow-xl animate-pulse">
            <Clock size={10} />
          </div>
        )}
      </div>

      <div className="text-center space-y-0.5 px-1 w-full">
        <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-tight transition-colors line-clamp-1 ${isFullyExecuted ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-600'}`}>
          {contract.PlanType}
        </h3>
        <div className="flex flex-col items-center gap-0.5">
          <p className={`text-[7px] md:text-[8px] font-bold uppercase tracking-[0.2em] leading-none ${isFullyExecuted ? 'text-indigo-400' : expired ? 'text-rose-400' : 'text-slate-400 opacity-60'}`}>
            {isFullyExecuted ? 'FULLY EXECUTED' : expired ? 'EXPIRED' : `${contract.NoOfUnits} UNITS • ${contract.BillingCycle}`}
          </p>
          <div className="flex items-center gap-1 mt-1">
             <Clock size={8} className={isFullyExecuted ? "text-indigo-300" : expired ? "text-rose-400" : "text-slate-300"} />
             <span className={`text-[6px] md:text-[7px] font-black uppercase tracking-tighter ${isFullyExecuted ? "text-indigo-400" : expired ? "text-rose-400" : "text-slate-300"}`}>
               Exp: {formatDate(contract.ExpiryDate)}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractCard;
