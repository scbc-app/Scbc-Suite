
import React from 'react';
import { User, Building2, MoreVertical, UserX } from 'lucide-react';
import { Client, ClientStatus, Agent } from '../../types';

interface ClientCardProps {
  client: Client;
  assignedAgent?: Agent;
  assetCount: number;
  onView: (client: Client) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, assignedAgent, assetCount, onView }) => {
  const isUnassigned = !client.AssignedAgentID || String(client.AssignedAgentID) === '0' || String(client.AssignedAgentID).trim() === '';
  const agentName = assignedAgent ? assignedAgent.AgentName.split(' ')[0] : null;
  const isPartner = assignedAgent?.Role?.toLowerCase() === 'partner';

  return (
    <div 
      onClick={() => onView(client)}
      className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1"
    >
      <button className="absolute -right-1 -top-1 p-2 text-slate-200 hover:text-slate-400 transition-colors z-10">
        <MoreVertical size={14} />
      </button>

      {isUnassigned && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 animate-pulse">
          <div className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shadow-xl border border-white">
            NEEDS AGENT
          </div>
        </div>
      )}

      <div className="relative mb-3 md:mb-5">
        <div className={`w-20 h-20 md:w-32 md:h-32 rounded-full border flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl bg-white
          ${isUnassigned ? 'border-rose-100 bg-rose-50/10' : 
            client.ClientType === 'Individual' ? 
            (client.Gender === 'Female' ? 'border-rose-100 text-rose-300' : 'border-indigo-100 text-indigo-300') : 
            'border-slate-100 text-slate-300'}`}
        >
          {isUnassigned ? (
            <UserX className="w-8 h-8 md:w-12 md:h-12 text-rose-200" strokeWidth={1} />
          ) : client.ClientType === 'Individual' ? (
            <User className="w-8 h-8 md:w-12 md:h-12" strokeWidth={1} />
          ) : (
            <Building2 className="w-8 h-8 md:w-12 md:h-12" strokeWidth={1} />
          )}
        </div>
        
        <div className={`absolute bottom-0.5 right-0.5 md:bottom-2 md:right-2 w-3.5 h-3.5 md:w-5 md:h-5 rounded-full border-2 md:border-4 border-white shadow-sm
          ${client.Status === ClientStatus.Active ? 'bg-emerald-500' : 'bg-rose-500'}`} 
        />

        <div className={`absolute -top-1 -left-1 px-1.5 py-0.5 rounded-md border flex items-center animate-in fade-in duration-1000 ${isUnassigned ? 'bg-rose-50 border-rose-100 text-rose-400' : 'bg-white/40 border-slate-100/30 text-slate-400'} backdrop-blur-[2px]`}>
          <span className="text-[6px] md:text-[8px] font-black uppercase tracking-tighter truncate max-w-[40px] md:max-w-[70px]">
            {isUnassigned ? 'Unassigned' : agentName}
          </span>
        </div>

        {assetCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 md:w-7 md:h-7 bg-slate-50/80 backdrop-blur-[2px] text-slate-400 rounded-full border border-slate-100/50 flex items-center justify-center animate-in zoom-in duration-500">
            <span className="text-[7px] md:text-[9px] font-black leading-none">{assetCount}</span>
          </div>
        )}
      </div>

      <div className="text-center space-y-0.5 px-1 w-full">
        <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-tight transition-colors line-clamp-1 ${isUnassigned ? 'text-rose-900' : 'text-slate-900 group-hover:text-indigo-600'}`}>
          {client.CompanyName}
        </h3>
        <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none opacity-60">
          {client.ClientType}
        </p>
      </div>

      {isPartner && !isUnassigned && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="bg-indigo-600 text-white text-[6px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">Partner</div>
        </div>
      )}
    </div>
  );
};

export default ClientCard;
