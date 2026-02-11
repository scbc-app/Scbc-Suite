
import React, { useState, useMemo } from 'react';
import { AlertCircle, Gift, ShieldCheck, Key, Video, Bell, Shield, Headphones, Heart, ChevronUp } from 'lucide-react';
import { AppState, Contract, Invoice, Vehicle, Ticket, TicketStatus, Referral } from '../types';
import { formatDate } from '../constants';
import ContractPreview from './ContractPreview';
import SignaturePad from './SignaturePad';
import { generateContractHTML } from '../services/contractPdfService';

// Sub-components
import PortalHeader from './portal/PortalHeader';
import SupportSection from './portal/SupportSection';
import FleetSection from './portal/FleetSection';
import BillingSection from './portal/BillingSection';
import PortalTabs, { PortalTab } from './portal/PortalTabs';
import PromotionBanner from './portal/PromotionBanner';
import DocumentsRegistry from './portal/DocumentsRegistry';
import { TicketModal, ReferralModal } from './portal/PortalModals';

interface ClientPortalProps {
  data: AppState;
  onSignContract: (contract: Contract) => Promise<void>;
  onReportIssue?: (ticket: Ticket) => Promise<void>;
  onSaveReferral?: (referral: Referral) => Promise<void>;
}

const FEATURED_SERVICES = [
  { id: 'push', label: 'Push to Start Conversion', icon: Key, desc: 'Upgrade from traditional key ignition to a modern push-button start system with proximity sensing.' },
  { id: 'dash', label: 'Dashcams', icon: Video, desc: 'High-definition video recording solutions for incident documentation and safety.' },
  { id: 'alarm', label: 'Vehicle Alarm System', icon: Bell, desc: 'Advanced anti-theft protection with precision sensors and remote monitoring integration.' },
  { id: 'rec', label: 'Tracking Officer', icon: Shield, desc: 'Professional personnel dedicated to active monitoring of your high-value assets.' }
];

