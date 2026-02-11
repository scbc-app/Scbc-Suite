
import React from 'react';
import { Building2, Store, User, CheckCircle2, Briefcase, Percent, Lock, Eye, EyeOff, Mail, Send, Info } from 'lucide-react';
import { Client, ClientStatus, Agent } from '../../types';

interface ClientFormProps {
  formData: Partial<Client>;
  agents: Agent[];
  isSaving: boolean;
  isAgentRestricted: boolean;
  isPortalEnabled: boolean;
  tempPassword: string;
  showPassword: boolean;
  passwordError: string;
  sendEmail: boolean;
  onSetSendEmail: (val: boolean) => void;
  onSetClientType: (type: 'Corporate' | 'SME' | 'Individual') => void;
  onTogglePortal: () => void;
  onSetTempPassword: (val: string) => void;
  onSetShowPassword: (val: boolean) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onAgentChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const FormInput = ({ label, required, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label} {required && '*'}</label>
    <input {...props} className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium" />
  </div>
);

const PortalAccessSection = ({ 
  isEnabled, 
  onToggle, 
  password, 
  setPassword, 
  showPassword, 
  setShowPassword, 
  error,
  forcePasswordChange,
  showWalkthrough,
  onCheckboxChange,
  isSaving
}: any) => (
  <div className="col-span-1 md:col-span-2 bg-slate-900 rounded-2xl p-6 text-white mt-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${isEnabled ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-500'}`}>
          <Lock size={18} strokeWidth={2} />
        </div>
        <div>
          <h4 className="text-11px font-bold uppercase tracking-widest">Portal Credentials</h4>
          <p className="text-[9px] text-slate-400 font-medium tracking-wide">Secure self-service node for client interaction.</p>
        </div>
      </div>
      <button type="button" disabled={isSaving} onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isEnabled ? 'bg-indigo-500' : 'bg-slate-800'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
    
    {isEnabled && (
      <div className="mt-6 pt-6 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="mb-4">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Set Access Pin / Password</label>
          <div className="relative mt-2">
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSaving}
              placeholder="Enter temporary password..."
              className={`w-full p-2.5 pr-12 bg-slate-800 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-mono tracking-widest text-white ${error ? 'border-rose-500' : 'border-slate-700'}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-slate-500 hover:text-white transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-[9px] text-rose-400 mt-2 font-bold uppercase tracking-widest">{error}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input name="ForcePasswordChange" type="checkbox" disabled={isSaving} checked={forcePasswordChange} onChange={onCheckboxChange} className="w-4 h-4 text-indigo-500 border-slate-700 bg-slate-800 rounded focus:ring-indigo-500" />
            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Strict Password Reset</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input name="ShowWalkthrough" type="checkbox" disabled={isSaving} checked={showWalkthrough} onChange={onCheckboxChange} className="w-4 h-4 text-indigo-500 border-slate-700 bg-slate-800 rounded focus:ring-indigo-500" />
            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Guided Onboarding</span>
          </label>
        </div>
      </div>
    )}
  </div>
);

const ClientForm: React.FC<ClientFormProps> = ({ 
  formData, agents, isSaving, isAgentRestricted, isPortalEnabled, tempPassword, showPassword, passwordError, sendEmail, onSetSendEmail,
  onSetClientType, onTogglePortal, onSetTempPassword, onSetShowPassword, onChange, onAgentChange, onCheckboxChange, onSubmit
}) => {
  const isIndividual = formData.ClientType === 'Individual';

  return (
    <form id="client-form" onSubmit={onSubmit} className="px-8 pb-10 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-50 pb-1">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Classification</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {['Corporate', 'SME', 'Individual'].map((type: any) => (
            <div 
              key={type}
              onClick={() => !isSaving && onSetClientType(type)}
              className={`relative p-2 rounded-xl border-2 transition-all cursor-pointer group flex flex-col items-center text-center gap-1 ${formData.ClientType === type ? 'bg-indigo-50 border-indigo-500 ring-4 ring-indigo-500/5' : 'bg-white border-slate-100 hover:border-indigo-100'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {formData.ClientType === type && <CheckCircle2 size={12} className="absolute top-1.5 right-1.5 text-indigo-500 animate-in zoom-in" />}
              <div className={`p-1.5 rounded-lg transition-colors ${formData.ClientType === type ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-400'}`}>
                {type === 'Corporate' ? <Building2 size={18} /> : type === 'SME' ? <Store size={18} /> : <User size={18} />}
              </div>
              <p className={`text-[9px] font-bold uppercase tracking-wider ${formData.ClientType === type ? 'text-indigo-900' : 'text-slate-500'}`}>{type}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Primary Identity</h3>
        </div>
        <FormInput required label={isIndividual ? "Full Legal Name" : "Registered Entity Name"} name="CompanyName" value={formData.CompanyName || ''} onChange={onChange} disabled={isSaving} />
        
        {isIndividual ? (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Gender *</label>
              <select required name="Gender" value={formData.Gender || ''} onChange={onChange} disabled={isSaving} className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium">
                <option value="" disabled>-- Select Gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
        ) : (
            <FormInput required label="Primary Contact Person" name="PrimaryContactName" value={formData.PrimaryContactName || ''} onChange={onChange} disabled={isSaving} />
        )}

        {isIndividual && <FormInput label="NRC Number (Individual)" name="NRC" value={formData.NRC || ''} onChange={onChange} disabled={isSaving} placeholder="000000/00/0" />}

        <div className={isIndividual ? "col-span-1" : "col-span-1 md:col-span-2"}>
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Registry Status</label>
            <select name="Status" value={formData.Status} onChange={onChange} disabled={isSaving} className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium">
              <option value={ClientStatus.Active}>Active</option>
              <option value={ClientStatus.Inactive}>Inactive</option>
              <option value={ClientStatus.Suspended}>Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2"><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Reach & Logistics</h3></div>
        <FormInput required type="email" label="Global Email Address" name="Email" value={formData.Email || ''} onChange={onChange} disabled={isSaving} />
        <FormInput required label="Primary Phone Line" name="Phone" value={formData.Phone || ''} onChange={onChange} disabled={isSaving} />
        <FormInput label="Alternative Phone" name="AltPhone" value={formData.AltPhone || ''} onChange={onChange} disabled={isSaving} />
        <div className="col-span-1 md:col-span-2"><FormInput label="Full Address" name="BillingAddress" value={formData.BillingAddress || ''} onChange={onChange} disabled={isSaving} /></div>
      </div>
      
      <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center space-x-2 mb-4"><Briefcase size={16} className="text-slate-400"/><h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-widest">Account Manager</h4></div>
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-slate-500 uppercase">Assigned Agent</label>
          <select disabled={isAgentRestricted || isSaving} name="AssignedAgentID" value={formData.AssignedAgentID || ''} onChange={onAgentChange} className="w-full p-2.5 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium">
            <option value="">-- Select Agent --</option>
            {agents.map(a => <option key={a.AgentID} value={a.AgentID}>{a.AgentName}</option>)}
          </select>
          <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Note: Commission protocol is managed globally via the Team Access module.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={`p-2.5 rounded-xl ${sendEmail ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                <Mail size={18} />
             </div>
             <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest">Onboarding Notification</h4>
                <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Send a professional welcome email to the client</p>
             </div>
          </div>
          <button 
            type="button" 
            onClick={() => onSetSendEmail(!sendEmail)}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${sendEmail ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${sendEmail ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <PortalAccessSection 
        isEnabled={isPortalEnabled} onToggle={onTogglePortal}
        password={tempPassword} setPassword={onSetTempPassword}
        showPassword={showPassword} setShowPassword={onSetShowPassword}
        error={passwordError} forcePasswordChange={formData.ForcePasswordChange}
        showWalkthrough={formData.ShowWalkthrough} onCheckboxChange={onCheckboxChange}
        isSaving={isSaving}
      />
    </form>
  );
};

export default ClientForm;
