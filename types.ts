
export enum TournamentType {
  LEAGUE = 'LEAGUE',
  CHAMPIONS = 'CHAMPIONS',
  FRIENDLY = 'FRIENDLY'
}

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED'
}

export enum MatchStatus {
  PENDING = 'PENDING',
  AWAITING_CONFIRMATION = 'AWAITING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED'
}

export enum UserRole {
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN',
  MASTER = 'MASTER'
}

export interface AppSettings {
  appName: string;
  logoUrl: string;
}

export interface User {
  id: string;
  nickname: string;
  password?: string;
  recoveryContact?: string;
  role: UserRole;
  registered: boolean;
  joinedTournaments: string[];
  prefBackground?: string; // Preset de fondo: 'default', 'stadium', 'neon', 'pitch'
  prefSecondaryColor?: string; // Color hexadecimal para acentos/botones
  prefFontColor?: string; // Color hexadecimal para textos
}

export interface MatchStats {
  goals: number;
  yellowCards: number;
  redCards: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  homePlayerId: string;
  awayPlayerId: string;
  homeStats: MatchStats;
  awayStats: MatchStats;
  status: MatchStatus;
  reporterId?: string;
  confirmations: string[];
  round?: number; 
  isSecondLeg?: boolean;
  correctionCount: number; // Nuevo: límite de 3 correcciones
  evidenceUrl?: string; // Nuevo: foto de evidencia
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  status: TournamentStatus;
  creatorId: string;
  inviteCode: string;
  participants: string[]; 
  matches: Match[];
  isDetailedLeague?: boolean;
  createdAt: number;
}

export interface AuthState {
  user: User | null;
}
