
import React from 'react';
import { User, Calendar, Clock, Hash } from 'lucide-react';
import { Payment } from '../../types';
import { formatDate, formatCurrency } from '../../constants';

const DetailRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | React.ReactNode }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <div className="flex items-center text-slate-500">
      <Icon size={14} className="mr-2" />
      <span className="text-xs">{label}</span>
    </div>
    <span className="text-xs font-medium text-slate-900">{value || '—'}</span>
  </div>
);

export const PaymentView = ({ formData }: { formData: Partial<Payment> }) => (
  <div className="space-y-4">
    <div className="text-center py-5 bg-white border border-slate-100 rounded-xl">
      <p className="text-[10px] text-slate-400 uppercase font-medium mb-1">Amount Received</p>
      <h1 className="text-2xl font-bold text-slate-900">K{formatCurrency(formData.Amount)}</h1>
      <div className={`inline-flex items-center mt-2 px-3 py-0.5 rounded-full text-[9px] font-semibold border ${formData.Status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
        {formData.Status}
      </div>
    </div>
    <div className="bg-white border border-slate-100 rounded-xl px-4 py-1">
      <DetailRow icon={User} label="Customer" value={formData.ClientName} />
      <DetailRow icon={Calendar} label="Date" value={formatDate(formData.Date)} />
      {formData.MonthsCovered && formData.MonthsCovered > 0 && (
        <DetailRow icon={Clock} label="Duration" value={`${formData.MonthsCovered} Month(s)`} />
      )}
      <DetailRow icon={Hash} label="Ref" value={formData.Reference} />
    </div>
  </div>
);
