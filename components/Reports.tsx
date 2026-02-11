
import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend,
  ComposedChart, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { TrendingUp, Users, Zap, MonitorCheck, Scale, Activity, Clock } from 'lucide-react';
import { AppState, InvoiceStatus, DocumentType } from '../types';
import { formatCurrency } from '../constants';
import KpiMetricCard from './reports/KpiMetricCard';

interface ReportsProps {
  data: AppState;
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const { payments, clients, vehicles, invoices, agents, simTopups } = data;

  const revenueMetrics = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const monthlyPayments = payments.filter(p => {
        const pDate = new Date(p.Date);
        return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear();
      });
      months.push({ name: monthName, revenue: monthlyPayments.reduce((s, p) => s + Number(p.Amount), 0), txCount: monthlyPayments.length });
    }
    return months;
  }, [payments]);

  const agingData = useMemo(() => {
    const today = new Date();
    const buckets = { current: 0, late1_30: 0, late31_60: 0, late61Plus: 0 };
    invoices.forEach(inv => {
      if (inv.Status === InvoiceStatus.Paid || inv.DocType !== DocumentType.Invoice) return;
      const dueDate = new Date(inv.DueDate);
      const diffDays = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) buckets.current += Number(inv.BalanceDue);
      else if (diffDays <= 30) buckets.late1_30 += Number(inv.BalanceDue);
      else if (diffDays <= 60) buckets.late31_60 += Number(inv.BalanceDue);
      else buckets.late61Plus += Number(inv.BalanceDue);
    });
    return [
      { category: 'Current', value: buckets.current, fill: '#10b981' },
      { category: '1-30 Days', value: buckets.late1_30, fill: '#f59e0b' },
      { category: '31-60 Days', value: buckets.late31_60, fill: '#f97316' },
      { category: '61+ Days', value: buckets.late61Plus, fill: '#ef4444' }
    ];
  }, [invoices]);

  const connectivityState = useMemo(() => {
    const today = new Date();
    const next30 = new Date(); next30.setDate(today.getDate() + 30);
    let active = 0, expired = 0, critical = 0;
    vehicles.forEach(v => {
      const vTopups = simTopups.filter(t => String(t.VehicleID).toLowerCase() === String(v.VehicleID).toLowerCase()).sort((a,b) => new Date(b.ExpiryDate).getTime() - new Date(a.ExpiryDate).getTime());
      const expiry = vTopups.length > 0 ? new Date(vTopups[0].ExpiryDate) : null;
      if (!expiry || expiry < today) expired++;
      else if (expiry < next30) critical++;
      else active++;
    });
    return [{ name: 'Operational', value: active, color: '#10b981' }, { name: 'Renewal Due', value: critical, color: '#f59e0b' }, { name: 'Offline/Expired', value: expired, color: '#ef4444' }];
  }, [vehicles, simTopups]);

  const totalRev = revenueMetrics.reduce((s, m) => s + m.revenue, 0);
  const totalArrears = agingData.reduce((s, b) => (b.category !== 'Current' ? s + b.value : s), 0);
  const arpu = vehicles.length > 0 ? (totalRev / 6) / vehicles.length : 0; 
  const efficiency = totalRev / (totalRev + totalArrears) * 100;

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-1000 overflow-y-auto no-scrollbar pb-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <KpiMetricCard variant="dark" icon={TrendingUp} label="Total Sales Pool" value={`K${formatCurrency(totalRev)}`} subtext="6-Month Trend" />
        <KpiMetricCard variant="light" icon={Zap} label="Unit Yield (ARPU)" value={`K${formatCurrency(arpu)}`} subtext="SaaS Metric" />
        <KpiMetricCard variant="light" icon={MonitorCheck} label="Collection Efficiency" value={`${efficiency.toFixed(1)}%`} subtext="Liquidity" />
        <KpiMetricCard variant="light" icon={Scale} label="Total Receivables" value={`K${formatCurrency(totalArrears)}`} subtext="Exposure" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-[400px]">
           <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Activity size={16} className="text-indigo-500" /> Revenue Flow Cycle</h4>
           </div>
           <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={revenueMetrics}>
                    <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}} labelStyle={{fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', color: '#64748b'}} />
                    <Area type="monotone" dataKey="revenue" fill="url(#revGrad)" stroke="#6366f1" strokeWidth={4} />
                    <Bar dataKey="txCount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                 </ComposedChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-[400px]">
           <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Clock size={16} className="text-rose-500" /> Accounts Receivable Aging</h4>
           </div>
           <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={agingData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#64748b'}} />
                    <Tooltip formatter={(value: number) => [`K${formatCurrency(value)}`, 'Total Balance']} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
