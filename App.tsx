import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Settings, 
  Plus, 
  Home, 
  LogOut, 
  Menu, 
  X,
  Palette
} from 'lucide-react';
import { 
  User, 
  Tournament, 
  TournamentType, 
  TournamentStatus, 
  MatchStatus,
  UserRole,
  AppSettings
} from './types';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import TournamentView from './components/TournamentView';
import CreateTournament from './components/CreateTournament';
import AdminPanel from './components/AdminPanel';
import UserSettings from './components/UserSettings';

const App: React.FC = () => {
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('fifa_app_settings');
    return saved ? JSON.parse(saved) : { appName: 'FIFA MASTER', logoUrl: '' };
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fifa_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const saved = localStorage.getItem('fifa_tournaments');
    return saved ? JSON.parse(saved) : [];
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('fifa_all_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState<'DASHBOARD' | 'VIEW_TOURNAMENT' | 'CREATE' | 'ADMIN' | 'SETTINGS'>('DASHBOARD');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(null);

  const userTournaments = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.MASTER || currentUser.role === UserRole.ADMIN) return tournaments;
    return tournaments.filter(t => t.participants.includes(currentUser.id));
  }, [tournaments, currentUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setPendingJoinCode(joinCode.toUpperCase());
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (currentUser && pendingJoinCode) {
      joinTournament(pendingJoinCode);
      setPendingJoinCode(null);
    }
  }, [currentUser, pendingJoinCode]);

  useEffect(() => {
    localStorage.setItem('fifa_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('fifa_tournaments', JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    localStorage.setItem('fifa_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('fifa_app_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  useEffect(() => {
    const root = document.documentElement;
    if (currentUser) {
      const bgs: Record<string, string> = {
        'default': 'bg-gray-50',
        'stadium': 'bg-indigo-900 bg-[url("https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000")] bg-cover bg-fixed bg-center bg-blend-overlay',
        'neon': 'bg-black bg-[url("https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000")] bg-cover bg-fixed bg-center bg-blend-darken',
        'pitch': 'bg-emerald-900 bg-[url("https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=2000")] bg-cover bg-fixed bg-center bg-blend-overlay'
      };
      document.body.className = bgs[currentUser.prefBackground || 'default'];
      root.style.setProperty('--user-secondary-color', currentUser.prefSecondaryColor || '#4f46e5');
      root.style.setProperty('--user-font-color', currentUser.prefFontColor || '#111827');
    } else {
      document.body.className = 'bg-gray-50';
      root.style.setProperty('--user-secondary-color', '#4f46e5');
      root.style.setProperty('--user-font-color', '#111827');
    }
  }, [currentUser?.prefBackground, currentUser?.prefSecondaryColor, currentUser?.prefFontColor]);

  // Master credentials moved to environment variables.
  // To enable master login set these variables at build/deploy time:
  // VITE_MASTER_NICK, VITE_MASTER_PASS, VITE_MASTER_EMAIL
  const MASTER_NICK = import.meta.env.VITE_MASTER_NICK as string | undefined;
  const MASTER_PASS = import.meta.env.VITE_MASTER_PASS as string | undefined;
  const MASTER_EMAIL = import.meta.env.VITE_MASTER_EMAIL as string | undefined;

  const handleLogin = (nickname: string, password: string, isGuest: boolean, isRegister: boolean, recoveryContact?: string) => {
    const nicknameLower = nickname.toLowerCase();
    const existing = allUsers.find(u => u.nickname.toLowerCase() === nicknameLower);
    
    const isMasterLogin = MASTER_NICK && nicknameLower === MASTER_NICK.toLowerCase();

    if (isRegister) {
      if (existing || (MASTER_NICK && nicknameLower === MASTER_NICK.toLowerCase())) {
        alert("¡Error! Este apodo ya está en uso o es reservado.");
        return;
      }
      const newUser: User = {
        id: crypto.randomUUID(),
        nickname,
        password: isGuest ? undefined : password,
        recoveryContact: isGuest ? undefined : recoveryContact,
        role: UserRole.PLAYER,
        registered: !isGuest,
        joinedTournaments: [],
        prefBackground: 'default',
        prefSecondaryColor: '#4f46e5',
        prefFontColor: '#111827'
      };
      setAllUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
    } else {
      if (isMasterLogin) {
        if (!MASTER_PASS) {
          alert("El acceso Master no está configurado en el entorno. Contacta al administrador para habilitarlo.");
          return;
        }
        if (password === MASTER_PASS) {
          const adminUser: User = {
            id: 'admin-master-id',
            nickname: MASTER_NICK!,
            // do not store the master password client-side
            password: undefined,
            recoveryContact: MASTER_EMAIL || undefined,
            role: UserRole.MASTER,
            registered: true,
            joinedTournaments: [],
            prefBackground: 'default',
            prefSecondaryColor: '#4f46e5',
            prefFontColor: '#111827'
          };
          if (!allUsers.find(u => u.id === adminUser.id)) {
            setAllUsers(prev => [...prev, adminUser]);
          }
          setCurrentUser(adminUser);
        } else {
          alert("Contraseña de Master incorrecta.");
        }
        return;
      }

      if (!existing) {
        alert("Usuario no encontrado.");
        return;
      }

      if (existing.registered) {
        if (existing.password !== password) {
          alert("Contraseña incorrecta.");
          return;
        }
      }
      setCurrentUser(existing);
    }
  };

  const handleResetPassword = (nickname: string, contact: string, newPass: string): boolean => {
    const existingIndex = allUsers.findIndex(u => 
      u.nickname.toLowerCase() === nickname.toLowerCase() && 
      u.recoveryContact?.toLowerCase() === contact.toLowerCase()
    );

    if (existingIndex !== -1) {
      const updatedUsers = [...allUsers];
      updatedUsers[existingIndex] = { 
        ...updatedUsers[existingIndex], 
        password: newPass 
      };
      setAllUsers(updatedUsers);
      return true;
    }
    return false;
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (currentUser?.role !== UserRole.MASTER) return;
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const updateUserSettings = (userId: string, updates: Partial<User>) => {
    const updatedUser = { ...currentUser!, ...updates };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('DASHBOARD');
  };

  const addTournament = (tournament: Tournament) => {
    setTournaments(prev => [tournament, ...prev]);
    setSelectedTournamentId(tournament.id);
    setView('VIEW_TOURNAMENT');
  };

  const joinTournament = (code: string) => {
    const tournament = tournaments.find(t => t.inviteCode.toUpperCase() === code.toUpperCase());
    if (!tournament) {
      if (!pendingJoinCode) alert("Código de torneo no encontrado");
      return;
    }
    
    if (tournament.participants.includes(currentUser!.id)) {
      navigateToTournament(tournament.id);
      return;
    }
    
    if (tournament.status !== TournamentStatus.DRAFT) {
      alert("El torneo ya ha comenzado.");
      return;
    }

    const updatedTournaments = tournaments.map(t => {
      if (t.id === tournament.id) {
        return { ...t, participants: [...t.participants, currentUser!.id] };
      }
      return t;
    });
    setTournaments(updatedTournaments);
    navigateToTournament(tournament.id);
  };

  const updateTournament = (updated: Tournament) => {
    setTournaments(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const navigateToTournament = (id: string) => {
    setSelectedTournamentId(id);
    setView('VIEW_TOURNAMENT');
    setIsSidebarOpen(false);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} onResetPassword={handleResetPassword} />;
  }

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500`} style={{ color: 'var(--user-font-color)' }}>
      <header className="bg-indigo-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <button onClick={() => setIsSidebarOpen(true)} className="p-1">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('DASHBOARD')}>
          {appSettings.logoUrl ? (
            <img src={appSettings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
          ) : (
            <Trophy className="w-6 h-6 text-yellow-400" />
          )}
          <h1 className="font-bold text-lg tracking-tight uppercase truncate max-w-[150px]">{appSettings.appName}</h1>
        </div>
        <div className="w-6 h-6"></div>
      </header>

      <style>{`
        :root {
          --user-secondary-color: ${currentUser.prefSecondaryColor || '#4f46e5'};
          --user-font-color: ${currentUser.prefFontColor || '#111827'};
        }
        .bg-indigo-600 { background-color: var(--user-secondary-color) !important; }
        .text-indigo-600 { color: var(--user-secondary-color) !important; }
        .border-indigo-600 { border-color: var(--user-secondary-color) !important; }
        .text-gray-900, .text-gray-800 { color: var(--user-font-color) !important; }
        input { color: #111827 !important; background-color: #f9fafb !important; }
        button { font-family: 'Inter', sans-serif; }
      `}</style>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 w-64 bg-white z-[70] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-indigo-900 uppercase">Menú</h2>
            <button onClick={() => setIsSidebarOpen(false)}><X /></button>
          </div>
          <nav className="flex-1 space-y-2">
            <button onClick={() => { setView('DASHBOARD'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-sm ${view === 'DASHBOARD' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Home className="w-5 h-5" /> Mi Historial
            </button>
            <button onClick={() => { setView('CREATE'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-sm ${view === 'CREATE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Plus className="w-5 h-5" /> Crear Torneo
            </button>
            <button onClick={() => { setView('SETTINGS'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-sm ${view === 'SETTINGS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Palette className="w-5 h-5" /> Personalización
            </button>
            {(currentUser.role === UserRole.MASTER || currentUser.role === UserRole.ADMIN) && (
              <button onClick={() => { setView('ADMIN'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-sm ${view === 'ADMIN' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Settings className="w-5 h-5" /> Panel Master
              </button>
            )}
          </nav>
          <div className="pt-6 border-t border-gray-100">
            <div className="mb-4 px-2">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Sesión Activa</p>
              <div className="flex items-center gap-2">
                <p className="font-black text-gray-800 tracking-tight">{currentUser.nickname}</p>
                <span className="text-[8px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase">{currentUser.role}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 text-red-600 font-bold text-sm hover:bg-red-50 rounded-2xl transition-colors">
              <LogOut className="w-5 h-5" /> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {view === 'DASHBOARD' && (
          <Dashboard 
            tournaments={userTournaments} 
            currentUser={currentUser}
            onSelect={navigateToTournament} 
            onCreate={() => setView('CREATE')}
            onJoin={joinTournament}
          />
        )}
        {view === 'CREATE' && (
          <CreateTournament 
            allUsers={allUsers} 
            creatorId={currentUser.id} 
            onCreated={addTournament} 
          />
        )}
        {view === 'VIEW_TOURNAMENT' && selectedTournament && (
          <TournamentView 
            tournament={selectedTournament} 
            currentUser={currentUser} 
            onUpdate={updateTournament}
            allUsers={allUsers}
          />
        )}
        {view === 'ADMIN' && (currentUser.role === UserRole.MASTER || currentUser.role === UserRole.ADMIN) && (
          <AdminPanel 
            users={allUsers} 
            tournaments={tournaments} 
            currentUser={currentUser} 
            onUpdateRole={updateUserRole}
            onUpdateBranding={setAppSettings}
            appSettings={appSettings}
          />
        )}
        {view === 'SETTINGS' && (
          <UserSettings 
            currentUser={currentUser} 
            onUpdate={updateUserSettings} 
          />
        )}
      </main>
    </div>
  );
};

export default App;