
import { useState, useEffect } from 'react';
import { Web3 } from 'web3';
import { getWeb3Instance, requestAccounts, switchToRinkeby, CONTRACTS, DATA_HOARDER_ABI, FORUM_VOTING_ABI, RINKEBY_CHAIN_ID } from '../config/web3';
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
        setIsCorrectNetwork(newChainId === RINKEBY_CHAIN_ID);
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
          setIsCorrectNetwork(networkId === RINKEBY_CHAIN_ID);
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
      
      // Switch to Rinkeby if not already there
      if (chainId !== RINKEBY_CHAIN_ID) {
        await switchToRinkeby();
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

  useEffect(() => {
    if (!web3 || !address || !isCorrectNetwork) {
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
  }, [web3, address, isCorrectNetwork]);

  return { playerData, isLoading };
};

export const usePlayerActions = () => {
  const { web3, currentAccount, isCorrectNetwork } = useWeb3Connection();
  const { toast } = useToast();

  const registerPlayer = async (username: string) => {
    if (!web3 || !currentAccount || !isCorrectNetwork) {
      throw new Error('Web3 not connected or wrong network');
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

  const createProposal = async (title: string, description: string, category: string) => {
    if (!web3 || !currentAccount || !isCorrectNetwork) {
      throw new Error('Web3 not connected or wrong network');
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
      
      return (result as any[]).map((proposal: any) => ({
        id: Number(proposal.id),
        title: proposal.title,
        description: proposal.description,
        category: proposal.category,
        creator: proposal.creator,
        votesFor: Number(proposal.votesFor),
        votesAgainst: Number(proposal.votesAgainst),
        isActive: proposal.isActive,
        timestamp: Number(proposal.timestamp),
      }));
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      return [];
    }
  };

  return { createProposal, vote, getProposals };
};
