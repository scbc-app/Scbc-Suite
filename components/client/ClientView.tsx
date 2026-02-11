
import React from 'react';
import { User, Building2, Mail, Phone, Smartphone, MapPin, Briefcase, Percent, Calendar, ShieldCheck, Activity, Contact, UserCircle } from 'lucide-react';
import { Client, ClientStatus, Agent } from '../../types';
import { formatDate } from '../../constants';

interface ClientViewProps {
  formData: Partial<Client>;
  agentDisplayName: string;
}

const ProfileAvatarSection = ({ status }: { status?: ClientStatus }) => (
  <div className="relative mb-2">
    <div className="w-16 h-16 rounded-2xl border border-slate-100 flex items-center justify-center bg-white shadow-sm ring-4 ring-slate-50 relative">
      <User size={28} strokeWidth={1.5} className="text-slate-400" />
    </div>
    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${status === ClientStatus.Active ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
  </div>
);

const ClientIdentityHeader = ({ name, type, id }: { name?: string, type?: string, id?: string }) => {
  const getDisplayType = () => {
    switch(type) {
      case 'Individual': return 'Personal Account';
      case 'SME': return 'SME Business';
      case 'Corporate': return 'Enterprise Entity';
      default: return type || 'Client';
    }
  };

  return (
    <div className="text-center mb-4">
      <h3 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1.5 px-4">
        {name || 'Unknown Client'}
      </h3>
      <div className="flex items-center justify-center gap-2">
        <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-widest">
          {getDisplayType()}
        </span>
        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest border border-slate-100 px-1 rounded">ID: {id || '---'}</span>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value, colorClass = "text-slate-700", isEven = false }: { icon: any, label: string, value?: string | number, colorClass?: string, isEven?: boolean }) => (
  <div className={`flex items-center justify-between py-2.5 px-4 border-b border-slate-100 transition-colors group ${isEven ? 'bg-slate-50/40' : 'bg-white'}`}>
    <div className="flex items-center gap-2">
      <Icon size={12} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <span className={`text-[11px] font-bold text-right truncate max-w-[130px] ${colorClass}`}>
      {value || '—'}
    </span>
  </div>
);

const ClientView: React.FC<ClientViewProps> = ({ formData, agentDisplayName }) => {
  const isIndividual = formData.ClientType === 'Individual';

  return (
    <div className="flex flex-col items-center px-4 pb-6 select-none">
      <ProfileAvatarSection status={formData.Status} />
      <ClientIdentityHeader name={formData.CompanyName} type={formData.ClientType} id={formData.ClientID} />
      
      <div className="w-full grid grid-cols-1 md:grid-cols-2 border border-slate-100 bg-white rounded-[1.5rem] overflow-hidden shadow-sm">
        <div className="md:border-r border-slate-100 flex flex-col">
          <div className="bg-slate-50/50 px-4 py-1.5 border-b border-slate-100">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Primary Details</span>
          </div>
          <InfoRow icon={isIndividual ? User : Building2} label={isIndividual ? "Legal Name" : "Entity Name"} value={formData.CompanyName} />
          {isIndividual && <InfoRow icon={UserCircle} label="Gender" value={formData.Gender} isEven />}
          {!isIndividual && <InfoRow icon={User} label="Primary Contact" value={formData.PrimaryContactName} isEven />}
          <InfoRow icon={Mail} label="Email Address" value={formData.Email} isEven={!isIndividual} />
          <InfoRow icon={Phone} label="Primary Phone" value={formData.Phone} isEven={isIndividual} />
          <InfoRow icon={Smartphone} label="Alt Phone" value={formData.AltPhone} isEven={!isIndividual} />
          <InfoRow icon={MapPin} label="Address" value={formData.BillingAddress} isEven={isIndividual} />
        </div>

        <div className="flex flex-col border-t md:border-t-0 border-slate-100">
          <div className="bg-slate-50/50 px-4 py-1.5 border-b border-slate-100">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Management & Meta</span>
          </div>
          {isIndividual && <InfoRow icon={Contact} label="NRC Number" value={formData.NRC} colorClass="text-indigo-600" />}
          <InfoRow icon={Briefcase} label="Assigned Agent" value={agentDisplayName} colorClass="text-slate-900" isEven={isIndividual} />
          <InfoRow icon={Percent} label="Comm. Protocol" value={`${formData.AgentCommissionRate || 0}%`} isEven={!isIndividual} />
          <InfoRow icon={Calendar} label="Active Since" value={formatDate(formData.OnboardingDate)} isEven={isIndividual} />
          <InfoRow icon={ShieldCheck} label="Portal Access" value={formData.PortalEnabled ? 'Enabled' : 'Restricted'} colorClass={formData.PortalEnabled ? 'text-emerald-600' : 'text-slate-400'} isEven={!isIndividual} />
          <InfoRow icon={Activity} label="Registry Status" value={formData.Status} colorClass={formData.Status === ClientStatus.Active ? 'text-emerald-600' : 'text-rose-600'} isEven={isIndividual} />
        </div>
      </div>
    </div>
  );
};

export default ClientView;
