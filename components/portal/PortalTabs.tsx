
import React, { useState } from 'react';
import { LayoutDashboard, Car, Receipt, Headphones, Sparkles, ChevronDown } from 'lucide-react';

export type PortalTab = 'home' | 'fleet' | 'billing' | 'support' | 'services';

interface PortalTabsProps {
  activeTab: PortalTab;
  setActiveTab: (tab: PortalTab) => void;
}

const PortalTabs: React.FC<PortalTabsProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const tabs: { id: PortalTab; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'fleet', label: 'Fleet', icon: Car },
    { id: 'billing', label: 'Billing', icon: Receipt },
    { id: 'support', label: 'Support', icon: Headphones },
    { id: 'services', label: 'Services', icon: Sparkles },
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <nav className="relative z-30">
      {/* Desktop Navigation: Segmented Control Style */}
      <div className="hidden md:grid grid-cols-5 bg-slate-100/80 p-1.5 rounded-[1.25rem] border border-slate-200/60 backdrop-blur-sm shadow-inner">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-2 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50 transform scale-[1.02]' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}`}
            >
              <Icon 
                size={16} 
                className={`transition-colors duration-300 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
              />
              <span className={`text-[11px] font-black uppercase tracking-[0.1em] transition-all
                ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Navigation: High-Visibility Dropdown Toggle */}
      <div className="md:hidden flex flex-col gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-6 py-4 bg-white rounded-2xl shadow-sm border-2 border-indigo-50 text-indigo-600 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <currentTab.icon size={20} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Section</span>
              <span className="font-black text-xs uppercase tracking-widest leading-none">{currentTab.label}</span>
            </div>
          </div>
          <div className={`p-1 rounded-full transition-all duration-300 ${isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-50 text-slate-400'}`}>
            <ChevronDown size={18} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-4 ring-slate-900/5">
            <div className="flex flex-col p-2">
              <div className="px-5 py-3 border-b border-slate-50">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Select Destination</span>
              </div>
              {tabs.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveTab(id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-4 px-5 py-4 text-left transition-all rounded-xl my-0.5
                      ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PortalTabs;
