
import React, { useState, useMemo } from 'react';
import { Smartphone, RefreshCw, Search, Clock, Signal, CheckSquare, Square, Building2, ChevronDown, ChevronRight, AlertCircle, Calendar } from 'lucide-react';
import { Vehicle, SimTopup, Client } from '../types';
import { formatDate } from '../constants';
import SimTopupModal from './SimTopupModal';

interface SimMaintenanceProps {
  vehicles: Vehicle[];
  simTopups: SimTopup[];
  clients: Client[];
  currentUser: { id: string, name: string };
  onTopUp: (topups: SimTopup[], triggerEmail: boolean) => Promise<void>;
}

const getRemainingDays = (expiryDate: string | null | undefined) => {
  if (!expiryDate) return -1;
  const expiry = new Date(expiryDate);
  if (isNaN(expiry.getTime())) return -1;
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const SimMaintenance: React.FC<SimMaintenanceProps> = ({ vehicles, simTopups, clients, currentUser, onTopUp }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [networkFilter, setNetworkFilter] = useState<string | 'All'>('All');
  const [selectedFleet, setSelectedFleet] = useState<string[]>([]); 
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [selectedVehiclesForModal, setSelectedVehiclesForModal] = useState<Vehicle[]>([]);

  // Helper to find latest expiry for a specific vehicle from transaction history
  const getLatestExpiryForVehicle = (vehicleId: string) => {
    const history = simTopups
      .filter(t => t.VehicleID === vehicleId)
      .sort((a, b) => {
         const d1 = new Date(a.ExpiryDate).getTime();
         const d2 = new Date(b.ExpiryDate).getTime();
         return (isNaN(d2) ? 0 : d2) - (isNaN(d1) ? 0 : d1);
      });
    return history.length > 0 ? history[0].ExpiryDate : null;
  };

  // Helper to find the actual date the SIM was last maintained (Topup Date)
  const getLatestTopupDateForVehicle = (vehicleId: string) => {
    const history = simTopups
      .filter(t => t.VehicleID === vehicleId)
      .sort((a, b) => {
        const d1 = new Date(a.Date).getTime();
        const d2 = new Date(b.Date).getTime();
        return (isNaN(d2) ? 0 : d2) - (isNaN(d1) ? 0 : d1);
      });
    return history.length > 0 ? history[0].Date : null;
  };

  const clientGroups = useMemo(() => {
    const groups: Record<string, { client: Client, items: Vehicle[], stats: any }> = {};
    
    vehicles.forEach(v => {
      if (networkFilter !== 'All' && v.NetworkProvider !== networkFilter) return;
      
      const search = searchTerm.toLowerCase();
      const matchesSearch = v.NumberPlate.toLowerCase().includes(search) || 
                            (v.SimNumber && v.SimNumber.toLowerCase().includes(search)) ||
                            v.ClientName.toLowerCase().includes(search);
      
      if (!matchesSearch) return;

      if (!groups[v.ClientID]) {
        const clientObj = clients.find(c => c.ClientID === v.ClientID);
        if (clientObj) {
          groups[v.ClientID] = { client: clientObj, items: [], stats: {} };
        }
      }
      
      if (groups[v.ClientID]) {
        groups[v.ClientID].items.push(v);
      }
    });

    Object.values(groups).forEach(g => {
      const groupVehicleIds = g.items.map(i => i.VehicleID);
      const groupTopups = simTopups.filter(t => groupVehicleIds.includes(t.VehicleID));
      
      const validTopupTimes = groupTopups
        .map(t => new Date(t.Date).getTime())
        .filter(t => !isNaN(t));

      const lastActionDate = validTopupTimes.length > 0 
        ? new Date(Math.max(...validTopupTimes)).toISOString() 
        : null;

      const nearestExpiry = g.items.reduce((acc: string | null, curr) => {
        const vehicleExpiry = getLatestExpiryForVehicle(curr.VehicleID);
        if (!vehicleExpiry || isNaN(new Date(vehicleExpiry).getTime())) return acc;
        if (!acc) return vehicleExpiry;
        return new Date(vehicleExpiry) < new Date(acc) ? vehicleExpiry : acc;
      }, null);
      
      const dueCount = g.items.filter(i => {
        const vehicleExpiry = getLatestExpiryForVehicle(i.VehicleID);
        return getRemainingDays(vehicleExpiry) <= 0;
      }).length;

      g.stats = { lastMaintained: lastActionDate, nextMaintenance: nearestExpiry, dueCount };
    });

    return Object.values(groups).sort((a, b) => b.stats.dueCount - a.stats.dueCount);
  }, [vehicles, clients, simTopups, networkFilter, searchTerm]);

  const toggleExpand = (id: string) => setExpandedClientId(prev => prev === id ? null : id);

  const toggleClientSelection = (clientId: string, itemIds: string[]) => {
    const allSelected = itemIds.every(id => selectedFleet.includes(id));
    if (allSelected) {
      setSelectedFleet(prev => prev.filter(id => !itemIds.includes(id)));
    } else {
      setSelectedFleet(prev => [...new Set([...prev, ...itemIds])]);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedFleet(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-2 shrink-0">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg shrink-0">
          {['All', 'Airtel', 'MTN'].map(n => (
            <button 
              key={n}
              onClick={() => setNetworkFilter(n)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${networkFilter === n ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search accounts or sims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-normal text-slate-600 outline-none focus:border-indigo-200 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <table className="w-full border-separate border-spacing-y-1">
          <thead>
            <tr className="text-xs font-semibold text-slate-400">
              <th className="w-10 px-2 py-2"></th>
              <th className="text-left px-2 py-2">Account Entity</th>
              <th className="text-left px-2 py-2 hidden md:table-cell">Last Maintained</th>
              <th className="text-left px-2 py-2">Earliest Expiry</th>
              <th className="text-center px-2 py-2 hidden sm:table-cell">Compliance</th>
              <th className="w-10 px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {clientGroups.length > 0 ? clientGroups.map(({ client, items, stats }) => {
              const isExpanded = expandedClientId === client.ClientID;
              const groupIds = items.map(i => i.VehicleID);
              const isGroupSelected = groupIds.every(id => selectedFleet.includes(id));
              const isPartiallySelected = groupIds.some(id => selectedFleet.includes(id)) && !isGroupSelected;

              return (
                <React.Fragment key={client.ClientID}>
                  <tr className={`group transition-all ${isExpanded ? 'bg-indigo-50/40' : 'hover:bg-slate-50'}`}>
                    <td className="px-2 py-2.5 text-center">
                      <button 
                        onClick={() => toggleClientSelection(client.ClientID, groupIds)}
                        className={`transition-colors ${isGroupSelected ? 'text-indigo-600' : isPartiallySelected ? 'text-indigo-400' : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        {isGroupSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </td>
                    <td className="px-2 py-2.5 cursor-pointer" onClick={() => toggleExpand(client.ClientID)}>
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md border transition-colors ${isExpanded ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                           <Building2 size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${isExpanded ? 'text-indigo-900' : 'text-slate-700'}`}>{client.CompanyName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{items.length} Assets</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 hidden md:table-cell text-sm text-slate-500">
                      {stats.lastMaintained ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-300" />
                          <span>{formatDate(stats.lastMaintained)}</span>
                        </div>
                      ) : <span className="text-slate-300 italic text-[10px] uppercase font-bold tracking-tighter">No Activity Logged</span>}
                    </td>
                    <td className="px-2 py-2.5 text-sm font-medium">
                       <span className={stats.dueCount > 0 ? 'text-rose-500' : 'text-emerald-600'}>
                         {formatDate(stats.nextMaintenance)}
                       </span>
                    </td>
                    <td className="px-2 py-2.5 text-center hidden sm:table-cell">
                       <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${stats.dueCount > 0 ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                          {stats.dueCount > 0 ? <AlertCircle size={10}/> : <Signal size={10}/>}
                          {stats.dueCount > 0 ? `${stats.dueCount} Due` : 'Healthy'}
                       </div>
                    </td>
                    <td className="px-2 py-2.5 text-right">
                       <button onClick={() => toggleExpand(client.ClientID)} className={`p-1.5 transition-all rounded-full ${isExpanded ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'text-slate-300 hover:text-slate-600'}`}>
                          <ChevronDown size={16}/>
                       </button>
                    </td>
                  </tr>

                  {isExpanded && items.map((v) => {
                    const vehicleExpiry = getLatestExpiryForVehicle(v.VehicleID);
                    const lastTopupDate = getLatestTopupDateForVehicle(v.VehicleID);
                    const daysLeft = getRemainingDays(vehicleExpiry);
                    const isDue = daysLeft <= 0;
                    const isSelected = selectedFleet.includes(v.VehicleID);

                    return (
                      <tr key={v.VehicleID} className="bg-white border-b border-slate-50 animate-in slide-in-from-top-1">
                        <td className="px-2 py-2 text-center pl-6">
                           <button 
                             onClick={() => toggleItemSelection(v.VehicleID)}
                             className={`transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-200 hover:text-slate-300'}`}
                           >
                             {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                           </button>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2">
                             <Smartphone size={12} className="text-slate-300" />
                             <div className="flex flex-col">
                               <span className="text-xs font-semibold text-slate-600 font-mono tracking-tight">{v.NumberPlate}</span>
                               <span className="text-[10px] text-slate-400 leading-none">
                                  SIM: {v.SimNumber || 'N/A'} {lastTopupDate && ` • Last Renewal: ${formatDate(lastTopupDate)}`}
                               </span>
                             </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 hidden md:table-cell text-xs text-slate-400">
                           <span className="opacity-0">—</span>
                        </td>
                        <td className="px-2 py-2">
                           <div className="flex items-center gap-1">
                              <Clock size={10} className={isDue ? 'text-rose-400' : 'text-slate-300'} />
                              <span className={`text-[11px] font-medium ${isDue ? 'text-rose-500 font-black' : 'text-slate-400'}`}>
                                {isDue ? 'Expired' : `${daysLeft}d left`}
                              </span>
                           </div>
                        </td>
                        <td className="px-2 py-2 text-center hidden sm:table-cell">
                           <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${isDue ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                              {v.NetworkProvider || 'Unknown'}
                           </span>
                        </td>
                        <td className="px-2 py-2 text-right pr-4">
                           <button onClick={() => setSelectedVehiclesForModal([v])} className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors">
                             <RefreshCw size={14} />
                           </button>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            }) : (
              <tr><td colSpan={6} className="py-24 text-center text-slate-300 text-sm font-medium">Inventory Empty</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedFleet.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-5">
           <div className="bg-slate-900 text-white rounded-xl py-2 px-4 flex items-center gap-6 shadow-2xl border border-white/10 backdrop-blur-md">
              <span className="text-xs font-semibold text-indigo-400">{selectedFleet.length} Items Selected</span>
              <div className="flex gap-2">
                 <button onClick={() => setSelectedFleet([])} className="px-3 py-1.5 text-slate-400 hover:text-white text-xs font-medium">Clear</button>
                 <button 
                  onClick={() => setSelectedVehiclesForModal(vehicles.filter(v => selectedFleet.includes(v.VehicleID)))}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-2"
                 >
                   Renew Batch
                 </button>
              </div>
           </div>
        </div>
      )}

      {selectedVehiclesForModal.length > 0 && (
        <SimTopupModal 
          isOpen={true} 
          onClose={() => { setSelectedVehiclesForModal([]); setSelectedFleet([]); }} 
          vehicles={selectedVehiclesForModal} 
          agent={currentUser} 
          onSave={onTopUp} 
        />
      )}
    </div>
  );
};

export default SimMaintenance;
