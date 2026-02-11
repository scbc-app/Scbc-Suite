
import React from 'react';
import { Agent } from '../../types';
import { toISODate } from '../../constants';

interface AgentFormInfoProps {
  formData: Partial<Agent>;
  isReadOnly: boolean;
  duration: string;
  onDurationChange: (months: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const AgentFormInfo: React.FC<AgentFormInfoProps> = ({ formData, isReadOnly, duration, onDurationChange, handleChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
      <div className="col-span-1 sm:col-span-2 space-y-1">
        <label className="text-xs font-medium text-slate-600">Full Name</label>
        <input 
          type="text" 
          name="AgentName" 
          value={formData.AgentName || ''} 
          onChange={handleChange} 
          disabled={isReadOnly} 
          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500" 
          placeholder="e.g. John Doe" 
        />
      </div>
      
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Account Role</label>
        <select 
          name="Role" 
          value={formData.Role} 
          onChange={handleChange} 
          disabled={isReadOnly} 
          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
        >
          <option value="Agent">Agent</option>
          <option value="Partner">Partner</option>
          <option value="Admin">Admin</option>
          <option value="Support">Support</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Experience Level</label>
        <select 
          name="ExperienceLevel" 
          value={formData.ExperienceLevel || 'Trainee'} 
          onChange={handleChange} 
          disabled={isReadOnly || formData.Role === 'Partner'} 
          className={`w-full p-2 border rounded-lg text-sm outline-none ${formData.Role === 'Partner' ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-slate-50 border-slate-200'}`}
        >
          <option value="Trainee">Trainee</option>
          <option value="Independent">Independent</option>
          <option value="Mentor">Mentor</option>
          <option value="Lead">Lead</option>
          <option value="Partner">Partner</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Department</label>
        <input 
          type="text" 
          name="Department" 
          value={formData.Department || ''} 
          onChange={handleChange} 
          disabled={isReadOnly} 
          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" 
          placeholder="Sales / Ops" 
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Email Address</label>
        <input 
          type="email" 
          name="Email" 
          value={formData.Email || ''} 
          onChange={handleChange} 
          disabled={isReadOnly} 
          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" 
          placeholder="name@company.com" 
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Phone Number</label>
        <input 
          type="text" 
          name="Phone" 
          value={formData.Phone || ''} 
          onChange={handleChange} 
          disabled={isReadOnly} 
          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" 
          placeholder="+260..." 
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Agreement Start Date</label>
        <input 
          type="date" 
          name="StartDate" 
          value={toISODate(formData.StartDate)} 
          onChange={handleChange} 
          disabled={isReadOnly} 
          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" 
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Duration (Months)</label>
        <input 
          type="number" 
          min="1"
          value={duration} 
          onChange={(e) => onDurationChange(e.target.value)} 
          disabled={isReadOnly} 
          className="w-full p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm outline-none text-indigo-700 font-semibold" 
          placeholder="e.g. 12"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600 italic">Agreement End Date (Calculated)</label>
        <input 
          type="date" 
          name="EndDate" 
          value={toISODate(formData.EndDate)} 
          readOnly
          disabled={true} 
          className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-sm outline-none font-semibold text-slate-500 cursor-not-allowed shadow-inner" 
        />
      </div>

      <div className="col-span-1 sm:col-span-2 space-y-1">
        <label className="text-xs font-medium text-slate-600">Professional Notes</label>
        <textarea 
          name="Notes" 
          value={formData.Notes || ''} 
          onChange={handleChange} 
          disabled={isReadOnly} 
          className="w-full h-20 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none resize-none" 
          placeholder="Optional notes regarding staff background or scope..."
        ></textarea>
      </div>
    </div>
  );
};

export default AgentFormInfo;
