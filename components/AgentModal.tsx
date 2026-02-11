
import React, { useState, useEffect } from 'react';
import { X, Save, User, Loader2, WifiOff, ArrowRight, CheckCircle2, Edit3 } from 'lucide-react';
import { Agent, UserPermissions, AppState } from '../types';

// Modular Sub-components
import AgentFormInfo from './agent/AgentFormInfo';
import AgentFormAccess from './agent/AgentFormAccess';
import AgentFormFinance from './agent/AgentFormFinance';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'add';
  agent: Agent | null;
  agents?: Agent[]; 
  currentUser?: AppState['currentUser'];
  onSave: (agent: Agent, sendEmail?: boolean) => void;
  onDelete?: (agentId: string) => void;
}

const DEFAULT_PERMISSIONS: UserPermissions = {
  dashboard: { view: true, create: false, update: false, delete: false },
  clients: { view: true, create: true, update: true, delete: false },
  vehicles: { view: true, create: true, update: true, delete: false },
  sim_manager: { view: true, create: true, update: true, delete: false },
  contracts: { view: true, create: true, update: true, delete: false },
  invoices: { view: true, create: true, update: true, delete: false },
  payments: { view: true, create: true, update: true, delete: false },
  commissions: { view: true, create: false, update: false, delete: false },
  agents: { view: false, create: false, update: false, delete: false },
  support: { view: true, create: true, update: true, delete: false },
  settings: { view: true, create: true, update: true, delete: true }
};

