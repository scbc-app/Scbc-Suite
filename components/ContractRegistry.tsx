
import React, { useState } from 'react';
import { Search, Plus, FileText, ShieldCheck, FileCheck, Clock } from 'lucide-react';
import { Contract, ContractStatus } from '../types';
import ContractCard from './registry/ContractCard';

interface ContractRegistryProps {
  contracts: Contract[];
  onAdd: () => void;
  onView: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
}

const ContractRegistry: React.FC<ContractRegistryProps> = ({ contracts, onAdd, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'expiring' | 'expired' | 'executed'>('all');

  const today = new Date();
  
  const metrics = React.useMemo(() => {
    return {
      active: contracts.filter(c => c.ContractStatus === 'Active' && new Date(c.ExpiryDate) >= today).length,
      expiring: contracts.filter(c => {
         const diffDays = Math.ceil((new Date(c.ExpiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
         return c.ContractStatus === 'Active' && diffDays > 0 && diffDays <= 30;
      }).length,
      executed: contracts.filter(c => !!c.ProviderSign && !!c.ClientSign).length
    };
  }, [contracts, today]);

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = 
      c.ClientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.PlanType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ContractID.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterMode === 'active') return c.ContractStatus === ContractStatus.Active && new Date(c.ExpiryDate) >= today;
    if (filterMode === 'expiring') {
        const diffDays = Math.ceil((new Date(c.ExpiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return c.ContractStatus === ContractStatus.Active && diffDays > 0 && diffDays <= 30;
    }
    if (filterMode === 'executed') return !!c.ProviderSign && !!c.ClientSign;
    if (filterMode === 'expired') return c.ContractStatus === ContractStatus.Active && new Date(c.ExpiryDate) < today;

    return true;
  });

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 overflow-hidden">
      
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 shrink-0">
        <div onClick={() => setFilterMode('active')} className={`cursor-pointer p-4 rounded-3xl border flex items-center justify-between transition-all ${filterMode === 'active' ? 'bg-emerald-50 border-emerald-600 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 hover:border-emerald-100'}`}>
          <div className="flex flex-col">
            <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${filterMode === 'active' ? 'text-white/70' : 'text-slate-400'}`}>Active Contracts</span>
            <span className={`text-xl font-black leading-none ${filterMode === 'active' ? 'text-white' : 'text-slate-900'}`}>{metrics.active}</span>
          </div>
          <ShieldCheck size={18} className={filterMode === 'active' ? 'text-white' : 'text-emerald-500'} />
        </div>

        <div onClick={() => setFilterMode('executed')} className={`cursor-pointer p-4 rounded-3xl border flex items-center justify-between transition-all ${filterMode === 'executed' ? 'bg-indigo-600 border-indigo-700 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-100'}`}>
          <div className="flex flex-col">
            <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${filterMode === 'executed' ? 'text-white/70' : 'text-slate-400'}`}>Fully Executed</span>
            <span className={`text-xl font-black leading-none ${filterMode === 'executed' ? 'text-white' : 'text-slate-900'}`}>{metrics.executed}</span>
          </div>
          <FileCheck size={18} className={filterMode === 'executed' ? 'text-white' : 'text-indigo-500'} />
        </div>

        <div onClick={() => setFilterMode('expiring')} className={`cursor-pointer p-4 rounded-3xl border flex items-center justify-between transition-all ${filterMode === 'expiring' ? 'bg-amber-500 border-amber-600 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 hover:border-amber-100'}`}>
          <div className="flex flex-col">
            <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${filterMode === 'expiring' ? 'text-white/70' : 'text-slate-400'}`}>Expiring Soon</span>
            <span className={`text-xl font-black leading-none ${filterMode === 'expiring' ? 'text-white' : 'text-slate-900'}`}>{metrics.expiring}</span>
          </div>
          <Clock size={18} className={filterMode === 'expiring' ? 'text-white' : 'text-amber-500'} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 shrink-0 border-t border-slate-50 pt-6">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-2xl w-fit overflow-x-auto no-scrollbar max-w-full">
          {['all', 'executed', 'active', 'expiring', 'expired'].map(mode => (
             <button 
                key={mode}
                onClick={() => setFilterMode(mode as any)}
                className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${filterMode === mode ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {mode === 'executed' ? 'Signed Both' : mode}
              </button>
          ))}
        </div>

        <div className="flex w-full md:max-w-lg items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="SEARCH CONTRACTS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black text-slate-600 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-slate-100/50 transition-all uppercase tracking-widest"
            />
          </div>
          <button onClick={onAdd} className="p-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg active:scale-90 flex-shrink-0">
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 md:gap-x-8 gap-y-8 md:gap-y-12">
          {filteredContracts.length > 0 ? (
            filteredContracts.map((contract) => (
              <ContractCard key={contract.ContractID} contract={contract} onView={onView} />
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center opacity-10">
              <FileText size={40} className="mb-2" />
              <p className="text-[8px] font-black uppercase tracking-[0.5em]">No matching contracts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractRegistry;
