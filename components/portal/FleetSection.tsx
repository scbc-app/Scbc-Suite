
import React from 'react';
import { LayoutGrid, Car } from 'lucide-react';
import { Contract, Vehicle } from '../../types';
import { formatCurrency } from '../../constants';

interface FleetSectionProps {
  activeContract?: Contract;
  vehicles: Vehicle[];
}

const FleetSection: React.FC<FleetSectionProps> = ({ activeContract, vehicles }) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-[160px]">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <LayoutGrid size={14} /> My Service Plan
          </div>
          {activeContract ? (
            <div className="py-1">
              <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{activeContract.PlanType}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{activeContract.NoOfUnits} Assets • {activeContract.BillingCycle} Cycle</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No active plan</p>
          )}
          <div className="pt-2 border-t border-slate-50">
            <span className="text-lg font-bold text-emerald-600">K{formatCurrency(activeContract?.TotalAmount || 0)}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-[160px]">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Car size={14} /> Fleet Size
          </div>
          <div className="py-1">
            <h2 className="text-3xl font-bold text-slate-900">{vehicles.length}</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Active Registered Assets</p>
          </div>
          <div className="pt-2 border-t border-slate-50 text-[9px] font-bold text-slate-400 uppercase">
            Verified Inventory
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Fleet Inventory</span>
        </div>
        <div className="divide-y divide-slate-100">
          {vehicles.map(v => (
            <div key={v.VehicleID} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm group-hover:scale-125 transition-transform"></div>
                <div>
                  <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">{v.NumberPlate}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">{v.Make} {v.Model} • {v.Year}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Status</p>
                <p className="text-[10px] font-black text-emerald-600 uppercase">{v.Status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FleetSection;
