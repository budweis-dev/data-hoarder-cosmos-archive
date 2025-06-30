
import { Web3 } from 'web3';

// Sepolia Testnet Configuration
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY';

// Smart Contract Addresses (deploy to Sepolia)
export const CONTRACTS = {
  DATA_HOARDER_ARENA: '0x742d35Cc6634C0532925a3b8D000B32e75847ca1', // Example address - replace with actual
  FORUM_VOTING: '0x2B4b1b8b3F1d8e7A9c0F2e3D4c5B6a7890123456', // Example address - replace with actual
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [SEPOLIA_RPC_URL],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

// Initialize Web3 instance
export const getWeb3Instance = (): Web3 | null => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new Web3(window.ethereum);
    }
    return null;
  } catch (error) {
    console.error('Failed to initialize Web3:', error);
    return null;
  }
};

// Request MetaMask accounts
export const requestAccounts = async (): Promise<string[]> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const web3 = getWeb3Instance();
    if (!web3) throw new Error('Failed to initialize Web3');
    
    return await web3.eth.getAccounts();
  } catch (error) {
    console.error('Failed to request accounts:', error);
    throw error;
  }
};

// Switch to Sepolia network
export const switchToSepolia = async (): Promise<void> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG],
        });
      } catch (addError) {
        throw new Error('Failed to add Sepolia network to MetaMask');
      }
    } else {
      throw new Error('Failed to switch to Sepolia network');
    }
  }
};

