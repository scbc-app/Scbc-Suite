
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiMetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'dark' | 'light' | 'indigo' | 'emerald' | 'rose';
}

const KpiMetricCard: React.FC<KpiMetricCardProps> = ({ label, value, subtext, icon: Icon, variant = 'light' }) => {
  const getStyles = () => {
    switch(variant) {
      case 'dark': return 'bg-slate-900 text-white border-slate-800';
      case 'indigo': return 'bg-indigo-600 text-white border-indigo-500';
      case 'emerald': return 'bg-emerald-600 text-white border-emerald-500';
      case 'rose': return 'bg-rose-600 text-white border-rose-500';
      default: return 'bg-white text-slate-900 border-slate-100 hover:border-indigo-200';
    }
  };

  const getIconStyles = () => {
    switch(variant) {
      case 'dark': return 'bg-white/10 text-white';
      case 'indigo': return 'bg-white/20 text-white';
      case 'emerald': return 'bg-white/20 text-white';
      case 'rose': return 'bg-white/20 text-white';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className={`p-5 rounded-[2rem] border shadow-sm flex flex-col justify-between group transition-all ${getStyles()}`}>
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl transition-colors ${getIconStyles()}`}>
          <Icon size={18} />
        </div>
        {subtext && (
          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${variant === 'light' ? 'bg-indigo-50 text-indigo-400' : 'bg-white/10 text-white'}`}>
            {subtext}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${variant === 'light' ? 'text-slate-400' : 'text-white/60'}`}>{label}</p>
        <h3 className="text-2xl font-black tracking-tighter leading-tight">{value}</h3>
      </div>
    </div>
  );
};

export default KpiMetricCard;
