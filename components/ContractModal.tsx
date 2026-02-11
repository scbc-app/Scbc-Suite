
import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Loader2, Send, Eye, WifiOff } from 'lucide-react';
import { Contract, ContractStatus, Client, Agent, ServicePlan, ClientStatus, Vehicle, SystemSetting } from '../types';
import SearchableSelect from './SearchableSelect';
import SignaturePad from './SignaturePad';
import ContractPreview from './ContractPreview';
import ContractView from './ContractView';
import ContractForm from './ContractForm';
import { generateContractHTML } from '../services/contractPdfService';
import { normalizeID } from '../logic/handlerUtils';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'add';
  contract: Contract | null;
  clients: Client[];
  agents: Agent[];
  servicePlans: ServicePlan[];
  vehicles?: Vehicle[];
  companySettings?: SystemSetting | null;
  userRole: string;
  currentUser?: { role: string; id: string; name: string };
  onCreateServicePlan: (plan: ServicePlan) => void;
  onSave: (contract: Contract, sendEmail?: boolean) => Promise<void>;
  onDelete?: (contractId: string) => void;
}

const DEFAULT_PLANS: ServicePlan[] = [
  { PlanID: 'SYS-BASIC', Category: 'GPS Tracking', Type: 'Basic', Class: 'Economy', BasePrice: 100, MaintenanceFee: 20, LastUpdated: new Date().toISOString() },
  { PlanID: 'SYS-STD', Category: 'GPS Tracking', Type: 'Standard', Class: 'Value', BasePrice: 150, MaintenanceFee: 30, LastUpdated: new Date().toISOString() },
  { PlanID: 'SYS-PRO', Category: 'GPS Tracking', Type: 'Professional', Class: 'Enterprise', BasePrice: 250, MaintenanceFee: 50, LastUpdated: new Date().toISOString() },
  { PlanID: 'SYS-CUSTOM', Category: 'Tailored', Type: 'Custom', Class: 'Bespoke', BasePrice: 0, MaintenanceFee: 0, LastUpdated: new Date().toISOString() }
];

