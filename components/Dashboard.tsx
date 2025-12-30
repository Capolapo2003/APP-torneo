
import React, { useState, useMemo } from 'react';
import { Tournament, TournamentType, TournamentStatus, MatchStatus, User } from '../types';
import { Trophy, Plus, ChevronRight, Hash, Send, Bell, AlertCircle } from 'lucide-react';

interface Props {
  tournaments: Tournament[];
  currentUser: User;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onJoin: (code: string) => void;
}

const Dashboard: React.FC<Props> = ({ tournaments, currentUser, onSelect, onCreate, onJoin }) => {
  const [inviteCode, setInviteCode] = useState('');
  
  const activeTournaments = tournaments.filter(t => t.status !== TournamentStatus.FINISHED);
  const finishedTournaments = tournaments.filter(t => t.status === TournamentStatus.FINISHED);

  const pendingConfirmations = useMemo(() => {
    const actions: { tournamentId: string, tournamentName: string, matchId: string, opponentName: string, score: string }[] = [];
    
    tournaments.forEach(t => {
      if (t.status === TournamentStatus.FINISHED) return;
      t.matches.forEach(m => {
        const isParticipant = m.homePlayerId === currentUser.id || m.awayPlayerId === currentUser.id;
        const alreadyConfirmed = m.confirmations.includes(currentUser.id);
        
        if (isParticipant && m.status === MatchStatus.AWAITING_CONFIRMATION && !alreadyConfirmed) {
          actions.push({
            tournamentId: t.id,
            tournamentName: t.name,
            matchId: m.id,
            opponentName: "tu rival",
            score: `${m.homeStats.goals} - ${m.awayStats.goals}`
          });
        }
      });
    });
    return actions;
  }, [tournaments, currentUser.id]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      onJoin(inviteCode.trim());
      setInviteCode('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Notifications Section */}
      {pendingConfirmations.length > 0 && (
        <section className="animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Bell className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Notificaciones ({pendingConfirmations.length})</h2>
          </div>
          <div className="space-y-3">
            {pendingConfirmations.map((notif) => (
              <div 
                key={notif.matchId}
                onClick={() => onSelect(notif.tournamentId)}
                className="bg-amber-50 border border-amber-100 p-4 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-amber-100 transition-all shadow-sm shadow-amber-100/50"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2.5 rounded-2xl text-amber-600 shadow-sm">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-amber-900 leading-tight uppercase tracking-tight">
                      Confirmar Resultado: {notif.score}
                    </p>
                    <p className="text-[9px] text-amber-700 font-bold opacity-70 mt-0.5">
                      En {notif.tournamentName} contra {notif.opponentName}
                    </p>
                  </div>
                </div>
                <div className="bg-amber-200/50 p-2 rounded-xl group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="w-4 h-4 text-amber-700" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Join Section */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Hash className="w-4 h-4" /> Unirse a un Torneo
        </h2>
        <form onSubmit={handleJoinSubmit} className="flex gap-2">
          <input 
            type="text"
            placeholder="Código de Invitación"
            className="flex-1 px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none uppercase font-mono font-black text-sm tracking-widest transition-all"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-indigo-600 text-white px-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-90"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tight italic uppercase">Tus Torneos</h2>
        </div>

        {activeTournaments.length === 0 ? (
          <div className="bg-white border-4 border-dashed border-gray-100 rounded-[3rem] p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 mb-6 font-bold text-sm uppercase tracking-widest">No hay torneos en curso</p>
            <button onClick={onCreate} className="bg-indigo-50 text-indigo-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all">
              Crear Nuevo Desafío
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeTournaments.map(t => (
              <button 
                key={t.id}
                onClick={() => onSelect(t.id)}
                className="w-full bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all text-left group"
              >
                <div className="flex gap-5 items-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${t.type === TournamentType.LEAGUE ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'}`}>
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors text-lg tracking-tight italic uppercase">{t.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {t.status === TournamentStatus.DRAFT ? 'Draft' : t.type}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        • {t.participants.length} Jugadores
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {finishedTournaments.length > 0 && (
        <section className="pb-10">
          <div className="mb-4 px-1">
            <h2 className="text-xl font-black text-gray-400 tracking-tight italic uppercase">Historial</h2>
          </div>
          <div className="grid gap-4">
            {finishedTournaments.map(t => (
              <button 
                key={t.id}
                onClick={() => onSelect(t.id)}
                className="w-full bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100 flex items-center justify-between opacity-70 hover:opacity-100 transition-all text-left"
              >
                <div className="flex gap-5 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-200 text-gray-400 flex items-center justify-center">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-500 italic uppercase">{t.name}</h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Finalizado • {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            ))}
          </div>
        </section>
      )}

      <button 
        onClick={onCreate}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white w-16 h-16 rounded-[2rem] shadow-[0_15px_40px_rgba(79,70,229,0.4)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
};

export default Dashboard;
