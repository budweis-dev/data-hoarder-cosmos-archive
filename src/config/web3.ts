import { Web3 } from 'web3';

// Sepolia Testnet Configuration
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID';

// Smart Contract Addresses (deploy to Sepolia)
export const CONTRACTS = {
  DATA_HOARDER_ARENA: '0x742d35Cc6634C0532925a3b8D000B32e75847ca1', // Example address - replace with actual
  FORUM_VOTING: '0x2B4b1b8b3F1d8e7A9c0F2e3D4c5B6a7890123456', // Example address - replace with actual
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
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [SEPOLIA_RPC_URL],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } catch (addError) {
        throw new Error('Failed to add Sepolia network to MetaMask');
      }
    } else {
      throw new Error('Failed to switch to Sepolia network');
    }
  }
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
  {
    inputs: [],
    name: 'getAllProposals',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
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
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
