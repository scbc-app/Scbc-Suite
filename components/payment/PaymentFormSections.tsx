
import React from 'react';
import { Repeat, ShoppingBag, Landmark, HelpCircle, Info } from 'lucide-react';
import { formatCurrency } from '../../constants';

export const CategorySelector = ({ category, setCategory, isSaving }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Payment Type</label>
    <div className="grid grid-cols-4 gap-2">
      {[
        { id: 'subscription', label: 'Monthly', icon: Repeat },
        { id: 'one-off', label: 'One-off', icon: ShoppingBag },
        { id: 'hire-purchase', label: 'Installment', icon: Landmark },
        { id: 'other', label: 'Other', icon: HelpCircle }
      ].map((cat) => (
        <button
          key={cat.id}
          type="button"
          disabled={isSaving}
          onClick={() => setCategory(cat.id as any)}
          className={`flex flex-col items-center py-2 px-1 rounded-lg border transition-all gap-1 ${category === cat.id ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-400'}`}
        >
          <cat.icon size={14} className={category === cat.id ? 'text-indigo-600' : 'text-slate-400'} />
          <span className={`text-[9px] font-medium ${category === cat.id ? 'text-indigo-900' : 'text-slate-500'}`}>{cat.label}</span>
        </button>
      ))}
    </div>
  </div>
);

export const ServicePlanSummary = ({ activeContract, isNewClient }: any) => (
  <>
    {isNewClient && activeContract && (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-3">
        <Info size={16} className="text-indigo-500 mt-0.5" />
        <p className="text-[11px] text-slate-600 leading-relaxed">
          <strong>First Payment:</strong> This is the initial payment to activate this account. Activation documents will be created automatically after saving.
        </p>
      </div>
    )}
    {activeContract && (
      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex justify-between items-center">
        <div className="min-w-0">
          <p className="text-[9px] font-medium text-slate-400 uppercase">Service Plan</p>
          <h4 className="text-xs font-semibold text-slate-800 truncate">{activeContract.PlanType} ({activeContract.NoOfUnits} Units)</h4>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] font-medium text-slate-400 uppercase">Unit Rate</p>
          <p className="text-xs font-semibold text-slate-900">K{formatCurrency(activeContract.UnitPrice)}</p>
        </div>
      </div>
    )}
  </>
);
