
import React from 'react';
import { DollarSign, Car, AlertTriangle, CheckSquare, Square, CheckCircle2, CreditCard, Clock, Calendar, ShieldCheck, Handshake } from 'lucide-react';
import { Contract, Client, ContractStatus, Vehicle, ServicePlan } from '../types';
import { formatCurrency, formatDate, toISODate } from '../constants';
import SearchableSelect from './SearchableSelect';

interface ContractFormProps {
  formData: Partial<Contract>;
  clientOptions: any[];
  groupedPlans: Record<string, ServicePlan[]>;
  selectedPlanID: string;
  isCustomPlan: boolean;
  clientVehicles: Vehicle[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onClientChange: (id: string) => void;
  onAssetToggle: (id: string) => void;
  onSelectAll?: () => void;
}

const ContractForm: React.FC<ContractFormProps> = ({ 
  formData, clientOptions, groupedPlans, selectedPlanID, isCustomPlan, clientVehicles, onChange, onClientChange, onAssetToggle, onSelectAll 
}) => {
  const selectedCount = Array.isArray(formData.AssetIDs) ? formData.AssetIDs.length : 0;
  const isAllSelected = clientVehicles.length > 0 && selectedCount === clientVehicles.length;

  return (
    <div className="space-y-6">
      {/* FORMAL AGREEMENT PREAMBLE */}
      <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute right-0 top-0 p-6 opacity-5 rotate-12"><Handshake size={80} /></div>
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-500 rounded-xl"><ShieldCheck size={18} /></div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Service Level Commitment</h3>
             </div>
             <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-wider">
                This agreement is for the supply and installation of <span className="text-indigo-400 font-black">GPS Tracking or Dashcam hardware</span>, and the provision of access to a <span className="text-indigo-400 font-black">digital tracking platform</span>. The service allows the Client to monitor vehicles in real-time, view route history, and receive technical support for asset management.
             </p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <SearchableSelect label="Client / Subscriber" required options={clientOptions} value={formData.ClientID || ''} onChange={onClientChange} placeholder="Select Client..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Contract Standing</label>
          <select name="ContractStatus" value={formData.ContractStatus} onChange={onChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            <option value={ContractStatus.Active}>Active / Enforced</option>
            <option value={ContractStatus.Expired}>Matured / Expired</option>
            <option value={ContractStatus.Cancelled}>Terminated</option>
          </select>
        </div>

        {formData.ClientID && (
          <div className="col-span-1 md:col-span-2 bg-indigo-50 border border-indigo-100 rounded-xl p-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-indigo-900">
                <Car size={18} />
                <h4 className="font-bold">Subject Assets (Hardware Nodes)</h4>
              </div>
              
              <div className="flex items-center gap-2">
                {clientVehicles.length > 0 && onSelectAll && (
                  <button 
                    type="button" 
                    onClick={onSelectAll}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isAllSelected ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'}`}
                  >
                    <CheckCircle2 size={12} />
                    {isAllSelected ? 'Deselect All' : 'Select All'}
                  </button>
                )}
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-white px-2 py-1.5 rounded shadow-sm border border-indigo-100">
                  {selectedCount} Units Targeted
                </span>
              </div>
            </div>
            
            {clientVehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {clientVehicles.map(vehicle => {
                  const isSelected = Array.isArray(formData.AssetIDs) && formData.AssetIDs.includes(vehicle.VehicleID);
                  return (
                    <div 
                      key={vehicle.VehicleID}
                      onClick={() => onAssetToggle(vehicle.VehicleID)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-indigo-600 border-indigo-700 text-white shadow-md' : 'bg-white border-indigo-100 text-indigo-900 hover:border-indigo-400'}`}
                    >
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} className="text-indigo-200" />}
                      <div className="min-w-0">
                        <p className="text-xs font-bold font-mono tracking-wider">{vehicle.NumberPlate}</p>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>IMEI: {vehicle.DeviceSerial}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 bg-white/50 border border-dashed border-indigo-200 rounded-lg">
                <AlertTriangle size={24} className="mx-auto text-indigo-300 mb-2" />
                <p className="text-xs font-medium text-indigo-700">No active vehicles found for this client.</p>
              </div>
            )}
          </div>
        )}

        <div className="col-span-1 md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Service Plan Classification *</label>
                    <select name="PlanID" value={selectedPlanID} onChange={onChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none">
                        <option value="">-- Select Plan --</option>
                        {Object.keys(groupedPlans).map(category => (
                            <optgroup key={category} label={category}>
                                {groupedPlans[category].map(plan => (<option key={plan.PlanID} value={plan.PlanID}>{plan.Type} - K{plan.BasePrice}</option>))}
                            </optgroup>
                        ))}
                        <option value="custom">-- Ad-hoc Custom Plan --</option>
                    </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Renewal Cycle</label>
                  <select name="BillingCycle" value={formData.BillingCycle} onChange={onChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none">
                    <option value="Monthly">Monthly Recurring</option>
                    <option value="Quarterly">Quarterly Cycle</option>
                    <option value="Annual">Annual Commitment</option>
                    <option value="Term">Fixed Term</option>
                    <option value="Once-off">One-Time Provision</option>
                  </select>
                </div>
            </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-700 border-b border-slate-200 pb-2">
            <CreditCard size={18} />
            <h4 className="font-bold text-sm">Settlement Terms</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preferred Method</label>
              <select name="PaymentMethod" value={formData.PaymentMethod || 'Bank Transfer'} onChange={onChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Cash">Direct Cash</option>
                <option value="Cheque">Corporate Cheque</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">First Payment Due</label>
              <input type="date" name="PaymentDueDate" value={toISODate(formData.PaymentDueDate)} onChange={onChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Agreement Activation Date</label>
          <input type="date" name="StartDate" value={toISODate(formData.StartDate)} onChange={onChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Term Length (Months)</label>
          <input type="number" name="DurationMonths" value={formData.DurationMonths || 0} onChange={onChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between shadow-xl">
         <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400">
               <Calendar size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none">Agreement Expiration</p>
               <h4 className="text-lg font-black text-white mt-1 uppercase tracking-tight">
                  {formData.ExpiryDate ? formatDate(formData.ExpiryDate) : 'Pending Data Entry'}
               </h4>
            </div>
         </div>
         <div className="text-right">
            <span className="text-[8px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded">Auto-Calculated</span>
         </div>
      </div>

      <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center"><DollarSign size={16} className="mr-2 text-green-600"/> Portfolio Valuations</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Unit Price</label>
              <input type="number" step="0.01" name="UnitPrice" value={formData.UnitPrice || 0} onChange={onChange} readOnly={!isCustomPlan} className={`w-full p-2 border border-gray-200 rounded ${!isCustomPlan ? 'bg-gray-100 text-gray-500' : 'bg-white'}`} />
           </div>
           <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Asset Count</label>
              <input type="number" name="NoOfUnits" value={formData.NoOfUnits || 0} onChange={onChange} className="w-full p-2 border border-gray-200 rounded bg-white font-bold text-slate-900" />
           </div>
           <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Maintenance Fees</label>
              <input type="number" step="0.01" name="AdditionalCost" value={formData.AdditionalCost || 0} onChange={onChange} className="w-full p-2 border border-gray-200 rounded bg-white" />
           </div>
           <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Client Discount</label>
              <input type="number" step="0.01" name="Discount" value={formData.Discount || 0} onChange={onChange} className="w-full p-2 border border-gray-200 rounded bg-white" />
           </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end items-center">
           <span className="text-sm font-medium text-gray-500 mr-3">Unified Total ({formData.BillingCycle}):</span>
           <span className="text-xl font-bold text-emerald-600">K{formatCurrency(formData.TotalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default ContractForm;
