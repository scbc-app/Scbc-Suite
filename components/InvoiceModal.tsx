
import React, { useState, useEffect } from 'react';
import { X, FileText, Loader2, CreditCard, Calendar, Calculator, Info, Zap, FilePlus, Edit, Eye, FileSpreadsheet, FileCode, Mail, Send, WifiOff } from 'lucide-react';
import { Invoice, InvoiceStatus, Client, Contract, DocumentType, ClientStatus, SystemSetting } from '../types';
import SearchableSelect from './SearchableSelect';
import InvoiceView from './InvoiceView';
import InvoicePreview from './InvoicePreview';
import { formatDate, formatCurrency } from '../constants';
import { generateInvoiceHTML } from '../services/invoicePdfService';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'add';
  invoice: Invoice | null;
  clients: Client[];
  contracts: Contract[];
  systemSettings: SystemSetting | null;
  onSave: (invoice: Invoice, sendEmail?: boolean) => Promise<void>;
  type?: DocumentType;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ 
  isOpen, onClose, mode: initialMode, invoice, clients, contracts, systemSettings, onSave, type: initialType = DocumentType.Invoice 
}) => {
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>(initialMode);
  const [formData, setFormData] = useState<Partial<Invoice>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
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
      const today = new Date().toISOString().split('T')[0];
      const due = new Date();
      due.setDate(due.getDate() + 7);
      
      setFormData({
        InvoiceID: `${initialType === DocumentType.Quotation ? 'QU' : initialType === DocumentType.Proforma ? 'PR' : 'INV'}-${Math.floor(10000 + Math.random() * 90000)}`,
        InvoiceDate: today,
        DueDate: due.toISOString().split('T')[0],
        Status: InvoiceStatus.Pending,
        DocType: initialType,
        PeriodMonths: 1,
        UnitPrice: 0,
        NoOfUnits: 0,
        TotalAmount: 0,
        AmountPaid: 0,
        BalanceDue: 0,
        Description: '',
        ServiceType: ''
      });
      setShowPdf(false);
      setSendEmail(true); // Default to send on new invoice
    } else if (invoice) {
      setFormData({ ...invoice });
      setShowPdf(false);
      setSendEmail(false);
    }
    setMode(initialMode);
  }, [initialMode, invoice, isOpen, initialType]);

  // Recalculate totals
  useEffect(() => {
    if (mode === 'view') return;
    const price = Number(formData.UnitPrice) || 0;
    const units = Number(formData.NoOfUnits) || 0;
    const months = Number(formData.PeriodMonths) || 1;
    const total = price * units * months;
    const paid = Number(formData.AmountPaid) || 0;
    
    setFormData(prev => ({ 
      ...prev, 
      TotalAmount: total, 
      BalanceDue: total - paid 
    }));
  }, [formData.UnitPrice, formData.NoOfUnits, formData.PeriodMonths, formData.AmountPaid, mode]);

  if (!isOpen) return null;

  const handleDocTypeChange = (newType: DocumentType) => {
    if (mode !== 'add' || isSaving) return;
    const currentIdNum = formData.InvoiceID?.split('-')[1] || Math.floor(10000 + Math.random() * 90000);
    const prefix = newType === DocumentType.Quotation ? 'QU' : newType === DocumentType.Proforma ? 'PR' : 'INV';
    setFormData(prev => ({
      ...prev,
      DocType: newType,
      InvoiceID: `${prefix}-${currentIdNum}`
    }));
  };

  const handleClientChange = (clientId: string) => {
    if (isSaving) return;
    const client = clients.find(c => c.ClientID === clientId);
    const clientContract = contracts.find(c => c.ClientID === clientId && c.ContractStatus === 'Active');
    
    setFormData(prev => ({ 
      ...prev, 
      ClientID: clientId, 
      ClientName: client?.CompanyName || '',
      ContractID: clientContract?.ContractID || 'ADHOC',
      ServiceType: clientContract?.ServiceType || 'Unified Managed Fleet',
      Description: clientContract ? `${clientContract.PlanType} - Connectivity Services` : prev.Description,
      UnitPrice: clientContract ? clientContract.UnitPrice : prev.UnitPrice,
      NoOfUnits: clientContract ? clientContract.NoOfUnits : prev.NoOfUnits
    }));
  };

  const clientOptions = clients.map(c => ({
    value: c.ClientID,
    label: c.CompanyName,
    disabled: c.Status !== ClientStatus.Active,
    subtext: c.ClientType
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !isOnline) return;
    setIsSaving(true);
    onSave(formData as Invoice, sendEmail).then(onClose).finally(() => setIsSaving(false));
  };

  const targetClient = clients.find(c => c.ClientID === formData.ClientID);
  const previewHtml = generateInvoiceHTML(formData, targetClient, systemSettings);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
          
          <div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center space-x-4">
               <div className={`p-3 rounded-2xl shadow-lg ${mode === 'view' ? 'bg-indigo-600' : 'bg-slate-900'} text-white`}>
                 {formData.DocType === DocumentType.Quotation ? <FileCode size={24} /> : 
                  formData.DocType === DocumentType.Proforma ? <FileSpreadsheet size={24} /> : 
                  <FileText size={24} />}
               </div>
               <div>
                 <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                   {mode === 'view' ? `${formData.DocType} Overview` : mode === 'edit' ? `Edit ${formData.DocType}` : `New ${formData.DocType}`}
                 </h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Reference: {formData.InvoiceID}</p>
               </div>
            </div>
            <button onClick={onClose} disabled={isSaving} className="p-2 text-slate-300 hover:text-slate-900 transition-colors disabled:opacity-30"><X size={24} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            {mode === 'view' ? (
              <InvoiceView invoice={formData} onPreview={() => setShowPdf(true)} />
            ) : (
              <fieldset disabled={isSaving} className="space-y-8">
                <form id="invoice-form" onSubmit={handleSubmit} className="space-y-8">
                  
                  {mode === 'add' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Select Document Type</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[DocumentType.Invoice, DocumentType.Proforma, DocumentType.Quotation].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => handleDocTypeChange(t)}
                            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.DocType === t ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                      <SearchableSelect label="Select Client" required options={clientOptions} value={formData.ClientID || ''} onChange={handleClientChange} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Document Date</label>
                      <input type="date" value={formData.InvoiceDate} onChange={e => setFormData({...formData, InvoiceDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formData.DocType === DocumentType.Quotation ? 'Validity Expiry' : 'Payment Due Date'}</label>
                      <input type="date" value={formData.DueDate} onChange={e => setFormData({...formData, DueDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service Description</label>
                      <input required type="text" value={formData.Description} onChange={e => setFormData({...formData, Description: e.target.value})} placeholder="e.g. Annual Fleet Tracking Service" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rate per Unit (K)</label>
                      <input type="number" step="0.01" value={formData.UnitPrice} onChange={e => setFormData({...formData, UnitPrice: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Units / Quantity</label>
                      <input type="number" value={formData.NoOfUnits} onChange={e => setFormData({...formData, NoOfUnits: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Billing Period (Months)</label>
                      <input type="number" min="1" value={formData.PeriodMonths} onChange={e => setFormData({...formData, PeriodMonths: Number(e.target.value)})} className="w-full p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl outline-none font-black" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Status</label>
                      <select value={formData.Status} onChange={e => setFormData({...formData, Status: e.target.value as InvoiceStatus})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-[11px] font-bold uppercase tracking-widest">
                        <option value={InvoiceStatus.Pending}>Pending</option>
                        <option value={InvoiceStatus.Paid}>Paid</option>
                        <option value={InvoiceStatus.Partial}>Partial</option>
                        <option value={InvoiceStatus.Overdue}>Overdue</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-slate-800">
                      <div className="absolute right-0 top-0 p-6 opacity-5 rotate-12"><Mail size={80} /></div>
                      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl transition-all duration-500 ${sendEmail ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                              <Send size={20} className={sendEmail ? "animate-pulse" : ""} />
                            </div>
                            <div>
                              <h4 className="text-[11px] font-black uppercase tracking-widest">Notification Protocol</h4>
                              <p className={`text-[9px] font-bold uppercase mt-0.5 ${sendEmail ? 'text-indigo-400' : 'text-slate-500'}`}>
                                  {sendEmail ? `Sending to: ${targetClient?.Email || 'No Email Found'}` : 'Internal Database Entry Only'}
                              </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => setSendEmail(!sendEmail)}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${sendEmail ? 'bg-indigo-500' : 'bg-slate-800'}`}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${sendEmail ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                  </div>
                </form>
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
                <button onClick={() => setMode('edit')} className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-2">
                  <Edit size={16} /> Edit Document
                </button>
              </>
            ) : (
              <>
                <button onClick={onClose} disabled={isSaving} className="px-8 py-3.5 text-slate-400 bg-white border border-slate-100 rounded-2xl font-black text-[11px] uppercase tracking-widest">Cancel</button>
                <button 
                  form="invoice-form" 
                  type="submit" 
                  disabled={isSaving || !isOnline} 
                  className={`px-10 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center min-w-[160px] ${isOnline ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  {isSaving && <Loader2 size={14} className="animate-spin mr-2" />}
                  {isSaving ? 'Processing...' : (mode === 'add' ? (sendEmail ? 'Dispatch & Save' : 'Execute Only') : 'Execute Changes')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <InvoicePreview 
        isOpen={showPdf} 
        onClose={() => setShowPdf(false)} 
        previewHtml={previewHtml} 
        invoice={formData} 
        onDownload={() => {
          const p = window.open('', '_blank');
          if(p) { p.document.write(previewHtml); p.document.close(); p.onload = () => p.print(); }
        }}
        onEdit={() => { setShowPdf(false); setMode('edit'); }}
      />
    </>
  );
};

export default InvoiceModal;
