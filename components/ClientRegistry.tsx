
import React, { useState } from 'react';
import { Search, Plus, AlertCircle, User } from 'lucide-react';
import { Client, Agent, Vehicle } from '../types';
import ClientCard from './registry/ClientCard';

interface ClientRegistryProps {
  clients: Client[];
  agents: Agent[];
  vehicles?: Vehicle[];
  onAdd: () => void;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
}

const ClientRegistry: React.FC<ClientRegistryProps> = ({ clients, agents, vehicles = [], onAdd, onView, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'All' | 'Unassigned'>('All');

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.CompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.Phone && c.Phone.includes(searchTerm)) ||
      (c.NRC && c.NRC.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    const isUnassigned = !c.AssignedAgentID || String(c.AssignedAgentID) === '0' || String(c.AssignedAgentID).trim() === '';
    if (filterMode === 'Unassigned') return isUnassigned;

    return true;
  });

  const unassignedCount = clients.filter(c => !c.AssignedAgentID || String(c.AssignedAgentID) === '0' || String(c.AssignedAgentID).trim() === '').length;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 shrink-0">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-2xl w-fit">
          <button 
            onClick={() => setFilterMode('All')}
            className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${filterMode === 'All' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            All Accounts
          </button>
          <button 
            onClick={() => setFilterMode('Unassigned')}
            className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${filterMode === 'Unassigned' ? 'bg-rose-50 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {unassignedCount > 0 && <AlertCircle size={12} className={filterMode === 'Unassigned' ? 'text-white' : 'text-rose-500'} />}
            Unassigned ({unassignedCount})
          </button>
        </div>

        <div className="flex w-full md:max-w-lg items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="SEARCH REGISTRY..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black text-slate-600 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-slate-100/50 transition-all uppercase tracking-widest"
            />
          </div>
          <button 
            onClick={onAdd}
            className="p-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg active:scale-90 flex-shrink-0"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 md:gap-x-8 gap-y-8 md:gap-y-12">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <ClientCard 
                key={client.ClientID}
                client={client}
                assignedAgent={agents.find(a => String(a.AgentID) === String(client.AssignedAgentID))}
                assetCount={vehicles.filter(v => String(v.ClientID) === String(client.ClientID)).length}
                onView={onView}
              />
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center opacity-10">
              <User size={40} className="mb-2" />
              <p className="text-[8px] font-black uppercase tracking-[0.5em]">No Data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientRegistry;
