
import React from 'react';
import { Tournament, User, Match, MatchStatus } from '../types';

interface Props {
  tournament: Tournament;
  participants: User[];
}

const LeagueTable: React.FC<Props> = ({ tournament, participants }) => {
  const stats = participants.map(user => {
    let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0, yellow = 0, red = 0;
    let homePlayed = 0, homeWon = 0, homeDrawn = 0, homeLost = 0;
    let awayPlayed = 0, awayWon = 0, awayDrawn = 0, awayLost = 0;

    tournament.matches.forEach(m => {
      if (m.status !== MatchStatus.CONFIRMED) return;

      if (m.homePlayerId === user.id) {
        played++;
        homePlayed++;
        gf += m.homeStats.goals;
        ga += m.awayStats.goals;
        yellow += m.homeStats.yellowCards;
        red += m.homeStats.redCards;
        if (m.homeStats.goals > m.awayStats.goals) { won++; homeWon++; }
        else if (m.homeStats.goals === m.awayStats.goals) { drawn++; homeDrawn++; }
        else { lost++; homeLost++; }
      } else if (m.awayPlayerId === user.id) {
        played++;
        awayPlayed++;
        gf += m.awayStats.goals;
        ga += m.homeStats.goals;
        yellow += m.awayStats.yellowCards;
        red += m.awayStats.redCards;
        if (m.awayStats.goals > m.homeStats.goals) { won++; awayWon++; }
        else if (m.awayStats.goals === m.homeStats.goals) { drawn++; awayDrawn++; }
        else { lost++; awayLost++; }
      }
    });

    return {
      userId: user.id,
      nickname: user.nickname,
      played, won, drawn, lost, gf, ga, gd: gf - ga, points: (won * 3) + drawn,
      yellow, red,
      home: { played: homePlayed, won: homeWon, drawn: homeDrawn, lost: homeLost },
      away: { played: awayPlayed, won: awayWon, drawn: awayDrawn, lost: awayLost }
    };
  }).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-gray-50 border-y border-gray-100">
          <tr>
            <th className="py-3 px-2 font-bold text-gray-500">Pos</th>
            <th className="py-3 px-2 font-bold text-gray-500">Jugador</th>
            <th className="py-3 px-1 font-bold text-center text-gray-500">PJ</th>
            <th className="py-3 px-1 font-bold text-center text-gray-500">G</th>
            <th className="py-3 px-1 font-bold text-center text-gray-500">E</th>
            <th className="py-3 px-1 font-bold text-center text-gray-500">P</th>
            <th className="py-3 px-1 font-bold text-center text-gray-500">DG</th>
            {tournament.isDetailedLeague && (
                <>
                <th className="py-3 px-1 font-bold text-center text-yellow-500">A</th>
                <th className="py-3 px-1 font-bold text-center text-red-500">R</th>
                </>
            )}
            <th className="py-3 px-2 font-bold text-center text-indigo-600">PTS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {stats.map((row, idx) => (
            <tr key={row.userId} className={`${idx === 0 ? 'bg-yellow-50/30' : ''}`}>
              <td className="py-4 px-2 font-bold text-gray-400">{idx + 1}</td>
              <td className="py-4 px-2 font-bold text-gray-900 truncate max-w-[80px]">{row.nickname}</td>
              <td className="py-4 px-1 text-center font-medium text-gray-600">{row.played}</td>
              <td className="py-4 px-1 text-center font-medium text-gray-600">{row.won}</td>
              <td className="py-4 px-1 text-center font-medium text-gray-600">{row.drawn}</td>
              <td className="py-4 px-1 text-center font-medium text-gray-600">{row.lost}</td>
              <td className={`py-4 px-1 text-center font-bold ${row.gd > 0 ? 'text-green-600' : row.gd < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {row.gd > 0 ? `+${row.gd}` : row.gd}
              </td>
              {tournament.isDetailedLeague && (
                <>
                <td className="py-4 px-1 text-center font-medium text-yellow-600">{row.yellow}</td>
                <td className="py-4 px-1 text-center font-medium text-red-600">{row.red}</td>
                </>
              )}
              <td className="py-4 px-2 text-center font-black text-indigo-700 text-base">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {tournament.isDetailedLeague && (
        <div className="mt-8 space-y-4">
            <h4 className="text-sm font-bold text-gray-900">Rendimiento Local/Visitante</h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                <span>Jugador</span>
                <span className="text-right">L (G-E-P) / V (G-E-P)</span>
            </div>
            {stats.map(row => (
                <div key={row.userId} className="flex justify-between items-center text-xs py-2 border-b border-gray-50">
                    <span className="font-bold text-gray-700">{row.nickname}</span>
                    <span className="text-gray-500 font-mono">
                        {row.home.won}-{row.home.drawn}-{row.home.lost} / {row.away.won}-{row.away.drawn}-{row.away.lost}
                    </span>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default LeagueTable;
