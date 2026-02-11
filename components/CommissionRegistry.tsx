
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calculator, DollarSign, User, X, Crown, GraduationCap, Activity, TrendingUp, Target } from 'lucide-react';
import { Agent, Client, Contract, Payment, SystemSetting } from '../types';
import { formatCurrency, formatDate } from '../constants';

interface CommissionRegistryProps {
  agents: Agent[];
  clients: Client[];
  contracts: Contract[];
  payments: Payment[];
  vehicles: any[];
  systemSettings: SystemSetting | null;
  currentUser?: { id: string; name: string; role: string };
}

const CommissionRegistry: React.FC<CommissionRegistryProps> = ({ agents, clients, contracts, payments, vehicles, systemSettings, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgentID, setSelectedAgentID] = useState<string | null>(null);
  
  const isAdmin = currentUser?.role === 'Admin';
  const isAgent = currentUser?.role === 'Agent';
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  useEffect(() => {
    if (isAgent && currentUser?.id && !selectedAgentID) {
      setSelectedAgentID(currentUser.id);
    }
  }, [isAgent, currentUser, selectedAgentID]);

  const processedStaff = useMemo(() => {
    return agents.map(agent => {
      const assignedClients = clients.filter(c => String(c.AssignedAgentID).trim().toLowerCase() === String(agent.AgentID).trim().toLowerCase());
      
      // FIXED PERCENTAGE LOGIC: The rate comes directly from the agent profile.
      // Total payout scales by volume (number of clients/payments), not by changing the percentage.
      const agentRate = Number(agent.CommissionRate || 10);

      const agentPayments = payments.filter(p => {
        const pDate = new Date(p.Date);
        return String(p.AgentID).trim().toLowerCase() === String(agent.AgentID).trim().toLowerCase() && 
               pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      });

      const portfolioRevenue = agentPayments.reduce((sum, p) => sum + Number(p.Amount), 0);
      const directPayout = (portfolioRevenue * (agentRate / 100));
      const totalPayout = directPayout + Number(agent.BaseSalary || 0) + Number(agent.PerformanceBonus || 0);

      return {
        ...agent,
        portfolioRevenue,
        totalClientsCount: assignedClients.length,
        effectiveRate: agentRate,
        currentMonthLogs: agentPayments.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()),
        payout: totalPayout
      };
    }).filter(a => a.AgentName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [agents, clients, payments, currentMonth, currentYear]);

  const selectedAgent = processedStaff.find(s => String(s.AgentID).trim().toLowerCase() === String(selectedAgentID || '').trim().toLowerCase());

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-500 max-w-full">
      {!isAgent && (
        <div className="w-full bg-slate-900 rounded-2xl p-4 mb-4 shadow-lg border border-slate-800 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                 <DollarSign size={16} />
              </div>
              <div>
                 <h4 className="text-[7px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Payroll Settlement Engine</h4>
                 <p className="text-lg font-black text-white tracking-tighter leading-none">K{formatCurrency(processedStaff.reduce((sum, a) => sum + a.payout, 0))}</p>
              </div>
           </div>
           <div className="relative w-full sm:w-48">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="SEARCH STAFF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-white uppercase outline-none focus:bg-white/10 transition-all"
              />
           </div>
        </div>
      )}

      {!selectedAgent && (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6 px-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {processedStaff.map((staff) => (
              <div key={staff.AgentID} onClick={() => setSelectedAgentID(staff.AgentID)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 cursor-pointer transition-all">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3 mx-auto">
                   <User size={20} />
                </div>
                <div className="text-center">
                  <h3 className="text-[10px] font-black text-slate-800 uppercase truncate">{staff.AgentName}</h3>
                  <p className="text-xs font-black text-emerald-600 mt-1">K{formatCurrency(staff.payout)}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{staff.effectiveRate}% Rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedAgent && (
        <div className="flex-1 bg-white rounded-[1.5rem] border border-slate-100 shadow-xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
          <div className="flex justify-between items-center p-4 border-b border-slate-50 bg-slate-50/30 shrink-0">
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-xl bg-slate-200 text-slate-500">
                  <User size={16} />
               </div>
               <div className="min-w-0">
                 <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate leading-none mb-1">{selectedAgent.AgentName}</h2>
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Fixed Rate: {selectedAgent.effectiveRate}%</p>
               </div>
            </div>
            {!isAgent && (
              <button onClick={() => setSelectedAgentID(null)} className="p-1.5 text-slate-300 hover:text-slate-900 transition-colors"><X size={18} /></button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><TrendingUp size={100} /></div>
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Month Net Earnings</p>
                <h3 className="text-3xl font-black tracking-tighter">K{formatCurrency(selectedAgent.payout)}</h3>
                <div className="mt-4 flex gap-2">
                   <span className="text-[8px] font-black bg-white/20 px-2 py-0.5 rounded uppercase">Base: K{formatCurrency(selectedAgent.BaseSalary || 0)}</span>
                   <span className="text-[8px] font-black bg-white/20 px-2 py-0.5 rounded uppercase">Comm: {selectedAgent.effectiveRate}%</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Managed Volume</p>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter">K{formatCurrency(selectedAgent.portfolioRevenue)}</h3>
                </div>
                <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                   <span className="text-[9px] font-bold text-slate-400 uppercase">{selectedAgent.totalClientsCount} Active Clients</span>
                   <Target size={14} className="text-indigo-400" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Activity size={14} /> Revenue Log (Current Cycle)
               </h4>
               <div className="space-y-2">
                  {selectedAgent.currentMonthLogs.length > 0 ? selectedAgent.currentMonthLogs.map((log: any) => (
                    <div key={log.PaymentID} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                       <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-800 uppercase truncate mb-1">{log.ClientName}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">{formatDate(log.Date)} • Ref: {log.Reference}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-slate-900 leading-none">K{formatCurrency(log.Amount)}</p>
                          <p className="text-[8px] font-bold text-emerald-600 uppercase mt-1">+{log.MonthsCovered || 1} Mo</p>
                       </div>
                    </div>
                  )) : (
                    <div className="py-12 text-center opacity-10 text-[10px] font-black uppercase tracking-widest">No matching payments found</div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionRegistry;
