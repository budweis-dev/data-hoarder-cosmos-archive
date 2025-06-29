
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wallet, Zap } from 'lucide-react';
import { useWeb3Connection, usePlayerData, usePlayerActions } from '@/hooks/useWeb3';

interface WalletConnectionProps {
  isConnected: boolean;
  onConnect: (connected: boolean) => void;
  playerData: any;
  setPlayerData: (data: any) => void;
}

export const WalletConnection = ({ isConnected, onConnect, playerData, setPlayerData }: WalletConnectionProps) => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [username, setUsername] = useState('');
  
  const { isConnected: web3Connected, currentAccount, connect, disconnect } = useWeb3Connection();
  const { playerData: blockchainPlayerData } = usePlayerData(currentAccount || undefined);
  const { registerPlayer } = usePlayerActions();

  useEffect(() => {
    if (web3Connected && blockchainPlayerData?.username) {
      setPlayerData({
        username: blockchainPlayerData.username,
        level: blockchainPlayerData.level,
        totalXP: blockchainPlayerData.totalXP,
        storageUsed: blockchainPlayerData.storageUsed,
        downloadSpeed: blockchainPlayerData.downloadSpeed,
      });
      onConnect(true);
    } else if (web3Connected && currentAccount && !blockchainPlayerData?.username) {
      setShowRegistration(true);
    }
  }, [web3Connected, blockchainPlayerData, currentAccount, onConnect, setPlayerData]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleRegister = async () => {
    if (username.trim()) {
      try {
        await registerPlayer(username.trim());
        setShowRegistration(false);
      } catch (error) {
        console.error('Registration failed:', error);
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onConnect(false);
    setPlayerData({
      username: '',
      level: 1,
      totalXP: 0,
      storageUsed: 0,
      downloadSpeed: 100
    });
  };

  if (web3Connected && blockchainPlayerData?.username) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-white font-mono text-sm">{blockchainPlayerData.username}</div>
          <div className="text-cyan-400 text-xs">Level {blockchainPlayerData.level}</div>
        </div>
        <Badge variant="outline" className="text-green-400 border-green-400">
          <Zap className="h-3 w-3 mr-1" />
          {blockchainPlayerData.totalXP} XP
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
        >
          DISCONNECT
        </Button>
      </div>
    );
  }

  if (showRegistration) {
    return (
      <Card className="absolute top-16 right-4 w-80 bg-black/90 border-cyan-500/50 z-50">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono text-sm">REGISTER GUARDIAN</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-mono">USERNAME</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter guardian name..."
              className="bg-black/60 border-cyan-500/30 text-white font-mono"
              maxLength={20}
            />
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleRegister}
              disabled={!username.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs"
            >
              INITIALIZE
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRegistration(false)}
              className="border-gray-500 text-gray-400 font-mono text-xs"
            >
              CANCEL
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!window.ethereum) {
    return (
      <div className="text-red-400 font-mono text-sm">
        Please install MetaMask
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-mono"
    >
      <Wallet className="h-4 w-4 mr-2" />
      CONNECT WALLET
    </Button>
  );
};
