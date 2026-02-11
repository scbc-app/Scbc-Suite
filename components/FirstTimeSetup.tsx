
import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Loader2, Zap, CheckCircle2, ShieldAlert, LogIn
} from 'lucide-react';

interface FirstTimeSetupProps {
  user: { id: string, name: string, role: string };
  profile: any;
  onComplete: (newPassword: string) => Promise<void>;
  onFinalize: () => void;
}

const FirstTimeSetup: React.FC<FirstTimeSetupProps> = ({ user, profile, onComplete, onFinalize }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isClient = user.role.toLowerCase() === 'client';
  const themeColor = isClient ? 'bg-indigo-600' : 'bg-slate-900';
  const themeText = isClient ? 'text-indigo-600' : 'text-slate-900';

  const handleFinish = async () => {
    setError(null);
    if (newPassword.length < 6) {
      setError('Required: Minimum 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Error: Passwords do not match.');
      return;
    }

    setIsProcessing(true);
    try {
      await onComplete(newPassword);
      setIsFinished(true);
    } catch (e: any) {
      setError(e.message || 'Synchronization error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden select-none font-sans">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500 border border-slate-100">
        
        <div className="p-6 md:p-8 flex-1 flex flex-col">
          {!isFinished ? (
            <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg ${themeColor}`}>
                  <Lock size={22} />
                </div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Security Activation</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Hello, {user.name}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                 <ShieldCheck className={themeText} size={16} />
                 <p className="text-[10px] font-bold text-slate-500 leading-tight uppercase">
                   Please update your password to secure your account and gain access.
                 </p>
              </div>

              <div className="space-y-3">
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isProcessing}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-black text-sm tracking-widest text-slate-900" 
                      placeholder="••••••••"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Verify Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isProcessing}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-black text-sm tracking-widest text-slate-900" 
                      placeholder="••••••••"
                    />
                 </div>
              </div>

              {error && (
                <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-[8px] font-black text-rose-600 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                   <ShieldAlert size={12} /> {error}
                </div>
              )}

              <button 
                onClick={handleFinish}
                disabled={isProcessing || !newPassword || !confirmPassword}
                className={`w-full py-4 ${themeColor} text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3`}
              >
                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                {isProcessing ? 'Saving Credentials...' : 'Activate Account'}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in zoom-in duration-500 text-center py-6">
               <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-inner">
                  <CheckCircle2 size={36} strokeWidth={2.5} />
               </div>
               <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Access Secured</h2>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                    Credentials updated successfully.<br/>Return to the login screen to sign in.
                  </p>
               </div>
               
               <button 
                  onClick={onFinalize}
                  className={`w-full py-4 ${themeColor} text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:opacity-95 transition-all active:scale-95 flex items-center justify-center gap-3`}
               >
                 Return to Login <LogIn size={14} />
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirstTimeSetup;
