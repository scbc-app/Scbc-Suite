
import React from 'react';
import { Receipt, ChevronUp, ChevronDown, History, CreditCard } from 'lucide-react';
import { Invoice, Payment } from '../../types';
import { formatDate, formatCurrency } from '../../constants';

interface BillingSectionProps {
  invoices: Invoice[];
  displayedInvoices: Invoice[];
  showAllInvoices: boolean;
  setShowAllInvoices: (show: boolean) => void;
  payments: Payment[];
  displayedPayments: Payment[];
  showAllPayments: boolean;
  setShowAllPayments: (show: boolean) => void;
}

const BillingSection: React.FC<BillingSectionProps> = ({
  invoices, displayedInvoices, showAllInvoices, setShowAllInvoices,
  payments, displayedPayments, showAllPayments, setShowAllPayments
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit flex flex-col">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <Receipt size={18} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Invoices</span>
        </div>
        <div className="divide-y divide-slate-100">
          {displayedInvoices.map(inv => (
            <div key={inv.InvoiceID} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-[11px] font-bold text-slate-900">INV #{inv.InvoiceID}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Due: {formatDate(inv.DueDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">K{formatCurrency(inv.TotalAmount)}</p>
                <span className={`text-[9px] font-bold uppercase ${inv.Status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{inv.Status}</span>
              </div>
            </div>
          ))}
        </div>
        {invoices.length > 5 && (
          <button 
            onClick={() => setShowAllInvoices(!showAllInvoices)}
            className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-all"
          >
            {showAllInvoices ? (
              <>Show Recent <ChevronUp size={14} /></>
            ) : (
              <>View All Documents <ChevronDown size={14} /></>
            )}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit flex flex-col">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <History size={18} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Payment History</span>
        </div>
        <div className="divide-y divide-slate-100">
          {displayedPayments.map(pay => (
            <div key={pay.PaymentID} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400"><CreditCard size={14} /></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900">{pay.Method}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{formatDate(pay.Date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600">K{formatCurrency(pay.Amount)}</p>
                <span className="text-[9px] font-bold text-slate-300 uppercase">Success</span>
              </div>
            </div>
          ))}
        </div>
        {payments.length > 5 && (
          <button 
            onClick={() => setShowAllPayments(!showAllPayments)}
            className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-all"
          >
            {showAllPayments ? (
              <>Show Recent <ChevronUp size={14} /></>
            ) : (
              <>View All Transactions <ChevronDown size={14} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default BillingSection;
