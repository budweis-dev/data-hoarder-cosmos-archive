
import { MetaMaskProvider } from 'web3';

declare global {
  interface Window {
    ethereum: MetaMaskProvider;
  }
}

// Enhanced Player Data
export interface PlayerData {
  username: string;
  totalXP: number;
  level: number;
  storageUsed: number;
  downloadSpeed: number;
}

export interface PlayerStats {
  registrationTime: number;
  lastActiveTime: number;
  filesUploaded: number;
  totalDownloads: number;
}

export interface PlayerProfile extends PlayerData, PlayerStats {
  categoryXP: Record<string, number>;
  achievements: number[];
  rank: number;
}

// Enhanced File Data
export interface FileData {
  fileName: string;
  fileHash: string;
  fileSize: number;
  category: string;
  uploader: string;
  timestamp: number;
  isVerified: boolean;
  downloadCount: number;
}

export interface FileUploadParams {
  fileName: string;
  fileHash: string;
  fileSize: number;
  category: string;
}

// Enhanced Forum Data
export interface ForumProposal {
  id: number;
  title: string;
  description: string;
  category: string;
  creator: string;
  votesFor: number;
  votesAgainst: number;
  isActive: boolean;
  timestamp: number;
  endTime: number;
  tags: string[];
  requiredLevel: number;
}

export interface ProposalComment {
  author: string;
  content: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  isHidden: boolean;
}

export interface CreateProposalParams {
  title: string;
  description: string;
  category: string;
  duration: number; // in seconds
  tags: string[];
  requiredLevel: number;
}

// Achievement System
export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  xpReward: number;
  isActive: boolean;
  unlocked?: boolean;
}

// Leaderboard Data
export interface LeaderboardEntry {
  address: string;
  username: string;
  score: number;
  rank: number;
  level: number;
}

export interface CategoryLeaderboard {
  category: string;
  entries: LeaderboardEntry[];
}

// Contract Statistics
export interface ContractStats {
  totalPlayers: number;
  totalFiles: number;
  totalXPDistributed: number;
  averageLevel: number;
  mostActiveCategory: string;
}

// Transaction Results
export interface TransactionResult {
  hash: string;
  blockNumber?: number;
  gasUsed?: string;
  success: boolean;
  error?: string;
}

// Web3 Connection States
export interface Web3ConnectionState {
  isConnected: boolean;
  isCorrectNetwork: boolean;
  currentAccount: string | null;
  chainId: number | null;
  balance: string;
}

// Error Types
export interface Web3Error {
  code: number;
  message: string;
  data?: any;
}

// Contract Event Types
export interface PlayerRegisteredEvent {
  player: string;
  username: string;
  timestamp: number;
}

export interface FileUploadedEvent {
  player: string;
  fileName: string;
  xpGained: number;
  category: string;
}

export interface LevelUpEvent {
  player: string;
  newLevel: number;
}

export interface AchievementUnlockedEvent {
  player: string;
  achievementId: number;
}

export interface ProposalCreatedEvent {
  proposalId: number;
  creator: string;
  title: string;
  category: string;
  endTime: number;
}

export interface VoteCastEvent {
  proposalId: number;
  voter: string;
  support: boolean;
}

// Utility Types
export type ContractMethod<T = any> = (...args: any[]) => Promise<T>;
export type EventFilter = {
  fromBlock?: number | string;
  toBlock?: number | string;
  topics?: string[];
};

// Configuration Types
export interface NetworkConfig {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export interface ContractAddresses {
  DATA_HOARDER_ARENA: string;
  FORUM_VOTING: string;
}

// Hook Return Types
export interface UseWeb3Return extends Web3ConnectionState {
  web3: any;
  connect: () => Promise<string[]>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

export interface UsePlayerDataReturn {
  playerData: PlayerData | null;
  playerStats: PlayerStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseContractReturn<T = any> {
  contract: T | null;
  isLoading: boolean;
  error: string | null;
  call: (method: string, ...args: any[]) => Promise<any>;
  send: (method: string, ...args: any[]) => Promise<TransactionResult>;
}
