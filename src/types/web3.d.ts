
import { MetaMaskProvider } from 'web3';

declare global {
  interface Window {
    ethereum: MetaMaskProvider;
  }
}

export interface PlayerData {
  username: string;
  totalXP: number;
  level: number;
  storageUsed: number;
  downloadSpeed: number;
}

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
}