// Enhanced Smart Contract ABIs
export const DATA_HOARDER_ABI = [
  // Player Management
  {
    inputs: [{ name: 'username', type: 'string' }],
    name: 'registerPlayer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'playerAddr', type: 'address' }],
    name: 'getPlayer',
    outputs: [
      { name: 'username', type: 'string' },
      { name: 'totalXP', type: 'uint256' },
      { name: 'level', type: 'uint16' },
      { name: 'storageUsed', type: 'uint64' },
      { name: 'downloadSpeed', type: 'uint32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'playerAddr', type: 'address' }],
    name: 'getPlayerStats',
    outputs: [
      { name: 'registrationTime', type: 'uint256' },
      { name: 'lastActiveTime', type: 'uint256' },
      { name: 'filesUploaded', type: 'uint256' },
      { name: 'totalDownloads', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'playerAddr', type: 'address' },
      { name: 'category', type: 'string' },
    ],
    name: 'getCategoryXP',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // File Management
  {
    inputs: [
      { name: 'fileName', type: 'string' },
      { name: 'fileHash', type: 'string' },
      { name: 'fileSize', type: 'uint256' },
      { name: 'category', type: 'string' },
    ],
    name: 'uploadFile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'uploader', type: 'address' },
      { name: 'fileIndex', type: 'uint256' },
    ],
    name: 'verifyFile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'uploader', type: 'address' },
      { name: 'fileIndex', type: 'uint256' },
    ],
    name: 'downloadFile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'player', type: 'address' }],
    name: 'getPlayerFiles',
    outputs: [
      {
        components: [
          { name: 'fileName', type: 'string' },
          { name: 'fileHash', type: 'string' },
          { name: 'fileSize', type: 'uint256' },
          { name: 'category', type: 'string' },
          { name: 'uploader', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'isVerified', type: 'bool' },
          { name: 'downloadCount', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // XP and Leveling
  {
    inputs: [
      { name: 'player', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'category', type: 'string' },
    ],
    name: 'addXP',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Leaderboards
  {
    inputs: [{ name: 'limit', type: 'uint256' }],
    name: 'getLeaderboard',
    outputs: [
      { name: 'players', type: 'address[]' },
      { name: 'scores', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'category', type: 'string' },
      { name: 'limit', type: 'uint256' },
    ],
    name: 'getCategoryLeaderboard',
    outputs: [
      { name: 'players', type: 'address[]' },
      { name: 'scores', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Achievements
  {
    inputs: [{ name: 'player', type: 'address' }],
    name: 'getPlayerAchievements',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Contract Stats
  {
    inputs: [],
    name: 'getContractStats',
    outputs: [
      { name: 'totalPlayers', type: 'uint256' },
      { name: 'totalFiles', type: 'uint256' },
      { name: 'totalXPDistributed', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalPlayers',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'username', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'PlayerRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'fileName', type: 'string' },
      { indexed: false, name: 'xpGained', type: 'uint256' },
      { indexed: false, name: 'category', type: 'string' },
    ],
    name: 'FileUploaded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'newLevel', type: 'uint16' },
    ],
    name: 'LevelUp',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'achievementId', type: 'uint256' },
    ],
    name: 'AchievementUnlocked',
    type: 'event',
  },
] as const;

export const FORUM_VOTING_ABI = [
  // Proposal Management
  {
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'duration', type: 'uint256' },
      { name: 'tags', type: 'string[]' },
      { name: 'requiredLevel', type: 'uint256' },
    ],
    name: 'createProposal',
    outputs: [{ name: 'proposalId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'support', type: 'bool' },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    name: 'closeProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    name: 'getProposal',
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'creator', type: 'address' },
      { name: 'votesFor', type: 'uint256' },
      { name: 'votesAgainst', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'tags', type: 'string[]' },
      { name: 'requiredLevel', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllProposals',
    outputs: [
      { name: 'ids', type: 'uint256[]' },
      { name: 'titles', type: 'string[]' },
      { name: 'categories', type: 'string[]' },
      { name: 'creators', type: 'address[]' },
      { name: 'votesFor', type: 'uint256[]' },
      { name: 'votesAgainst', type: 'uint256[]' },
      { name: 'isActive', type: 'bool[]' },
      { name: 'timestamps', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'category', type: 'string' }],
    name: 'getProposalsByCategory',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserProposals',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Comments
  {
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'content', type: 'string' },
    ],
    name: 'addComment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'commentIndex', type: 'uint256' },
      { name: 'vote', type: 'int8' },
    ],
    name: 'voteOnComment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    name: 'getProposalComments',
    outputs: [
      { name: 'authors', type: 'address[]' },
      { name: 'contents', type: 'string[]' },
      { name: 'timestamps', type: 'uint256[]' },
      { name: 'upvotes', type: 'uint256[]' },
      { name: 'downvotes', type: 'uint256[]' },
      { name: 'isHidden', type: 'bool[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Voting Info
  {
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    name: 'hasUserVoted',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    name: 'getUserVote',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Configuration
  {
    inputs: [{ name: '_dataHoarderArena', type: 'address' }],
    name: 'setDataHoarderArena',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'proposalId', type: 'uint256' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'title', type: 'string' },
      { indexed: false, name: 'category', type: 'string' },
      { indexed: false, name: 'endTime', type: 'uint256' },
    ],
    name: 'ProposalCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'proposalId', type: 'uint256' },
      { indexed: true, name: 'voter', type: 'address' },
      { indexed: false, name: 'support', type: 'bool' },
    ],
    name: 'VoteCast',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'proposalId', type: 'uint256' },
      { indexed: false, name: 'passed', type: 'bool' },
    ],
    name: 'ProposalClosed',
    type: 'event',
  },
] as const;

// Utility functions
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatXP = (xp: number): string => {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  } else if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
};

export const calculateLevelProgress = (xp: number): { level: number; progress: number; nextLevelXP: number } => {
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXP = (level - 1) * 100;
  const nextLevelXP = level * 100;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  
  return { level, progress, nextLevelXP };
};

// Error handling utilities
export const handleWeb3Error = (error: any): string => {
  if (error.code === 4001) {
    return 'Transaction rejected by user';
  } else if (error.code === -32603) {
    return 'Internal JSON-RPC error';
  } else if (error.message?.includes('insufficient funds')) {
    return 'Insufficient ETH for gas fees';
  } else if (error.message?.includes('execution reverted')) {
    return 'Transaction failed - check contract requirements';
  } else if (error.message?.includes('network')) {
    return 'Network connection error';
  }
  return error.message || 'Unknown error occurred';
};

// Contract interaction helpers
export const getContract = (web3: Web3, address: string, abi: any) => {
  return new web3.eth.Contract(abi, address);
};

export const estimateGas = async (web3: Web3, transaction: any): Promise<string> => {
  try {
    const gasEstimate = await web3.eth.estimateGas(transaction);
    return (BigInt(gasEstimate) * BigInt(120) / BigInt(100)).toString(); // Add 20% buffer
  } catch (error) {
    console.warn('Gas estimation failed, using default:', error);
    return '300000'; // Default gas limit
  }
};
