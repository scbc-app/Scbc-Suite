
import React from 'react';
import { Rocket, Medal } from 'lucide-react';

interface PromotionBannerProps {
  isEligible: boolean;
  onClaim: () => void;
}

const PromotionBanner: React.FC<PromotionBannerProps> = ({ isEligible, onClaim }) => {
  if (!isEligible) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
      <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Rocket size={120} /></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Medal size={24} className="text-amber-300" /></div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Professional Opportunity</h2>
          </div>
          <p className="text-sm font-medium text-emerald-50 leading-relaxed max-w-xl">
            Based on your exceptional referral record and timely payment history, you are eligible to become a <strong>Trainee Agent</strong>. Start earning commissions while managing your fleet.
          </p>
        </div>
        <button 
          onClick={onClaim}
          className="px-8 py-4 bg-white text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          Claim My Offer
        </button>
      </div>
    </div>
  );
};

export default PromotionBanner;
