
import React from 'react';
import { Search, Plus, User, Briefcase, Gavel, Shield, MoreVertical, Building2, Crown, GraduationCap, Users2, Network, Edit2 } from 'lucide-react';
import { Agent } from '../types';

interface AgentRegistryProps {
  agents: Agent[];
  onAdd: () => void;
  onView: (agent: Agent) => void;
  onEdit: (agent: Agent) => void;
}

const AgentRegistry: React.FC<AgentRegistryProps> = ({ agents, onAdd, onView, onEdit }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredAgents = agents.filter(a => 
    a.AgentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.Role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.Department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (agent: Agent) => {
    if (agent.ExperienceLevel === 'Lead') return Crown;
    if (agent.ExperienceLevel === 'Trainee') return GraduationCap;
    switch(agent.Role.toLowerCase()) {
      case 'admin': return Shield;
      case 'partner': return Gavel;
      default: return Briefcase;
    }
  };

  const getRoleColor = (agent: Agent) => {
    if (agent.ExperienceLevel === 'Lead') return 'border-amber-100 text-amber-500 ring-4 ring-amber-50';
    if (agent.ExperienceLevel === 'Independent') return 'border-indigo-100 text-indigo-400';
    switch(agent.Role.toLowerCase()) {
      case 'admin': return 'border-indigo-100 text-indigo-400';
      case 'partner': return 'border-amber-100 text-amber-500';
      default: return 'border-slate-100 text-slate-300';
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 overflow-hidden">
      
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 pb-8 shrink-0">
        <div className="flex w-full md:max-w-lg items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="SEARCH STAFF..."
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
          {filteredAgents.length > 0 ? (
            filteredAgents.map((staff) => {
              const RoleIcon = getRoleIcon(staff);
              const nameParts = staff.AgentName.split(' ');
              const shortName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : staff.AgentName;
              
              const subAgentsCount = agents.filter(a => String(a.ParentAgentID).trim().toLowerCase() === String(staff.AgentID).trim().toLowerCase()).length;

              return (
                <div 
                  key={staff.AgentID} 
                  onClick={() => onView(staff)}
                  className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="absolute -right-1 -top-1 z-20 flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(staff); }}
                      className="p-2 bg-white border border-slate-100 text-slate-300 hover:text-indigo-600 rounded-full transition-all shadow-md active:scale-90"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>

                  <div className="relative mb-3 md:mb-5">
                    <div className={`w-20 h-20 md:w-32 md:h-32 rounded-full border flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl bg-white ${getRoleColor(staff)}`}>
                      <RoleIcon className="w-8 h-8 md:w-12 md:h-12" strokeWidth={1} />
                    </div>
                    
                    <div className={`absolute bottom-0.5 right-0.5 md:bottom-2 md:right-2 w-3.5 h-3.5 md:w-5 md:h-5 rounded-full border-2 md:border-4 border-white shadow-sm
                      ${staff.Status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} 
                    />

                    {subAgentsCount > 0 && (
                      <div className="absolute -top-1 -right-1 px-2 py-1 bg-amber-500 text-white rounded-full border border-white shadow-lg flex items-center gap-1 animate-in zoom-in duration-500">
                        <Users2 size={10} />
                        <span className="text-[8px] font-black leading-none">{subAgentsCount}</span>
                      </div>
                    )}

                    <div className={`absolute -top-1 -left-1 px-1.5 py-0.5 rounded-md border flex items-center shadow-sm animate-in zoom-in duration-500 bg-white/80 backdrop-blur-[2px] ${staff.Role === 'Partner' ? 'border-amber-100 text-amber-600' : 'border-slate-100 text-slate-400'}`}>
                      <span className="text-[6px] md:text-[7px] font-black uppercase tracking-tighter">
                        {staff.ExperienceLevel || staff.Role}
                      </span>
                    </div>

                    <div className="absolute bottom-0 -left-1 px-1.5 py-0.5 bg-slate-900/90 backdrop-blur-[2px] text-white rounded-md border border-white/10 flex items-center animate-in slide-in-from-bottom-2 duration-700">
                      <span className="text-[6px] md:text-[7px] font-black leading-none uppercase tracking-tighter">
                        {staff.AgentID}
                      </span>
                    </div>
                  </div>

                  <div className="text-center space-y-0.5 px-1 w-full">
                    <h3 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {shortName}
                    </h3>
                    <div className="flex flex-col items-center gap-0.5">
                      <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none opacity-60">
                        {staff.Department || 'Operations'}
                      </p>
                      {subAgentsCount > 0 && (
                        <p className="text-[6px] font-black text-amber-600 uppercase tracking-widest mt-1">Leading Team</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center opacity-10">
              <User size={40} className="mb-2" />
              <p className="text-[8px] font-black uppercase tracking-[0.5em]">No Staff Members Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentRegistry;
