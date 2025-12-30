
import React, { useState, useMemo } from 'react';
import { Tournament, User, Match, MatchStatus, TournamentType, TournamentStatus, UserRole } from '../types';
import { Share2, CheckCircle, Play, Calendar, Trophy, ChevronRight, Check, Edit3, Image as ImageIcon } from 'lucide-react';
import LeagueTable from './LeagueTable';
import MatchReportModal from './MatchReportModal';

interface Props {
  tournament: Tournament;
  currentUser: User;
  onUpdate: (tournament: Tournament) => void;
  allUsers: User[];
}

const TournamentView: React.FC<Props> = ({ tournament, currentUser, onUpdate, allUsers }) => {
  const [activeTab, setActiveTab] = useState<'MATCHES' | 'TABLE'>(tournament.type === TournamentType.FRIENDLY ? 'MATCHES' : 'TABLE');
  const [reportingMatch, setReportingMatch] = useState<Match | null>(null);

  const participants = useMemo(() => 
    tournament.participants.map(pid => allUsers.find(u => u.id === pid)!).filter(Boolean)
  , [tournament.participants, allUsers]);

  const canManage = tournament.creatorId === currentUser.id || currentUser.role === UserRole.MASTER || currentUser.role === UserRole.ADMIN;

  const getStandings = () => {
    const stats = participants.map(user => {
      let played = 0, won = 0, drawn = 0, points = 0, gf = 0, ga = 0;
      tournament.matches.forEach(m => {
        if (m.status !== MatchStatus.CONFIRMED) return;
        if (m.homePlayerId === user.id) {
          played++; gf += m.homeStats.goals; ga += m.awayStats.goals;
          if (m.homeStats.goals > m.awayStats.goals) { won++; points += 3; }
          else if (m.homeStats.goals === m.awayStats.goals) points += 1;
        } else if (m.awayPlayerId === user.id) {
          played++; gf += m.awayStats.goals; ga += m.homeStats.goals;
          if (m.awayStats.goals > m.homeStats.goals) { won++; points += 3; }
          else if (m.awayStats.goals === m.homeStats.goals) points += 1;
        }
      });
      return { id: user.id, points, gd: gf - ga, gf };
    }).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    return stats;
  };

  const createMatch = (home: string, away: string, round: number, isVuelta: boolean = false): Match => ({
    id: crypto.randomUUID(),
    tournamentId: tournament.id,
    homePlayerId: home,
    awayPlayerId: away,
    homeStats: { goals: 0, yellowCards: 0, redCards: 0 },
    awayStats: { goals: 0, yellowCards: 0, redCards: 0 },
    status: MatchStatus.PENDING,
    confirmations: [],
    round,
    isSecondLeg: isVuelta,
    correctionCount: 0
  });

  const handleStartTournament = () => {
    if (tournament.participants.length < 2) {
      alert("Se necesitan al menos 2 jugadores.");
      return;
    }
    const matches: Match[] = [];
    const p = [...tournament.participants];
    if (tournament.type === TournamentType.LEAGUE) {
      const pRotated = p.length % 2 !== 0 ? [...p, 'BYE'] : p;
      const n = pRotated.length;
      for (let r = 0; r < n - 1; r++) {
        for (let i = 0; i < n / 2; i++) {
          const h = pRotated[(r + i) % (n - 1)];
          let a = pRotated[(n - 1 - i + r) % (n - 1)];
          if (i === 0) a = pRotated[n - 1];
          if (h !== 'BYE' && a !== 'BYE') {
            matches.push(createMatch(h, a, r + 1));
            matches.push(createMatch(a, h, r + n, true));
          }
        }
      }
    } else if (tournament.type === TournamentType.FRIENDLY) {
      matches.push(createMatch(p[0], p[1], 1));
    } else if (tournament.type === TournamentType.CHAMPIONS) {
      if (p.length > 16) {
        const shuffled = [...p].sort(() => 0.5 - Math.random());
        const n = shuffled.length;
        const matchesPerPlayer = 4;
        const generatedPairs = new Set<string>();
        for (let i = 0; i < n; i++) {
          for (let offset = 1; offset <= matchesPerPlayer; offset++) {
            const h = shuffled[i];
            const a = shuffled[(i + offset) % n];
            const pairKey = [h, a].sort().join('-');
            if (!generatedPairs.has(pairKey)) {
              matches.push(createMatch(h, a, 0));
              generatedPairs.add(pairKey);
            }
          }
        }
      } else {
        const initialRound = p.length > 8 ? 1 : (p.length > 4 ? 2 : (p.length > 2 ? 3 : 4));
        generateKnockoutRound(p, initialRound, matches);
      }
    }
    onUpdate({ ...tournament, status: TournamentStatus.ACTIVE, matches });
  };

  const generateKnockoutRound = (players: string[], round: number, matches: Match[]) => {
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        matches.push(createMatch(shuffled[i], shuffled[i+1], round));
        if (round < 4) {
          matches.push(createMatch(shuffled[i+1], shuffled[i], round, true));
        }
      }
    }
  };

  const handleAdvancePhase = () => {
    const standings = getStandings();
    const currentMatches = tournament.matches;
    const maxRound = Math.max(...currentMatches.map(m => m.round || 0));
    let nextPlayers: string[] = [];
    let nextRound = 1;
    if (maxRound === 0) {
      nextPlayers = standings.slice(0, 16).map(s => s.id);
      nextRound = 1;
    } else {
      const roundMatches = currentMatches.filter(m => m.round === maxRound);
      const pairings = new Map<string, {p1: string, p2: string, s1: number, s2: number}>();
      roundMatches.forEach(m => {
        const pairKey = [m.homePlayerId, m.awayPlayerId].sort().join('-');
        const current = pairings.get(pairKey) || { p1: m.homePlayerId, p2: m.awayPlayerId, s1: 0, s2: 0 };
        if (m.homePlayerId === current.p1) {
          current.s1 += m.homeStats.goals; current.s2 += m.awayStats.goals;
        } else {
          current.s2 += m.homeStats.goals; current.s1 += m.awayStats.goals;
        }
        pairings.set(pairKey, current);
      });
      pairings.forEach(val => {
        if (val.s1 > val.s2) nextPlayers.push(val.p1);
        else if (val.s2 > val.s1) nextPlayers.push(val.p2);
        else nextPlayers.push(val.p1);
      });
      nextRound = maxRound + 1;
    }
    if (nextPlayers.length < 2 && nextRound < 5) {
      alert("No hay suficientes jugadores clasificados.");
      return;
    }
    if (nextRound > 4) {
        onUpdate({ ...tournament, status: TournamentStatus.FINISHED });
        return;
    }
    const nextMatches: Match[] = [];
    generateKnockoutRound(nextPlayers, nextRound, nextMatches);
    onUpdate({ ...tournament, matches: [...tournament.matches, ...nextMatches] });
    setActiveTab('MATCHES');
  };

  const handleFinishTournament = () => {
    if (window.confirm("¿Estás seguro de que deseas finalizar el torneo? Se moverá al historial.")) {
      onUpdate({ ...tournament, status: TournamentStatus.FINISHED });
    }
  };

  const handleUpdateMatch = (matchId: string, hG: number, aG: number, hY: number, hR: number, aY: number, aR: number, evidence?: string) => {
    const updated = tournament.matches.map(m => {
      if (m.id === matchId) {
        const isAdminReport = currentUser.role === UserRole.MASTER || currentUser.role === UserRole.ADMIN;
        const isCorrection = m.status === MatchStatus.AWAITING_CONFIRMATION;

        return {
          ...m,
          homeStats: { goals: hG, yellowCards: hY, redCards: hR },
          awayStats: { goals: aG, yellowCards: aY, redCards: aR },
          status: isAdminReport ? MatchStatus.CONFIRMED : MatchStatus.AWAITING_CONFIRMATION,
          reporterId: currentUser.id,
          confirmations: isAdminReport ? [m.homePlayerId, m.awayPlayerId] : [currentUser.id],
          evidenceUrl: evidence || m.evidenceUrl,
          correctionCount: isCorrection ? m.correctionCount + 1 : m.correctionCount
        };
      }
      return m;
    });
    onUpdate({ ...tournament, matches: updated });
    setReportingMatch(null);
  };

  const handleConfirmMatch = (matchId: string) => {
    const updated = tournament.matches.map(m => {
      if (m.id === matchId) {
        const confs = [...m.confirmations, currentUser.id];
        return { ...m, confirmations: confs, status: confs.length >= 2 ? MatchStatus.CONFIRMED : MatchStatus.AWAITING_CONFIRMATION };
      }
      return m;
    });
    onUpdate({ ...tournament, matches: updated });
  };

  const canAdvance = useMemo(() => {
    if (tournament.status !== TournamentStatus.ACTIVE || tournament.type !== TournamentType.CHAMPIONS) return false;
    const maxRound = Math.max(...tournament.matches.map(m => m.round || 0));
    const roundMatches = tournament.matches.filter(m => m.round === maxRound);
    return roundMatches.length > 0 && roundMatches.every(m => m.status === MatchStatus.CONFIRMED) && maxRound < 4;
  }, [tournament]);

  const canFinish = useMemo(() => {
    if (tournament.status !== TournamentStatus.ACTIVE) return false;
    const allConfirmed = tournament.matches.length > 0 && tournament.matches.every(m => m.status === MatchStatus.CONFIRMED);
    if (tournament.type !== TournamentType.CHAMPIONS) return allConfirmed;
    const maxRound = Math.max(...tournament.matches.map(m => m.round || 0));
    return allConfirmed && maxRound === 4;
  }, [tournament]);

  const groupedMatches = useMemo(() => matchesByRound(tournament.matches), [tournament.matches]);
  const sortedRounds = useMemo(() => Object.keys(groupedMatches).map(Number).sort((a, b) => b - a), [groupedMatches]);

  if (tournament.status === TournamentStatus.DRAFT) {
    return (
      <div className="space-y-6 pb-20 animate-in slide-in-from-bottom-4">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
            <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100 rotate-6">
                <Trophy className="w-10 h-10 text-white -rotate-6" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">{tournament.name}</h2>
            <div className="flex justify-center gap-2 mt-4">
                <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">{tournament.type}</span>
                <span className="bg-gray-50 text-gray-500 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100">{participants.length} JUGADORES</span>
            </div>
            <div className="mt-10 p-8 bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Código de Invitación</p>
                <p className="text-5xl font-black text-indigo-900 tracking-tighter font-mono">{tournament.inviteCode}</p>
            </div>
        </div>

        <div className="px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-5 px-4">Convocatoria ({participants.length})</h3>
            <div className="grid gap-3">
                {participants.map(u => (
                    <div key={u.id} className="bg-white p-5 rounded-3xl flex items-center justify-between border border-gray-100 hover:border-indigo-200 transition-colors shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-sm bg-indigo-600">
                                {u.nickname.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-black text-gray-800 tracking-tight">{u.nickname}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {canManage && (
            <div className="fixed bottom-8 left-0 right-0 px-6 max-w-lg mx-auto z-50">
                <button onClick={handleStartTournament} disabled={participants.length < 2} className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-tighter">
                    <Play className="w-6 h-6 fill-current" /> Arrancar Torneo
                </button>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 animate-in slide-in-from-bottom-4">
      <div className="bg-indigo-950 -mx-4 p-8 rounded-b-[4rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-40 -mt-40 blur-3xl"></div>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Panel de Estadio</span>
                <h2 className="text-3xl font-black mt-2 tracking-tighter leading-none italic">{tournament.name}</h2>
                {tournament.status === TournamentStatus.FINISHED && (
                  <div className="inline-flex items-center gap-2 bg-yellow-500 text-indigo-950 px-3 py-1 rounded-full text-[9px] font-black uppercase mt-2">
                    <Check className="w-3 h-3" /> Torneo Finalizado
                  </div>
                )}
            </div>
            <button className="p-4 bg-white/10 rounded-2xl backdrop-blur-md hover:bg-white/20 transition-colors"><Share2 className="w-5 h-5" /></button>
        </div>
        
        {tournament.type !== TournamentType.FRIENDLY && (
          <div className="flex mt-10 gap-2 p-2 bg-white/5 rounded-[2rem] backdrop-blur-md relative z-10">
            <button onClick={() => setActiveTab('TABLE')} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'TABLE' ? 'bg-white text-indigo-950 shadow-2xl scale-[1.03]' : 'text-indigo-200'}`}>Tablas</button>
            <button onClick={() => setActiveTab('MATCHES')} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'MATCHES' ? 'bg-white text-indigo-950 shadow-2xl scale-[1.03]' : 'text-indigo-200'}`}>Partidos</button>
          </div>
        )}
      </div>

      {activeTab === 'TABLE' ? (
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <LeagueTable tournament={tournament} participants={participants} />
        </div>
      ) : (
        <div className="space-y-16 mt-4">
          {sortedRounds.map(roundNum => (
            <div key={roundNum} className="space-y-8">
              <div className="flex items-center gap-5 px-4">
                <div className="bg-indigo-600 w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-indigo-100 flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  {getRoundLabel(roundNum, tournament.type)}
                </h3>
                <div className="flex-1 h-[2px] bg-gray-50 rounded-full"></div>
              </div>
              <div className="grid gap-6 px-2">
                {groupedMatches[roundNum].map(m => (
                  <MatchCard 
                    key={m.id} 
                    match={m} 
                    allUsers={allUsers} 
                    onReport={() => setReportingMatch(m)} 
                    onConfirm={() => handleConfirmMatch(m.id)} 
                    currentUser={currentUser} 
                    canManage={canManage}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <div className="fixed bottom-8 left-0 right-0 px-6 max-w-lg mx-auto z-50 flex gap-3">
          {canAdvance && (
            <button onClick={handleAdvancePhase} className="flex-1 bg-green-600 text-white py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(22,163,74,0.3)] animate-bounce active:scale-95 transition-all uppercase tracking-tighter">
                Próxima Fase <ChevronRight className="w-7 h-7" />
            </button>
          )}
          {canFinish && (
            <button onClick={handleFinishTournament} className="flex-1 bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95 transition-all uppercase tracking-tighter">
                Finalizar Torneo <CheckCircle className="w-7 h-7" />
            </button>
          )}
        </div>
      )}

      {reportingMatch && (
        <MatchReportModal match={reportingMatch} allUsers={allUsers} tournament={tournament} onClose={() => setReportingMatch(null)} onSave={handleUpdateMatch} />
      )}
    </div>
  );
};

const MatchCard: React.FC<{ match: Match; allUsers: User[]; onConfirm?: () => void; onReport?: () => void; currentUser: User; canManage: boolean }> = ({ match, allUsers, onConfirm, onReport, currentUser, canManage }) => {
  const home = allUsers.find(u => u.id === match.homePlayerId);
  const away = allUsers.find(u => u.id === match.awayPlayerId);
  const isParticipant = match.homePlayerId === currentUser.id || match.awayPlayerId === currentUser.id;
  const alreadyConfirmed = match.confirmations.includes(currentUser.id);

  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div className={`bg-white p-8 rounded-[3rem] border-2 ${match.status === MatchStatus.CONFIRMED ? 'border-gray-50 bg-gray-50/30' : 'border-indigo-50 shadow-xl shadow-indigo-50/50'} relative overflow-hidden group transition-all`}>
      {match.isSecondLeg && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black px-6 py-2 rounded-bl-3xl uppercase tracking-[0.3em] shadow-lg">Vuelta</div>
      )}
      
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-center space-y-4">
          <div className="w-16 h-16 rounded-[1.5rem] mx-auto flex items-center justify-center text-white font-black text-xl shadow-xl bg-indigo-600">
            {home?.nickname.substring(0, 2).toUpperCase()}
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate px-1">{home?.nickname}</p>
          <div className="text-5xl font-black text-indigo-950 tracking-tighter">{match.status === MatchStatus.PENDING ? '-' : match.homeStats.goals}</div>
        </div>
        <div className="px-4 flex flex-col items-center flex-shrink-0">
            <span className="text-[10px] font-black text-gray-200 mb-2 italic tracking-widest">VS</span>
            <div className="w-[3px] h-16 bg-gradient-to-b from-transparent via-gray-100 to-transparent"></div>
        </div>
        <div className="flex-1 text-center space-y-4">
          <div className="w-16 h-16 rounded-[1.5rem] mx-auto flex items-center justify-center text-white font-black text-xl shadow-xl bg-blue-600">
            {away?.nickname.substring(0, 2).toUpperCase()}
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate px-1">{away?.nickname}</p>
          <div className="text-5xl font-black text-indigo-950 tracking-tighter">{match.status === MatchStatus.PENDING ? '-' : match.awayStats.goals}</div>
        </div>
      </div>

      {match.evidenceUrl && (
        <div className="mt-4 flex flex-col items-center">
            <button 
              onClick={() => setShowEvidence(!showEvidence)}
              className="flex items-center gap-2 text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100"
            >
              <ImageIcon className="w-3 h-3" /> {showEvidence ? 'Ocultar Evidencia' : 'Ver Evidencia de Resultado'}
            </button>
            {showEvidence && (
              <div className="mt-4 w-full h-48 rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                <img src={match.evidenceUrl} className="w-full h-full object-contain" alt="Resultado Final" />
              </div>
            )}
        </div>
      )}

      <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-3">
        {(isParticipant || canManage) && match.status === MatchStatus.PENDING ? (
          <button onClick={onReport} className="text-xs font-black text-indigo-600 bg-indigo-50 px-10 py-4 rounded-2xl hover:bg-indigo-100 transition-all uppercase tracking-widest border border-indigo-100 active:scale-95">Editar Marcador</button>
        ) : match.status === MatchStatus.AWAITING_CONFIRMATION ? (
          (isParticipant && !alreadyConfirmed) ? (
            <div className="flex flex-col w-full gap-3">
               <button onClick={onConfirm} className="w-full text-xs font-black text-white bg-green-500 py-4 rounded-2xl hover:bg-green-600 transition-all uppercase tracking-widest shadow-xl shadow-green-100 active:scale-95 flex items-center justify-center gap-2">
                 <CheckCircle className="w-4 h-4" /> Aprobar Resultado
               </button>
               {match.correctionCount < 3 ? (
                 <button onClick={onReport} className="w-full text-xs font-black text-amber-600 bg-amber-50 py-4 rounded-2xl hover:bg-amber-100 transition-all uppercase tracking-widest border border-amber-100 active:scale-95 flex items-center justify-center gap-2">
                   <Edit3 className="w-4 h-4" /> Corregir Marcador ({3 - match.correctionCount} restantes)
                 </button>
               ) : (
                 <div className="text-center p-3 bg-red-50 rounded-2xl border border-red-100">
                   <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Límite de correcciones alcanzado (3/3)</p>
                   <p className="text-[8px] text-red-400 font-bold uppercase mt-1">Debes contactar a un administrador si el resultado es incorrecto.</p>
                 </div>
               )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 bg-amber-50 px-8 py-3 rounded-2xl border border-amber-100">
                  <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></div>
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{canManage ? 'A espera de jugadores' : 'Esperando rival'}</span>
              </div>
              <p className="text-[8px] text-gray-400 font-bold uppercase">Corrección {match.correctionCount}/3</p>
            </div>
          )
        ) : (
          <span className="flex items-center gap-3 text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-8 py-3 rounded-2xl border border-green-100"><CheckCircle className="w-4 h-4" /> Resultado Oficial</span>
        )}
      </div>
    </div>
  );
};

const matchesByRound = (matches: Match[]) => matches.reduce((acc, match) => {
    const r = match.round || 0;
    if (!acc[r]) acc[r] = [];
    acc[r].push(match);
    return acc;
}, {} as Record<number, Match[]>);

const getRoundLabel = (r: number, type: TournamentType) => {
    if (type === TournamentType.CHAMPIONS) {
        if (r === 0) return "Fase de Grupos";
        if (r === 1) return "Octavos de Final";
        if (r === 2) return "Cuartos de Final";
        if (r === 3) return "Semifinales";
        if (r === 4) return "La Gran Final";
        return "Eliminatorias";
    }
    return `Jornada ${r}`;
};

export default TournamentView;
