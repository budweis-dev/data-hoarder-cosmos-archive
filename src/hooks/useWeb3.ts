import { useState, useEffect } from 'react';
import { Web3 } from 'web3';
import { getWeb3Instance, requestAccounts, switchToSepolia, CONTRACTS, DATA_HOARDER_ABI, FORUM_VOTING_ABI, SEPOLIA_CHAIN_ID } from '../config/web3';
import { PlayerData, ForumProposal } from '../types/web3';
import { useToast } from './use-toast';

export const useWeb3Connection = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initWeb3 = () => {
      if (window.ethereum) {
        const web3Instance = getWeb3Instance();
        setWeb3(web3Instance);
        
        // Check if already connected
        if (window.ethereum.selectedAddress) {
          setAccounts([window.ethereum.selectedAddress]);
          setIsConnected(true);
        }
      }
    };

    initWeb3();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccounts(accounts);
        setIsConnected(accounts.length > 0);
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        setChainId(newChainId);
        setIsCorrectNetwork(newChainId === SEPOLIA_CHAIN_ID);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  useEffect(() => {
    const checkNetwork = async () => {
      if (web3) {
        try {
          const id = await web3.eth.getChainId();
          const networkId = Number(id);
          setChainId(networkId);
          setIsCorrectNetwork(networkId === SEPOLIA_CHAIN_ID);
        } catch (error) {
          console.error('Failed to get chain ID:', error);
        }
      }
    };

    checkNetwork();
  }, [web3]);

  const connect = async () => {
    try {
      const accountList = await requestAccounts();
      setAccounts(accountList);
      setIsConnected(accountList.length > 0);
      
      // Switch to Sepolia if not already there
      if (chainId !== SEPOLIA_CHAIN_ID) {
        await switchToSepolia();
      }
      
      return accountList;
    } catch (error) {
      console.error('Failed to connect:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const disconnect = () => {
    setAccounts([]);
    setIsConnected(false);
  };

  return {
    web3,
    accounts,
    isConnected,
    chainId,
    isCorrectNetwork,
    currentAccount: accounts[0] || null,
    connect,
    disconnect,
  };
};

export const usePlayerData = (address?: string) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { web3, isCorrectNetwork } = useWeb3Connection();

  const fetchPlayerData = async () => {
    if (!web3 || !address || !isCorrectNetwork) {
      console.log('usePlayerData: Skipping fetch - missing requirements', {
        hasWeb3: !!web3,
        hasAddress: !!address,
        isCorrectNetwork
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('usePlayerData: Fetching player data for:', address);
      const contract = new web3.eth.Contract(DATA_HOARDER_ABI, CONTRACTS.DATA_HOARDER_ARENA);
      const result = await contract.methods.getPlayer(address).call();
      
      console.log('usePlayerData: Raw result from contract:', result);
      
      if (result && typeof result === 'object') {
        const playerData = {
          username: result.username as string,
          totalXP: Number(result.totalXP),
          level: Number(result.level),
          storageUsed: Number(result.storageUsed),
          downloadSpeed: Number(result.downloadSpeed),
        };
        
        console.log('usePlayerData: Parsed player data:', playerData);
        
        // Only set if username exists (player is registered)
        if (playerData.username && playerData.username.trim() !== '') {
          setPlayerData(playerData);
        } else {
          console.log('usePlayerData: Player not registered (empty username)');
          setPlayerData(null);
        }
      } else {
        console.log('usePlayerData: Invalid result format');
        setPlayerData(null);
      }
    } catch (error) {
      console.error('Failed to fetch player data:', error);
      
      // Check if it's a contract not deployed error
      if (error.message && error.message.includes('Parameter decoding error')) {
        console.warn('usePlayerData: Contract not deployed or wrong ABI - this is expected for demo');
        // For demo purposes, don't spam errors
        setPlayerData(null);
      } else {
        console.error('usePlayerData: Unexpected error:', error);
        setPlayerData(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerData();
  }, [web3, address, isCorrectNetwork]);

  return { 
    playerData, 
    isLoading, 
    refetch: fetchPlayerData 
  };
};

export const usePlayerActions = () => {
  const { web3, currentAccount, isCorrectNetwork } = useWeb3Connection();
  const { toast } = useToast();

  const registerPlayer = async (username: string) => {
    if (!web3 || !currentAccount || !isCorrectNetwork) {
      throw new Error('Web3 not connected or wrong network');
    }

    try {
      console.log('usePlayerActions: Registering player:', username);
      const contract = new web3.eth.Contract(DATA_HOARDER_ABI, CONTRACTS.DATA_HOARDER_ARENA);
      
      const tx = await contract.methods.registerPlayer(username).send({ from: currentAccount });
      console.log('usePlayerActions: Registration transaction successful:', tx);
      
      toast({
        title: "Registration Successful",
        description: `Welcome to the network, ${username}!`,
      });
      
      return tx;
    } catch (error) {
      console.error('usePlayerActions: Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: "Unable to register player. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadFile = async (fileName: string, fileHash: string, fileSize: number, category: string) => {
    if (!web3 || !currentAccount || !isCorrectNetwork) {
      throw new Error('Web3 not connected or wrong network');
    }

    try {
      const contract = new web3.eth.Contract(DATA_HOARDER_ABI, CONTRACTS.DATA_HOARDER_ARENA);
      await contract.methods.uploadFile(fileName, fileHash, fileSize, category).send({ from: currentAccount });
      
      // Calculate XP based on file size (1 MB = 10 XP)
      const xpGained = Math.floor(fileSize / (1024 * 1024)) * 10;
      
      toast({
        title: "File Uploaded Successfully",
        description: `${fileName} uploaded. +${xpGained} XP gained!`,
      });
      
      return xpGained;
    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Unable to upload file to blockchain. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { registerPlayer, uploadFile };
};

export const useForumActions = () => {
  const { web3, currentAccount, isCorrectNetwork } = useWeb3Connection();
  const { toast } = useToast();

  const createProposal = async (
    title: string, 
    description: string, 
    category: string,
    duration: number = 7 * 24 * 60 * 60, // Default 7 days in seconds
    tags: string[] = [],
    requiredLevel: number = 0
  ) => {
    if (!web3 || !currentAccount || !isCorrectNetwork) {
      throw new Error('Web3 not connected or wrong network');
    }

    try {
      const contract = new web3.eth.Contract(FORUM_VOTING_ABI, CONTRACTS.FORUM_VOTING);
      await contract.methods.createProposal(title, description, category, duration, tags, requiredLevel).send({ from: currentAccount });
      
      toast({
        title: "Proposal Created",
        description: "Your proposal has been submitted to the network.",
      });
    } catch (error) {
      console.error('Proposal creation failed:', error);
      toast({
        title: "Proposal Failed",
        description: "Unable to create proposal. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const vote = async (proposalId: number, support: boolean) => {
    if (!web3 || !currentAccount || !isCorrectNetwork) {
      throw new Error('Web3 not connected or wrong network');
    }

    try {
      const contract = new web3.eth.Contract(FORUM_VOTING_ABI, CONTRACTS.FORUM_VOTING);
      await contract.methods.vote(proposalId, support).send({ from: currentAccount });
      
      toast({
        title: "Vote Recorded",
        description: `You voted ${support ? 'FOR' : 'AGAINST'} the proposal.`,
      });
    } catch (error) {
      console.error('Voting failed:', error);
      toast({
        title: "Vote Failed",
        description: "Unable to record vote. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getProposals = async (): Promise<ForumProposal[]> => {
    if (!web3 || !isCorrectNetwork) {
      return [];
    }

    try {
      const contract = new web3.eth.Contract(FORUM_VOTING_ABI, CONTRACTS.FORUM_VOTING);
      const result = await contract.methods.getAllProposals().call();
      
      // Handle the contract result more safely without strict type assertion
      if (!result || !Array.isArray(result) || result.length < 8) {
        console.warn('getAllProposals returned unexpected format:', result);
        return [];
      }

      const [ids, titles, categories, creators, votesFor, votesAgainst, isActive, timestamps] = result;

      // Ensure all arrays have the same length and are valid
      if (!Array.isArray(ids) || !Array.isArray(titles) || !Array.isArray(categories) || 
          !Array.isArray(creators) || !Array.isArray(votesFor) || !Array.isArray(votesAgainst) ||
          !Array.isArray(isActive) || !Array.isArray(timestamps)) {
        console.warn('getAllProposals: Invalid array structure');
        return [];
      }

      const length = ids.length;
      if (![titles, categories, creators, votesFor, votesAgainst, isActive, timestamps]
          .every(arr => arr.length === length)) {
        console.warn('getAllProposals: Array length mismatch');
        return [];
      }

      return ids.map((id: any, index: number) => ({
        id: Number(id),
        title: String(titles[index]),
        description: '', // Description not returned by getAllProposals, would need separate call
        category: String(categories[index]),
        creator: String(creators[index]),
        votesFor: Number(votesFor[index]),
        votesAgainst: Number(votesAgainst[index]),
        isActive: Boolean(isActive[index]),
        timestamp: Number(timestamps[index]),
        endTime: 0, // Would need separate call to getProposal for full details
        tags: [], // Would need separate call to getProposal for full details
        requiredLevel: 0, // Would need separate call to getProposal for full details
      }));
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      return [];
    }
  };

  return { createProposal, vote, getProposals };
};