const ContractModal: React.FC<ContractModalProps> = ({ 
  isOpen, onClose, mode: initialMode, contract, clients, agents, servicePlans, vehicles = [], companySettings, userRole, currentUser, onSave, onDelete 
}) => {
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>(initialMode);
  const [formData, setFormData] = useState<Partial<Contract>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [sendEmail, setSendEmail] = useState(true); 
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [isCustomPlan, setIsCustomPlan] = useState(false);
  const [selectedPlanID, setSelectedPlanID] = useState<string>('');
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signingRole, setSigningRole] = useState<'Provider' | 'Client'>('Provider');

  useEffect(() => {
    const handleNet = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleNet);
    window.addEventListener('offline', handleNet);
    return () => {
      window.removeEventListener('online', handleNet);
      window.removeEventListener('offline', handleNet);
    };
  }, []);

  const activePlans = (servicePlans && servicePlans.length > 0) ? servicePlans : DEFAULT_PLANS;

  const groupedPlans = activePlans.reduce((acc, plan) => {
    const category = plan.Category || 'General Plans';
    if (!acc[category]) acc[category] = [];
    acc[category].push(plan);
    return acc;
  }, {} as Record<string, ServicePlan[]>);

  const clientOptions = clients.map(c => ({
    value: c.ClientID,
    label: c.CompanyName,
    disabled: c.Status !== ClientStatus.Active,
    subtext: c.Status !== ClientStatus.Active ? 'Inactive Account' : c.ClientType
  }));

  const clientVehicles = vehicles.filter(v => normalizeID(v.ClientID) === normalizeID(formData.ClientID) && v.Status === 'Active');

  useEffect(() => {
    if (!isOpen) return;
    
    setMode(initialMode);
    setIsCustomPlan(false);
    setSelectedPlanID('');
    setPreviewHtml(null);
    setIsSaving(false);
    
    setSendEmail(initialMode === 'add');

    if (initialMode === 'add') {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        ContractID: `CN-${Math.floor(3000 + Math.random() * 9000)}`,
        StartDate: today,
        PaymentDueDate: today,
        DurationMonths: 12,
        ContractStatus: ContractStatus.Active,
        NoOfUnits: 0,
        UnitPrice: 0,
        AdditionalCost: 0,
        Discount: 0,
        SubTotal: 0,
        TotalAmount: 0,
        BillingCycle: 'Monthly',
        PlanType: '',
        ServiceType: '',
        AssetIDs: [],
        AssignedAgentID: (currentUser?.role === 'Agent' || currentUser?.role === 'Partner') ? currentUser.id : ''
      });
    } else if (contract) {
      const assetList = contract.AssetIDs || [];
      const unitCount = contract.NoOfUnits > 0 ? contract.NoOfUnits : assetList.length;
      
      setFormData({ 
        ...contract, 
        AssetIDs: assetList,
        NoOfUnits: unitCount
      });

      const matchedPlan = activePlans.find(p => p.Type?.trim().toLowerCase() === contract.PlanType?.trim().toLowerCase());
      if (matchedPlan) setSelectedPlanID(matchedPlan.PlanID);
      else { setSelectedPlanID('custom'); setIsCustomPlan(true); }
    }
  }, [initialMode, contract, isOpen, activePlans, currentUser]);

  useEffect(() => {
    if (mode === 'view') return;
    
    const units = (formData.AssetIDs && formData.AssetIDs.length > 0) 
      ? formData.AssetIDs.length 
      : (Number(formData.NoOfUnits) || 0);

    const price = Number(formData.UnitPrice) || 0;
    const extra = Number(formData.AdditionalCost) || 0;
    const discount = Number(formData.Discount) || 0;
    const subTotal = units * price;
    const total = subTotal + extra - discount;
    
    let expiryDate = '';
    if (formData.StartDate && formData.DurationMonths) {
      const start = new Date(formData.StartDate);
      start.setMonth(start.getMonth() + Number(formData.DurationMonths));
      expiryDate = start.toISOString().split('T')[0];
    }
    
    if (formData.NoOfUnits !== units || formData.TotalAmount !== total || formData.ExpiryDate !== expiryDate) {
      setFormData(prev => ({ 
        ...prev, 
        NoOfUnits: units,
        SubTotal: subTotal, 
        TotalAmount: total, 
        ExpiryDate: expiryDate 
      }));
    }
  }, [formData.NoOfUnits, formData.AssetIDs, formData.UnitPrice, formData.AdditionalCost, formData.Discount, formData.StartDate, formData.DurationMonths, mode]);

  const handleRenew = () => {
    if (!contract) return;
    const today = new Date().toISOString().split('T')[0];
    const duration = contract.DurationMonths || 12;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + duration);

    setFormData({
      ...contract,
      ContractID: `CN-R-${Math.floor(1000 + Math.random() * 9000)}`,
      StartDate: today,
      PaymentDueDate: today,
      ExpiryDate: expiry.toISOString().split('T')[0],
      ContractStatus: ContractStatus.Active,
      ProviderSignDate: '',
      ProviderSign: '',
      ClientSignName: '',
      ClientSignTitle: '',
      ClientSignDate: '',
      ClientSign: ''
    });
    setMode('add');
    setSendEmail(true);
  };

  const handleOpenPreviewDraft = () => {
    const targetClientID = normalizeID(formData.ClientID);
    const client = clients.find(c => normalizeID(c.ClientID) === targetClientID);
    const finalDraft = { 
      ...formData, 
      NoOfUnits: formData.AssetIDs?.length || formData.NoOfUnits || 0 
    } as Contract;
    
    const html = generateContractHTML(finalDraft, client, vehicles, companySettings || null, agents);
    setPreviewHtml(html);
  };

  const handleFinalSubmit = () => {
    if (isSaving || !isOnline) return;
    setIsSaving(true);
    
    const units = (formData.AssetIDs && formData.AssetIDs.length > 0) 
      ? formData.AssetIDs.length 
      : (Number(formData.NoOfUnits) || 0);

    const targetClientID = normalizeID(formData.ClientID);
    const client = clients.find(c => normalizeID(c.ClientID) === targetClientID);

    const finalData = { 
      ...formData, 
      NoOfUnits: units,
      Email: client?.Email || ''
    } as Contract;
    
    const sig = String(finalData.ProviderSign || finalData.ProviderSignImage || '').trim();
    const isSignedByAgent = sig.length > 20;
    
    onSave(finalData, isSignedByAgent ? true : sendEmail)
      .then(() => {
        setPreviewHtml(null);
        onClose();
      })
      .finally(() => setIsSaving(false));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isSaving) return;
    const { name, value } = e.target;
    if (name === 'PlanID') {
        if (value === 'custom') { setIsCustomPlan(true); setSelectedPlanID('custom'); }
        else {
            setIsCustomPlan(false);
            setSelectedPlanID(value);
            const plan = activePlans.find(p => p.PlanID === value);
            if (plan) setFormData(prev => ({ ...prev, PlanType: plan.Type, ServiceType: `${plan.Category || 'General'} - ${plan.Class || 'Standard'}`, UnitPrice: plan.BasePrice, AdditionalCost: plan.MaintenanceFee }));
        }
        return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssetToggle = (vehicleId: string) => {
    if (isSaving) return;
    setFormData(prev => {
      const currentIDs = prev.AssetIDs || [];
      const newIDs = currentIDs.includes(vehicleId) ? currentIDs.filter(id => id !== vehicleId) : [...currentIDs, vehicleId];
      return { ...prev, AssetIDs: newIDs, NoOfUnits: newIDs.length };
    });
  };

  const handleConfirmSignature = (name: string, title: string, image: string, signatureMode: 'draw' | 'type') => {
      const today = new Date().toISOString();
      const isProvider = signingRole === 'Provider';
      const updatedContract = {
          ...formData,
          [isProvider ? 'ProviderSignName' : 'ClientSignName']: name,
          [isProvider ? 'ProviderSignTitle' : 'ClientSignTitle']: title,
          [isProvider ? 'ProviderSignDate' : 'ClientSignDate']: today,
          [isProvider ? 'ProviderSign' : 'ClientSign']: image,
          [isProvider ? 'ProviderSignImage' : 'ClientSignImage']: image
      } as Contract;
      setFormData(updatedContract);
      setIsSigning(false);
      
      const targetClientID = normalizeID(updatedContract.ClientID);
      const client = clients.find(c => normalizeID(c.ClientID) === targetClientID);
      setPreviewHtml(generateContractHTML(updatedContract, client, vehicles, companySettings || null, agents));
      
      if (isProvider) setSendEmail(true);
      if (mode === 'view') onSave({ ...updatedContract, Email: client?.Email || '' }, true);
  };

  if (!isOpen) return null;

  const isExpired = formData.ExpiryDate && new Date(formData.ExpiryDate) < new Date();
  const targetClientID = normalizeID(formData.ClientID);
  const targetClient = clients.find(c => normalizeID(c.ClientID) === targetClientID);
  const provSig = String(formData.ProviderSign || formData.ProviderSignImage || '').trim();
  const isAgentSigned = provSig.length > 20;
  const isClientSigned = !!(formData.ClientSign || formData.ClientSignImage);
  const isFullyExecuted = isAgentSigned && isClientSigned;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center space-x-4">
               <div className={`p-3 rounded-2xl ${mode === 'view' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-900 text-white'}`}><RefreshCw size={24} /></div>
               <div>
                 <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{mode === 'view' ? 'Agreement Overview' : mode === 'edit' ? 'Edit Agreement' : 'New Service Agreement'}</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{mode === 'view' ? `REF: ${formData.ContractID}` : 'Configure Terms & Inventory'}</p>
               </div>
            </div>
            <button onClick={onClose} disabled={isSaving} className="p-2 text-slate-300 hover:text-slate-900 transition-colors disabled:opacity-30"><X size={24} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            {mode === 'view' ? (
              <ContractView 
                contract={formData} 
                agents={agents} 
                vehicles={vehicles} 
                onPreview={() => {
                   const targetClientID = normalizeID(formData.ClientID);
                   const client = clients.find(c => normalizeID(c.ClientID) === targetClientID);
                   setPreviewHtml(generateContractHTML(formData, client, vehicles, companySettings || null, agents));
                }} 
              />
            ) : (
              <fieldset disabled={isSaving} className="space-y-8">
                <form id="contract-form" onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(); }} className="space-y-6">
                  <ContractForm 
                    formData={formData}
                    clientOptions={clientOptions}
                    groupedPlans={groupedPlans}
                    selectedPlanID={selectedPlanID}
                    isCustomPlan={isCustomPlan}
                    clientVehicles={clientVehicles}
                    onChange={handleChange}
                    onClientChange={(id) => { if(!isSaving) { const targetClientID = normalizeID(id); const c = clients.find(cl => normalizeID(cl.ClientID) === targetClientID); setFormData(p => ({ ...p, ClientID: id, ClientName: c?.CompanyName || '', AssetIDs: [] })); } }}
                    onAssetToggle={handleAssetToggle}
                    onSelectAll={() => { if(!isSaving) { const all = clientVehicles.map(v => v.VehicleID); const curr = formData.AssetIDs || []; if (curr.length === all.length) setFormData(p => ({ ...p, AssetIDs: [], NoOfUnits: 0 })); else setFormData(p => ({ ...p, AssetIDs: all, NoOfUnits: all.length })); } }}
                  />
                </form>

                <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
                    <div className="absolute right-0 top-0 p-6 opacity-5 rotate-12"><Send size={80} /></div>
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl transition-all duration-500 ${sendEmail || isAgentSigned ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                             <Send size={20} className={sendEmail || isAgentSigned ? "animate-pulse" : ""} />
                          </div>
                          <div>
                             <h4 className="text-[11px] font-black uppercase tracking-widest">Digital Dispatch Protocol</h4>
                             <p className={`text-[9px] font-bold uppercase mt-0.5 ${sendEmail || isAgentSigned ? 'text-indigo-400' : 'text-slate-500'}`}>
                                {isAgentSigned 
                                  ? `Authorized: Dispatching document to ${targetClient?.Email || 'Unset Address'}` 
                                  : sendEmail ? `Active: System will trigger a review request email.` : `Standby: Internal record update only.`}
                             </p>
                          </div>
                       </div>
                       {!isAgentSigned && (
                         <button
                            type="button"
                            onClick={() => !isSaving && setSendEmail(!sendEmail)}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${sendEmail ? 'bg-indigo-600' : 'bg-slate-800'}`}
                         >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${sendEmail ? 'translate-x-6' : 'translate-x-1'}`} />
                         </button>
                       )}
                    </div>
                </div>
              </fieldset>
            )}
          </div>

          <div className="p-8 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-end items-center gap-4 shrink-0">
            {!isOnline && mode !== 'view' && (
              <div className="flex items-center gap-2 text-rose-500 font-black text-[9px] uppercase tracking-widest mb-2 sm:mb-0">
                <WifiOff size={14} /> Offline Mode: Registry Locked
              </div>
            )}
            {mode === 'view' ? (
              <>
                 {isExpired && (
                   <button onClick={handleRenew} className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center">
                     <RefreshCw size={14} className="mr-2" /> Renew Agreement
                   </button>
                 )}
                 {onDelete && <button onClick={() => { if (confirm('Permanently remove this agreement?')) { onDelete(formData.ContractID!); onClose(); } }} className="px-6 py-3 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest">Delete</button>}
                 <button onClick={() => setMode('edit')} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">Edit Record</button>
              </>
            ) : (
              <>
                <button onClick={onClose} disabled={isSaving} type="button" className="px-6 py-3 text-slate-400 bg-white border border-slate-100 rounded-2xl font-black text-[11px] uppercase tracking-widest">Cancel</button>
                
                <button 
                  type="button"
                  onClick={handleOpenPreviewDraft}
                  disabled={!formData.ClientID || !formData.PlanType || isSaving}
                  className="flex items-center px-6 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-30"
                >
                  <Eye size={14} className="mr-2" /> {isAgentSigned ? 'Review Final Doc' : 'Preview & Authorize'}
                </button>

                {!isFullyExecuted && (
                  <button 
                    form="contract-form" 
                    type="submit" 
                    disabled={isSaving || !isOnline} 
                    className={`px-10 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center min-w-[160px] transition-all ${isAgentSigned ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white'} disabled:bg-slate-200 disabled:text-slate-400`}
                  >
                    {isSaving && <Loader2 size={14} className="animate-spin mr-2" />}
                    {isSaving ? 'Processing...' : (isAgentSigned ? 'Dispatch & Sync' : 'Save Draft')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <ContractPreview 
        isOpen={!!previewHtml} 
        onClose={() => setPreviewHtml(null)} 
        previewHtml={previewHtml} 
        contract={formData} 
        userRole={userRole} 
        onInitiateSigning={(role) => { setSigningRole(role); setIsSigning(true); }} 
        onDownload={() => { 
          const targetClientID = normalizeID(formData.ClientID);
          const client = clients.find(c => normalizeID(c.ClientID) === targetClientID); 
          const html = generateContractHTML(formData, client, vehicles, companySettings || null, agents); 
          const p = window.open('', '_blank'); 
          if(p) { p.document.write(html); p.document.close(); p.onload = () => p.print(); } 
        }} 
        onShare={() => {}} 
        onDispatch={handleFinalSubmit}
      />
      
      <SignaturePad 
        isOpen={isSigning} 
        onClose={() => setIsSigning(false)} 
        role={signingRole} 
        defaultName={signingRole === 'Provider' ? (currentUser?.name || '') : (formData.ClientName || '')} 
        defaultTitle={signingRole === 'Provider' ? (formData.ProviderSignTitle || '') : (formData.ClientSignTitle || '')} 
        onConfirm={handleConfirmSignature} 
      />
    </>
  );
};

export default ContractModal;
