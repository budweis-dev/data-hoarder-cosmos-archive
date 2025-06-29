
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWeb3Connection, usePlayerData } from '@/hooks/useWeb3';
import { useToast } from '@/hooks/use-toast';

interface PlayerData {
  username: string;
  level: number;
  totalXP: number;
  storageUsed: number;
  downloadSpeed: number;
}

interface UserContextType {
  // User state
  isConnected: boolean;
  playerData: PlayerData;
  isLoading: boolean;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  registerPlayer: (username: string) => Promise<void>;
  refreshPlayerData: () => Promise<void>;
  updatePlayerData: (data: Partial<PlayerData>) => void;
}

const defaultPlayerData: PlayerData = {
  username: '',
  level: 1,
  totalXP: 0,
  storageUsed: 0,
  downloadSpeed: 100
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerData>(defaultPlayerData);
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    isConnected: web3Connected, 
    currentAccount, 
    connect, 
    disconnect 
  } = useWeb3Connection();
  
  const { 
    playerData: blockchainPlayerData, 
    isLoading: playerLoading,
    refetch: refetchPlayerData 
  } = usePlayerData(currentAccount || undefined);
  
  const { toast } = useToast();

  // Synchronize with blockchain data
  useEffect(() => {
    console.log('UserContext: Synchronizing with blockchain data', {
      web3Connected,
      currentAccount,
      blockchainPlayerData
    });

    if (web3Connected && currentAccount && blockchainPlayerData?.username) {
      console.log('UserContext: Setting player as connected with data:', blockchainPlayerData);
      setPlayerData({
        username: blockchainPlayerData.username,
        level: blockchainPlayerData.level,
        totalXP: blockchainPlayerData.totalXP,
        storageUsed: blockchainPlayerData.storageUsed,
        downloadSpeed: blockchainPlayerData.downloadSpeed,
      });
      setIsConnected(true);
      
      // Save to localStorage for persistence
      localStorage.setItem('playerData', JSON.stringify(blockchainPlayerData));
      localStorage.setItem('isConnected', 'true');
    } else if (!web3Connected) {
      console.log('UserContext: Wallet disconnected, resetting state');
      setIsConnected(false);
      setPlayerData(defaultPlayerData);
      localStorage.removeItem('playerData');
      localStorage.removeItem('isConnected');
    }
  }, [web3Connected, currentAccount, blockchainPlayerData]);

  // Load persisted data on mount
  useEffect(() => {
    const savedPlayerData = localStorage.getItem('playerData');
    const savedIsConnected = localStorage.getItem('isConnected');
    
    if (savedPlayerData && savedIsConnected === 'true') {
      try {
        const parsedData = JSON.parse(savedPlayerData);
        setPlayerData(parsedData);
        // Don't set isConnected here - let web3 connection handle it
      } catch (error) {
        console.error('Failed to parse saved player data:', error);
      }
    }
  }, []);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    disconnect();
    setIsConnected(false);
    setPlayerData(defaultPlayerData);
    localStorage.removeItem('playerData');
    localStorage.removeItem('isConnected');
  };

  const registerPlayer = async (username: string) => {
    if (!web3Connected || !currentAccount) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      console.log('UserContext: Starting player registration for:', username);
      
      // Import here to avoid circular dependency
      const { usePlayerActions } = await import('@/hooks/useWeb3');
      const { registerPlayer: registerPlayerAction } = usePlayerActions();
      
      await registerPlayerAction(username);
      
      console.log('UserContext: Registration successful, refreshing data...');
      
      // Wait for blockchain confirmation and refresh
      setTimeout(async () => {
        await refetchPlayerData();
        setIsLoading(false);
      }, 3000);
      
    } catch (error) {
      console.error('UserContext: Registration failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const refreshPlayerData = async () => {
    if (currentAccount) {
      await refetchPlayerData();
    }
  };

  const updatePlayerData = (data: Partial<PlayerData>) => {
    setPlayerData(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('playerData', JSON.stringify(updated));
      return updated;
    });
  };

  const contextValue: UserContextType = {
    isConnected,
    playerData,
    isLoading: isLoading || playerLoading,
    connectWallet,
    disconnectWallet,
    registerPlayer,
    refreshPlayerData,
    updatePlayerData,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
