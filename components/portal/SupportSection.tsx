
import React from 'react';
import { MessageSquare, Plus, Headphones, ChevronUp, ChevronDown } from 'lucide-react';
import { Ticket } from '../../types';
import { formatDate } from '../../constants';

interface SupportSectionProps {
  ticketTab: 'active' | 'history';
  setTicketTab: (tab: 'active' | 'history') => void;
  displayedTickets: Ticket[];
  allCurrentTabTickets: Ticket[];
  showAllTickets: boolean;
  setShowAllTickets: (show: boolean) => void;
  onNewTicket: () => void;
}

const SupportSection: React.FC<SupportSectionProps> = ({
  ticketTab, setTicketTab, displayedTickets, allCurrentTabTickets, showAllTickets, setShowAllTickets, onNewTicket
}) => {
  return (
    <div className="lg:col-span-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <MessageSquare size={18} className="text-indigo-600" />
          <span className="text-xs uppercase tracking-widest">Support Center</span>
        </div>
        <button onClick={onNewTicket} className="p-1.5 bg-slate-900 text-white rounded-full hover:scale-105 transition-transform">
          <Plus size={14} />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {displayedTickets.map(t => (
          <div key={t.TicketID} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-bold text-slate-900 truncate pr-2">{t.Subject}</p>
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100 shrink-0">{t.Status}</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
              <span>#{t.TicketID}</span>
              <span>{formatDate(t.CreatedAt)}</span>
            </div>
          </div>
        ))}
        
        {allCurrentTabTickets.length > 3 && (
          <button 
            onClick={() => setShowAllTickets(!showAllTickets)}
            className="w-full py-2 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {showAllTickets ? (
              <>Collapse History <ChevronUp size={14} /></>
            ) : (
              <>View All Activity <ChevronDown size={14} /></>
            )}
          </button>
        )}

        {allCurrentTabTickets.length === 0 && (
          <div className="py-8 text-center text-slate-400 space-y-1">
            <Headphones size={24} className="mx-auto opacity-20" />
            <p className="text-[10px] uppercase font-bold tracking-widest">No active tickets</p>
          </div>
        )}
      </div>
      <div className="flex p-1.5 gap-1.5 bg-slate-50 border-t border-slate-100">
        <button onClick={() => {setTicketTab('active'); setShowAllTickets(false);}} className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-all ${ticketTab === 'active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Active</button>
        <button onClick={() => {setTicketTab('history'); setShowAllTickets(false);}} className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-all ${ticketTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>History</button>
      </div>
    </div>
  );
};

export default SupportSection;
