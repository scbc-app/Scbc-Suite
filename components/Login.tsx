
import React, { useState } from 'react';
import { AlertTriangle, Loader2, Clock, Globe, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pass: string) => Promise<string | null>;
  isConnecting: boolean;
  isAuthenticating: boolean;
  logo?: string;
  systemName?: string;
  lockoutTime?: number;
  isConnected?: boolean;
}

const Login: React.FC<LoginProps> = ({ 
  onLogin, 
  isConnecting, 
  isAuthenticating,
  logo,
  systemName = "Sally Chanza", 
  lockoutTime = 0, 
  isConnected = true 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    const result = await onLogin(email, password);
    if (result) {
      setError(result);
    }
  };

  const isLocked = lockoutTime > 0;
  const isBusy = isConnecting || isAuthenticating;

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-white select-none">
      
      {/* Left Panel: Brand & Status (Visible on Desktop) */}
      <div className="hidden lg:flex w-[35%] bg-[#002d1a] p-16 flex-col justify-between relative overflow-hidden shrink-0">
        <div className="relative z-10">
          {/* Logo Container */}
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-10 shadow-2xl overflow-hidden">
             {logo ? (
                <img src={logo} alt="Company Logo" className="w-full h-full object-contain p-2" />
             ) : (
                <div className="w-12 h-12 border-2 border-[#002d1a] rounded flex items-center justify-center font-black text-[#002d1a] text-xl">S</div>
             )}
          </div>
          
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">
            {systemName}
          </h1>
          <p className="text-[10px] font-bold text-[#10b981] uppercase tracking-[0.4em] mt-3">
            Unified Business Portal
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
             <div className={`h-4 w-1 transition-colors duration-500 ${isConnected ? 'bg-[#10b981]' : 'bg-slate-500'}`}></div>
             <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isConnected ? 'text-white' : 'text-slate-500'}`}>
                {isConnected ? 'Engine Online' : 'Engine Connecting...'}
             </span>
          </div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} SCBC Fleet Solutions
          </p>
        </div>
      </div>

      {/* Right Panel: Interactive Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
        
        {/* Mobile Header (Hidden on PC) */}
        <div className="lg:hidden p-8 bg-[#002d1a] text-white flex items-center justify-between">
           <h1 className="text-xl font-black uppercase tracking-tighter">{systemName}</h1>
           {logo && <div className="w-10 h-10 bg-white rounded-lg p-1.5 overflow-hidden"><img src={logo} alt="Logo" className="w-full h-full object-contain" /></div>}
        </div>

        {/* Login Form Container */}
        <div className="flex-1 flex flex-col justify-center items-center lg:items-start lg:pl-32 overflow-y-auto no-scrollbar py-12 lg:py-0">
          <div className="w-full max-w-[400px] px-8 lg:px-0">
            
            <div className="mb-10">
              <h2 className="text-3xl font-black text-[#0f172a] mb-2 tracking-tight">Login</h2>
              <p className="text-slate-400 text-sm font-medium">Sign in to access your account.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 animate-in shake">
                <AlertTriangle className="text-rose-500 shrink-0" size={18} />
                <p className="text-[10px] text-rose-600 font-black uppercase tracking-wider">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400"
                  placeholder="Email Address"
                  disabled={isBusy || isLocked}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400"
                  placeholder="Password"
                  disabled={isBusy || isLocked}
                  autoComplete="current-password"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                   <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-[#0f172a] focus:ring-0" />
                   <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Stay signed in</span>
                </label>
              </div>

              <div className="pt-8">
                <button 
                  type="submit" 
                  disabled={isBusy || isLocked}
                  className={`w-full py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center font-black text-xs uppercase tracking-[0.2em] active:scale-[0.98] ${
                    isLocked 
                      ? 'bg-slate-100 text-slate-400 shadow-none' 
                      : 'bg-[#0f172a] text-white hover:bg-black shadow-slate-900/10'
                  }`}
                >
                  {isConnecting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={20} strokeWidth={3} />
                      <span>Connecting... Please wait</span>
                    </div>
                  ) : isAuthenticating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={20} strokeWidth={3} />
                      <span>Verifying Identity...</span>
                    </div>
                  ) : isLocked ? (
                    `Locked: ${lockoutTime}s`
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Floating PC Ornament */}
        <div className="absolute bottom-10 right-10 hidden lg:block opacity-20 hover:opacity-50 transition-opacity">
           <ShieldCheck size={20} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
};

export default Login;
