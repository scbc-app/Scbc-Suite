
import React, { useState } from 'react';
import { Search, Wrench, Plus, User, Clock, CheckCircle, Car, MoreVertical, Filter, Activity, AlertCircle } from 'lucide-react';
import { MaintenanceRecord, MaintenanceStatus } from '../types';
import { formatDate, formatCurrency } from '../constants';

interface MaintenanceRegistryProps {
  logs: MaintenanceRecord[];
  onAdd: () => void;
  onView: (log: MaintenanceRecord) => void;
}

const MaintenanceRegistry: React.FC<MaintenanceRegistryProps> = ({ logs, onAdd, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<MaintenanceStatus | 'All'>('All');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.ClientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ID.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filter !== 'All' && log.Status !== filter) return false;

    return true;
  }).sort((a,b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());

  const getStatusColor = (status: MaintenanceStatus) => {
    switch(status) {
      case MaintenanceStatus.Completed: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case MaintenanceStatus.InProgress: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 overflow-hidden">
      
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 shrink-0">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-2xl w-fit overflow-x-auto no-scrollbar max-w-full">
          {['All', MaintenanceStatus.Scheduled, MaintenanceStatus.InProgress, MaintenanceStatus.Completed].map(s => (
            <button 
              key={s}
              onClick={() => setFilter(s as any)}
              className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${filter === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex w-full md:max-w-md items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="SEARCH SERVICE LOGS..."
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

      {/* Registry Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div 
                key={log.ID} 
                onClick={() => onView(log)}
                className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Wrench size={18} />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${getStatusColor(log.Status)}`}>
                    {log.Status}
                  </span>
                </div>

                <div className="mb-4">
                   <h3 className="text-sm font-black text-slate-900 uppercase truncate leading-tight">{log.ClientName}</h3>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {log.ID}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mb-4 min-h-[50px] border border-slate-50">
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{log.Description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                    <div className="flex items-center gap-2">
                        <Clock size={12} className="text-slate-300" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formatDate(log.Date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Car size={12} className="text-indigo-300" />
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{log.AssetIDs.length} Units Affected</span>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 flex flex-col items-center opacity-10">
              <Wrench size={50} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.8em]">No Maintenance Logs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceRegistry;
