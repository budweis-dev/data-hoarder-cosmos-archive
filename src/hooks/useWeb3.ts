
import { useState, useEffect } from 'react';
import { Web3 } from 'web3';
import { getWeb3Instance, requestAccounts, CONTRACTS, DATA_HOARDER_ABI, FORUM_VOTING_ABI } from '../config/web3';
import { PlayerData } from '../types/web3';
import { useToast } from './use-toast';

export const useWeb3Connection = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

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
        setChainId(parseInt(chainId, 16));
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
    const getChainId = async () => {
      if (web3) {
        try {
          const id = await web3.eth.getChainId();
          setChainId(Number(id));
        } catch (error) {
          console.error('Failed to get chain ID:', error);
        }
      }
    };

    getChainId();
  }, [web3]);

  const connect = async () => {
    try {
      const accountList = await requestAccounts();
      setAccounts(accountList);
      setIsConnected(accountList.length > 0);
      return accountList;
    } catch (error) {
      console.error('Failed to connect:', error);
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
    currentAccount: accounts[0] || null,
    connect,
    disconnect,
  };
};

export const usePlayerData = (address?: string) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { web3 } = useWeb3Connection();

  useEffect(() => {
    if (!web3 || !address || CONTRACTS.DATA_HOARDER_ARENA === '0x0000000000000000000000000000000000000000') {
      return;
    }

    const fetchPlayerData = async () => {
      setIsLoading(true);
      try {
        const contract = new web3.eth.Contract(DATA_HOARDER_ABI, CONTRACTS.DATA_HOARDER_ARENA);
        const result = await contract.methods.getPlayer(address).call();
        
        if (result && typeof result === 'object') {
          setPlayerData({
            username: result.username as string,
            totalXP: Number(result.totalXP),
            level: Number(result.level),
            storageUsed: Number(result.storageUsed),
            downloadSpeed: Number(result.downloadSpeed),
          });
        }
      } catch (error) {
        console.error('Failed to fetch player data:', error);
        setPlayerData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerData();
  }, [web3, address]);

  return { playerData, isLoading };
};

export const usePlayerActions = () => {
  const { web3, currentAccount } = useWeb3Connection();
  const { toast } = useToast();

  const registerPlayer = async (username: string) => {
    if (!web3 || !currentAccount) {
      throw new Error('Web3 not connected');
    }

    try {
      const contract = new web3.eth.Contract(DATA_HOARDER_ABI, CONTRACTS.DATA_HOARDER_ARENA);
      await contract.methods.registerPlayer(username).send({ from: currentAccount });
      
      toast({
        title: "Registration Successful",
        description: `Welcome to the network, ${username}!`,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: "Unable to register player. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addXP = async (amount: number, category: string) => {
    if (!web3 || !currentAccount) {
      throw new Error('Web3 not connected');
    }

    try {
      const contract = new web3.eth.Contract(DATA_HOARDER_ABI, CONTRACTS.DATA_HOARDER_ARENA);
      await contract.methods.addXP(currentAccount, amount, category).send({ from: currentAccount });
      
      toast({
        title: "XP Gained!",
        description: `+${amount} XP in ${category}`,
      });
    } catch (error) {
      console.error('XP addition failed:', error);
      throw error;
    }
  };

  return { registerPlayer, addXP };
};

export const useForumActions = () => {
  const { web3, currentAccount } = useWeb3Connection();
  const { toast } = useToast();

  const createProposal = async (title: string, description: string, category: string) => {
    if (!web3 || !currentAccount) {
      throw new Error('Web3 not connected');
    }

    try {
      const contract = new web3.eth.Contract(FORUM_VOTING_ABI, CONTRACTS.FORUM_VOTING);
      await contract.methods.createProposal(title, description, category).send({ from: currentAccount });
      
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
    if (!web3 || !currentAccount) {
      throw new Error('Web3 not connected');
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

  return { createProposal, vote };
};
