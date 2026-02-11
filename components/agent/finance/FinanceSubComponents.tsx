
import React from 'react';
import { Wallet, PiggyBank, Calculator, ArrowDownCircle, CheckCircle2, Info } from 'lucide-react';
import { Agent, PartnerPayoutModel, InvestmentStatus } from '../../../types';
import { formatCurrency, formatDate } from '../../../constants';

export const PayrollSection = ({ isPartner, formData, isReadOnly, handleChange }: any) => (
  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl shadow-sm">
    <div className="flex items-center justify-between mb-4">
       <div className="flex items-center gap-2 text-slate-800">
         <Wallet size={16} className="text-slate-400" />
         <h3 className="text-sm font-semibold uppercase tracking-wider">
           {isPartner ? 'Partner Remuneration' : 'Payroll & Banking'}
         </h3>
       </div>
       {isPartner && (
         <span className="text-[8px] font-black text-slate-400 uppercase bg-slate-200/50 px-2 py-0.5 rounded">Management Fees</span>
       )}
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase">
          {isPartner ? 'Fixed Draw (ZMW)' : 'Base Salary (ZMW)'}
        </label>
        <input type="number" name="BaseSalary" value={formData.BaseSalary || 0} onChange={handleChange} disabled={isReadOnly} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold" />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Comm. Rate (%)</label>
        <input type="number" name="CommissionRate" value={formData.CommissionRate || 0} onChange={handleChange} disabled={isReadOnly} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Bank Name</label>
        <input type="text" name="BankName" value={formData.BankName || ''} onChange={handleChange} disabled={isReadOnly} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" placeholder="e.g. Stanbic" />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Account No.</label>
        <input type="text" name="AccountNumber" value={formData.AccountNumber || ''} onChange={handleChange} disabled={isReadOnly} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" />
      </div>
    </div>
  </div>
);

export const InvestmentParameters = ({ formData, isReadOnly, handleChange }: any) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-amber-700 uppercase">Principal (ZMW)</label>
      <input type="number" name="InvestmentPrincipal" value={formData.InvestmentPrincipal || 0} onChange={handleChange} disabled={isReadOnly || formData.InvestmentStatus === InvestmentStatus.Active} className="w-full p-2 bg-white border border-amber-200 rounded-lg text-sm font-bold text-amber-900" />
    </div>
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-amber-700 uppercase">Equity Share (%)</label>
      <input type="number" step="0.1" name="EquityShare" value={formData.EquityShare || 0} onChange={handleChange} disabled={isReadOnly || formData.InvestmentStatus === InvestmentStatus.Active} className="w-full p-2 bg-white border border-amber-200 rounded-lg text-sm font-bold text-amber-900" />
    </div>
    <div className="col-span-2 space-y-1">
      <label className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Yield Model</label>
      <select name="PartnerPayoutModel" value={formData.PartnerPayoutModel || PartnerPayoutModel.InterestOnly} onChange={handleChange} disabled={isReadOnly || formData.InvestmentStatus === InvestmentStatus.Active} className="w-full p-2 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-900 outline-none">
        <option value={PartnerPayoutModel.InterestOnly}>Capital Preservation (Profits Only)</option>
        <option value={PartnerPayoutModel.PrincipalPlusInterest}>Amortized Recovery (Profits + Principal)</option>
      </select>
    </div>
  </div>
);