const ClientPortal: React.FC<ClientPortalProps> = ({ data, onSignContract, onReportIssue, onSaveReferral }) => {
  const [activeTab, setActiveTab] = useState<PortalTab>('home');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketTab, setTicketTab] = useState<'active' | 'history'>('active');

  const [referralName, setReferralName] = useState('');
  const [referralCompany, setReferralCompany] = useState('');
  const [referralPhone, setReferralPhone] = useState('');

  const [showAllTickets, setShowAllTickets] = useState(false);
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);

  const clientID = data.currentUser?.id;
  const myClient = data.clients.find(c => c.ClientID === clientID);
  
  const myContracts = useMemo(() => {
     if (!clientID) return [];
     return data.contracts
      .filter(c => String(c.ClientID).trim() === String(clientID).trim())
      .sort((a, b) => new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime());
  }, [data.contracts, clientID]);

  const myVehicles = useMemo(() => {
    return data.vehicles
      .filter(v => v.ClientID === clientID)
      .sort((a, b) => a.NumberPlate.localeCompare(b.NumberPlate));
  }, [data.vehicles, clientID]);

  const myInvoices = useMemo(() => {
    return data.invoices
      .filter(i => i.ClientID === clientID)
      .sort((a, b) => new Date(b.InvoiceDate).getTime() - new Date(a.InvoiceDate).getTime());
  }, [data.invoices, clientID]);

  const myPayments = useMemo(() => {
    return data.payments
      .filter(p => p.ClientID === clientID)
      .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
  }, [data.payments, clientID]);

  const myReferrals = useMemo(() => {
    return data.referrals.filter(r => r.ReferrerID === clientID);
  }, [data.referrals, clientID]);

  const successfulReferrals = myReferrals.filter(r => r.Status === 'Successful');

  const isEligibleForPromotion = useMemo(() => {
    const hasEnoughReferrals = successfulReferrals.length >= 2;
    const hasZeroOverdue = !myInvoices.some(i => i.Status === 'Overdue');
    const hasStrongPaymentHistory = myInvoices.filter(i => i.Status === 'Paid').length >= 3;
    return hasEnoughReferrals && hasZeroOverdue && hasStrongPaymentHistory;
  }, [successfulReferrals, myInvoices]);

  const activeContract = myContracts.find(c => c.ContractStatus === 'Active');

  const allTickets = useMemo(() => {
    return data.tickets
      .filter(t => t.ClientID === clientID)
      .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
  }, [data.tickets, clientID]);

  const activeTickets = allTickets.filter(t => t.Status !== 'Resolved');
  const resolvedTickets = allTickets.filter(t => t.Status === 'Resolved');

  const pendingContract = useMemo(() => {
    if (!clientID) return undefined;
    return myContracts.find(c => {
        const sigData = c.ClientSign || c.ClientSignImage;
        const isSigned = !!sigData;
        return !isSigned && c.ContractStatus === 'Active';
    });
  }, [myContracts, clientID]);

  const handleOpenPreview = (contract: Contract) => {
    const client = data.clients.find(c => c.ClientID === clientID);
    const html = generateContractHTML(contract, client, data.vehicles, data.systemSettings, data.agents);
    setPreviewHtml(html);
    setSelectedContract(contract);
    setIsPreviewOpen(true);
  };

  const handleConfirmSignature = async (name: string, title: string, image: string) => {
    if (!selectedContract) return;
    const updatedContract = {
      ...selectedContract,
      ClientSignName: name,
      ClientSignTitle: title,
      ClientSignDate: new Date().toISOString(),
      ClientSign: image,
      ClientSignImage: image
    } as Contract;

    await onSignContract(updatedContract);
    setIsSigning(false);
    setIsPreviewOpen(false);
    setPreviewHtml(null);
    setSelectedContract(null);
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onReportIssue || !clientID) return;
    setIsSubmittingTicket(true);
    try {
      const newTicket: Ticket = {
        TicketID: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        ClientID: clientID,
        Subject: ticketSubject,
        Description: ticketDescription,
        Status: TicketStatus.Open,
        Priority: 'Normal',
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString()
      };
      await onReportIssue(newTicket);
      setTicketSubject('');
      setTicketDescription('');
      setIsTicketModalOpen(false);
      setTicketTab('active');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onReportIssue || !onSaveReferral || !clientID) return;
    setIsSubmittingTicket(true);
    try {
      const refID = `REF-${Math.floor(1000 + Math.random() * 9000)}`;
      const newReferral: Referral = {
        ID: refID,
        ReferrerID: clientID,
        ReferrerName: myClient?.CompanyName || 'Unknown',
        FriendName: referralName,
        FriendCompany: referralCompany,
        FriendPhone: referralPhone,
        Date: new Date().toISOString(),
        Status: 'Pending'
      };
      await onSaveReferral(newReferral);
      const newTicket: Ticket = {
        TicketID: refID,
        ClientID: clientID,
        Subject: `REFERRAL RECORD: ${referralName}`,
        Description: `CLIENT REFERRAL PROGRAM\nReferred: ${referralName}\nCompany: ${referralCompany}\nPhone: ${referralPhone}\n\nClient ${myClient?.CompanyName} is requesting 1 month free credit upon activation.`,
        Status: TicketStatus.Open,
        Priority: 'High',
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString()
      };
      await onReportIssue(newTicket);
      setReferralName('');
      setReferralCompany('');
      setReferralPhone('');
      setIsReferralModalOpen(false);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6 flex-1 flex flex-col min-h-0">
        
        <PortalHeader client={myClient} invoices={myInvoices} />

        <PortalTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {activeTab === 'home' && (
              <div className="space-y-6">
                <PromotionBanner 
                  isEligible={isEligibleForPromotion} 
                  onClaim={() => { setTicketSubject('Application: Trainee Agent Status'); setTicketDescription('I have met the eligibility criteria for Trainee Agent status and would like to apply.'); setIsTicketModalOpen(true); }} 
                />

                {pendingContract && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-amber-800">
                      <AlertCircle size={24} />
                      <div>
                        <p className="font-bold text-sm">Signature Required</p>
                        <p className="text-xs">Please review and sign your service agreement for {pendingContract.ContractID}.</p>
                      </div>
                    </div>
                    <button onClick={() => handleOpenPreview(pendingContract)} className="w-full md:w-auto px-6 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-all">Sign Document</button>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/30">
                        <Gift size={14} className="text-indigo-600" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-700">Growth Tracker</span>
                      </div>
                      <div className="p-3 grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
                            <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Referrals</p>
                            <p className="text-lg font-black text-slate-900 leading-none">{myReferrals.length}</p>
                        </div>
                        <div className="bg-emerald-50 p-2.5 rounded-xl text-center border border-emerald-100">
                            <p className="text-[7px] font-black text-emerald-500 uppercase mb-1">Activated</p>
                            <p className="text-lg font-black text-emerald-700 leading-none">{successfulReferrals.length}</p>
                        </div>
                      </div>
                      <div className="px-4 pb-4">
                        <div className="flex items-center justify-between text-[7px] font-black uppercase text-slate-400 mb-1.5">
                            <span>Rank Progression</span>
                            <span className={isEligibleForPromotion ? 'text-indigo-600' : 'text-slate-500'}>
                              {isEligibleForPromotion ? 'Elite Tier' : 'Standard Tier'}
                            </span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${Math.min(100, (successfulReferrals.length / 2) * 100)}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-[160px]">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <ShieldCheck size={14} /> Account Status
                      </div>
                      <div className="py-1">
                        <h2 className="text-3xl font-bold text-slate-900">{myClient?.Status || 'Active'}</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Verified Client Member</p>
                      </div>
                      <div className="pt-2 border-t border-slate-50 text-[9px] font-bold text-slate-400 uppercase">
                        Member Since {formatDate(myClient?.OnboardingDate)}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                     <FleetSection activeContract={activeContract} vehicles={myVehicles.slice(0, 3)} />
                     <button onClick={() => setActiveTab('fleet')} className="w-full mt-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest">View Full Fleet Inventory</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fleet' && (
              <div className="space-y-6">
                <FleetSection activeContract={activeContract} vehicles={myVehicles} />
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <BillingSection 
                  invoices={myInvoices} displayedInvoices={showAllInvoices ? myInvoices : myInvoices.slice(0, 5)} 
                  showAllInvoices={showAllInvoices} setShowAllInvoices={setShowAllInvoices}
                  payments={myPayments} displayedPayments={showAllPayments ? myPayments : myPayments.slice(0, 5)}
                  showAllPayments={showAllPayments} setShowAllPayments={setShowAllPayments}
                />
                <DocumentsRegistry contracts={myContracts} onView={handleOpenPreview} />
              </div>
            )}

            {activeTab === 'support' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                   <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center space-y-4 mb-6">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                         <Headphones size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">How can we help today?</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">Our technical team is ready to assist you with any service or hardware inquiries.</p>
                      </div>
                      <button onClick={() => setIsTicketModalOpen(true)} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Create New Ticket</button>
                   </div>
                   
                   <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                         <span className="text-[10px] font-bold uppercase tracking-widest">Common Support Tasks</span>
                      </div>
                      <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { label: 'Technical Malfunction', sub: 'GPS or Dashcam offline' },
                          { label: 'Asset Transfer', sub: 'Moving hardware to new vehicle' },
                          { label: 'Plan Upgrade', sub: 'Switching to higher service tier' },
                          { label: 'Billing Inquiry', sub: 'Question about an invoice' }
                        ].map(item => (
                          <button 
                            key={item.label}
                            onClick={() => { setTicketSubject(item.label); setTicketDescription(`Inquiry regarding ${item.label.toLowerCase()}...`); setIsTicketModalOpen(true); }}
                            className="p-4 text-left bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group"
                          >
                            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">{item.label}</p>
                            <p className="text-[10px] text-slate-400">{item.sub}</p>
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-1">
                  <SupportSection 
                    ticketTab={ticketTab} setTicketTab={setTicketTab} 
                    displayedTickets={showAllTickets ? (ticketTab === 'active' ? activeTickets : resolvedTickets) : (ticketTab === 'active' ? activeTickets.slice(0, 3) : resolvedTickets.slice(0, 3))} 
                    allCurrentTabTickets={ticketTab === 'active' ? activeTickets : resolvedTickets}
                    showAllTickets={showAllTickets} setShowAllTickets={setShowAllTickets}
                    onNewTicket={() => setIsTicketModalOpen(true)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FEATURED_SERVICES.map((service) => (
                  <div key={service.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-start gap-6">
                      <div className="p-4 bg-slate-50 text-slate-400 rounded-3xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:scale-110">
                        <service.icon size={32} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{service.label}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{service.desc}</p>
                        <button 
                          onClick={() => { setTicketSubject(`Inquiry: ${service.label}`); setTicketDescription(`I am interested in the ${service.label} service. Please provide more details.`); setIsTicketModalOpen(true); }}
                          className="pt-4 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
                        >
                          Request Information <ChevronUp className="rotate-90" size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="md:col-span-2 bg-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute right-0 top-0 p-10 opacity-10 rotate-12"><ShieldCheck size={140} /></div>
                   <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white/20 rounded-2xl"><Heart size={24} className="fill-white" /></div>
                         <h3 className="text-2xl font-black uppercase tracking-tight">Refer & Earn</h3>
                      </div>
                      <p className="text-lg text-indigo-100 max-w-2xl leading-relaxed">Refer a friend or business partner to our tracking solutions. For every successful activation, you'll receive <span className="text-white font-bold underline decoration-indigo-400">one full month of service credit</span> absolutely free.</p>
                      <button onClick={() => setIsReferralModalOpen(true)} className="px-10 py-4 bg-white text-indigo-900 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all active:scale-95">Register Referral</button>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <ReferralModal 
        isOpen={isReferralModalOpen} onClose={() => setIsReferralModalOpen(false)} 
        name={referralName} setName={setReferralName} 
        company={referralCompany} setCompany={setReferralCompany}
        phone={referralPhone} setPhone={setReferralPhone}
        isSubmitting={isSubmittingTicket} onSubmit={handleReferralSubmit}
      />

      <TicketModal 
        isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)}
        subject={ticketSubject} setSubject={setTicketSubject}
        description={ticketDescription} setDescription={setTicketDescription}
        isSubmitting={isSubmittingTicket} onSubmit={handleTicketSubmit}
      />

      {isPreviewOpen && previewHtml && (
        <ContractPreview 
          isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} 
          previewHtml={previewHtml} contract={selectedContract!} 
          userRole="Client" onInitiateSigning={() => setIsSigning(true)} 
          onDownload={() => { const p = window.open('', '_blank'); if(p) { p.document.write(previewHtml); p.document.close(); p.onload = () => p.print(); } }} 
          onShare={() => {}} onDispatch={() => {}}
        />
      )}

      {isSigning && (
        <SignaturePad 
          isOpen={isSigning} 
          onClose={() => setIsSigning(false)} 
          role="Client" 
          defaultName={data.currentUser?.name || ''} 
          defaultTitle="Authorized Representative" 
          onConfirm={handleConfirmSignature} 
        />
      )}
    </div>
  );
};

export default ClientPortal;
