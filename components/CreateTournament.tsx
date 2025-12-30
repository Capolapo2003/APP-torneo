
import React, { useState } from 'react';
import { User, Tournament, TournamentType, TournamentStatus } from '../types';
import { Trophy, Users, Info, Swords } from 'lucide-react';

interface Props {
  allUsers: User[];
  creatorId: string;
  onCreated: (tournament: Tournament) => void;
}

const CreateTournament: React.FC<Props> = ({ allUsers, creatorId, onCreated }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TournamentType>(TournamentType.LEAGUE);
  const [isDetailed, setIsDetailed] = useState(false);

  const handleCreate = () => {
    if (!name) return;

    const tId = crypto.randomUUID();
    const newTournament: Tournament = {
      id: tId,
      name,
      type,
      status: TournamentStatus.DRAFT,
      creatorId,
      inviteCode: Math.random().toString(36).substring(2, 7).toUpperCase(),
      participants: [creatorId],
      matches: [],
      isDetailedLeague: isDetailed,
      createdAt: Date.now()
    };

    onCreated(newTournament);
  };

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-bold text-gray-900">Nuevo Desafío</h2>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej. Clásico del Barrio"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Formato</label>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setType(TournamentType.LEAGUE)}
              className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === TournamentType.LEAGUE ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-100 text-gray-500'}`}
            >
              <Trophy className="w-5 h-5" />
              <span className="text-[10px] font-bold">Liga</span>
            </button>
            <button 
              onClick={() => setType(TournamentType.CHAMPIONS)}
              className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === TournamentType.CHAMPIONS ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-100 text-gray-500'}`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-bold">Champions</span>
            </button>
            <button 
              onClick={() => setType(TournamentType.FRIENDLY)}
              className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === TournamentType.FRIENDLY ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-100 text-gray-500'}`}
            >
              <Swords className="w-5 h-5" />
              <span className="text-[10px] font-bold">Amistoso</span>
            </button>
          </div>
        </div>

        {type === TournamentType.LEAGUE && (
          <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700">Incluir estadísticas de tarjetas</p>
            </div>
            <input 
              type="checkbox" 
              checked={isDetailed} 
              onChange={(e) => setIsDetailed(e.target.checked)}
              className="w-5 h-5 accent-indigo-600"
            />
          </div>
        )}

        {type === TournamentType.FRIENDLY && (
          <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl font-medium">
            El amistoso es 1 vs 1. Necesitas que un amigo se una con tu código para jugar.
          </p>
        )}

        <button 
          onClick={handleCreate}
          disabled={!name}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50"
        >
          {type === TournamentType.FRIENDLY ? 'Crear Reto 1vs1' : 'Crear Torneo'}
        </button>
      </div>
    </div>
  );
};

export default CreateTournament;
