
import React from 'react';
import { X, Headphones, Send, Loader2, UserPlus, Heart } from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  setSubject: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen, onClose, subject, setSubject, description, setDescription, isSubmitting, onSubmit
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Headphones size={20} />
            <span className="text-sm uppercase tracking-widest">Support Request</span>
          </div>
          <button onClick={onClose}><X size={20} className="text-slate-300 hover:text-slate-900 transition-colors" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Subject</label>
            <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we assist you?" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100 transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Message</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your request in detail..." className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium resize-none focus:ring-2 focus:ring-indigo-100 transition-all" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  setName: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen, onClose, name, setName, company, setCompany, phone, setPhone, isSubmitting, onSubmit
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-indigo-100 flex justify-between items-center bg-indigo-50/30">
          <div className="flex items-center gap-2 font-bold text-indigo-900">
            <UserPlus size={20} />
            <span className="text-sm uppercase tracking-widest">Refer a Friend</span>
          </div>
          <button onClick={onClose}><X size={20} className="text-slate-300 hover:text-slate-900 transition-colors" /></button>
        </div>
        <div className="px-8 pt-6 pb-2 text-center">
          <p className="text-xs text-slate-500">Provide their details below. Once they join our platform, we will automatically credit your account with <strong className="text-indigo-600">1 month of free service</strong>.</p>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contact Person Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name of your friend/contact..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100 transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
            <input required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Business or entity name..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100 transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XX XXX XXX" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100 transition-all" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all mt-4">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
            Submit Referral
          </button>
        </form>
      </div>
    </div>
  );
};
