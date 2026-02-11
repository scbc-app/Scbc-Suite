
import React, { useState, useEffect } from 'react';
import { X, Loader2, WifiOff } from 'lucide-react';
import { Client, ClientStatus, Agent } from '../types';
import ClientView from './client/ClientView';
import ClientForm from './client/ClientForm';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'add';
  client: Client | null;
  agents: Agent[];
  currentUser?: { role: string; id: string; name: string };
  onSave: (client: Client, sendEmail?: boolean) => Promise<void>;
  onDelete?: (clientId: string) => void;
}

const normalizeID = (id: any): string => String(id || '').trim().toLowerCase();

const ClientModal: React.FC<ClientModalProps> = ({ 
  isOpen, onClose, mode: initialMode, client, agents, currentUser, onSave, onDelete 
}) => {
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>(initialMode);
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [isPortalEnabled, setIsPortalEnabled] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
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
    if (!isOpen) return;
    setMode(initialMode);
    setPasswordError('');
    setIsSaving(false);
    setSendEmail(initialMode === 'add');
    
    if (initialMode === 'add') {
      const defaultAgent = (currentUser?.role === 'Agent' || currentUser?.role === 'Partner') 
        ? agents.find(a => String(a.AgentID) === String(currentUser.id)) 
        : null;
        
      setFormData({
        ClientID: `CL-${Math.floor(1000 + Math.random() * 9000)}`,
        Status: ClientStatus.Active,
        ClientType: 'Corporate',
        OnboardingDate: new Date().toISOString().split('T')[0],
        ForcePasswordChange: true,
        ShowWalkthrough: true,
        AssignedAgentID: defaultAgent?.AgentID || '',
        AgentCommissionRate: defaultAgent?.CommissionRate || 0,
        Gender: 'N/A',
        CompanyName: '',
        Email: '',
        Phone: '',
        BillingAddress: '',
        PrimaryContactName: ''
      });
      setIsPortalEnabled(false);
    } else if (client) {
      setFormData({ ...client });
      setIsPortalEnabled(!!client.ClientAccountID && client.PortalEnabled !== false);
    }
    setTempPassword('');
  }, [initialMode, client, isOpen, currentUser, agents]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (isSaving) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isSaving) return;
    const agentId = e.target.value;
    const agent = agents.find(a => String(a.AgentID) === String(agentId));
    setFormData(prev => ({ ...prev, AssignedAgentID: agentId, AgentCommissionRate: agent?.CommissionRate || 0 }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSaving) return;
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const setClientType = (type: 'Corporate' | 'SME' | 'Individual') => {
    if (isSaving) return;
    setFormData(prev => ({ 
      ...prev, 
      ClientType: type, 
      Gender: type === 'Individual' ? (prev.Gender !== 'N/A' ? prev.Gender : undefined) : 'N/A' 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !isOnline) return;
    setPasswordError('');

    if (isPortalEnabled && !formData.ClientAccountID && !tempPassword) {
      setPasswordError('A temporary password is required to enable portal access.');
      return;
    }
    
    const finalData = { ...formData };
    if (!finalData.CompanyName || !finalData.Email) {
      setPasswordError('Required fields missing.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...finalData,
        PortalEnabled: isPortalEnabled,
        ClientAccountID: isPortalEnabled ? (finalData.ClientAccountID || `ACC-${Math.floor(10000 + Math.random() * 90000)}`) : '',
        TempPassword: tempPassword
      } as any, sendEmail);
      onClose();
    } catch (error: any) {
      setPasswordError('Synchronization failed. Check connection.');
      setIsSaving(false);
    }
  };

  const isAgentRestricted = currentUser?.role === 'Agent' || currentUser?.role === 'Partner';
  const selectedAgent = agents.find(a => normalizeID(a.AgentID) === normalizeID(formData.AssignedAgentID));
  const agentDisplayName = selectedAgent ? selectedAgent.AgentName : 'Unassigned';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className={`bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 ${mode === 'view' ? 'h-auto' : 'h-full max-h-[90vh]'}`}>
        
        <div className="flex justify-end p-4 pb-0">
          <button onClick={onClose} disabled={isSaving} className="p-2 text-slate-300 hover:text-slate-900 transition-colors disabled:opacity-30"><X size={20} /></button>
        </div>

        <div className={`flex-1 overflow-y-auto custom-scrollbar ${isSaving ? 'pointer-events-none' : ''}`}>
          {mode === 'view' ? (
            <ClientView formData={formData} agentDisplayName={agentDisplayName} />
          ) : (
            <fieldset disabled={isSaving}>
              <ClientForm 
                formData={formData} agents={agents} isSaving={isSaving} 
                isAgentRestricted={isAgentRestricted} isPortalEnabled={isPortalEnabled} 
                tempPassword={tempPassword} showPassword={showPassword} passwordError={passwordError}
                sendEmail={sendEmail} onSetSendEmail={setSendEmail}
                onSetClientType={setClientType} onTogglePortal={() => setIsPortalEnabled(!isPortalEnabled)}
                onSetTempPassword={setTempPassword} onSetShowPassword={setShowPassword}
                onChange={handleChange} onAgentChange={handleAgentChange}
                onCheckboxChange={handleCheckboxChange} onSubmit={handleSubmit}
              />
            </fieldset>
          )}
        </div>

        <div className="p-6 pt-0 flex flex-col md:flex-row justify-center items-center gap-3 bg-white shrink-0">
          {!isOnline && (
            <div className="flex items-center gap-2 text-rose-500 font-black text-[8px] uppercase tracking-widest mb-2 md:mb-0">
              <WifiOff size={12} /> Syncing Disabled: Device is Offline
            </div>
          )}
          {mode === 'view' ? (
            <button onClick={() => setMode('edit')} className="w-full md:w-auto px-10 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all text-[10px] uppercase tracking-widest active:scale-95">Modify Profile</button>
          ) : (
            <>
              <button onClick={onClose} disabled={isSaving} className="w-full md:w-auto px-8 py-3 text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest">Cancel</button>
              <button 
                form="client-form" 
                type="submit" 
                disabled={isSaving || !isOnline} 
                className={`w-full md:w-auto px-10 py-3 rounded-2xl font-black shadow-lg transition-all text-[10px] uppercase tracking-widest active:scale-95 min-w-[180px] flex items-center justify-center ${isOnline ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                {isSaving ? (
                   <>
                     <Loader2 size={14} className="animate-spin mr-2" />
                     Synchronizing...
                   </>
                ) : (
                  mode === 'add' ? 'Initiate Account' : 'Commit Changes'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientModal;
