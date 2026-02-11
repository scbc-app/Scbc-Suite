
import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Database, Mail, Activity, Zap, FileText, CreditCard, 
  MessageSquare, Loader2, Info, AlertCircle, CheckCircle2, 
  RotateCcw, Globe, Smartphone, Building2, Phone, MapPin, Coins, 
  Percent, Image as ImageIcon, Shield, Settings2, BellRing, Network,
  Calendar, Camera, Upload
} from 'lucide-react';
import { SystemSetting, AppState } from '../types';
import { DEFAULT_SCRIPT_URL } from '../constants';
import { syncRow } from '../services/googleSheetsService';

interface SettingsProps {
  onSave: () => void;
  onSync: () => void;
  lastSyncTime: Date | null;
  appData: AppState;
}

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-6 py-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap
      ${active ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'}`}
  >
    <Icon size={14} />
    {label}
  </button>
);

const SectionHeader = ({ icon: Icon, title, subtitle }: any) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
      <Icon size={18} />
    </div>
    <div>
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-none">{title}</h3>
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">{subtitle}</p>
    </div>
  </div>
);

const FormField = ({ label, icon: Icon, children }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 ml-1">
      {Icon && <Icon size={12} />} {label}
    </label>
    {children}
  </div>
);

const ToggleRow = ({ label, icon: Icon, value, onChange, color }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color} shadow-sm group-hover:scale-110 transition-transform`}>
        <Icon size={16} />
      </div>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-indigo-600' : 'bg-slate-300'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const Settings: React.FC<SettingsProps> = ({ onSave, onSync, lastSyncTime, appData }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'finance' | 'notifications' | 'integration'>('profile');
  const [scriptUrl, setScriptUrl] = useState(DEFAULT_SCRIPT_URL);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<SystemSetting>({
    ID: '1', CompanyName: '', Address: '', Phone: '', Email: '', Website: '', Logo: '',
    DisbursementDay: 5, DefaultCommissionRate: 10, DefaultBonusRate: 500, IncentivesActive: true,
    EmailInvoicesEnabled: true, EmailPaymentsEnabled: true, EmailContractsEnabled: true,
    EmailTicketNewEnabled: true, EmailTicketUpdateEnabled: true, EmailTicketResolvedEnabled: true,
    PortalUrl: '', MobileAppLink: ''
  });

  useEffect(() => {
    const savedUrl = localStorage.getItem('omni_script_url');
    setScriptUrl(savedUrl || DEFAULT_SCRIPT_URL);
    if (appData?.systemSettings) {
      setSettings({ ...appData.systemSettings });
    }
  }, [appData]);

  const updateField = (field: keyof SystemSetting, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('Logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCommit = async () => {
    setIsUpdating(true);
    try {
      const url = (scriptUrl || localStorage.getItem('omni_script_url') || DEFAULT_SCRIPT_URL).trim();
      await syncRow(url, 'SystemSettings', 'update', settings, 'ID');
      localStorage.setItem('omni_script_url', url);
      onSave();
      alert("Settings updated successfully.");
    } catch (e: any) {
      console.error(e);
      alert(`Update failed: ${e.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetConnection = () => {
    if (confirm("Reset to default database connection?")) {
      setScriptUrl(DEFAULT_SCRIPT_URL);
      localStorage.setItem('omni_script_url', DEFAULT_SCRIPT_URL);
      onSave();
    }
  };

  const formattedSyncTime = lastSyncTime && !isNaN(lastSyncTime.getTime()) 
    ? lastSyncTime.toLocaleTimeString() 
    : 'Not Synced';

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0 px-2">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
              <Settings2 size={24} />
           </div>
           <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">System Settings</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                 Configure Organization & Automation <div className="w-1 h-1 rounded-full bg-slate-200"></div> 
                 Last Synced: {formattedSyncTime}
              </p>
           </div>
        </div>

        <button 
          onClick={handleCommit} 
          disabled={isUpdating}
          className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Configuration
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 min-h-0 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        
        {/* TAB NAVIGATION */}
        <div className="flex items-center border-b border-slate-50 bg-slate-50/30 px-6 overflow-x-auto no-scrollbar shrink-0">
          <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={Building2} label="Company Profile" />
          <TabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={Coins} label="Finance & Rates" />
          <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={BellRing} label="Email Notifications" />
          <TabButton active={activeTab === 'integration'} onClick={() => setActiveTab('integration')} icon={Network} label="Connectivity" />
        </div>

        {/* INTERNAL CONTENT AREA */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 bg-slate-50/10">
           <div className="max-w-5xl mx-auto">
              
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
                   <div className="space-y-6">
                      <SectionHeader icon={Building2} title="Organization Identity" subtitle="Primary business details" />
                      <div className="space-y-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="System ID (Auto)" icon={Shield}>
                               <input type="text" value={settings.ID} readOnly className="w-full p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-500 outline-none cursor-not-allowed" />
                            </FormField>
                            <FormField label="Company Name" icon={Building2}>
                               <input type="text" value={settings.CompanyName} onChange={e => updateField('CompanyName', e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                            </FormField>
                         </div>
                         <FormField label="Business Address" icon={MapPin}>
                            <input type="text" value={settings.Address} onChange={e => updateField('Address', e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                         </FormField>
                         <div className="grid grid-cols-2 gap-4">
                            <FormField label="Support Email" icon={Mail}>
                               <input type="email" value={settings.Email} onChange={e => updateField('Email', e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                            </FormField>
                            <FormField label="Contact Phone" icon={Phone}>
                               <input type="text" value={settings.Phone} onChange={e => updateField('Phone', e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                            </FormField>
                         </div>
                         <FormField label="Website" icon={Globe}>
                            <input type="text" value={settings.Website} onChange={e => updateField('Website', e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                         </FormField>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <SectionHeader icon={ImageIcon} title="Company Branding" subtitle="Logo for documents and emails" />
                      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-6">
                         <div 
                           onClick={() => fileInputRef.current?.click()}
                           className="w-40 h-40 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner group cursor-pointer hover:border-indigo-300 transition-all"
                         >
                            {settings.Logo ? (
                              <div className="relative w-full h-full group">
                                <img src={settings.Logo} className="w-full h-full object-contain p-4" alt="Logo" />
                                <div className="absolute inset-0 bg-indigo-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                   <Camera size={24} className="text-white" />
                                   <span className="text-[10px] font-bold text-white uppercase">Upload New</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-slate-300 group-hover:text-indigo-400 transition-colors">
                                <Upload size={40} />
                                <span className="text-[10px] font-bold uppercase">Click to Upload</span>
                              </div>
                            )}
                         </div>
                         <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                         <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                            <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                               Your logo will be automatically embedded in all generated Invoices, Quotations, and Service Agreements.
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'finance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
                   <div className="space-y-6">
                      <SectionHeader icon={Coins} title="Payment Cycles" subtitle="Standard disbursement settings" />
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                         <FormField label="Monthly Pay Day" icon={Calendar}>
                            <div className="flex items-center gap-4">
                               <input type="number" min="1" max="31" value={settings.DisbursementDay} onChange={e => updateField('DisbursementDay', Number(e.target.value))} className="w-24 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-center text-indigo-600 outline-none" />
                               <div className="flex-1">
                                  <p className="text-xs font-semibold text-slate-700 leading-none">Accounting Day</p>
                                  <p className="text-[10px] text-slate-400 font-medium mt-1">The date each month when commissions are finalized for payout.</p>
                               </div>
                            </div>
                         </FormField>
                         <FormField label="Default Commission Rate (%)" icon={Percent}>
                            <input type="number" value={settings.DefaultCommissionRate} onChange={e => updateField('DefaultCommissionRate', Number(e.target.value))} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-100 transition-all" />
                         </FormField>
                         <FormField label="Base Performance Bonus" icon={Zap}>
                            <input type="number" value={settings.DefaultBonusRate} onChange={e => updateField('DefaultBonusRate', Number(e.target.value))} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                         </FormField>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <SectionHeader icon={Shield} title="Rewards Engine" subtitle="Automated performance incentives" />
                      <div className="space-y-4">
                         <ToggleRow label="Enable Performance Incentives" icon={Activity} value={settings.IncentivesActive} onChange={(v:any) => updateField('IncentivesActive', v)} color="bg-emerald-50 text-emerald-600" />
                         <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl border border-slate-800">
                            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Activity size={100} /></div>
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Policy</h4>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                               When enabled, the system automatically calculates bonus overrides for staff members exceeding their monthly activation targets.
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
                   <div className="space-y-6">
                      <SectionHeader icon={BellRing} title="Customer Notifications" subtitle="Automated email trigger rules" />
                      <div className="space-y-3">
                         <ToggleRow label="Send New Ticket Confirmations" icon={MessageSquare} value={settings.EmailTicketNewEnabled} onChange={(v:any) => updateField('EmailTicketNewEnabled', v)} color="bg-indigo-50 text-indigo-600" />
                         <ToggleRow label="Send Ticket Update Alerts" icon={Activity} value={settings.EmailTicketUpdateEnabled} onChange={(v:any) => updateField('EmailTicketUpdateEnabled', v)} color="bg-amber-50 text-amber-600" />
                         <ToggleRow label="Send Resolution Notifications" icon={CheckCircle2} value={settings.EmailTicketResolvedEnabled} onChange={(v:any) => updateField('EmailTicketResolvedEnabled', v)} color="bg-emerald-50 text-emerald-600" />
                      </div>
                   </div>

                   <div className="space-y-6 pt-12 md:pt-14">
                      <div className="space-y-3">
                         <ToggleRow label="Dispatch Invoices via Email" icon={FileText} value={settings.EmailInvoicesEnabled} onChange={(v:any) => updateField('EmailInvoicesEnabled', v)} color="bg-slate-100 text-slate-600" />
                         <ToggleRow label="Dispatch Payment Receipts" icon={CreditCard} value={settings.EmailPaymentsEnabled} onChange={(v:any) => updateField('EmailPaymentsEnabled', v)} color="bg-emerald-50 text-emerald-600" />
                         <ToggleRow label="Dispatch Contract Dispatches" icon={Shield} value={settings.EmailContractsEnabled} onChange={(v:any) => updateField('EmailContractsEnabled', v)} color="bg-indigo-50 text-indigo-600" />
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'integration' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
                   <div className="space-y-6">
                      <SectionHeader icon={Network} title="External Access" subtitle="Client portal and app links" />
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                         <FormField label="Client Portal URL" icon={Globe}>
                            <input type="text" value={settings.PortalUrl} onChange={e => updateField('PortalUrl', e.target.value)} placeholder="https://portal.company.com" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                         </FormField>
                         <FormField label="Mobile App Store Link" icon={Smartphone}>
                            <input type="text" value={settings.MobileAppLink} onChange={e => updateField('MobileAppLink', e.target.value)} placeholder="https://play.google.com/store/..." className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                         </FormField>
                         <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                               Ensure these links are correct as they are included in all automated customer correspondence and signature requests.
                            </p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <SectionHeader icon={Database} title="Database Connection" subtitle="Google Sheets Registry Settings" />
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                         <FormField label="Google Script URL" icon={Database}>
                            <div className="relative">
                               <input 
                                 type="text" 
                                 value={scriptUrl} 
                                 onChange={(e) => setScriptUrl(e.target.value)} 
                                 className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-[10px] text-slate-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
                               />
                               <div className="absolute right-2 top-2">
                                  <button onClick={handleResetConnection} className="p-2 text-slate-300 hover:text-slate-900 transition-colors" title="Reset to Default">
                                     <RotateCcw size={16}/>
                                  </button>
                               </div>
                            </div>
                         </FormField>
                      </div>
                   </div>
                </div>
              )}

           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
