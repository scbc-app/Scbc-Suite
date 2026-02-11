
import React from 'react';
import { 
  Network, X, Users, Users2, DollarSign, Scale, Gift, ShieldCheck, ShieldAlert, 
  TrendingUp, Trophy, GraduationCap, Sparkles, Crown, Handshake 
} from 'lucide-react';
import { formatCurrency } from '../../constants';
import { Agent } from '../../types';

interface NetworkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  isAgent: boolean;
  myClientsCount: number;
  myTraineesCount: number;
  estimatedEarnings: number;
  monthActivations: number;
  referralLeaders: any[];
  agentPerformance: any[];
  questProgress: any;
  hasClaimed: boolean;
  onApplyForPartnership?: () => void;
}

const NetworkDrawer: React.FC<NetworkDrawerProps> = ({
  isOpen, onClose, isAdmin, isAgent, myClientsCount, myTraineesCount, estimatedEarnings, monthActivations, 
  referralLeaders, agentPerformance, questProgress, hasClaimed, onApplyForPartnership
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-500 flex flex-col">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-slate-900 text-white rounded-2xl"><Network size={20} /></div>
             <div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">Network Node</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Growth Mechanics & Overrides</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={24}/></button>
        </div>

        <div className="p-8 space-y-10 pb-24">
           {/* KPI Summary */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex flex-col gap-3">
                <div className="p-2 w-fit bg-indigo-100 text-indigo-600 rounded-xl"><Users size={20}/></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Direct Portfolio</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">{myClientsCount} Accounts</p>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex flex-col gap-3">
                <div className="p-2 w-fit bg-emerald-100 text-emerald-600 rounded-xl"><Users2 size={20}/></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Team Network</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">{myTraineesCount} Nodes</p>
                </div>
              </div>

              <div className={`p-5 rounded-[2rem] shadow-lg flex flex-col gap-3 text-white ${isAdmin ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                <div className="p-2 w-fit bg-white/20 rounded-xl"><DollarSign size={20}/></div>
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 leading-none">Monthly Earning</p>
                  <p className="text-xl font-black tracking-tighter leading-none">K{formatCurrency(estimatedEarnings)}</p>
                </div>
              </div>

              <div className={`p-5 rounded-[2rem] shadow-lg flex flex-col gap-3 text-white ${monthActivations >= 1 ? 'bg-emerald-600' : 'bg-rose-500'} group overflow-hidden`}>
                <div className="p-2 w-fit bg-white/20 rounded-xl">
                  <Scale size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 leading-none">Compliance State</p>
                  <p className="text-xl font-black tracking-tighter leading-none">
                    {monthActivations >= 1 ? 'Target Met' : 'Action Required'}
                  </p>
                </div>
              </div>
           </div>

           {/* REFERRAL PERFORMANCE (ADMIN ONLY) */}
           {isAdmin && (
             <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-600 text-white rounded-xl"><Gift size={16} /></div>
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Referral Activity</h3>
                </div>
                <div className="space-y-3">
                   {referralLeaders.map((leader, idx) => (
                     <div key={leader.name} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{idx+1}</div>
                           <div>
                              <p className="text-[10px] font-black text-slate-900 uppercase">{leader.name}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">Top Referrer</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-indigo-600">{leader.count}</p>
                           <p className="text-[8px] font-bold text-slate-300 uppercase">Leads</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {/* CAREER QUEST TRACKER */}
           {isAgent && (
              <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border transition-all duration-500 bg-slate-900 border-slate-800 animate-in slide-in-from-top-4`}>
                <div className="absolute right-0 top-0 p-8 opacity-5 rotate-12">{questProgress.icon}</div>
                <div className="relative z-10 flex flex-col gap-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className={`p-4 rounded-2xl shadow-xl transition-transform hover:scale-110 ${questProgress.color}`}>
                            {questProgress.icon}
                         </div>
                         <div>
                            <h4 className={`text-xs font-black uppercase tracking-[0.2em] text-white`}>{questProgress.label}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{questProgress.subtext}</p>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="flex-1">
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                               <div className={`h-full transition-all duration-1000 bg-indigo-500`} style={{ width: `${questProgress.percentage}%` }}></div>
                            </div>
                         </div>
                         <span className="text-sm font-black tracking-tighter text-white shrink-0">{questProgress.percentage.toFixed(0)}%</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                         <span className={`text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border bg-white/5 border-white/10 text-slate-400`}>
                            Rank: {questProgress.level}
                         </span>
                         {questProgress.canApply && !hasClaimed && (
                            <button 
                               onClick={onApplyForPartnership}
                               className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 animate-pulse"
                            >
                               <Handshake size={14} /> Claim Partner Rank
                            </button>
                         )}
                      </div>
                   </div>
                </div>
              </div>
           )}

           {/* OPERATIONAL DIRECTIVES */}
           <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-900 text-white rounded-xl"><ShieldCheck size={16} /></div>
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Operational Policy</h3>
              </div>
              <div className="space-y-4">
                 <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
                    <ShieldAlert size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <div>
                       <h5 className="text-[10px] font-black text-slate-900 uppercase">Payout Eligibility</h5>
                       <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">Minimum 1 new client activation required monthly to maintain base payout standing.</p>
                    </div>
                 </section>
                 <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
                    <TrendingUp size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                       <h5 className="text-[10px] font-black text-slate-900 uppercase">Growth Bonus</h5>
                       <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">Onboarding 2+ clients monthly accelerates rank progression and increases base commission rate.</p>
                    </div>
                 </section>
              </div>
           </div>

           {/* ADMIN VIEW: STAFF LEADERBOARD */}
           {isAdmin && (
             <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 p-6 opacity-10"><Trophy size={80} /></div>
                <h4 className="text-[11px] font-black uppercase text-indigo-400 tracking-widest mb-6">Staff Leaderboard</h4>
                <div className="space-y-4">
                   {agentPerformance.slice(0, 5).map((agt, idx) => (
                      <div key={agt.AgentID} className="flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${idx === 0 ? 'bg-amber-500 shadow-lg' : 'bg-slate-800'}`}>{idx + 1}</div>
                            <div className="min-w-0">
                               <p className="text-xs font-black uppercase tracking-tight">{agt.AgentName}</p>
                               <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-1">{agt.monthlyOnboards} Onboards • {agt.ExperienceLevel}</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default NetworkDrawer;
