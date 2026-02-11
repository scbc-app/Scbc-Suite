
import React, { useState } from 'react';
import { PiggyBank } from 'lucide-react';
import { Agent, PartnerPayoutModel, InvestmentStatus } from '../../types';
import { 
  PayrollSection, 
  InvestmentParameters, 
  YieldSimulation, 
  SignatureBadge, 
  SmartYieldControls 
} from './finance/FinanceSubComponents';

interface AgentFormFinanceProps {
  formData: Partial<Agent>;
  isReadOnly: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isAdmin: boolean;
}

const AgentFormFinance: React.FC<AgentFormFinanceProps> = ({ formData, isReadOnly, handleChange, isAdmin }) => {
  const [simPool, setSimPool] = useState<number>(50000);

  if (!isAdmin) return null;

  const isPartner = formData.Role === 'Partner';
  const principal = Number(formData.InvestmentPrincipal || 0);
  const duration = Number(formData.InvestmentTermMonths || 12);
  const equityShare = Number(formData.EquityShare || 0);
  const roiCapPercent = Number(formData.MaxMonthlyROI || 0);
  const isSmartYieldActive = !!formData.SmartYieldActive;
  
  const monthlyPrincipalReturn = formData.PartnerPayoutModel === PartnerPayoutModel.PrincipalPlusInterest 
    ? (principal / Math.max(1, duration)) 
    : 0;

  const theoreticalInterest = (simPool * (equityShare / 100));
  const roiCapAmount = (principal * (roiCapPercent / 100));
  const isCapped = isSmartYieldActive && roiCapPercent > 0 && theoreticalInterest > roiCapAmount;
  
  const estimatedVariableInterest = isCapped ? roiCapAmount : theoreticalInterest;
  const totalProjectedTakeaway = monthlyPrincipalReturn + estimatedVariableInterest;
  const totalTermInterest = estimatedVariableInterest * duration;
  const totalTermYield = totalProjectedTakeaway * duration;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PayrollSection isPartner={isPartner} formData={formData} isReadOnly={isReadOnly} handleChange={handleChange} />

      {isPartner && (
        <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-5 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-800">
              <PiggyBank size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">Equity Governance</h3>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-bold text-amber-600 uppercase">Agreement Status:</span>
               <select 
                name="InvestmentStatus" 
                value={formData.InvestmentStatus || InvestmentStatus.Draft} 
                onChange={handleChange} 
                disabled={isReadOnly} 
                className={`px-2 py-0.5 text-[8px] font-black rounded uppercase shadow-sm border-none outline-none cursor-pointer transition-colors ${
                  formData.InvestmentStatus === InvestmentStatus.Active ? 'bg-emerald-500 text-white' : 
                  formData.InvestmentStatus === InvestmentStatus.UnderReview ? 'bg-amber-400 text-slate-900' : 
                  'bg-slate-200 text-slate-600'
                }`}
              >
                <option value={InvestmentStatus.Draft}>Draft (Admin Only)</option>
                <option value={InvestmentStatus.UnderReview}>Issue for Partner Signature</option>
                <option value={InvestmentStatus.Active}>Executed / Active</option>
              </select>
            </div>
          </div>

          <InvestmentParameters formData={formData} isReadOnly={isReadOnly} handleChange={handleChange} />
          
          <YieldSimulation 
            simPool={simPool} setSimPool={setSimPool} isCapped={isCapped} 
            monthlyPrincipalReturn={monthlyPrincipalReturn} estimatedVariableInterest={estimatedVariableInterest} 
            roiCapPercent={roiCapPercent} totalProjectedTakeaway={totalProjectedTakeaway} 
            duration={duration} totalTermInterest={totalTermInterest} totalTermYield={totalTermYield} 
          />

          {formData.InvestmentSignature && <SignatureBadge formData={formData} />}
          <SmartYieldControls formData={formData} handleChange={handleChange} isReadOnly={isReadOnly} />
        </div>
      )}
    </div>
  );
};

export default AgentFormFinance;
