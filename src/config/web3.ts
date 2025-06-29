
import { Web3 } from 'web3';

// Smart Contract Addresses (to be deployed)
export const CONTRACTS = {
  DATA_HOARDER_ARENA: '0x0000000000000000000000000000000000000000', // Placeholder
  FORUM_VOTING: '0x0000000000000000000000000000000000000000', // Placeholder
} as const;

// Initialize Web3 instance
export const getWeb3Instance = (): Web3 | null => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new Web3(window.ethereum);
  }
  return null;
};

// Request MetaMask accounts
export const requestAccounts = async (): Promise<string[]> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const web3 = getWeb3Instance();
  if (!web3) throw new Error('Failed to initialize Web3');
  
  return web3.eth.getAccounts();
};

// Smart Contract ABIs
export const DATA_HOARDER_ABI = [
  {
    inputs: [{ name: 'username', type: 'string' }],
    name: 'registerPlayer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
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
  {
    inputs: [{ name: 'playerAddr', type: 'address' }],
    name: 'getPlayer',
    outputs: [
      {
        components: [
          { name: 'username', type: 'string' },
          { name: 'totalXP', type: 'uint256' },
          { name: 'level', type: 'uint16' },
          { name: 'storageUsed', type: 'uint64' },
          { name: 'downloadSpeed', type: 'uint32' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
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
] as const;

export const FORUM_VOTING_ABI = [
  {
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'category', type: 'string' },
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
    name: 'getProposal',
    outputs: [
      {
        components: [
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'creator', type: 'address' },
          { name: 'votesFor', type: 'uint256' },
          { name: 'votesAgainst', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'timestamp', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
