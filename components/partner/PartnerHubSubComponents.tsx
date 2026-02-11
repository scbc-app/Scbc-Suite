
import React from 'react';
import { Gavel, Handshake, Calculator, ArrowUpCircle, MessageSquare, PenTool, PiggyBank, Activity, TrendingUp, Plus, ShieldCheck, CheckCircle, User, X, Coins, ShieldAlert, Target, Info } from 'lucide-react';
import { PartnerPayoutModel, InvestmentStatus, Agent } from '../../types';
import { formatCurrency, formatDate } from '../../constants';

export const PartnerReviewView = ({ currentPartner, isPendingReview, principal, share, termMonths, monthlyCapital, setShowNegotiationModal, setShowSigningModal }: any) => {
  const totalPrincipalRecovery = currentPartner.PartnerPayoutModel === PartnerPayoutModel.PrincipalPlusInterest ? principal : 0;
  
  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 md:p-12 overflow-y-auto no-scrollbar animate-in fade-in duration-700">
       <div className="max-w-4xl mx-auto w-full space-y-8">
          <div className="text-center space-y-3">
             <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center text-amber-500 mx-auto border border-amber-100">
                <Handshake size={32} />
             </div>
             <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Agreement Review</h1>
             <p className="text-slate-500 font-medium max-w-md mx-auto">Please review and authorize the professional partnership terms drafted by the Admin.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-5"><Gavel size={120} /></div>
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full animate-pulse ${isPendingReview ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Status: {isPendingReview ? 'Ready for Signature' : currentPartner.InvestmentStatus?.replace(/([A-Z])/g, ' $1').trim() || 'Terms Pending'}
                   </span>
                </div>
                <div className="text-right">
                   <span className="text-[9px] font-bold text-slate-400 uppercase">Registry Reference</span>
                   <p className="text-xs font-black text-slate-900 uppercase">PARTNER-{currentPartner.AgentID}</p>
                </div>
             </div>

             <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Principal</p>
                   <p className="text-3xl font-black text-slate-900 tracking-tighter">K{formatCurrency(principal)}</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Capital Commitment</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equity Allocation</p>
                   <p className="text-3xl font-black text-indigo-600 tracking-tighter">{share}%</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase">On Global Sales Volume</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agreement Term</p>
                   <p className="text-3xl font-black text-slate-900 tracking-tighter">{termMonths} Mo</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Maturity Horizon</p>
                </div>
             </div>

             {/* PROPOSAL POLICY BLOCK */}
             <div className="mx-10 mb-8 p-6 bg-slate-900 text-white rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-8 opacity-5"><ShieldAlert size={100} /></div>
                <div className="space-y-4 relative z-10">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg"><Activity size={20} /></div>
                      <h4 className="text-[11px] font-black uppercase tracking-widest">Yield Mechanism</h4>
                   </div>
                   <div className="space-y-2">
                      <p className="text-sm font-bold text-white uppercase">{currentPartner.PartnerPayoutModel === PartnerPayoutModel.InterestOnly ? 'Capital Preservation' : 'Amortized Recovery'}</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {currentPartner.PartnerPayoutModel === PartnerPayoutModel.InterestOnly 
                          ? 'Principal remains locked for the duration. Monthly payouts consist of profit share only.' 
                          : 'Monthly payouts include a portion of your principal + profit share for gradual capital exit.'}
                      </p>
                   </div>
                </div>

                <div className="space-y-4 relative z-10">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg"><Target size={20} /></div>
                      <h4 className="text-[11px] font-black uppercase tracking-widest">Risk Mitigation</h4>
                   </div>
                   <div className="space-y-2">
                      <p className="text-sm font-bold text-white uppercase">{currentPartner.SmartYieldActive ? 'SmartYield™ Enabled' : 'Standard Yield'}</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {currentPartner.SmartYieldActive 
                          ? `Stabilized returns capped at ${currentPartner.MaxMonthlyROI}% ROI per month to ensure long-term solvency.` 
                          : 'Variable returns based strictly on monthly unified sales performance.'}
                      </p>
                   </div>
                </div>
             </div>

             <div className="mx-10 mb-8 p-6 bg-slate-50 border border-slate-100 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600"><Calculator size={24} /></div>
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Principal Exit</h4>
                      <p className="text-xl font-black text-slate-900 leading-none mt-1">K{formatCurrency(monthlyCapital)}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600"><TrendingUp size={24} /></div>
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guaranteed Draw</h4>
                      <p className="text-xl font-black text-slate-900 leading-none mt-1">K{formatCurrency(currentPartner.BaseSalary)}</p>
                   </div>
                </div>
             </div>

             {currentPartner.ProposalNotes && (
                <div className="mx-10 mb-10 p-6 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-3xl relative overflow-hidden">
                   <div className="absolute right-0 top-0 p-4 opacity-10"><MessageSquare size={40} /></div>
                   <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-2">Internal Proposal Addendum</h4>
                   <p className="text-sm font-medium italic leading-relaxed text-indigo-800">"{currentPartner.ProposalNotes}"</p>
                </div>
             )}

             <div className="p-10 bg-slate-100 border-t border-slate-200 flex flex-col md:flex-row gap-4">
                <button onClick={() => setShowNegotiationModal(true)} className="flex-1 px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-amber-400 transition-all flex items-center justify-center gap-2"><MessageSquare size={16} /> Negotiate Terms</button>
                <button 
                  onClick={() => setShowSigningModal(true)} 
                  disabled={!isPendingReview} 
                  className={`flex-1 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all ${isPendingReview ? 'bg-slate-900 text-white hover:bg-emerald-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  <PenTool size={16} /> {isPendingReview ? 'Authorize & Sign Agreement' : 'Draft Status: Awaiting Publication'}
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export const PartnerWealthBar = ({ principal, share, payoutModel, setShowDepositModal }: any) => (
  <div className="bg-slate-900 rounded-[2.5rem] p-8 mb-8 text-white relative overflow-hidden shadow-2xl border border-slate-800">
     <div className="absolute right-0 top-0 p-12 opacity-10 rotate-12"><PiggyBank size={180} /></div>
     <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg"><Gavel size={32} /></div>
           <div>
              <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-1">Active Share Principal</h4>
              <p className="text-4xl font-black tracking-tighter">K{formatCurrency(principal)}</p>
              <div className="flex items-center gap-4 mt-2">
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Activity size={12} className="text-emerald-500" /> Share: {share}% Revenue Node</span>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><TrendingUp size={12} className="text-indigo-400" /> Model: {payoutModel === PartnerPayoutModel.InterestOnly ? 'Capital Preservation' : 'Amortized Recovery'}</span>
              </div>
           </div>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setShowDepositModal(true)} className="px-8 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95 flex items-center gap-2 shadow-xl"><Plus size={16} /> Increase Principal</button>
           <div className="px-8 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl border border-emerald-400"><ShieldCheck size={16} /> Authenticated Partner</div>
        </div>
     </div>
  </div>
);

export const NodePerformanceTab = ({ monthsRemaining, progressPercent, endDate, baseSalary, equityShare }: any) => (
  <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-[160px]">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Maturity Progress</p>
          <div className="flex items-end justify-between mb-3">
             <h3 className="text-2xl font-black text-slate-900">{monthsRemaining} Months Remaining</h3>
             <span className="text-xs font-bold text-amber-600">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase mt-4">Termination Node: {formatDate(endDate)}</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-[160px]">
         <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Operational Draw</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">K{formatCurrency(baseSalary)}</h3>
         </div>
         <div className="pt-2 border-t border-slate-50">
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10} /> Guaranteed Disbursement</span>
         </div>
      </div>

      <div className="bg-amber-900 p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden h-[160px]">
         <div className="absolute -right-4 -bottom-4 opacity-10"><TrendingUp size={120} /></div>
         <p className="text-[10px] font-black text-amber-200/60 uppercase tracking-widest mb-4">Equity Participation</p>
         <h3 className="text-2xl font-black text-white leading-tight">{equityShare}% Variable Performance Allocation</h3>
      </div>
    </div>

    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-8">
         <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Activity size={16} className="text-amber-500" /> Monthly Growth Trend</h3>
      </div>
      <div className="h-64 flex items-end justify-between gap-4 px-4">
         {[40, 45, 42, 55, 60, 58, 65, 75, 80, 78, 85, 95].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
               <div className="w-full relative">
                  <div className="bg-indigo-500 rounded-t-lg transition-all duration-700 w-full group-hover:bg-indigo-400" style={{ height: `${val * 0.8}px` }}></div>
                  <div className="bg-amber-500 rounded-t-lg transition-all duration-700 w-full absolute bottom-0 opacity-50" style={{ height: `${val * 0.4}px` }}></div>
               </div>
               <span className="text-[7px] font-black text-slate-300 uppercase">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
            </div>
         ))}
      </div>
    </div>
  </div>
);

export const SalesDistributionTab = ({ salesForce }: any) => (
  <div className="max-w-6xl mx-auto animate-in slide-in-from-right-4 duration-500">
     <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Sales Team</h2>
           <p className="text-xs text-slate-400 mt-1">Personnel contributing to the global revenue pool</p>
        </div>
     </div>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salesForce.map((agent: Agent) => (
           <div key={agent.AgentID} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-amber-50 transition-colors"><User size={28} /></div>
                 <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{agent.AgentName}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{agent.Department}</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                 <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Status</p>
                    <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${agent.Status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{agent.Status}</span>
                 </div>
              </div>
           </div>
        ))}
     </div>
  </div>
);

export const LegalMSARecord = ({ currentPartner }: any) => (
  <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
     <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden p-12">
        <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
           <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Master Shareholder Agreement</h1>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.3em]">Binding Partnership Terms • Ref: PARTNER-{currentPartner.AgentID}</p>
           </div>
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase">Effective Since</p>
              <p className="text-sm font-black text-slate-900">{formatDate(currentPartner.InvestmentSignedDate)}</p>
           </div>
        </div>
        <div className="space-y-8 text-slate-600 text-sm leading-relaxed max-h-[600px] overflow-y-auto pr-6 custom-scrollbar">
           <section>
              <h4 className="font-black text-slate-900 uppercase text-xs mb-3 flex items-center gap-2"><div className="w-1 h-4 bg-amber-500 rounded-full"></div> 1. FINANCIAL POSITION</h4>
              <p>The Partner maintains an active investment principal of <strong>K{formatCurrency(currentPartner.InvestmentPrincipal)}</strong>. The company acknowledges receipt of this capital, which grants the Partner a preferential right to <strong>{currentPartner.EquityShare}%</strong> of the gross monthly sales revenue generated by the unified sales force.</p>
           </section>
           <section>
              <h4 className="font-black text-slate-900 uppercase text-xs mb-3 flex items-center gap-2"><div className="w-1 h-4 bg-amber-500 rounded-full"></div> 2. DISBURSEMENT PROTOCOL</h4>
              <p>Profits are calculated based on realized monthly collections. Payouts are dispatched on the company's standard disbursement cycle. In the event of an Amortized Recovery model, the Principal portion of the payout is treated as a return of capital, and the variable portion as investment yield.</p>
           </section>
           <section>
              <h4 className="font-black text-slate-900 uppercase text-xs mb-3 flex items-center gap-2"><div className="w-1 h-4 bg-amber-500 rounded-full"></div> 3. GOVERNANCE</h4>
              <p>This agreement remains in effect for <strong>{currentPartner.InvestmentTermMonths} months</strong>. Early termination or withdrawal of principal requires a standard 90-day written notice to ensure fleet operational continuity is not disrupted by capital fluctuations.</p>
           </section>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-2 gap-12">
           <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">For Sally Chanza Business Café</p>
              <div className="h-16 border-b border-slate-200 flex items-end pb-2 italic text-slate-400 font-serif text-lg">Sally Chanza</div>
              <p className="text-[11px] font-bold text-slate-700 uppercase">Director & Administrator</p>
           </div>
           <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shareholder Authorization</p>
              <div className="h-16 border-b border-slate-200 flex items-end pb-2">
                 <img src={currentPartner.InvestmentSignature} alt="Signature" className="h-14 mix-blend-multiply" />
              </div>
              <p className="text-[11px] font-bold text-slate-700 uppercase">{currentPartner.AgentName} • Partner</p>
           </div>
        </div>
     </div>
  </div>
);

export const PartnerModals = ({ showDepositModal, setShowDepositModal, depositAmount, setDepositAmount, handleDeposit, isProcessing, showNegotiationModal, setShowNegotiationModal, counterShare, setCounterShare, counterTerm, setCounterTerm, counterNote, setCounterNote, handleCounterPropose }: any) => (
  <>
    {showDepositModal && (
       <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Coins size={20} /></div>
                   <h3 className="font-black text-slate-900 uppercase text-sm">Principal Injection</h3>
                </div>
                <button onClick={() => setShowDepositModal(false)}><X size={20} className="text-slate-300" /></button>
             </div>
             <div className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contribution (ZMW)</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">K</span>
                      <input autoFocus type="number" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} className="w-full pl-10 p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-3xl font-black" />
                   </div>
                </div>
             </div>
             <div className="p-8 bg-slate-50 flex gap-4">
                <button onClick={() => setShowDepositModal(false)} className="flex-1 px-6 py-3 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                <button onClick={handleDeposit} disabled={isProcessing || depositAmount <= 0} className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-xl">Confirm Capital</button>
             </div>
          </div>
       </div>
    )}

    {showNegotiationModal && (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
               <h3 className="font-black text-slate-900 uppercase text-sm">Negotiation Panel</h3>
               <button onClick={() => setShowNegotiationModal(false)}><X size={20} className="text-slate-300" /></button>
            </div>
            <div className="p-10 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase">Target Share (%)</label>
                     <input type="number" step="0.1" value={counterShare} onChange={(e) => setCounterShare(Number(e.target.value))} className="w-full p-3 bg-slate-50 border rounded-xl outline-none font-black text-indigo-600" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase">Target Term (Mo)</label>
                     <input type="number" value={counterTerm} onChange={(e) => setCounterTerm(Number(e.target.value))} className="w-full p-3 bg-slate-50 border rounded-xl outline-none font-black text-slate-900" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Rationale</label>
                  <textarea value={counterNote} onChange={(e) => setCounterNote(e.target.value)} placeholder="Explain your suggested changes..." className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium resize-none focus:ring-4 focus:ring-indigo-50" />
               </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
               <button onClick={() => setShowNegotiationModal(false)} className="flex-1 px-6 py-3 text-[10px] font-black uppercase text-slate-400">Cancel</button>
               <button onClick={handleCounterPropose} className="flex-1 bg-amber-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase">Submit Counter-Offer</button>
            </div>
         </div>
      </div>
    )}
  </>
);
