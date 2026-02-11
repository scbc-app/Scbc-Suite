
import React from 'react';
import { Mail, Receipt, Loader2, Calculator, Layers } from 'lucide-react';
import SearchableSelect from '../SearchableSelect';
import { CategorySelector, ServicePlanSummary } from './PaymentFormSections';
import { formatDate, formatCurrency } from '../../constants';
import { normalizeID } from '../../logic/handlerUtils';

export const PaymentForm = ({ 
  formData, setFormData, isSaving, clientOptions, handleClientChange,
  category, setCategory, activeContract, calculatedPeriod,
  invoices, useContractTerms, sendEmail, setSendEmail, handleSubmit
}: any) => {
  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-5">
      <SearchableSelect
        label="Target Subscriber" required options={clientOptions}
        value={formData.ClientID || ''} onChange={handleClientChange}
        placeholder="Search registry..."
      />

      <CategorySelector category={category} setCategory={setCategory} isSaving={isSaving} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Payment Date</label>
          <input required type="date" value={formData.Date || ''} onChange={(e) => setFormData({...formData, Date: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold" />
        </div>
        
        {/* Dynamic Amount Behavior */}
        {!useContractTerms ? (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Total Amount (ZMW)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">K</span>
              <input required type="number" step="0.01" value={formData.Amount || ''} onChange={(e) => setFormData({...formData, Amount: parseFloat(e.target.value) || 0})} className="w-full pl-7 p-3 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Derived Total</label>
             <div className="w-full p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-black text-indigo-700 flex justify-between items-center">
                <span>K {formatCurrency(formData.Amount)}</span>
                <Calculator size={14} className="opacity-40" />
             </div>
          </div>
        )}
      </div>

      {/* Subscription Breakdown (Multiplier Mode) */}
      {category === 'subscription' && useContractTerms && (
        <div className="bg-slate-900 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
           <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <Layers size={14} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Subscription Multiplier</h4>
           </div>
           <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Unit Rate</p>
                 <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-500 font-black">K</span>
                    <input type="number" value={formData.UnitPrice} onChange={(e) => setFormData({...formData, UnitPrice: parseFloat(e.target.value) || 0})} className="w-full pl-5 p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-black text-white outline-none" />
                 </div>
              </div>
              <div className="space-y-1">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Asset Qty</p>
                 <input type="number" value={formData.NoOfUnits} onChange={(e) => setFormData({...formData, NoOfUnits: parseInt(e.target.value) || 0})} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-black text-white outline-none" />
              </div>
              <div className="space-y-1">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Months</p>
                 <input type="number" value={formData.MonthsCovered} onChange={(e) => setFormData({...formData, MonthsCovered: parseInt(e.target.value) || 1})} className="w-full p-2 bg-indigo-600 border border-indigo-500 rounded-lg text-xs font-black text-white outline-none" />
              </div>
           </div>
           
           <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Extension Maturity</span>
              <span className="text-xs font-black text-indigo-400">{calculatedPeriod ? formatDate(calculatedPeriod.end) : '—'}</span>
           </div>
        </div>
      )}

      {!useContractTerms && (
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Reference/Purpose</label>
          <input type="text" value={formData.Reference || ''} onChange={(e) => setFormData({...formData, Reference: e.target.value})} placeholder="e.g. Hardware Deposit, Installation Fee" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Link to Ledger</label>
          <select value={formData.InvoiceID || ''} onChange={(e) => setFormData((prev:any) => ({ ...prev, InvoiceID: e.target.value }))} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none">
            <option value="">-- Direct Payment --</option>
            {invoices.filter((i:any) => normalizeID(i.ClientID) === normalizeID(formData.ClientID) && i.Status !== 'Paid').map((inv:any) => (
              <option key={inv.InvoiceID} value={inv.InvoiceID}>{inv.InvoiceID} (Bal: K{formatCurrency(inv.BalanceDue)})</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Method</label>
          <select value={formData.Method} onChange={(e) => setFormData({...formData, Method: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none">
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
          </select>
        </div>
      </div>

      {useContractTerms && (
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Bank Confirmation / TXN Ref</label>
          <input required type="text" value={formData.Reference || ''} onChange={(e) => setFormData({...formData, Reference: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-indigo-600 outline-none" />
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${sendEmail ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}>
            <Mail size={16} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Dispatch Receipt</h4>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Instant delivery to client</p>
          </div>
        </div>
        <button type="button" onClick={() => setSendEmail(!sendEmail)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sendEmail ? 'bg-indigo-600' : 'bg-slate-200'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sendEmail ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </form>
  );
};
