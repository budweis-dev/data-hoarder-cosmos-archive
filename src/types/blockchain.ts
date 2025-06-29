
export interface PlayerData {
  username: string;
  totalXP: bigint;
  level: number;
  storageUsed: bigint;
  downloadSpeed: number;
}

export interface DataPiece {
  name: string;
  category: string;
  subcategory: string;
  fileSize: bigint;
  ipfsHash: string;
  xpValue: bigint;
  submittedBy: string;
  timestamp: bigint;
  communityVerified: boolean;
}

export interface ForumProposal {
  title: string;
  description: string;
  category: string;
  creator: string;
  votesFor: bigint;
  votesAgainst: bigint;
  isActive: boolean;
  timestamp: bigint;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  requirements: {
    fileCount?: number;
    totalSize?: bigint;
    categories?: string[];
    specific?: string[];
  };
  xpReward: bigint;
  unlockLevel: number;
  isCompleted: boolean;
}

export const CATEGORIES = [
  'UAP Research',
  'Critical Survival',
  'Educational',
  'Cultural Heritage',
  'Technical Documentation',
  'Scientific Data',
  'Historical Archives',
  'Entertainment',
] as const;

export type CategoryType = typeof CATEGORIES[number];
