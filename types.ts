
export enum GameStatus {
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  INTERMISSION = 'INTERMISSION',
  PAUSED = 'PAUSED',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  BATTLE_WON = 'BATTLE_WON',
  VOTING = 'VOTING',
  LIMBO = 'LIMBO',
}

export enum Difficulty {
  EASY = 'Easy',
  NORMAL = 'Normal',
  HARD = 'Hard',
}

export enum GameMode {
    OFFLINE = 'Offline',
    ONLINE = 'Online (Discord Activity)',
}

export interface Theme {
  id: string;
  name: string;
  className: string;
  cost: number;
}


export interface Stim {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'visual' | 'theme' | 'tool';
  effect?: any; // Could be a CSS class name, a function, etc.
  uses?: number;
}

export interface Feedback {
  fromPlayerId: string;
  fromPlayerName: string;
  text: string;
  rating: number; // 1-5
}

export interface Character {
    name: string;
    bio: string;
}

export interface Player {
  id: string; // Can be a generic ID in offline mode, or Discord User ID in online mode
  name: string;
  hearts: number;
  maxHearts: number;
  coins: number;
  level: number;
  experience: number;
  inventory: Stim[];
  theme: Theme;
  feedback: Feedback[];
  characters: Character[];
  activeCharacterIndex: number;
  rebirthPoints: number;
}

export interface Monster {
  name:string;
  description: string;
  maxHp: number;
  currentHp: number;
  imageUrl: string;
  attack: number;
  locationId: string;
}

export interface LimboState {
    wordGoals: Record<string, number>; // Player ID to word count goal
    demons: Record<string, Monster>; // Player ID to their personal demon
    completedPlayers: string[]; // Player IDs who have finished
}

export interface Location {
    id: string;
    name: string;
    description: string;
    item?: Stim;
    connections: string[]; // Array of location IDs
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    rewardCoins: number;
    rewardXp: number;
    targetWordCount?: number;
    assigneeId: string | 'all'; // 'all' for global quests
    progress: Record<string, number>; // playerId to word count
    isComplete: boolean;
}

export interface GameSettings {
  playerNames: string[];
  players: Player[];
  storyPrompt: string;
  initialText: string;
  goals: string;
  difficulty: Difficulty;
  storyLengthWords: number | null; // null for unlimited
  locations: Location[];
  gameMode: GameMode;
  hostRules: string;
  initialCharacters: Record<string, Character[]>; // Player name to character array
  hostId: string | null;
}

export interface Comment {
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}

export interface GameState {
  gameId: string; // Unique ID for the game session, derived from hostId in online mode
  status: GameStatus;
  settings: GameSettings;
  story: string;
  currentPlayerIndex: number;
  monster: Monster | null;
  commentary: Comment[];
  turn: number;
  playerPositions: Record<string, string>; // Player ID to Location ID
  brainstormingJournal: Record<string, string[]>;
  voteState: { active: boolean; votes: string[] } | null;
  quests: Quest[];
  storyBible: string;
  limboState: LimboState | null;
}