
import React, { useState } from 'react';
import { User, Tournament, UserRole, AppSettings } from '../types';
import { Shield, Users, Trophy, UserCheck, Star, UserCog, Edit3, Image as ImageIcon, Save } from 'lucide-react';

interface Props {
  users: User[];
  tournaments: Tournament[];
  currentUser: User;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onUpdateBranding: (settings: AppSettings) => void;
  appSettings: AppSettings;
}

const AdminPanel: React.FC<Props> = ({ users, tournaments, currentUser, onUpdateRole, onUpdateBranding, appSettings }) => {
  const realUsers = users.filter(u => !u.id.startsWith('bot-'));
  const isMaster = currentUser.role === UserRole.MASTER;

  const [editBranding, setEditBranding] = useState(false);
  const [tempName, setTempName] = useState(appSettings.appName);
  const [tempLogo, setTempLogo] = useState(appSettings.logoUrl);

  const handleSaveBranding = () => {
    onUpdateBranding({ appName: tempName, logoUrl: tempLogo });
    setEditBranding(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl shadow-indigo-100">
        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
            <Shield className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight leading-none uppercase italic">Panel de Control</h2>
          <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-2">{currentUser.role === UserRole.MASTER ? 'Acceso Maestro Total' : 'Gestión de Torneos'}</p>
        </div>
      </div>

      {/* Actualización de Branding (Solo Master) */}
      {isMaster && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> Personalización de App
            </h3>
            <button 
              onClick={() => setEditBranding(!editBranding)}
              className="text-[10px] font-black text-indigo-600 uppercase"
            >
              {editBranding ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {!editBranding ? (
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
              <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden">
                {appSettings.logoUrl ? <img src={appSettings.logoUrl} className="w-full h-full object-contain" /> : <ImageIcon className="text-gray-300" />}
              </div>
              <div>
                <p className="font-black text-gray-900 leading-none">{appSettings.appName}</p>
                <p className="text-[9px] text-gray-400 uppercase mt-1">Nombre Global de la Aplicación</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Nombre de la App</label>
                <input 
                  type="text" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">URL del Logo (PNG/JPG)</label>
                <input 
                  type="text" 
                  value={tempLogo} 
                  onChange={(e) => setTempLogo(e.target.value)}
                  placeholder="https://ejemplo.com/logo.png"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none focus:border-indigo-500"
                />
              </div>
              <button 
                onClick={handleSaveBranding}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 uppercase shadow-lg active:scale-95"
              >
                <Save className="w-4 h-4" /> Guardar Cambios
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jugadores</p>
          <p className="text-4xl font-black text-indigo-600 tracking-tighter">{realUsers.length}</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
             <UserCheck className="w-3 h-3 text-green-500" /> Cuentas Activas
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Torneos</p>
          <p className="text-4xl font-black text-blue-600 tracking-tighter">{tournaments.length}</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
             <Trophy className="w-3 h-3 text-amber-500" /> Eventos
          </div>
        </div>
      </div>

      {/* Gestión de Usuarios y Roles */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-black text-gray-800 flex items-center gap-3 text-xs uppercase tracking-wider">
                <UserCog className="w-5 h-5 text-indigo-500" /> Gestión de Roles
            </h3>
            <span className="text-[10px] font-black text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">{realUsers.length} JUGADORES</span>
        </div>
        <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto custom-scrollbar">
          {realUsers.length === 0 ? (
            <div className="p-10 text-center text-gray-400 italic text-sm">No hay usuarios registrados.</div>
          ) : (
            realUsers.map(u => (
              <div key={u.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-sm ${u.role === UserRole.MASTER ? 'bg-indigo-600' : u.role === UserRole.ADMIN ? 'bg-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                        {u.nickname.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-black text-gray-900 leading-none">{u.nickname}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{u.recoveryContact || 'Sin contacto'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isMaster && u.id !== currentUser.id && u.role !== UserRole.MASTER ? (
                      <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                        <button 
                          onClick={() => onUpdateRole(u.id, UserRole.PLAYER)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${u.role === UserRole.PLAYER ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                        >
                          Player
                        </button>
                        <button 
                          onClick={() => onUpdateRole(u.id, UserRole.ADMIN)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${u.role === UserRole.ADMIN ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400'}`}
                        >
                          Admin
                        </button>
                      </div>
                    ) : (
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${u.role === UserRole.MASTER ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : u.role === UserRole.ADMIN ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                         <span className="flex items-center gap-1.5">
                            {u.role === UserRole.MASTER && <Star className="w-3 h-3 fill-current" />}
                            {u.role}
                         </span>
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
