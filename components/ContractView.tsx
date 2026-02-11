
import React from 'react';
/* Fix: ShieldInfo is not an exported member of lucide-react. Replaced with Shield. */
import { Layers, Calendar, Clock, Calculator, User, Car, FileText, Eye, FileCheck, Shield, Briefcase } from 'lucide-react';
import { Contract, Agent, Vehicle } from '../types';
import { formatDate, formatCurrency } from '../constants';

interface ContractViewProps {
  contract: Partial<Contract>;
  agents: Agent[];
  vehicles: Vehicle[];
  onPreview: () => void;
}

const DetailRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number | undefined }) => (
  <div className="flex items-start p-3 bg-gray-50 rounded-lg">
    <div className="p-2 bg-white rounded-md border border-gray-100 mr-3 text-indigo-600"><Icon size={18} /></div>
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-semibold mt-1 text-slate-800">{value || '0'}</p>
    </div>
  </div>
);

const ContractView: React.FC<ContractViewProps> = ({ contract, agents, vehicles, onPreview }) => {
  // Robustly find vehicles matching the contract's AssetIDs
  const selectedIDs = (contract.AssetIDs || []).map(id => String(id).trim().toLowerCase());
  const linkedVehicles = vehicles.filter(v => {
    const vID = String(v.VehicleID || '').trim().toLowerCase();
    return selectedIDs.includes(vID);
  });

  // Robustly find the agent name, avoiding '0' display
  const assignedAgent = agents.find(a => String(a.AgentID) === String(contract.AssignedAgentID));
  const agentName = assignedAgent ? assignedAgent.AgentName : (contract.AssignedAgentID && contract.AssignedAgentID !== '0' ? contract.AssignedAgentID : 'Unassigned');

  return (
    <div className="space-y-6">
      {/* FORMAL AGREEMENT IDENTITY */}
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
         <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Briefcase size={120} /></div>
         <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
               {/* Fix: Replaced non-existent ShieldInfo with Shield icon */}
               <div className="p-2 bg-white/20 rounded-xl"><Shield size={20} /></div>
               <h3 className="text-sm font-black uppercase tracking-[0.2em]">Nature of Agreement</h3>
            </div>
            <p className="text-xs text-indigo-50 leading-relaxed font-medium">
               This agreement is for the supply and installation of <span className="font-bold text-white">GPS Tracking or Dashcam hardware</span>, and the provision of access to a <span className="font-bold text-white">digital tracking platform</span>. 
               The service allows <span className="font-bold text-white">{contract.ClientName}</span> to monitor vehicles in real-time, view route history, and receive technical support for asset management.
            </p>
         </div>
      </div>

      <div className="bg-white border border-gray-100 p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="space-y-1">
           <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{contract.PlanType || 'Standard'}</h3>
              <div className="flex gap-1.5">
                 <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider">
                    <Eye size={10} className="mr-1"/> Digital Registry
                 </span>
                 <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${contract.ContractStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                    {contract.ContractStatus}
                 </span>
              </div>
           </div>
           <div className="flex items-center text-slate-500 text-sm font-medium">
              <User size={14} className="mr-1.5 opacity-50"/> 
              <span className="tracking-tight">{contract.ClientName || 'N/A'}</span>
           </div>
        </div>
        
        <div className="w-full sm:w-auto text-left sm:text-right border-t sm:border-0 pt-4 sm:pt-0">
           <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.15em] mb-1">Service Value</p>
           <div className="flex items-baseline sm:justify-end gap-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tighter">K{formatCurrency(contract.TotalAmount)}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">/{contract.BillingCycle}</span>
           </div>
           {contract.ClientSign && (
              <div className="mt-1 flex sm:justify-end">
                 <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100"><FileCheck size={10} className="mr-1"/> Legally Executed</span>
              </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <DetailRow icon={Layers} label="Technology Type" value={contract.ServiceType} />
        <DetailRow icon={Calendar} label="Effective Date" value={formatDate(contract.StartDate)} />
        <DetailRow icon={Clock} label="Agreement Maturity" value={formatDate(contract.ExpiryDate)} />
        <DetailRow icon={Calculator} label="Asset Nodes" value={contract.NoOfUnits} />
        <DetailRow icon={User} label="Managing Agent" value={agentName} />
        <DetailRow icon={Clock} label="Renewal Frequency" value={contract.BillingCycle} />
      </div>

      {linkedVehicles.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <Car size={16} className="text-slate-400" />
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Targeted Hardware Inventory</h4>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[9px] uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-bold">Registration</th>
                  <th className="px-5 py-3 font-bold">Asset Model</th>
                  <th className="px-5 py-3 font-bold">Digital Identity (IMEI)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {linkedVehicles.map(v => (
                  <tr key={v.VehicleID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">{v.NumberPlate}</td>
                    <td className="px-5 py-3 text-slate-600">{v.Year} {v.Make} {v.Model}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{v.DeviceSerial}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center shadow-lg shadow-slate-900/10">
          <div className="mb-4 md:mb-0">
              <h4 className="font-bold text-lg flex items-center"><FileText size={20} className="mr-2 text-blue-400"/> Contractual Instrument</h4>
              <p className="text-sm text-slate-300 mt-1 max-w-md">The binding legal document containing exhaustive terms, conditions, and inventory schedules.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
              <button onClick={onPreview} className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest border border-slate-700 shadow-xl active:scale-95">Open Document View</button>
          </div>
      </div>
    </div>
  );
};

export default ContractView;
