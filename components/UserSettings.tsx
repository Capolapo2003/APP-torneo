
import React from 'react';
import { User } from '../types';
// Added Plus to the imports from lucide-react
import { Palette, Check, Droplet, Type, Plus } from 'lucide-react';

interface Props {
  currentUser: User;
  onUpdate: (userId: string, updates: Partial<User>) => void;
}

const UserSettings: React.FC<Props> = ({ currentUser, onUpdate }) => {
  const backgrounds = [
    { id: 'default', name: 'Original', color: 'bg-indigo-600' },
    { id: 'stadium', name: 'Estadio', color: 'bg-green-600' },
    { id: 'pitch', name: 'Césped', color: 'bg-emerald-700' },
    { id: 'neon', name: 'Noche Neon', color: 'bg-purple-800' }
  ];

  const presetColors = [
    '#4f46e5', // Indigo
    '#0ea5e9', // Sky
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#000000', // Black
  ];

  const presetFonts = [
    '#111827', // Gray 900
    '#ffffff', // White
    '#4f46e5', // Indigo
    '#1e293b', // Slate 800
    '#065f46', // Emerald 800
    '#991b1b', // Red 800
  ];

  if (!currentUser.registered) {
    return (
      <div className="bg-white p-10 rounded-[3rem] text-center shadow-sm border border-gray-100">
        <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-black text-gray-900">Función Exclusiva</h3>
        <p className="text-sm text-gray-500 mt-2">Registra tu cuenta para desbloquear la personalización del estadio y colores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 pb-28">
      <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-10">
        
        {/* Sección: Fondo del Estadio */}
        <section>
          <div className="flex items-center gap-4 mb-6">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                  <Palette className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                  <h2 className="text-xl font-black text-gray-900 leading-none">Campo de Juego</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ambiente visual del estadio</p>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {backgrounds.map(bg => (
              <button
                key={bg.id}
                onClick={() => onUpdate(currentUser.id, { prefBackground: bg.id })}
                className={`relative overflow-hidden group p-5 rounded-[2rem] border-2 transition-all text-left ${currentUser.prefBackground === bg.id ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-lg' : 'border-gray-50 hover:border-gray-200'}`}
              >
                <div className={`w-10 h-10 rounded-xl mb-4 shadow-inner ${bg.color}`}></div>
                <span className="font-black text-xs uppercase tracking-tight block">{bg.name}</span>
                {currentUser.prefBackground === bg.id && (
                  <div className="absolute top-4 right-4 bg-indigo-600 text-white p-1.5 rounded-full">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Sección: Color Secundario (Botones/Acentos) */}
        <section>
          <div className="flex items-center gap-4 mb-6">
              <div className="bg-amber-100 p-3 rounded-2xl">
                  <Droplet className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                  <h2 className="text-xl font-black text-gray-900 leading-none">Color de Acento</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Botones y elementos interactivos</p>
              </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {presetColors.map(color => (
              <button
                key={color}
                onClick={() => onUpdate(currentUser.id, { prefSecondaryColor: color })}
                className="w-12 h-12 rounded-2xl border-2 border-white shadow-md transition-transform active:scale-90 flex items-center justify-center relative"
                style={{ backgroundColor: color }}
              >
                {currentUser.prefSecondaryColor === color && <Check className="w-5 h-5 text-white mix-blend-difference" />}
              </button>
            ))}
            <div className="relative group">
              <input 
                type="color" 
                value={currentUser.prefSecondaryColor || '#4f46e5'}
                onChange={(e) => onUpdate(currentUser.id, { prefSecondaryColor: e.target.value })}
                className="w-12 h-12 rounded-2xl border-2 border-white shadow-md cursor-pointer opacity-0 absolute inset-0 z-10"
              />
              <div className="w-12 h-12 rounded-2xl border-2 border-gray-200 flex items-center justify-center bg-gray-50 text-gray-400">
                <Plus className="w-5 h-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Color de Fuente */}
        <section>
          <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-2xl">
                  <Type className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                  <h2 className="text-xl font-black text-gray-900 leading-none">Color de Texto</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Legibilidad de la información</p>
              </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {presetFonts.map(color => (
              <button
                key={color}
                onClick={() => onUpdate(currentUser.id, { prefFontColor: color })}
                className="w-12 h-12 rounded-2xl border-2 border-gray-100 shadow-sm transition-transform active:scale-90 flex items-center justify-center font-bold text-lg"
                style={{ backgroundColor: color, color: color === '#ffffff' ? '#000' : '#fff' }}
              >
                Aa
                {currentUser.prefFontColor === color && (
                  <div className="absolute -top-1 -right-1 bg-indigo-600 text-white p-0.5 rounded-full">
                    <Check className="w-2 h-2" />
                  </div>
                )}
              </button>
            ))}
            <div className="relative group">
              <input 
                type="color" 
                value={currentUser.prefFontColor || '#111827'}
                onChange={(e) => onUpdate(currentUser.id, { prefFontColor: e.target.value })}
                className="w-12 h-12 rounded-2xl border-2 border-white shadow-md cursor-pointer opacity-0 absolute inset-0 z-10"
              />
              <div className="w-12 h-12 rounded-2xl border-2 border-gray-200 flex items-center justify-center bg-gray-50 text-gray-400">
                <Plus className="w-5 h-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Vista Previa de Legibilidad */}
        <div className="mt-10 p-8 rounded-[2.5rem] border border-gray-100 space-y-6" style={{ backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Previsualización de Escritura</h4>
            
            <div className="space-y-4">
               <p className="text-lg font-black italic uppercase" style={{ color: currentUser.prefFontColor }}>
                 {currentUser.nickname} vs RIVAL_ESTRELLA
               </p>
               <p className="text-sm font-medium opacity-80" style={{ color: currentUser.prefFontColor }}>
                 "El fútbol no se juega con los pies, se juega con la cabeza."
               </p>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase">Campo de Texto (Siempre legible)</p>
              <input 
                type="text" 
                disabled
                value="Texto de ejemplo en input..."
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900"
              />
            </div>

            <button 
              className="w-full py-4 rounded-2xl font-black text-white text-xs uppercase tracking-widest shadow-lg"
              style={{ backgroundColor: currentUser.prefSecondaryColor }}
            >
              Botón de Muestra
            </button>
        </div>

        <div className="pt-6 text-center">
            <button 
              onClick={() => onUpdate(currentUser.id, { prefBackground: 'default', prefSecondaryColor: '#4f46e5', prefFontColor: '#111827' })}
              className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
            >
              Restablecer Valores de Fábrica
            </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
