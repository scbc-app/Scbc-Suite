
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell, LogOut, ArrowLeft, Smartphone, AlertCircle, Clock, Info, CheckCheck, X, Check,
  DollarSign, Handshake
} from 'lucide-react';
import { AppNotification, UserPermissions } from '../types';
import { formatDate } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
  notifications?: AppNotification[];
  permissions?: UserPermissions;
  logo?: string;
  onLogout: () => void;
  onClearNotifications?: () => void;
  onDismissNotification?: (id: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, userRole, userName, notifications = [], permissions, logo, onLogout, onClearNotifications, onDismissNotification 
}) => {
  const [isNotifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDashboard = location.pathname === '/';
  const isGuest = userRole === 'Guest';
  const unreadCount = notifications.filter(n => n.Status === 'Unread').length;
  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.Time).getTime() - new Date(a.Time).getTime())
    .slice(0, 15);

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'Critical': return 'bg-rose-500';
      case 'High': return 'bg-orange-500';
      case 'Normal': return 'bg-indigo-500';
      default: return 'bg-slate-400';
    }
  };

  const getInitials = (name: string) => {
     return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getNotifIcon = (type?: string) => {
     if (!type) return <Info size={16} />;
     const t = type.toUpperCase();
     if (t.includes('SIM')) return <Smartphone size={16} />;
     if (t.includes('PAYOUT')) return <DollarSign size={16} />;
     if (t.includes('PARTNER')) return <Handshake size={16} />;
     return <Info size={16} />;
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden font-sans">
      <header className="flex items-center justify-between h-14 md:h-20 px-4 md:px-10 bg-white border-b border-gray-100 shrink-0 z-50">
        <div className="flex items-center space-x-4 md:space-x-8">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl group-hover:scale-105 transition-all">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-contain p-1.5" />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center font-bold text-white text-sm">S</div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-semibold tracking-tighter text-slate-900 leading-none">Sally Chanza</span>
              <span className="text-[8px] md:text-[9px] font-medium text-slate-400 uppercase tracking-[0.4em] mt-1.5">Business Café</span>
            </div>
          </Link>
        </div>

        {!isGuest && (
          <div className="flex items-center space-x-2 md:space-x-6">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotifOpen(!isNotifOpen)}
                className="p-3 text-slate-400 hover:text-slate-900 transition-all relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-4 w-[340px] bg-white rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex flex-col">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Activity Hub</h4>
                      <span className="text-[8px] font-bold text-indigo-600 mt-0.5 uppercase tracking-tighter">
                          {unreadCount} Pending Actions
                      </span>
                    </div>
                    {unreadCount > 0 && onClearNotifications && (
                      <button 
                          onClick={(e) => { e.stopPropagation(); onClearNotifications(); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 rounded-xl transition-all shadow-sm group"
                      >
                          <span className="text-[8px] font-black uppercase tracking-widest">Clear All</span>
                          <CheckCheck size={12} className="group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[420px] overflow-y-auto no-scrollbar">
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map((notif) => (
                        <div key={notif.ID} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 group relative ${notif.Status === 'Unread' ? 'bg-indigo-50/20' : ''}`}>
                          <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm ${getPriorityColor(notif.Priority)}`}>
                            {getNotifIcon(notif.Type)}
                          </div>
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-slate-900 leading-tight pr-6">
                              {notif.Message}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                  {formatDate(notif.Time)}
                              </span>
                              {notif.ClientName && (
                                <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-tighter truncate max-w-[120px]">
                                  {notif.ClientName}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Individual Clear Action */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDismissNotification?.(notif.ID); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg border border-slate-100 text-slate-300 hover:text-emerald-600 hover:border-emerald-100 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                            title="Dismiss"
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-16 flex flex-col items-center opacity-20">
                        <Bell size={40} className="mb-3" />
                        <p className="text-[9px] font-black uppercase tracking-[0.2em]">Queue is currently empty</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                    <button className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                      Open System Log
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-1.5 md:pr-5 rounded-[1.25rem] border border-gray-100">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-semibold text-xs shadow-xl">
                {getInitials(userName)}
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-semibold text-slate-900 leading-none truncate max-w-[100px]">{userName}</p>
                <p className="text-[8px] text-slate-400 font-medium uppercase tracking-[0.2em] mt-1.5">{userRole}</p>
              </div>
            </div>

            <button onClick={onLogout} className="p-3 text-slate-300 hover:text-slate-900 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col min-h-0 relative">
        {!isDashboard && !isGuest && (
          <div className="px-4 pt-6 md:px-10 lg:px-20 shrink-0 flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
             <button 
                onClick={() => navigate('/')} 
                className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-slate-900 hover:text-white text-slate-400 transition-all active:scale-90"
             >
               <ArrowLeft size={18} />
             </button>
             <div className="flex flex-col">
                <span className="text-[9px] font-medium text-slate-300 uppercase tracking-widest">Main Menu</span>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-tighter mt-1">{location.pathname.substring(1).replace('-', ' ')}</h2>
             </div>
          </div>
        )}
        
        <div className={`flex-1 min-h-0 w-full overflow-hidden ${isDashboard ? '' : 'p-4 md:p-10 lg:p-20 lg:pt-8 pt-4'}`}>
          <div className="mx-auto w-full max-w-[1600px] h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
