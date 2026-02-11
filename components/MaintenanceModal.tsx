
import React, { useState, useEffect } from 'react';
import { X, Wrench, Calendar, User, Car, FileText, Send, CheckCircle, Loader2, DollarSign, Smartphone, WifiOff } from 'lucide-react';
import { MaintenanceRecord, MaintenanceStatus, Client, Vehicle, ClientStatus } from '../types';
import SearchableSelect from './SearchableSelect';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'add';
  record: MaintenanceRecord | null;
  clients: Client[];
  vehicles: Vehicle[];
  onSave: (record: MaintenanceRecord, triggerEmail: boolean) => Promise<void>;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ 
  isOpen, onClose, mode: initialMode, record, clients, vehicles, onSave 
}) => {
  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleNet = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleNet);
    window.addEventListener('offline', handleNet);
    return () => {
      window.removeEventListener('online', handleNet);
      window.removeEventListener('offline', handleNet);
    };
  }, []);

  useEffect(() => {
    if (initialMode === 'add') {
      setFormData({
        ID: `MNT-${Math.floor(10000 + Math.random() * 90000)}`,
        Date: new Date().toISOString().split('T')[0],
        Status: MaintenanceStatus.Scheduled,
        AssetIDs: [],
        Cost: 0,
        Description: ''
      });
      setSendEmail(true);
    } else if (record) {
      setFormData({ ...record });
      setSendEmail(false);
    }
    setIsSaving(false);
  }, [initialMode, record, isOpen]);

  if (!isOpen) return null;

  const handleClientChange = (clientId: string) => {
    if (isSaving) return;
    const client = clients.find(c => c.ClientID === clientId);
    setFormData(prev => ({ 
      ...prev, 
      ClientID: clientId, 
      ClientName: client?.CompanyName || '',
      AssetIDs: [] // Reset selected assets when client changes
    }));
  };

  const handleAssetToggle = (assetId: string) => {
    if (isSaving) return;
    setFormData(prev => {
      const current = prev.AssetIDs || [];
      const updated = current.includes(assetId) 
        ? current.filter(id => id !== assetId)
        : [...current, assetId];
      return { ...prev, AssetIDs: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !isOnline) return;
    if (!formData.ClientID || !formData.Description) return;
    setIsSaving(true);
    try {
      await onSave(formData as MaintenanceRecord, sendEmail);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const clientOptions = clients.map(c => ({
    value: c.ClientID,
    label: c.CompanyName,
    disabled: c.Status !== ClientStatus.Active,
    subtext: c.ClientType
  }));

  const clientVehicles = vehicles.filter(v => v.ClientID === formData.ClientID);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
             <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg">
                <Wrench size={24} />
             </div>
             <div>
               <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                 {initialMode === 'add' ? 'New Asset Service' : 'Service Record'}
               </h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ref: {formData.ID}</p>
             </div>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-2 text-slate-300 hover:text-slate-900 transition-colors disabled:opacity-30">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <fieldset disabled={isSaving}>
            <form id="maintenance-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <SearchableSelect 
                    label="Target Company" 
                    required 
                    options={clientOptions} 
                    value={formData.ClientID || ''} 
                    onChange={handleClientChange} 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Service Status</label>
                  <select 
                    value={formData.Status} 
                    onChange={e => setFormData({...formData, Status: e.target.value as MaintenanceStatus})}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs"
                  >
                    <option value={MaintenanceStatus.Scheduled}>Scheduled / Pending</option>
                    <option value={MaintenanceStatus.InProgress}>Currently In Progress</option>
                    <option value={MaintenanceStatus.Completed}>Task Completed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Service Date</label>
                  <input 
                    type="date" 
                    value={formData.Date} 
                    onChange={e => setFormData({...formData, Date: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Work Description</label>
                  <textarea 
                    required
                    value={formData.Description}
                    onChange={e => setFormData({...formData, Description: e.target.value})}
                    placeholder="Details of the repair or maintenance performed..."
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium resize-none focus:ring-4 focus:ring-indigo-50 transition-all"
                  />
                </div>

                {formData.ClientID && clientVehicles.length > 0 && (
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Affect Assets</label>
                    <div className="grid grid-cols-2 gap-2">
                        {clientVehicles.map(v => (
                          <button
                            key={v.VehicleID}
                            type="button"
                            onClick={() => handleAssetToggle(v.VehicleID)}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${formData.AssetIDs?.includes(v.VehicleID) ? 'bg-indigo-600 border-indigo-700 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Car size={16} className={formData.AssetIDs?.includes(v.VehicleID) ? 'text-indigo-200' : 'text-slate-300'} />
                            <div className="min-w-0">
                                <p className="text-[10px] font-black font-mono leading-none">{v.NumberPlate}</p>
                                <p className={`text-[8px] font-bold uppercase truncate mt-0.5 ${formData.AssetIDs?.includes(v.VehicleID) ? 'text-indigo-300' : 'text-slate-400'}`}>{v.Make} {v.Model}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {formData.Status === MaintenanceStatus.Completed && (
                <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden border border-slate-800 animate-in zoom-in duration-300">
                    <div className="absolute right-0 top-0 p-6 opacity-5 rotate-12"><Send size={80} /></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl transition-all duration-500 ${sendEmail ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800 text-slate-600'}`}>
                            <CheckCircle size={18} />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-black uppercase tracking-widest leading-none">Completion Dispatch</h4>
                            <p className={`text-[8px] font-bold uppercase mt-1.5 ${sendEmail ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {sendEmail ? 'Client will receive service confirmation' : 'Silent record update only'}
                            </p>
                          </div>
                      </div>
                      <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => setSendEmail(!sendEmail)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${sendEmail ? 'bg-emerald-500' : 'bg-slate-800'}`}
                      >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${sendEmail ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                </div>
              )}
            </form>
          </fieldset>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end items-center gap-4 shrink-0">
          {!isOnline && (
            <div className="flex items-center gap-2 text-rose-500 font-black text-[9px] uppercase tracking-widest mb-2 sm:mb-0">
              <WifiOff size={14} /> Offline Mode: Registry Locked
            </div>
          )}
          <button onClick={onClose} disabled={isSaving} className="px-8 py-3 text-slate-400 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30">Cancel</button>
          <button 
            form="maintenance-form" 
            type="submit" 
            disabled={isSaving || !isOnline} 
            className={`px-12 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all min-w-[180px] ${isOnline ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {isSaving ? 'Processing...' : (initialMode === 'add' ? 'Log Maintenance' : 'Update Record')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal;