const AgentModal: React.FC<AgentModalProps> = ({ 
  isOpen, onClose, mode: initialMode, agent, agents = [], currentUser, onSave 
}) => {
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>(initialMode);
  const [activeTab, setActiveTab] = useState<'info' | 'access' | 'finance'>('info');
  const [formData, setFormData] = useState<Partial<Agent>>({});
  const [durationMonths, setDurationMonths] = useState<string>('');
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [sendEmail, setSendEmail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const isAdmin = currentUser?.role === 'Admin';

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
    setActiveTab('info');
    setSendEmail(initialMode === 'add');
    setIsSaving(false);
    setDurationMonths('');

    if (initialMode === 'add') {
      const generatedPass = 'SC' + Math.floor(1000 + Math.random() * 9000);
      setFormData({
        AgentID: `AGT-${Math.floor(1000 + Math.random() * 9000)}`,
        Status: 'Active',
        StartDate: new Date().toISOString().split('T')[0],
        Role: 'Agent',
        CommissionRate: 10,
        ExperienceLevel: 'Trainee',
        Password: generatedPass,
        Department: 'Sales',
        BaseSalary: 0,
        Notes: '',
        InvestmentTermMonths: 12
      });
      setDurationMonths('12');
      setPermissions(DEFAULT_PERMISSIONS);
    } else if (agent) {
      setFormData({ ...agent });
      setDurationMonths(agent.InvestmentTermMonths?.toString() || '');
      try {
        const parsed = agent.Privileges ? JSON.parse(agent.Privileges) : DEFAULT_PERMISSIONS;
        setPermissions({ ...DEFAULT_PERMISSIONS, ...parsed });
      } catch (e) { setPermissions(DEFAULT_PERMISSIONS); }
    }
  }, [initialMode, agent, isOpen]);

  const calculateAndSetEndDate = (startDate: string, months: string) => {
    if (!startDate || !months) return;
    const date = new Date(startDate);
    const mCount = parseInt(months);
    if (isNaN(mCount)) return;
    
    const finalDate = new Date(startDate);
    finalDate.setMonth(finalDate.getMonth() + mCount);

    setFormData(prev => ({ 
      ...prev, 
      EndDate: finalDate.toISOString().split('T')[0],
      InvestmentTermMonths: mCount
    }));
  };

  const handleDurationChange = (months: string) => {
    setDurationMonths(months);
    const mCount = parseInt(months);
    if (formData.StartDate) {
      calculateAndSetEndDate(formData.StartDate, months);
    } else {
      setFormData(prev => ({ ...prev, InvestmentTermMonths: isNaN(mCount) ? 0 : mCount }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (isSaving || mode === 'view') return;
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
        let next = { ...prev, [name]: value };
        if (name === 'Role' && value === 'Partner') next.ExperienceLevel = 'Partner';
        if (name === 'StartDate' && durationMonths) {
          setTimeout(() => calculateAndSetEndDate(value, durationMonths), 0);
        }
        return next;
      });
    }
  };

  const handlePermissionToggle = (module: string, action: keyof typeof DEFAULT_PERMISSIONS.dashboard) => {
    if (isSaving || mode === 'view') return;
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action]
      }
    }));
  };

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !isOnline) return;

    if (mode === 'view') {
      setMode('edit');
      return;
    }

    // Intelligent navigation for ADD mode
    if (mode === 'add') {
      if (activeTab === 'info') {
        setActiveTab('access');
        return;
      }
      if (activeTab === 'access') {
        setActiveTab('finance');
        return;
      }
    }

    // Actual Save
    setIsSaving(true);
    const finalAgent: Agent = { 
      ...(formData as Agent), 
      Privileges: JSON.stringify(permissions) 
    };
    onSave(finalAgent, sendEmail);
    onClose();
  };

  const isReadOnly = mode === 'view';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-900 text-white rounded-lg">
                <User size={18} />
             </div>
             <div>
               <h2 className="text-base font-semibold text-slate-900">
                 {mode === 'add' ? 'Staff Onboarding' : mode === 'edit' ? 'Edit Staff Profile' : 'Staff Profile'}
               </h2>
             </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-white px-6 shrink-0">
          {[
            { id: 'info', label: 'General Info' },
            { id: 'access', label: 'Security Access' },
            { id: 'finance', label: 'Financials', hidden: !isAdmin }
          ].filter(t => !t.hidden).map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`px-4 py-3 text-[10px] font-bold border-b-2 transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              {mode === 'add' && activeTab !== tab.id && (
                <div className={`w-1.5 h-1.5 rounded-full ${['info', 'access', 'finance'].indexOf(activeTab) > ['info', 'access', 'finance'].indexOf(tab.id) ? 'bg-emerald-50' : 'bg-slate-200'}`}></div>
              )}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          <fieldset disabled={isSaving}>
            {activeTab === 'info' && (
              <AgentFormInfo 
                formData={formData} 
                isReadOnly={isReadOnly} 
                duration={durationMonths}
                onDurationChange={handleDurationChange}
                handleChange={handleChange} 
              />
            )}

            {activeTab === 'access' && (
              <AgentFormAccess 
                formData={formData} 
                isReadOnly={isReadOnly} 
                handleChange={handleChange} 
                permissions={permissions} 
                handlePermissionToggle={handlePermissionToggle}
                defaultPermissions={DEFAULT_PERMISSIONS}
              />
            )}

            {activeTab === 'finance' && (
              <AgentFormFinance formData={formData} isReadOnly={isReadOnly} handleChange={handleChange} isAdmin={isAdmin} />
            )}
          </fieldset>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
             {mode === 'add' && activeTab === 'finance' && (
               <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Dispatch Login Details</span>
               </label>
             )}
             {!isOnline && <span className="text-[10px] font-medium text-rose-500 flex items-center gap-1"><WifiOff size={12}/> Offline</span>}
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancel</button>
            
            <button 
              onClick={handleAction} 
              disabled={isSaving || !isOnline} 
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${isOnline ? 'bg-slate-900 text-white hover:bg-black' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : (mode === 'add' ? (activeTab === 'finance' ? <CheckCircle2 size={14} /> : <ArrowRight size={14} />) : mode === 'view' ? <Edit3 size={14} /> : <Save size={14} />)}
              {isSaving ? 'Synchronizing...' : (
                mode === 'add' 
                  ? (activeTab === 'info' ? 'Next: Setup Access' : activeTab === 'access' ? 'Next: Financials' : 'Complete Onboarding') 
                  : mode === 'view' ? 'Modify Profile' : 'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentModal;
