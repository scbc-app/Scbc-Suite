
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Edit, Trash2, Car, Calendar, Link as LinkIcon, AlertCircle, Wrench, Smartphone, Signal, FileText, Camera, Upload, Trash, Loader2, WifiOff } from 'lucide-react';
import { Vehicle, VehicleStatus, Client, ClientStatus } from '../types';
import { formatDate } from '../constants';
import SearchableSelect from './SearchableSelect';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'add';
  vehicle: Vehicle | null;
  clients: Client[];
  onSave: (vehicle: Vehicle) => Promise<void>;
  onDelete?: (vehicleId: string) => void;
}

const VehicleModal: React.FC<VehicleModalProps> = ({ 
  isOpen, onClose, mode: initialMode, vehicle, clients, onSave, onDelete 
}) => {
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>(initialMode);
  const [formData, setFormData] = useState<Partial<Vehicle>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Track the ID of the vehicle being viewed to prevent accidental state resets
  const activeVehicleIdRef = useRef<string | null>(null);

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
    if (isOpen) {
      if (activeVehicleIdRef.current !== (vehicle?.VehicleID || 'new')) {
        setMode(initialMode);
        activeVehicleIdRef.current = vehicle?.VehicleID || 'new';
        
        if (initialMode === 'add') {
          setFormData({
            VehicleID: `VH-${Math.floor(2000 + Math.random() * 9000)}`,
            InstallationDate: new Date().toISOString().split('T')[0],
            Status: VehicleStatus.Active,
            Year: new Date().getFullYear().toString(),
            SimNumber: '',
            NetworkProvider: '',
            Photo: ''
          });
        } else if (vehicle) {
          setFormData({ ...vehicle });
        }
      }
      setIsSaving(false);
    } else {
      activeVehicleIdRef.current = null;
    }
  }, [isOpen, vehicle, initialMode]);

  const clientOptions = clients.map(c => ({
    value: c.ClientID,
    label: c.CompanyName,
    disabled: c.Status !== ClientStatus.Active,
    subtext: c.Status !== ClientStatus.Active ? 'Inactive Account' : c.ClientType
  }));

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isSaving) return;
    const { name, value } = e.target;
    if (name === 'NumberPlate') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (clientId: string) => {
      if (isSaving) return;
      const selectedClient = clients.find(c => c.ClientID === clientId);
      setFormData(prev => ({ 
        ...prev, 
        ClientID: clientId, 
        ClientName: selectedClient?.CompanyName || '' 
      }));
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSaving) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, Photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (e: React.MouseEvent) => {
    if (isSaving) return;
    e.stopPropagation();
    setFormData(prev => ({ ...prev, Photo: '' }));
  };

  const triggerCapture = () => {
    if (mode !== 'view' && !isSaving) {
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !isOnline) return;
    if (formData.NumberPlate && formData.ClientID) {
      setIsSaving(true);
      try {
        await onSave(formData as Vehicle);
        onClose();
      } finally {
        setIsSaving(false);
      }
    }
  };

  const DetailRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | undefined }) => (
    <div className="flex items-center p-3 border-b border-gray-100 last:border-0">
      <div className="text-gray-400 mr-3">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 uppercase font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-3">
             <div className={`p-2 rounded-lg ${mode === 'view' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                <Car size={24} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-slate-800">
                 {mode === 'view' ? 'Vehicle Details' : mode === 'edit' ? 'Edit Vehicle' : 'Register Vehicle'}
               </h2>
               <p className="text-sm text-gray-500">
                 {mode === 'view' ? `Viewing ${formData.NumberPlate}` : 'Manage GPS/Dashcam installation'}
               </p>
             </div>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'view' ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Car size={80} />
                </div>
                
                {formData.Photo ? (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl hidden sm:block">
                     <img src={formData.Photo} alt="Vehicle" className="w-full h-full object-cover" />
                  </div>
                ) : null}

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                       <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">License Plate</p>
                       <h3 className="text-2xl font-mono font-bold tracking-wider text-white border-2 border-white/50 inline-block px-3 py-1 rounded mt-1 shadow-sm">
                         {formData.NumberPlate}
                       </h3>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${formData.Status === 'Active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}`}>
                        {formData.Status}
                     </span>
                  </div>
                  
                  {formData.Photo && (
                    <div className="sm:hidden mb-4 w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20">
                       <img src={formData.Photo} alt="Vehicle" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/10 pt-4">
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">Make/Model</p>
                      <p className="font-semibold text-white/90">{formData.Year} {formData.Make} {formData.Model}</p>
                    </div>
                    <div>
                       <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">Client Owner</p>
                       <p className="font-semibold text-white/90 truncate max-w-[120px]">{formData.ClientName}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                   <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center"><Wrench size={16} className="mr-2"/> Device Configuration</h4>
                   <div className="bg-white rounded-lg border border-gray-200">
                      <DetailRow icon={LinkIcon} label="Device Serial / IMEI" value={formData.DeviceSerial} />
                      <DetailRow icon={FileText} label="Service Type" value={formData.ServiceType} />
                      <DetailRow icon={Calendar} label="Installation Date" value={formatDate(formData.InstallationDate)} />
                   </div>
                </div>

                <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                   <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center"><Smartphone size={16} className="mr-2"/> SIM Connectivity</h4>
                   <div className="bg-white rounded-lg border border-blue-200">
                      <DetailRow icon={Smartphone} label="SIM Number" value={formData.SimNumber} />
                      <DetailRow icon={Signal} label="Network" value={formData.NetworkProvider} />
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <fieldset disabled={isSaving}>
              <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="col-span-1 md:col-span-2">
                    <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCapture} className="hidden" />
                    <div 
                      onClick={triggerCapture}
                      className={`relative overflow-hidden group cursor-pointer border-2 border-dashed rounded-2xl transition-all h-32 flex flex-col items-center justify-center ${formData.Photo ? 'border-transparent' : 'border-gray-200 hover:border-indigo-300 bg-gray-50 hover:bg-indigo-50/30'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {formData.Photo ? (
                        <>
                          <img src={formData.Photo} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
                          {!isSaving && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                              <div className="p-2 bg-white rounded-full text-indigo-600"><Camera size={20} /></div>
                              <button type="button" onClick={removePhoto} className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"><Trash size={20} /></button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center">
                           <div className="mx-auto w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-indigo-500 mb-2 transition-colors">
                              <Camera size={24} />
                           </div>
                           <p className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Capture Vehicle Picture</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <SearchableSelect label="Client Owner" required options={clientOptions} value={formData.ClientID || ''} onChange={handleClientChange} placeholder="Search and Select Client..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">License Plate *</label>
                    <input required type="text" name="NumberPlate" value={formData.NumberPlate || ''} onChange={handleChange} placeholder="e.g. TX-990-ZZ" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Vehicle Status</label>
                    <select name="Status" value={formData.Status} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value={VehicleStatus.Active}>Active</option>
                      <option value={VehicleStatus.Inactive}>Inactive</option>
                      <option value={VehicleStatus.Maintenance}>Maintenance</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Make</label>
                    <input type="text" name="Make" value={formData.Make || ''} onChange={handleChange} placeholder="Toyota" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Model</label>
                    <input type="text" name="Model" value={formData.Model || ''} onChange={handleChange} placeholder="Corolla" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Year</label>
                    <input type="number" name="Year" value={formData.Year || ''} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Device Serial (IMEI)</label>
                    <input type="text" name="DeviceSerial" value={formData.DeviceSerial || ''} onChange={handleChange} placeholder="IMEI-..." className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Service Type (Contract)</label>
                    <input type="text" name="ServiceType" value={formData.ServiceType || ''} onChange={handleChange} placeholder="e.g. GPS Premium" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="text-sm font-bold text-blue-800 mb-3">Tracker SIM Configuration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">SIM Number</label>
                            <input type="text" name="SimNumber" value={formData.SimNumber || ''} onChange={handleChange} placeholder="09XX..." className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Network Provider</label>
                            <select name="NetworkProvider" value={formData.NetworkProvider || ''} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                              <option value="">-- Select --</option>
                              <option value="MTN">MTN</option>
                              <option value="Airtel">Airtel</option>
                              <option value="Zamtel">Zamtel</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Installation Date</label>
                    <input type="date" name="InstallationDate" value={formData.InstallationDate || ''} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </form>
            </fieldset>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-end items-center gap-3">
          {!isOnline && mode !== 'view' && (
            <div className="flex items-center gap-2 text-rose-500 font-black text-[9px] uppercase tracking-widest mb-2 sm:mb-0">
              <WifiOff size={14} /> Offline Mode: Registry Locked
            </div>
          )}
          {mode === 'view' ? (
            <>
               {onDelete && (
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this vehicle?')) {
                      onDelete(formData.VehicleID!);
                      onClose();
                    }
                  }}
                  className="flex items-center px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium"
                >
                  <Trash2 size={18} className="mr-2" />
                  Delete
                </button>
               )}
               <button 
                  onClick={() => setMode('edit')}
                  className="flex items-center px-6 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors font-medium shadow-lg shadow-slate-900/20"
                >
                  <Edit size={18} className="mr-2" />
                  Edit
                </button>
            </>
          ) : (
            <>
              <button onClick={onClose} disabled={isSaving} type="button" className="px-5 py-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors font-medium">Cancel</button>
              <button 
                form="vehicle-form" 
                type="submit" 
                disabled={isSaving || !isOnline} 
                className={`flex items-center px-6 py-2 rounded-lg transition-colors font-medium shadow-lg min-w-[160px] justify-center ${isOnline ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                {isSaving ? 'Processing...' : (mode === 'add' ? 'Register Vehicle' : 'Save Changes')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleModal;
