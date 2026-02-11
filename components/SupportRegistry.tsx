
import React, { useState } from 'react';
import { Search, MessageSquare, Clock, CheckCircle, AlertCircle, User, ArrowRight, X, Send, Loader2, Activity } from 'lucide-react';
import { Ticket, TicketStatus, Client, Agent } from '../types';
import { formatDate } from '../constants';

interface SupportRegistryProps {
  tickets: Ticket[];
  clients: Client[];
  agents: Agent[];
  onUpdateTicket: (ticket: Ticket) => Promise<void>;
  currentUser: { id: string, name: string };
}

const SupportRegistry: React.FC<SupportRegistryProps> = ({ tickets, clients, agents, onUpdateTicket, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'All'>('All');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredTickets = tickets.filter(t => {
    const client = clients.find(c => c.ClientID === t.ClientID);
    const matchesSearch = 
      t.Subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.CompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.TicketID.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterStatus !== 'All' && t.Status !== filterStatus) return false;

    return true;
  }).sort((a,b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());

  const handleResolve = async (status: TicketStatus) => {
    if (!selectedTicket) return;
    setIsUpdating(true);
    try {
      const updatedTicket: Ticket = {
        ...selectedTicket,
        Status: status,
        Resolution: resolutionText,
        AssignedAgentID: currentUser.id,
        UpdatedAt: new Date().toISOString()
      };
      await onUpdateTicket(updatedTicket);
      setSelectedTicket(null);
      setResolutionText('');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusStyle = (status: TicketStatus) => {
    switch(status) {
      case TicketStatus.Resolved: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case TicketStatus.InProgress: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 overflow-hidden">
      
      {/* Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 shrink-0">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-2xl w-fit overflow-x-auto no-scrollbar max-w-full">
          {['All', TicketStatus.Open, TicketStatus.InProgress, TicketStatus.Resolved].map(s => (
            <button 
              key={s}
              onClick={() => setFilterStatus(s as any)}
              className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${filterStatus === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-md">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="SEARCH TICKETS OR CLIENTS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black text-slate-600 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-slate-100/50 transition-all uppercase tracking-widest"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => {
              const client = clients.find(c => c.ClientID === ticket.ClientID);
              const agent = agents.find(a => a.AgentID === ticket.AssignedAgentID);

              return (
                <div 
                  key={ticket.TicketID} 
                  onClick={() => { setSelectedTicket(ticket); setResolutionText(ticket.Resolution || ''); }}
                  className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <MessageSquare size={18} />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${getStatusStyle(ticket.Status)}`}>
                      {ticket.Status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1 truncate uppercase">{ticket.Subject}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                    <User size={10} /> {client?.CompanyName || 'Unknown Client'}
                  </p>

                  <div className="bg-slate-50 rounded-xl p-3 mb-4 min-h-[60px]">
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{ticket.Description}</p>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-slate-50 pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock size={10} className="text-slate-300" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Reported: {formatDate(ticket.CreatedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity size={10} className="text-indigo-300" />
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">Update: {formatDate(ticket.UpdatedAt)}</span>
                        </div>
                    </div>
                    {agent && (
                      <div className="flex justify-end">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded">Owner: {agent.AgentName.split(' ')[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-24 flex flex-col items-center opacity-10">
              <MessageSquare size={50} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.8em]">No support tickets found</p>
            </div>
          )}
        </div>
      </div>

      {/* RESOLUTION MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><AlertCircle size={20} /></div>
                    <h3 className="font-bold text-slate-800 uppercase tracking-tight">Resolution Manager</h3>
                 </div>
                 <button onClick={() => setSelectedTicket(null)}><X size={20} className="text-slate-300 hover:text-slate-900 transition-colors" /></button>
              </div>
              <div className="p-10 space-y-6">
                 <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Original Ticket Submission</span>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <p className="text-sm font-bold text-slate-800 mb-1">{selectedTicket.Subject}</p>
                       <p className="text-xs text-slate-500 leading-relaxed">{selectedTicket.Description}</p>
                       <div className="mt-3 flex gap-4 text-[7px] font-black uppercase text-slate-400">
                          <span>Reported: {formatDate(selectedTicket.CreatedAt)}</span>
                          <span>Last Activity: {formatDate(selectedTicket.UpdatedAt)}</span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Professional Response</label>
                    <textarea 
                       required
                       autoFocus
                       value={resolutionText}
                       onChange={(e) => setResolutionText(e.target.value)}
                       placeholder="Explain the technical resolution or provide a progress update..." 
                       className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium resize-none focus:ring-4 focus:ring-indigo-50 transition-all" 
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 pt-2">
                    <button 
                       onClick={() => handleResolve(TicketStatus.InProgress)} 
                       disabled={isUpdating}
                       className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                       Set to Pending
                    </button>
                    <button 
                       onClick={() => handleResolve(TicketStatus.Resolved)} 
                       disabled={isUpdating || !resolutionText}
                       className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                       {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                       Mark Resolved
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SupportRegistry;
