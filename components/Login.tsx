
import React, { useState, useEffect } from 'react';
import { Trophy, UserPlus, LogIn, User as UserIcon, Lock, Eye, EyeOff, Mail, ArrowLeft, Key, AlertCircle, Zap } from 'lucide-react';

interface Props {
  onLogin: (nickname: string, password: string, isGuest: boolean, isRegister: boolean, recoveryContact?: string) => void;
  onResetPassword: (nickname: string, contact: string, newPassword: string) => boolean;
}

const Login: React.FC<Props> = ({ onLogin, onResetPassword }) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryContact, setRecoveryContact] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'RECOVER' | 'GUEST'>('LOGIN');
  const [error, setError] = useState<string | null>(null);

  // Recovery State
  const [resetNickname, setResetNickname] = useState('');
  const [resetContact, setResetContact] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Limpiar errores al cambiar de modo
  useEffect(() => {
    setError(null);
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'RECOVER') {
      if (newPassword.length < 6) {
        setError("La nueva contraseña debe tener al menos 6 caracteres.");
        return;
      }
      const success = onResetPassword(resetNickname, resetContact, newPassword);
      if (success) {
        alert("¡Contraseña restablecida con éxito! Ya puedes entrar.");
        setMode('LOGIN');
      } else {
        setError("El correo o teléfono no coincide con los datos registrados.");
      }
      return;
    }

    if (mode === 'GUEST') {
      if (nickname.trim()) {
        onLogin(nickname.trim(), '', true, true);
      } else {
        setError("Introduce un apodo para jugar.");
      }
      return;
    }

    if (nickname.trim() && (password.trim())) {
      onLogin(nickname.trim(), password.trim(), false, mode === 'REGISTER', recoveryContact);
    } else if (!password.trim()) {
      setError("Por favor, introduce tu contraseña para entrar al campo.");
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 duration-500 overflow-hidden relative">
        
        {/* Banner de Error Dinámico */}
        {error && (
          <div className="absolute top-0 left-0 right-0 bg-red-50 border-b border-red-100 p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300 z-[110]">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-[11px] font-bold text-red-700 leading-tight">{error}</p>
          </div>
        )}

        <div className={`text-center mb-8 ${error ? 'mt-10' : ''}`}>
          <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100 rotate-3 transition-transform hover:rotate-0">
            <Trophy className="w-12 h-12 text-white -rotate-3" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">FIFA MASTER</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
            {mode === 'LOGIN' ? 'Acceso al Estadio' : mode === 'REGISTER' ? 'Nuevo Fichaje' : mode === 'GUEST' ? 'Entrada Rápida' : 'Recuperar Cuenta'}
          </p>
        </div>

        {/* Solo Login y Register en el toggle principal */}
        {(mode === 'LOGIN' || mode === 'REGISTER') && (
          <div className="flex p-1.5 bg-gray-50 rounded-2xl mb-8">
            <button 
              onClick={() => setMode('LOGIN')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'LOGIN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setMode('REGISTER')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'REGISTER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
            >
              Registrarse
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'RECOVER' ? (
            <>
              <div className="relative">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nickname de Jugador</label>
                <input 
                  type="text" required
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 outline-none font-bold text-gray-900 placeholder:text-gray-300"
                  placeholder="Tu apodo exacto"
                  value={resetNickname}
                  onChange={(e) => setResetNickname(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Correo / Teléfono de Recuperación</label>
                <input 
                  type="text" required
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 outline-none font-bold text-gray-900 placeholder:text-gray-300"
                  placeholder="El que usaste al registrarte"
                  value={resetContact}
                  onChange={(e) => setResetContact(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nueva Contraseña Maestra</label>
                <input 
                  type="password" required
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 outline-none font-bold text-gray-900 placeholder:text-gray-300"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nickname de Jugador</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-300" />
                    </div>
                    <input 
                      type="text" required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-gray-900"
                      placeholder="Ej. CR7_Master"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                </div>
              </div>

              {(mode === 'LOGIN' || mode === 'REGISTER') && (
                <div className="relative">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-300" />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"}
                        required={true}
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-gray-900"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                  </div>
                </div>
              )}

              {mode === 'REGISTER' && (
                <div className="relative animate-in slide-in-from-top-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contacto de Recuperación (Email/Tel)</label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-300" />
                      </div>
                      <input 
                        type="text" required
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-gray-900"
                        placeholder="Obligatorio para resetear"
                        value={recoveryContact}
                        onChange={(e) => setRecoveryContact(e.target.value)}
                      />
                  </div>
                </div>
              )}

              {mode === 'GUEST' && (
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3 animate-in fade-in duration-300">
                  <Zap className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] font-bold text-indigo-700 leading-tight">
                    El modo invitado te permite jugar torneos rápidamente, pero no podrás recuperar tus estadísticas si cambias de dispositivo.
                  </p>
                </div>
              )}
            </>
          )}

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl active:scale-95 uppercase tracking-tighter"
          >
            {mode === 'RECOVER' ? (
              <><Key className="w-6 h-6" /> Reclamar Acceso</>
            ) : mode === 'LOGIN' ? (
              <><LogIn className="w-6 h-6" /> Iniciar Sesión</>
            ) : mode === 'GUEST' ? (
              <><Zap className="w-6 h-6" /> Entrar al Campo</>
            ) : (
              <><UserPlus className="w-6 h-6" /> Crear Cuenta</>
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4 text-center">
          {mode === 'LOGIN' && (
            <>
              <button 
                onClick={() => setMode('RECOVER')}
                className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors"
              >
                ¿Perdiste tu contraseña? Recuperar
              </button>
              
              {/* Acceso rápido para Invitados */}
              <div className="pt-4 border-t border-gray-50 mt-2">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-3">O utiliza el acceso rápido</p>
                <button 
                  onClick={() => setMode('GUEST')}
                  className="w-full bg-gray-50 text-gray-600 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-gray-100 transition-all border border-gray-100 active:scale-95 uppercase tracking-widest"
                >
                  <Zap className="w-4 h-4 text-amber-500" /> Continuar como Invitado
                </button>
              </div>
            </>
          )}

          {mode === 'REGISTER' && (
             <div className="pt-4 border-t border-gray-50 mt-2">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-3">¿Solo quieres jugar una partida?</p>
                <button 
                  onClick={() => setMode('GUEST')}
                  className="w-full bg-gray-50 text-gray-600 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-gray-100 transition-all border border-gray-100 active:scale-95 uppercase tracking-widest"
                >
                  <Zap className="w-4 h-4 text-amber-500" /> Modo Invitado
                </button>
             </div>
          )}

          {(mode === 'RECOVER' || mode === 'GUEST') && (
            <button 
              onClick={() => setMode('LOGIN')}
              className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Volver al Inicio de Sesión
            </button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.2em]">Servidor de Torneos v2.5</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
