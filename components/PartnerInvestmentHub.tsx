
import React, { useState } from 'react';
import { Agent, AppState, InvestmentStatus } from '../types';
import SignaturePad from './SignaturePad';
import { 
  PartnerReviewView, 
  PartnerWealthBar, 
  NodePerformanceTab, 
  SalesDistributionTab, 
  LegalMSARecord, 
  PartnerModals 
} from './partner/PartnerHubSubComponents';

interface PartnerInvestmentHubProps {
  data: AppState;
  onUpdatePartner: (agent: Agent) => Promise<void>;
}

const PartnerInvestmentHub: React.FC<PartnerInvestmentHubProps> = ({ data, onUpdatePartner }) => {
  const [activeTab, setActiveTab] = useState<'wealth' | 'team' | 'legal'>('wealth');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [counterShare, setCounterShare] = useState<number>(0);
  const [counterTerm, setCounterTerm] = useState<number>(0);
  const [counterNote, setCounterNote] = useState('');

  const currentPartner = data.agents.find(a => a.AgentID === data.currentUser?.id);
  const salesForce = data.agents.filter(a => a.Role === 'Agent' || a.Role === 'Support');

  if (!currentPartner) return null;

  const isExecuted = currentPartner.InvestmentStatus === InvestmentStatus.Active;
  const isPendingReview = currentPartner.InvestmentStatus === InvestmentStatus.UnderReview;
  const termMonths = Number(currentPartner.InvestmentTermMonths || 12);
  const startDate = currentPartner.InvestmentDate ? new Date(currentPartner.InvestmentDate) : new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + termMonths);
  const monthsRemaining = Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
  const progressPercent = Math.min(100, Math.max(0, ((termMonths - monthsRemaining) / termMonths) * 100));

  const handleDeposit = async () => {
    if (!currentPartner || depositAmount <= 0) return;
    setIsProcessing(true);
    try {
      await onUpdatePartner({ ...currentPartner, InvestmentPrincipal: (currentPartner.InvestmentPrincipal || 0) + depositAmount });
      setDepositAmount(0);
      setShowDepositModal(false);
    } finally { setIsProcessing(false); }
  };

  const handleCounterPropose = async () => {
    setIsProcessing(true);
    try {
      await onUpdatePartner({ ...currentPartner, EquityShare: counterShare, InvestmentTermMonths: counterTerm, ProposalNotes: `PARTNER SUGGESTION: ${counterNote}`, InvestmentStatus: InvestmentStatus.CounterProposed });
      setShowNegotiationModal(false);
    } finally { setIsProcessing(false); }
  };

  const handleSignAgreement = async (name: string, title: string, image: string) => {
    setIsProcessing(true);
    try {
      await onUpdatePartner({ ...currentPartner, InvestmentSignature: image, InvestmentSignedDate: new Date().toISOString(), InvestmentStatus: InvestmentStatus.Active });
      setShowSigningModal(false);
    } finally { setIsProcessing(false); }
  };

  if (!isExecuted) {
    return (
      <>
        <PartnerReviewView 
          currentPartner={currentPartner} isPendingReview={isPendingReview} principal={currentPartner.InvestmentPrincipal || 0} 
          share={currentPartner.EquityShare || 0} termMonths={termMonths} monthlyCapital={(currentPartner.InvestmentPrincipal || 0) / Math.max(1, termMonths)} 
          setShowNegotiationModal={setShowNegotiationModal} setShowSigningModal={setShowSigningModal} 
        />
        <PartnerModals 
          showNegotiationModal={showNegotiationModal} setShowNegotiationModal={setShowNegotiationModal} 
          counterShare={counterShare} setCounterShare={setCounterShare} counterTerm={counterTerm} setCounterTerm={setCounterTerm} 
          counterNote={counterNote} setCounterNote={setCounterNote} handleCounterPropose={handleCounterPropose} 
        />
        <SignaturePad isOpen={showSigningModal} onClose={() => setShowSigningModal(false)} role="Client" defaultName={currentPartner.AgentName} defaultTitle="Authorized Shareholder" onConfirm={handleSignAgreement} />
      </>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
      <PartnerWealthBar principal={currentPartner.InvestmentPrincipal} share={currentPartner.EquityShare} payoutModel={currentPartner.PartnerPayoutModel} setShowDepositModal={setShowDepositModal} />
      <div className="flex border-b border-gray-100 bg-white px-6 shrink-0">
        {['wealth', 'team', 'legal'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-4 text-[10px] font-black tracking-widest border-b-2 transition-colors uppercase ${activeTab === tab ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-400'}`}>
            {tab === 'wealth' ? 'Node Performance' : tab === 'team' ? 'Sales Distribution' : 'MSA Record'}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/30">
        {activeTab === 'wealth' && <NodePerformanceTab monthsRemaining={monthsRemaining} progressPercent={progressPercent} endDate={endDate.toISOString()} baseSalary={currentPartner.BaseSalary} equityShare={currentPartner.EquityShare} />}
        {activeTab === 'team' && <SalesDistributionTab salesForce={salesForce} />}
        {activeTab === 'legal' && <LegalMSARecord currentPartner={currentPartner} />}
      </div>
      <PartnerModals showDepositModal={showDepositModal} setShowDepositModal={setShowDepositModal} depositAmount={depositAmount} setDepositAmount={setDepositAmount} handleDeposit={handleDeposit} isProcessing={isProcessing} />
    </div>
  );
};

export default PartnerInvestmentHub;
