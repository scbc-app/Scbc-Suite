
import React, { useState, useMemo } from 'react';
import { 
  Users, Car, FileText, CreditCard, Briefcase, Percent, Smartphone,
  BarChart3, Settings as SettingsIcon, PiggyBank, MessageSquare, Wrench, Zap,
  GraduationCap, Sparkles, Crown
} from 'lucide-react';
import { AppState } from '../types';

// Sub-components
import DashboardTiles from './dashboard/DashboardTiles';
import NetworkDrawer from './dashboard/NetworkDrawer';

interface DashboardProps {
  data: AppState;
  onClaimPayout?: (agentId: string, agentName: string, amount: number, momoNumber: string) => Promise<void>;
  onApplyForPartnership?: (agentId: string, agentName: string, pitch: string) => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onClaimPayout, onApplyForPartnership }) => {
  const [showInsights, setShowInsights] = useState(false);
  
  const userRole = data.currentUser?.role || 'Agent';
  const isAdmin = userRole === 'Admin';
  const isAgent = userRole === 'Agent';
  const myID = data.currentUser?.id || '';
  const myName = data.currentUser?.name || '';
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const myClients = useMemo(() => 
    data.clients.filter(c => String(c.AssignedAgentID).trim().toLowerCase() === String(myID).trim().toLowerCase()),
    [data.clients, myID]
  );

  const monthActivations = useMemo(() => 
    myClients.filter(c => {
      const d = new Date(c.OnboardingDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length,
    [myClients, currentMonth, currentYear]
  );

  const referralLeaders = useMemo(() => {
    const counts: Record<string, {name: string, count: number}> = {};
    data.referrals.forEach(r => {
      if (!counts[r.ReferrerID]) counts[r.ReferrerID] = {name: r.ReferrerName, count: 0};
      counts[r.ReferrerID].count++;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [data.referrals]);

  const agentPerformance = useMemo(() => {
    return data.agents
      .filter(a => a.Role === 'Agent' || a.Role === 'Admin')
      .map(agent => {
        const agtClients = data.clients.filter(c => String(c.AssignedAgentID).trim().toLowerCase() === String(agent.AgentID).trim().toLowerCase());
        const monthlyOnboards = agtClients.filter(c => {
          const d = new Date(c.OnboardingDate);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;
        const monthlyRevenue = data.payments.filter(p => {
          const isMine = agtClients.some(c => c.ClientID === p.ClientID);
          const pDate = new Date(p.Date);
          return isMine && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
        }).reduce((sum, p) => sum + (Number(p.Amount) / (p.MonthsCovered || 1)), 0);
        const teamSize = data.agents.filter(a => String(a.ParentAgentID).trim().toLowerCase() === String(agent.AgentID).trim().toLowerCase()).length;
        return { ...agent, monthlyOnboards, monthlyRevenue, teamSize, score: (monthlyOnboards * 100) + (monthlyRevenue / 10) };
      })
      .sort((a, b) => b.score - a.score);
  }, [data.agents, data.clients, data.payments, currentMonth, currentYear]);

  const pendingActions = useMemo(() => {
    return data.notifications.filter(n => 
      (n.Type === 'PAYOUT_REQUEST' || n.Type === 'PARTNERSHIP_APPLICATION') && 
      n.Status === 'Unread'
    ).sort((a, b) => new Date(b.Time).getTime() - new Date(a.Time).getTime());
  }, [data.notifications]);

  const myAgentRecord = data.agents.find(a => String(a.AgentID).trim().toLowerCase() === String(myID).trim().toLowerCase());
  const myTrainees = data.agents.filter(a => String(a.ParentAgentID).trim().toLowerCase() === String(myID).trim().toLowerCase());
  
  const questProgress = useMemo(() => {
    const totalClients = myClients.length;
    const graduatedCount = myAgentRecord?.GraduatedTraineesCount || 0;
    const level = myAgentRecord?.ExperienceLevel || 'Trainee';
    let target = 10;
    let label = "Path to Independent Agent";
    let subtext = `${10 - totalClients} more clients to unlock Independent status.`;
    let icon = <GraduationCap size={24} />;
    let color = "bg-indigo-600";
    if (totalClients >= 10 && level === 'Trainee') {
        target = 25; label = "Path to Mentor Unlock"; subtext = "Reached 10! Add 15 more to unlock Trainee Slots."; icon = <Sparkles size={24} />; color = "bg-emerald-500";
    } else if (totalClients >= 25 || level === 'Mentor') {
        target = 50; label = "Path to Partner (Lead)"; subtext = `Graduated: ${graduatedCount}/5. Mentor override active.`; icon = <Crown size={24} />; color = "bg-amber-500";
    }
    const percentage = Math.min(100, (totalClients / target) * 100);
    const canApply = level === 'Mentor' && graduatedCount >= 5;
    return { percentage, label, subtext, icon, color, canApply, graduatedCount, level };
  }, [myClients, myAgentRecord]);

  const estimatedEarnings = useMemo(() => {
    const myRate = myAgentRecord?.CommissionRate ?? 10;
    const directRevenue = data.payments.filter(p => {
      const isMine = myClients.some(c => c.ClientID === p.ClientID);
      const pDate = new Date(p.Date);
      return isMine && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    }).reduce((sum, p) => sum + (Number(p.Amount) / (p.MonthsCovered || 1)), 0);
    const networkRevenue = data.payments.filter(p => {
       const trainee = myTrainees.find(t => String(t.AgentID) === String(p.AgentID));
       const pDate = new Date(p.Date);
       return !!trainee && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    }).reduce((sum, p) => sum + (Number(p.Amount) / (p.MonthsCovered || 1)), 0);
    return (directRevenue * (myRate / 100)) + (networkRevenue * 0.05);
  }, [data.payments, myClients, myTrainees, currentMonth, currentYear, myAgentRecord]);

  const hasClaimed = useMemo(() => {
    const claimId = `CLAIM-${myID}-${currentMonth + 1}-${currentYear}`;
    return data.notifications.some(n => n.ID === claimId);
  }, [data.notifications, myID, currentMonth, currentYear]);

  const navTiles = [
    { name: 'Partner Hub', path: '/partner-hub', icon: PiggyBank, key: 'partner_hub', roles: ['Partner'] },
    { name: 'Clients', path: '/clients', icon: Users, key: 'clients' },
    { name: 'Vehicles', path: '/vehicles', icon: Car, key: 'vehicles' },
    { name: 'Asset Service', path: '/maintenance', icon: Wrench, key: 'sim_manager' },
    { name: 'SIM Assets', path: '/sim-maintenance', icon: Smartphone, key: 'sim_manager' },
    { name: 'Contracts', path: '/contracts', icon: FileText, key: 'contracts' },
    { name: 'Invoices', path: '/invoices', icon: FileText, key: 'invoices' },
    { name: 'Payments', path: '/payments', icon: CreditCard, key: 'payments' },
    { name: 'Commissions', path: '/commissions', icon: Percent, key: 'commissions' },
    { name: 'Support Desk', path: '/support', icon: MessageSquare, key: 'support' },
    { name: 'Team Access', path: '/agents', icon: Briefcase, key: 'agents' },
    { name: 'Reports', path: '/reports', icon: BarChart3, key: 'dashboard' },
    { name: 'Settings', path: '/settings', icon: SettingsIcon, key: 'settings' }
  ];

  const visibleTiles = navTiles.filter(tile => {
    if (tile.roles && !tile.roles.includes(userRole)) return false;
    if (userRole === 'Admin') return true;
    if (userRole === 'Partner' && tile.key === 'partner_hub') return true;
    const agentCoreKeys = ['clients', 'vehicles', 'sim_manager', 'contracts', 'invoices', 'payments', 'commissions', 'support', 'dashboard'];
    if (userRole === 'Agent' && agentCoreKeys.includes(tile.key)) return true;
    return data.currentUser?.permissions?.[tile.key]?.view;
  });

  return (
    <div className="h-full flex flex-col items-center select-none overflow-y-auto no-scrollbar py-12 px-4 animate-in fade-in duration-1000 relative">
      <div className="fixed bottom-10 right-10 z-[60]">
        <button 
          onClick={() => setShowInsights(true)}
          className="group w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-2xl flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-95 hover:bg-indigo-600 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Zap size={24} className="relative z-10" />
          <span className="text-[7px] font-black uppercase tracking-widest mt-1 relative z-10">Network</span>
          {pendingActions.length > 0 && isAdmin && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black animate-bounce">
              {pendingActions.length}
            </span>
          )}
        </button>
      </div>

      <DashboardTiles tiles={visibleTiles} />

      <NetworkDrawer 
        isOpen={showInsights} onClose={() => setShowInsights(false)} 
        isAdmin={isAdmin} isAgent={isAgent}
        myClientsCount={myClients.length} myTraineesCount={myTrainees.length}
        estimatedEarnings={estimatedEarnings} monthActivations={monthActivations}
        referralLeaders={referralLeaders} agentPerformance={agentPerformance}
        questProgress={questProgress} hasClaimed={hasClaimed}
        onApplyForPartnership={() => onApplyForPartnership?.(myID, myName, "Promotion to Partner Status Request")}
      />
    </div>
  );
};

export default Dashboard;
