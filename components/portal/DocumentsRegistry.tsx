
import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';
import { Contract } from '../../types';
import { formatDate } from '../../constants';

interface DocumentsRegistryProps {
  contracts: Contract[];
  onView: (contract: Contract) => void;
}

const DocumentsRegistry: React.FC<DocumentsRegistryProps> = ({ contracts, onView }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
        <ShieldCheck size={18} className="text-slate-400" />
        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Official Contracts</span>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {contracts.map(c => (
          <div key={c.ContractID} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100 group hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 group-hover:text-indigo-600 transition-colors"><FileText size={20} /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{c.PlanType} ({c.NoOfUnits} Units)</p>
                <p className="text-[9px] text-slate-400 uppercase font-medium">ID: {c.ContractID} • Exp: {formatDate(c.ExpiryDate)}</p>
              </div>
            </div>
            <button onClick={() => onView(c)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all">View</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsRegistry;
