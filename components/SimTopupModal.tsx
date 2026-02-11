
import React, { useState, useEffect } from 'react';
import { X, Smartphone, RefreshCw, Hash, DollarSign, CheckCircle, Loader2, Send, Layers } from 'lucide-react';
import { SimTopup, Vehicle } from '../types';
import { formatDate } from '../constants';

interface SimTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  agent: { id: string, name: string };
  onSave: (topups: SimTopup[], triggerEmail: boolean) => Promise<void>;
}

const SimTopupModal: React.FC<SimTopupModalProps> = ({ isOpen, onClose, vehicles, agent, onSave }) => {
  const [formData, setFormData] = useState<Partial<SimTopup>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [packageType, setPackageType] = useState<'30' | '180' | '365' | 'custom'>('30');

  const isBulk = vehicles.length > 1;

  useEffect(() => {
    if (vehicles.length > 0 && isOpen) {
      const v = vehicles[0];
      const today = new Date().toISOString().split('T')[0];
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);

      setFormData({
        ID: `SIM-${Math.floor(10000 + Math.random() * 90000)}`,
        Date: today,
        ExpiryDate: expiry.toISOString().split('T')[0],
        AgentID: agent.id,
        Reference: '',
        Amount: 50,
        VehicleID: v.VehicleID,
        Plate: v.NumberPlate,
        SimNumber: v.SimNumber,
        Network: v.NetworkProvider
      });
      setPackageType('30');
    }
  }, [vehicles, isOpen, agent]);

  const calculateExpiry = (startDate: string, days: string) => {
    if (!startDate || days === 'custom') return;
    const date = new Date(startDate);
    date.setDate(date.getDate() + parseInt(days));
    setFormData(prev => ({ ...prev, ExpiryDate: date.toISOString().split('T')[0] }));
  };

  const handlePackageChange = (type: any) => {
    setPackageType(type);
    if (type !== 'custom' && formData.Date) {
      calculateExpiry(formData.Date, type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ExpiryDate is the only strictly required logic field
    if (!formData.ExpiryDate) return;
    setIsSaving(true);
    
    try {
      const topups: SimTopup[] = vehicles.map((v, index) => ({
        ID: `SIM-${Math.floor(10000 + Math.random() * 90000)}-${index}`,
        VehicleID: v.VehicleID,
        Plate: v.NumberPlate,
        SimNumber: v.SimNumber,
        Network: v.NetworkProvider,
        Amount: formData.Amount || 0,
        Date: formData.Date!,
        ExpiryDate: formData.ExpiryDate!,
        AgentID: agent.id,
        Reference: formData.Reference || 'MANUAL-RENEW'
      }));

      await onSave(topups, sendEmail);
      onClose();
    } catch (err) {
      console.error("Renewal Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || vehicles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
        
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-lg">
                 {isBulk ? <Layers size={18} /> : <Smartphone size={18} />}
              </div>
              <div>
                 <h2 className="text-sm font-semibold text-slate-900 leading-tight">
                    {isBulk ? `Batch Renewal (${vehicles.length})` : 'SIM Renewal'}
                 </h2>
                 <p className="text-[10px] text-slate-400 font-medium">Security Protocol Active</p>
              </div>
           </div>
           <button onClick={onClose} className="p-1 text-slate-300 hover:text-slate-900"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
           {!isBulk ? (
             <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                <div className="min-w-0">
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Target Plate</p>
                   <p className="text-sm font-bold text-slate-900 font-mono tracking-tighter">{vehicles[0].NumberPlate}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">SIM Provider</p>
                   <p className="text-xs font-semibold text-slate-700">{vehicles[0].NetworkProvider}</p>
                </div>
             </div>
           ) : (
             <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
               <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-tighter">Processing Multi-Node Renewal</p>
               <p className="text-xs font-semibold text-indigo-700 mt-0.5">{vehicles.length} Assets in Queue</p>
             </div>
           )}

           <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                 <label className="text-[10px] font-semibold text-slate-400 uppercase">Service Plan</label>
                 <select value={packageType} onChange={(e) => handlePackageChange(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs font-medium">
                    <option value="30">Monthly</option>
                    <option value="180">6 Months</option>
                    <option value="365">Annual</option>
                    <option value="custom">Custom</option>
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-semibold text-slate-400 uppercase">Cost / SIM</label>
                 <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">K</span>
                    <input type="number" value={formData.Amount || 0} onChange={(e) => setFormData({...formData, Amount: parseFloat(e.target.value)})} className="w-full pl-6 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold" />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                 <label className="text-[10px] font-semibold text-slate-400 uppercase">Entry Date</label>
                 <input type="date" value={formData.Date} onChange={(e) => { setFormData({...formData, Date: e.target.value}); calculateExpiry(e.target.value, packageType); }} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-semibold text-slate-400 uppercase">Expiry Node</label>
                 <input type="date" value={formData.ExpiryDate || ''} onChange={(e) => setFormData({...formData, ExpiryDate: e.target.value})} readOnly={packageType !== 'custom'} className={`w-full p-2 border rounded-lg text-xs font-semibold ${packageType === 'custom' ? 'bg-slate-50 border-slate-200' : 'bg-indigo-50 border-indigo-100 text-indigo-600 cursor-not-allowed'}`} />
              </div>
           </div>

           <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Network Transaction ID (Optional)</label>
              <input value={formData.Reference || ''} onChange={(e) => setFormData({...formData, Reference: e.target.value})} placeholder="Ref from SMS..." className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-indigo-600 outline-none focus:border-indigo-300" />
           </div>

           <div className="flex items-center justify-between px-3 py-2 bg-slate-900 rounded-xl">
              <div className="flex items-center gap-2">
                 <Send size={12} className={sendEmail ? "text-emerald-400" : "text-slate-500"} />
                 <span className="text-[10px] font-medium text-slate-300">Notify Customer via Email</span>
              </div>
              <button type="button" onClick={() => setSendEmail(!sendEmail)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${sendEmail ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                 <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${sendEmail ? 'translate-x-4.5' : 'translate-x-1'}`} />
              </button>
           </div>

           <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600">Cancel</button>
              <button type="submit" disabled={isSaving} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center justify-center gap-2">
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {isBulk ? 'Commit Multi-Node' : 'Record Renewal'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default SimTopupModal;
