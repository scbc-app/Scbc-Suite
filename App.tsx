
import React, { useEffect } from 'react';
import { HashRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import SyncIndicator from './components/SyncIndicator';
import AppModals from './components/AppModals';
import AppRouter from './AppRouter';
import FirstTimeSetup from './components/FirstTimeSetup';
import { useAppLogic } from './useAppLogic';

// Sub-component to handle navigation logic inside Router context
const AuthenticatedApp: React.FC<{
  appState: any;
  setAppState: any;
  augmentedNotifications: any;
  syncing: boolean;
  visibleData: any;
  modals: any;
  handlers: any;
  lastSync: any;
}> = ({ appState, setAppState, augmentedNotifications, syncing, visibleData, modals, handlers, lastSync }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to Main Menu on every login event
  useEffect(() => {
    if (appState.currentUser && !appState.currentUser?.lastLogin) {
      // Stay on setup screen for first-time users
    } else if (appState.currentUser) {
      // Force navigation to main dashboard upon initial load/auth
      if (location.pathname === '/login' || location.pathname === '*') {
        navigate('/', { replace: true });
      } else {
        // If we are already somewhere valid, just ensure root if we just logged in
        // In this case, we always want the first page after login to be dashboard
        navigate('/', { replace: true });
      }
    }
  }, [appState.currentUser?.id]); // Only re-run if user ID changes (session start)

  // First-Time Login Detection Logic
  const isFirstTime = !appState.currentUser?.lastLogin;

  if (isFirstTime) {
    const userRole = String(appState.currentUser?.role || '').toLowerCase();
    const isClient = userRole === 'client';
    
    const profile = isClient 
      ? appState.clients.find((c: any) => String(c.ClientID) === String(appState.currentUser?.id))
      : appState.agents.find((a: any) => String(a.AgentID) === String(appState.currentUser?.id));

    return (
      <FirstTimeSetup 
        user={appState.currentUser} 
        profile={profile || {}} 
        onComplete={async (pass) => {
          if (isClient) {
            await handlers.handleSaveClient({ 
              ...(profile || {}), 
              ClientID: appState.currentUser?.id, 
              TempPassword: pass, 
              PortalEnabled: true 
            }, false);
          } else {
            await handlers.handleSaveAgent({ 
              ...(profile || {}), 
              AgentID: appState.currentUser?.id, 
              Password: pass 
            }, false);
          }
        }}
        onFinalize={handlers.handleLogout}
      />
    );
  }

  return (
    <Layout 
      userRole={appState.currentUser.role} 
      userName={appState.currentUser.name} 
      notifications={augmentedNotifications}
      permissions={appState.currentUser.permissions} 
      logo={appState.systemSettings?.Logo}
      onLogout={handlers.handleLogout}
      onClearNotifications={handlers.handleClearNotifications}
      onDismissNotification={handlers.handleDismissNotification}
    >
      <SyncIndicator isVisible={syncing} />
      
      <AppRouter 
        appState={appState} 
        visibleData={visibleData} 
        modals={modals} 
        handlers={handlers} 
        lastSync={lastSync}
        setSyncing={() => {}} 
      />

      <AppModals 
        appState={appState}
        modals={{
          client: { isOpen: modals.client.isOpen, mode: modals.client.mode, selected: modals.client.selected, close: () => modals.client.setOpen(false) },
          contract: { isOpen: modals.contract.isOpen, mode: modals.contract.mode, selected: modals.contract.selected, close: () => modals.contract.setOpen(false) },
          invoice: { isOpen: modals.invoice.isOpen, mode: modals.invoice.mode, selected: modals.invoice.selected, type: modals.invoice.type, close: () => modals.invoice.setOpen(false) },
          vehicle: { isOpen: modals.vehicle.isOpen, mode: modals.vehicle.mode, selected: modals.vehicle.selected, close: () => modals.vehicle.setOpen(false) },
          payment: { isOpen: modals.payment.isOpen, mode: modals.payment.mode, selected: modals.payment.selected, close: () => modals.payment.setOpen(false) },
          agent: { isOpen: modals.agent.isOpen, mode: modals.agent.mode, selected: modals.agent.selected, close: () => modals.agent.setOpen(false) },
          maintenance: { isOpen: modals.maintenance.isOpen, mode: modals.maintenance.mode, selected: modals.maintenance.selected, close: () => modals.maintenance.setOpen(false) }
        }}
        handlers={{
          onSaveClient: handlers.handleSaveClient,
          onSaveContract: handlers.handleSaveContract,
          onSaveInvoice: handlers.handleSaveInvoice,
          onSaveVehicle: handlers.handleSaveVehicle,
          onSavePayment: handlers.handleSavePayment,
          onSaveAgent: handlers.handleSaveAgent,
          onSaveMaintenance: handlers.handleSaveMaintenance
        }}
      />
    </Layout>
  );
};

const App: React.FC = () => {
  const { 
    appState, setAppState, loading, authLoading, syncing, lastSync, 
    augmentedNotifications, visibleData, modals, handlers, lockoutTime 
  } = useAppLogic();

  return (
    <Router>
      {!appState.currentUser ? (
        <Login 
          onLogin={handlers.handleLogin} 
          isConnecting={loading}
          isAuthenticating={authLoading}
          logo={appState.systemSettings?.Logo}
          systemName={'Sally Chanza Café'} 
          lockoutTime={lockoutTime}
          isConnected={!loading}
        />
      ) : (
        <AuthenticatedApp 
          appState={appState}
          setAppState={setAppState}
          augmentedNotifications={augmentedNotifications}
          syncing={syncing}
          visibleData={visibleData}
          modals={modals}
          handlers={handlers}
          lastSync={lastSync}
        />
      )}
    </Router>
  );
};

export default App;
