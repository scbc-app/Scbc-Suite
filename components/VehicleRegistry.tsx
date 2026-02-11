
import React, { useState } from 'react';
import { Search, Car, MoreVertical, Plus, User, Hash, Edit2 } from 'lucide-react';
import { Vehicle, VehicleStatus, Client, Agent } from '../types';

interface VehicleRegistryProps {
  vehicles: Vehicle[];
  agents: Agent[];
  clients: Client[];
  onAdd: () => void;
  onView: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
}

const VehicleRegistry: React.FC<VehicleRegistryProps> = ({ vehicles, agents, clients, onAdd, onView, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = vehicles.filter(v => 
    v.NumberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.ClientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.Make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.Model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 overflow-hidden">
      {/* Search & Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 pb-6 shrink-0">
        <div className="flex w-full md:max-w-lg items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="SEARCH FLEET..."
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 md:gap-x-8 gap-y-8 md:gap-y-12">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => {
              return (
                <div 
                  key={vehicle.VehicleID} 
                  onClick={() => onView(vehicle)}
                  className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Action UI Overlay */}
                  <div className="absolute -right-1 -top-1 z-20 flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(vehicle); }}
                      className="p-2 bg-white border border-slate-100 text-slate-300 hover:text-indigo-600 rounded-full transition-all shadow-md active:scale-90"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>

                  {/* Avatar Section */}
                  <div className="relative mb-3 md:mb-5">
                    <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border border-slate-100 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl bg-white text-slate-300">
                      <Car className="w-8 h-8 md:w-12 md:h-12" strokeWidth={1} />
                    </div>
                    
                    <div className={`absolute bottom-0.5 right-0.5 md:bottom-2 md:right-2 w-3.5 h-3.5 md:w-5 md:h-5 rounded-full border-2 md:border-4 border-white shadow-sm
                      ${vehicle.Status === VehicleStatus.Active ? 'bg-indigo-500' : 'bg-orange-500'}`} 
                    />

                    <div className="absolute bottom-0 -left-1 px-1.5 py-0.5 bg-white/60 backdrop-blur-[2px] rounded-full border border-slate-100/30 flex items-center gap-1 animate-in slide-in-from-bottom-2 duration-700">
                      <User size={8} className="text-slate-400" />
                      <span className="text-[6px] md:text-[7px] font-black text-slate-400 uppercase tracking-tight truncate max-w-[50px] md:max-w-[80px]">
                        {vehicle.ClientName}
                      </span>
                    </div>

                    <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-slate-900/90 backdrop-blur-[2px] text-white rounded-md border border-white/10 flex items-center animate-in zoom-in duration-500">
                      <Hash size={8} className="text-indigo-400 mr-0.5" />
                      <span className="text-[7px] md:text-[9px] font-black leading-none uppercase tracking-tighter">
                        {vehicle.NumberPlate}
                      </span>
                    </div>
                  </div>

                  <div className="text-center space-y-0.5 px-1 w-full">
                    <h3 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {vehicle.Make} {vehicle.Model}
                    </h3>
                    <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none opacity-60">
                      {vehicle.Year} • {vehicle.ServiceType}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center opacity-10">
              <Car size={40} className="mb-2" />
              <p className="text-[8px] font-black uppercase tracking-[0.5em]">No Assets</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleRegistry;
