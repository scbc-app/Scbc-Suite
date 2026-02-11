
import React from 'react';
import { Lock, Shield } from 'lucide-react';
import { Agent, UserPermissions } from '../../types';

interface AgentFormAccessProps {
  formData: Partial<Agent>;
  isReadOnly: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  permissions: UserPermissions;
  handlePermissionToggle: (module: string, action: 'view' | 'create' | 'update' | 'delete') => void;
  defaultPermissions: UserPermissions;
}

const AgentFormAccess: React.FC<AgentFormAccessProps> = ({ 
  formData, isReadOnly, handleChange, permissions, handlePermissionToggle, defaultPermissions 
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-4 bg-slate-900 rounded-xl text-white">
        <div className="flex items-center gap-3 mb-4">
          <Lock size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold">Login Details</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-slate-400 uppercase">Temp Password</label>
            <input 
              type="text" 
              name="Password" 
              value={formData.Password || ''} 
              onChange={handleChange} 
              disabled={isReadOnly} 
              className="w-full bg-white/10 border border-white/10 p-2 rounded-lg text-sm font-mono" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-slate-400 uppercase">Account Status</label>
            <select 
              name="Status" 
              value={formData.Status} 
              onChange={handleChange} 
              disabled={isReadOnly} 
              className="w-full bg-white/10 border border-white/10 p-2 rounded-lg text-sm"
            >
              <option className="text-black" value="Active">Active</option>
              <option className="text-black" value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
          < Shield size={14} className="text-slate-400" />
          <h3 className="text-xs font-semibold text-slate-700">Permissions</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.keys(defaultPermissions).map(module => (
            <div key={module} className="p-2 border border-slate-100 rounded-lg bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 truncate">{module.replace('_', ' ')}</p>
              <div className="flex flex-wrap gap-1">
                {['view', 'create', 'update'].map(action => (
                  <button 
                    key={action}
                    type="button"
                    onClick={() => handlePermissionToggle(module, action as any)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-medium capitalize border ${permissions[module]?.[action as keyof UserPermissions[string]] ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentFormAccess;
