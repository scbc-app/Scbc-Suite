
import { 
  CreditCard, Loader2, WifiOff, X, Receipt, ShieldCheck, 
  Calculator, Tag, User, Calendar, Hash, Settings2, 
  Trash2, Plus, Package, UserPlus, Users, MapPin, Phone, AlertTriangle,
  Clock, Info, FileText, Activity, ShieldCheck as VerifiedIcon
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { Payment, PaymentStatus, Invoice, Client, Contract, ClientStatus, ContractStatus } from '../types';
import { normalizeID } from '../logic/handlerUtils';
import SearchableSelect from './SearchableSelect';
import { formatDate, formatCurrency } from '../constants';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'add';
  payment: Payment | null;
  payments: Payment[];
  invoices: Invoice[];
  contracts?: Contract[];
  agents: any[];
  clients: Client[];
  currentUser: { id: string, name: string };
  onSave: (payment: Payment, sendEmail?: boolean) => void;
  onSaveInvoice: (invoice: Invoice) => void;
}

const DetailRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | React.ReactNode }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
    <div className="flex items-center text-slate-400">
      <Icon size={12} className="mr-2" />
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </div>
    <span className="text-xs font-medium text-slate-700">{value || '—'}</span>
  </div>
);

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, onClose, mode: initialMode, payment, payments, invoices, contracts = [], clients, currentUser, onSave
}) => {
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>(initialMode);
  const [formData, setFormData] = useState<any>({});
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleNet = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleNet);
    window.addEventListener('offline', handleNet);
    return () => { window.removeEventListener('online', handleNet); window.removeEventListener('offline', handleNet); };
  }, []);

  const activeContract = useMemo(() => {
    if (!formData.ClientID || formData.ClientID === 'WALK-IN') return undefined;
    return contracts.find(c => 
      normalizeID(c.ClientID) === normalizeID(formData.ClientID) && 
      normalizeID(c.ContractStatus) === normalizeID(ContractStatus.Active)
    );
  }, [contracts, formData.ClientID]);

  const clientInsight = useMemo(() => {
    if (!formData.ClientID || formData.ClientID === 'WALK-IN') return null;
    const history = payments
      .filter(p => normalizeID(p.ClientID) === normalizeID(formData.ClientID))
      .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
    const lastPay = history.length > 0 ? history[0] : null;
    const contract = contracts.find(c => normalizeID(c.ClientID) === normalizeID(formData.ClientID) && c.ContractStatus === 'Active');
    
    let monthsLeft = 0;
    if (contract && contract.ExpiryDate) {
      const exp = new Date(contract.ExpiryDate);
      const today = new Date();
      monthsLeft = Math.max(0, (exp.getFullYear() - today.getFullYear()) * 12 + (exp.getMonth() - today.getMonth()));
    }

    return {
      lastPayDate: lastPay?.Date,
      nextRenewal: lastPay?.NextDueDate || contract?.PaymentDueDate,
      expiryDate: contract?.ExpiryDate,
      monthsRemaining: monthsLeft,
      contractSigned: !!(contract?.ClientSign || contract?.ClientSignImage),
      status: contract?.ContractStatus || 'No Active Plan'
    };
  }, [formData.ClientID, payments, contracts]);

  const nextDueDate = useMemo(() => {
    if (!formData.MonthsCovered || formData.MonthsCovered <= 0) return null;
    const startDate = formData.Date ? new Date(formData.Date) : new Date();
    if (isNaN(startDate.getTime())) return null;
    const nextDate = new Date(startDate);
    nextDate.setMonth(nextDate.getMonth() + Number(formData.MonthsCovered));
    return nextDate.toISOString().split('T')[0];
  }, [formData.Date, formData.MonthsCovered]);

  useEffect(() => {
    if (!isOpen) return;
    setIsSaving(false); setSendEmail(true); setMode(initialMode);
    setIsNewCustomer(false);
    
    if (initialMode === 'add') {
      setFormData({
        PaymentID: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
        Date: new Date().toISOString().split('T')[0],
        Status: PaymentStatus.Completed,
        Method: 'Bank Transfer',
        Amount: 0,
        MonthsCovered: 1,
        AdditionalCost: 0,
        Discount: 0,
        Remarks: '',
        AgentID: currentUser.id,
        Reference: '',
        ClientName: ''
      });
    } else if (payment) {
      setFormData({ ...payment });
    }
  }, [initialMode, payment, isOpen, currentUser]);

  useEffect(() => {
    if (mode !== 'add' || isNewCustomer || !activeContract) return;
    const resolvedUnits = Number(activeContract.NoOfUnits) || activeContract.AssetIDs?.length || 0;
    const unitPrice = Number(activeContract.UnitPrice) || 0;
    const months = Number(formData.MonthsCovered) || 1;
    const addCost = Number(formData.AdditionalCost) || 0;
    const disc = Number(formData.Discount) || 0;
    const calculatedAmount = (unitPrice * resolvedUnits * months) + addCost - disc;

    setFormData(prev => ({
      ...prev,
      Amount: calculatedAmount,
      ContractID: activeContract.ContractID,
      NoOfUnits: resolvedUnits,
      UnitPrice: unitPrice
    }));
  }, [formData.ClientID, activeContract, mode, isNewCustomer, formData.MonthsCovered, formData.AdditionalCost, formData.Discount]);

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.ClientID === clientId);
    setFormData(prev => ({ 
      ...prev, 
      ClientID: clientId, 
      ClientName: client?.CompanyName || '',
      Amount: 0,
      NoOfUnits: 0,
      MonthsCovered: 1,
      Remarks: '' 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !isOnline) return;
    setIsSaving(true);
    try {
      await onSave({ ...formData, NextDueDate: nextDueDate } as Payment, sendEmail);
      onClose();
    } finally { setIsSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in duration-200">
        
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-900 text-white rounded-xl"><CreditCard size={18} /></div>
             <h2 className="text-sm font-medium text-slate-800 uppercase tracking-tight">Record Payment</h2>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-1 text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar">
          {mode === 'view' ? (
            <div className="space-y-4">
              <div className="text-center py-6 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] text-slate-400 uppercase font-medium mb-1">Total Received</p>
                <h1 className="text-3xl font-medium text-emerald-600 tracking-tighter">K {formatCurrency(formData.Amount)}</h1>
                <div className="mt-2"><span className={`px-3 py-1 rounded-full text-[9px] font-medium uppercase tracking-widest border ${formData.Status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>{formData.Status}</span></div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-1">
                <DetailRow icon={User} label="Client" value={formData.ClientName} />
                <DetailRow icon={Calendar} label="Settlement Date" value={formatDate(formData.Date)} />
                <DetailRow icon={Receipt} label="Bank Reference" value={formData.Reference} />
                {formData.Remarks && <DetailRow icon={FileText} label="Notes" value={formData.Remarks} />}
              </div>
            </div>
          ) : (
            <form id="payment-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                 <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">Client Name</label>
                    <button type="button" onClick={() => { setIsNewCustomer(!isNewCustomer); if(!isNewCustomer) setFormData({...formData, ClientID: 'WALK-IN', ClientName: ''}); }} className="flex items-center gap-1.5 text-[9px] font-medium uppercase text-indigo-600 hover:text-indigo-700 transition-colors">
                       {isNewCustomer ? <Users size={12}/> : <UserPlus size={12}/>} {isNewCustomer ? 'Registry' : 'Guest Payment'}
                    </button>
                 </div>
                 {!isNewCustomer ? (
                   <SearchableSelect required options={clients.map(c => ({ value: c.ClientID, label: c.CompanyName, disabled: c.Status !== ClientStatus.Active }))} value={formData.ClientID || ''} onChange={handleClientChange} placeholder="Select from registry..." />
                 ) : (
                   <input required value={formData.ClientName} onChange={e => setFormData({...formData, ClientName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Enter guest name..." />
                 )}
              </div>

              {clientInsight && (
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3 animate-in fade-in duration-500">
                   <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                         <div className={`p-1.5 rounded-lg ${clientInsight.contractSigned ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {clientInsight.contractSigned ? <VerifiedIcon size={12}/> : <Activity size={12}/>}
                         </div>
                         <span className="text-[10px] font-medium text-slate-700 uppercase tracking-tight">Status: {clientInsight.status}</span>
                      </div>
                      <span className="text-[9px] font-medium text-slate-400 uppercase">{clientInsight.monthsRemaining} Mo Remaining</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                         <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">Last Activity</p>
                         <p className="text-[10px] font-medium text-slate-700">{formatDate(clientInsight.lastPayDate)}</p>
                      </div>
                      <div>
                         <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">Next Renewal Goal</p>
                         <p className="text-[10px] font-medium text-indigo-600">{formatDate(clientInsight.nextRenewal)}</p>
                      </div>
                   </div>
                </div>
              )}

              {activeContract && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4">
                   <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-0.5">Active Service</p>
                        <h4 className="text-xs font-medium text-slate-900">{activeContract.PlanType} • {formData.NoOfUnits} Units</h4>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-0.5">Base Rate</p>
                         <h4 className="text-xs font-medium text-slate-900">K{formatCurrency(activeContract.UnitPrice)}</h4>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">Period Paid (Months)</label>
                        <input type="number" min="1" value={formData.MonthsCovered} onChange={e => setFormData({...formData, MonthsCovered: Number(e.target.value)})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-indigo-600 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">Extended Expiry</label>
                        <div className="w-full p-2.5 bg-indigo-50/50 rounded-xl text-[11px] font-medium text-indigo-700 flex items-center gap-2 border border-indigo-100">
                           <Clock size={14}/> {nextDueDate ? formatDate(nextDueDate) : 'N/A'}
                        </div>
                      </div>
                   </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">Payment Date</label>
                    <input required type="date" value={formData.Date} onChange={e => setFormData({...formData, Date: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">Method</label>
                    <select value={formData.Method} onChange={e => setFormData({...formData, Method: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none">
                       <option value="Bank Transfer">Bank Transfer</option>
                       <option value="Mobile Money">Mobile Money</option>
                       <option value="Cash">Cash</option>
                       <option value="Card">Card</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">Outstanding Invoices</label>
                 <select value={formData.InvoiceID || ''} onChange={(e) => setFormData({ ...formData, InvoiceID: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none">
                    <option value="">-- Apply to Future Cycle --</option>
                    {invoices.filter(i => normalizeID(i.ClientID) === normalizeID(formData.ClientID) && i.Status !== 'Paid').map(inv => (
                      <option key={inv.InvoiceID} value={inv.InvoiceID}>{inv.InvoiceID} (Balance: K{formatCurrency(inv.BalanceDue)})</option>
                    ))}
                 </select>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">Bank Reference ID</label>
                 <input required type="text" value={formData.Reference || ''} onChange={e => setFormData({...formData, Reference: e.target.value})} placeholder="Unique identifier..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">Notes</label>
                 <textarea value={formData.Remarks || ''} onChange={e => setFormData({...formData, Remarks: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none h-20 focus:ring-2 focus:ring-indigo-100 font-medium" placeholder="Keep blank for default..." />
              </div>

              <div className="bg-slate-900 p-5 rounded-[2rem] flex justify-between items-center text-white shadow-xl relative overflow-hidden">
                 <div className="absolute right-0 top-0 p-5 opacity-5 rotate-12"><Calculator size={48}/></div>
                 <div className="relative z-10">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1 leading-none">Total Settlement</p>
                    <h4 className="text-2xl font-medium text-emerald-400 leading-none tracking-tighter">K {formatCurrency(formData.Amount)}</h4>
                 </div>
                 <div className="relative z-10 flex flex-col items-end gap-1">
                    <span className="text-[8px] font-medium text-slate-500 uppercase">Notify Client</span>
                    <button type="button" onClick={() => setSendEmail(!sendEmail)} className={`h-5 w-10 rounded-full relative transition-colors ${sendEmail ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                       <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${sendEmail ? 'right-0.5' : 'left-0.5'}`}/>
                    </button>
                 </div>
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={isSaving} className="px-5 py-2.5 text-[10px] font-medium uppercase text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
          {mode !== 'view' && (
            <button form="payment-form" type="submit" disabled={isSaving || !isOnline} className={`px-10 py-2.5 rounded-xl text-[10px] font-medium uppercase shadow-xl flex items-center gap-2 transition-all active:scale-95 ${isOnline ? 'bg-slate-900 text-white hover:bg-black' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              {isSaving ? 'Processing...' : 'Finalize Settlement'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
