
import React, { useState, useRef } from 'react';
import { Match, User, Tournament } from '../types';
import { X, Save, Camera, AlertTriangle, Image as ImageIcon } from 'lucide-react';

interface Props {
  match: Match;
  allUsers: User[];
  tournament: Tournament;
  onClose: () => void;
  onSave: (matchId: string, homeScore: number, awayScore: number, homeY: number, homeR: number, awayY: number, awayR: number, evidence?: string) => void;
}

const MatchReportModal: React.FC<Props> = ({ match, allUsers, tournament, onClose, onSave }) => {
  const [homeScore, setHomeScore] = useState(match.homeStats.goals);
  const [awayScore, setAwayScore] = useState(match.awayStats.goals);
  const [homeY, setHomeY] = useState(match.homeStats.yellowCards);
  const [homeR, setHomeR] = useState(match.homeStats.redCards);
  const [awayY, setAwayY] = useState(match.awayStats.yellowCards);
  const [awayR, setAwayR] = useState(match.awayStats.redCards);
  const [evidence, setEvidence] = useState<string | undefined>(match.evidenceUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const home = allUsers.find(u => u.id === match.homePlayerId);
  const away = allUsers.find(u => u.id === match.awayPlayerId);

  const isCorrection = match.correctionCount > 0 || match.status === 'AWAITING_CONFIRMATION';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidence(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const StatRow = ({ label, value, onChange, colorClass }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50">
      <span className="text-sm font-semibold text-gray-600">{label}</span>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onChange(Math.max(0, value - 1))} 
          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold active:scale-90 transition-transform"
        >
          -
        </button>
        <span className={`w-8 text-center font-black text-lg ${colorClass || 'text-gray-900'}`}>{value}</span>
        <button 
          onClick={() => onChange(value + 1)} 
          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold active:scale-90 transition-transform"
        >
          +
        </button>
      </div>
    </div>
  );

  const canSubmit = !isCorrection || (isCorrection && evidence);

  return (
    <div className="fixed inset-0 z-[100] bg-indigo-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black text-indigo-900">{isCorrection ? 'Corregir Marcador' : 'Reportar Marcador'}</h3>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Corrección {match.correctionCount}/3</p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar pb-4">
            {isCorrection && (
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start animate-in fade-in duration-300">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-[10px] font-bold text-amber-700 leading-tight">
                  Al ser una corrección por disputa, es <b>obligatorio</b> adjuntar una foto del resultado final para validación.
                </p>
              </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-8 bg-indigo-600 rounded-full"></div>
                    <h4 className="font-black text-gray-800 tracking-tight">{home?.nickname}</h4>
                </div>
                <StatRow label="Goles Marcados" value={homeScore} onChange={setHomeScore} colorClass="text-3xl text-indigo-700" />
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-8 bg-blue-600 rounded-full"></div>
                    <h4 className="font-black text-gray-800 tracking-tight">{away?.nickname}</h4>
                </div>
                <StatRow label="Goles Marcados" value={awayScore} onChange={setAwayScore} colorClass="text-3xl text-blue-700" />
            </div>

            {/* Evidencia Fotográfica */}
            <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Evidencia del Resultado</p>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-40 border-4 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${evidence ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50 hover:border-indigo-200'}`}
                >
                    {evidence ? (
                      <img src={evidence} className="w-full h-full object-cover" alt="Evidencia" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-300 mb-2" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subir Foto</span>
                      </>
                    )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
            </div>
        </div>

        <button 
          onClick={() => onSave(match.id, homeScore, awayScore, homeY, homeR, awayY, awayR, evidence)}
          disabled={!canSubmit}
          className="w-full mt-6 bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50 disabled:grayscale active:scale-95 uppercase tracking-tighter"
        >
          <Save className="w-6 h-6" /> {isCorrection ? 'Enviar Corrección' : 'Reportar Resultado'}
        </button>
      </div>
    </div>
  );
};

export default MatchReportModal;