export const YieldSimulation = ({ simPool, setSimPool, isCapped, monthlyPrincipalReturn, estimatedVariableInterest, roiCapPercent, totalProjectedTakeaway, duration, totalTermInterest, totalTermYield }: any) => (
  <div className={`rounded-xl p-4 border transition-all duration-500 ${isCapped ? 'bg-amber-100/50 border-amber-300 shadow-lg' : 'bg-white border-amber-200 shadow-md'}`}>
    <div className="flex items-center justify-between mb-4 border-b border-amber-50 pb-2">
      <div className="flex items-center gap-2">
        <Calculator size={14} className={isCapped ? 'text-amber-600' : 'text-indigo-600'} />
        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Simulation Projection</h4>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-bold text-slate-400 uppercase">Monthly Pool:</span>
        <div className="relative">
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-400">K</span>
          <input type="number" value={simPool} onChange={(e) => setSimPool(Number(e.target.value))} className="w-16 pl-4 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-black outline-none" />
        </div>
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="flex justify-between items-center text-[11px]">
        <span className="text-slate-500 font-medium">Monthly Principal Return:</span>
        <span className="font-bold text-slate-900 tracking-tight">K {formatCurrency(monthlyPrincipalReturn)}</span>
      </div>
      <div className="flex justify-between items-center text-[11px]">
        <span className="text-slate-500 font-medium">Monthly Interest (Share):</span>
        <div className="flex flex-col items-end">
          <span className={`font-bold ${isCapped ? 'text-amber-700' : 'text-indigo-600'}`}>K {formatCurrency(estimatedVariableInterest)}</span>
          {isCapped && <span className="text-[7px] font-black text-amber-600 uppercase tracking-tighter flex items-center gap-1 animate-pulse"><ArrowDownCircle size={7} /> Capped at {roiCapPercent}% ROI</span>}
        </div>
      </div>
      <div className="pt-2 border-t border-amber-100 flex justify-between items-center">
        <span className="text-[10px] font-black text-amber-700 uppercase tracking-tighter">Net Monthly Yield</span>
        <span className={`text-sm font-black ${isCapped ? 'text-amber-600' : 'text-emerald-600'}`}>K {formatCurrency(totalProjectedTakeaway)}</span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-amber-100">
      <div className="bg-amber-100/50 p-2 rounded-lg border border-amber-200/50">
        <p className="text-[7px] font-black text-amber-800 uppercase leading-none mb-1">Total {duration}mo Interest</p>
        <p className="text-[10px] font-black text-amber-900 tracking-tight">K {formatCurrency(totalTermInterest)}</p>
      </div>
      <div className="bg-emerald-500 p-2 rounded-lg border border-emerald-600 shadow-sm">
        <p className="text-[7px] font-black text-emerald-100 uppercase leading-none mb-1">Total Term Payout</p>
        <p className="text-[10px] font-black text-white tracking-tight">K {formatCurrency(totalTermYield)}</p>
      </div>
    </div>
  </div>
);

export const SignatureBadge = ({ formData }: any) => (
  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between animate-in zoom-in duration-300">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-lg"><CheckCircle2 size={16} /></div>
      <div>
        <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none">Agreement Executed</h4>
        <p className="text-[8px] font-bold text-emerald-600 uppercase mt-1">Signed on {formatDate(formData.InvestmentSignedDate)}</p>
      </div>
    </div>
    <div className="bg-white p-1 rounded-lg border border-emerald-100">
      <img src={formData.InvestmentSignature} alt="Signed" className="h-6 opacity-60 mix-blend-multiply" />
    </div>
  </div>
);

export const SmartYieldControls = ({ formData, handleChange, isReadOnly }: any) => (
  <div className="pt-4 border-t border-amber-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
        Max Monthly ROI Cap (%)
        <div className="group relative">
          <Info size={10} className="text-amber-400 cursor-help" />
          <div className="absolute bottom-full left-0 mb-2 w-56 p-3 bg-slate-900 text-white text-[9px] rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 shadow-2xl border border-white/10">
            <strong>Stabilization Cap:</strong> Excess profits are diverted to a Reserve Buffer to maintain consistent payouts during low-revenue months.
          </div>
        </div>
      </label>
      <input type="number" step="0.1" name="MaxMonthlyROI" value={formData.MaxMonthlyROI || 0} onChange={handleChange} disabled={isReadOnly || formData.InvestmentStatus === InvestmentStatus.Active} className="w-full p-2 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-900" />
    </div>
    <div className="flex flex-col justify-center pt-2">
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input type="checkbox" name="SmartYieldActive" checked={!!formData.SmartYieldActive} onChange={handleChange} disabled={isReadOnly || formData.InvestmentStatus === InvestmentStatus.Active} className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-amber-700 uppercase tracking-tighter">SmartYield™ Active</span>
          <span className="text-[7px] text-slate-400 font-bold uppercase">Automated Smoothing</span>
        </div>
      </label>
    </div>
  </div>
);
