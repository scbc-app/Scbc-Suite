
import React, { useState, useMemo } from 'react';
import { Search, Plus, AlertCircle, ArrowRightCircle, FileText } from 'lucide-react';
import { Invoice, InvoiceStatus, DocumentType, Payment } from '../types';
import { formatCurrency } from '../constants';
import InvoiceCard from './registry/InvoiceCard';

interface InvoiceRegistryProps {
  invoices: Invoice[];
  payments?: Payment[];
  onAdd: (type: DocumentType) => void;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoiceId: string) => void;
}

const InvoiceRegistry: React.FC<InvoiceRegistryProps> = ({ invoices, payments = [], onAdd, onView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<DocumentType | 'All' | 'Overdue'>('All');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const today = new Date();

  const invoiceLastPaymentMap = useMemo(() => {
    const map: Record<string, Payment> = {};
    payments.forEach(p => {
      if (!p.InvoiceID || p.InvoiceID === '0') return;
      if (!map[p.InvoiceID] || new Date(p.Date) > new Date(map[p.InvoiceID].Date)) {
        map[p.InvoiceID] = p;
      }
    });
    return map;
  }, [payments]);

  const overdueMetrics = useMemo(() => {
    const overdueInvoices = invoices.filter(i => {
      const due = new Date(i.DueDate);
      return i.BalanceDue > 0 && due < today && i.DocType === DocumentType.Invoice;
    });
    return {
      count: overdueInvoices.length,
      total: overdueInvoices.reduce((acc, curr) => acc + Number(curr.BalanceDue), 0)
    };
  }, [invoices, today]);

  const filteredInvoices = invoices.filter(i => {
    const matchesSearch = 
      i.ClientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.InvoiceID.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === 'Overdue') {
        const due = new Date(i.DueDate);
        return i.BalanceDue > 0 && due < today && i.DocType === DocumentType.Invoice;
    }
    if (filterMode !== 'All' && i.DocType !== filterMode) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 overflow-hidden" onClick={() => setActiveMenu(null)}>
      <div className="w-full bg-rose-50 border border-rose-100 rounded-3xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg"><AlertCircle size={24} /></div>
              <div>
                  <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Revenue at Risk</h4>
                  <p className="text-2xl font-black text-rose-900 tracking-tighter">K{formatCurrency(overdueMetrics.total)}</p>
              </div>
          </div>
          <div className="flex items-center gap-6">
              <div className="text-right">
                  <h4 className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Overdue Accounts</h4>
                  <p className="text-lg font-black text-rose-900 leading-none">{overdueMetrics.count} Items</p>
              </div>
              <button onClick={() => setFilterMode('Overdue')} className="flex items-center gap-2 bg-rose-900 text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-800 transition-all active:scale-95">Review Delinquency <ArrowRightCircle size={14} /></button>
          </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 shrink-0">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-2xl w-fit overflow-x-auto no-scrollbar max-w-full">
          {['All', 'Overdue', DocumentType.Invoice, DocumentType.Proforma, DocumentType.Quotation].map(t => (
            <button key={t} onClick={() => setFilterMode(t as any)} className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${filterMode === t ? (t === 'Overdue' ? 'bg-rose-50 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-400 hover:text-slate-600'}`}>{t}{t !== 'All' && t !== 'Overdue' ? 's' : ''}</button>
          ))}
        </div>
        <div className="flex w-full md:max-w-lg items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input type="text" placeholder="SEARCH REGISTRY..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black text-slate-600 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-slate-100/50 transition-all uppercase tracking-widest" />
          </div>
          <button onClick={() => onAdd(DocumentType.Invoice)} className="p-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg active:scale-90 flex-shrink-0"><Plus size={16} strokeWidth={3} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 md:gap-x-8 gap-y-10 md:gap-y-16">
          {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
             <InvoiceCard 
                key={inv.InvoiceID}
                inv={inv}
                lastPayment={invoiceLastPaymentMap[inv.InvoiceID]}
                activeMenu={activeMenu}
                onView={onView}
                onToggleMenu={setActiveMenu}
                onDelete={(id) => { if (confirm(`Delete document ${id}?`)) onDelete(id); }}
             />
          )) : <div className="col-span-full py-24 flex flex-col items-center opacity-10"><FileText size={50} className="mb-4" /><p className="text-[10px] font-black uppercase tracking-[0.8em]">No records found</p></div>}
        </div>
      </div>
    </div>
  );
};

export default InvoiceRegistry;
