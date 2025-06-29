
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wallet, Zap, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useWeb3Connection } from '@/hooks/useWeb3';

export const WalletConnection = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [username, setUsername] = useState('');
  
  const { 
    isConnected, 
    playerData, 
    isLoading, 
    connectWallet, 
    disconnectWallet, 
    registerPlayer 
  } = useUser();
  
  const { 
    isConnected: web3Connected, 
    currentAccount 
  } = useWeb3Connection();

  // Show registration form if wallet is connected but player not registered
  React.useEffect(() => {
    if (web3Connected && currentAccount && !playerData.username && !isLoading) {
      setShowRegistration(true);
    } else if (playerData.username) {
      setShowRegistration(false);
    }
  }, [web3Connected, currentAccount, playerData.username, isLoading]);

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleRegister = async () => {
    if (username.trim()) {
      try {
        await registerPlayer(username.trim());
        setUsername('');
      } catch (error) {
        console.error('Registration failed:', error);
      }
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowRegistration(false);
  };

  // Connected and registered player
  if (isConnected && playerData.username) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-white font-mono text-sm">{playerData.username}</div>
          <div className="text-cyan-400 text-xs">Level {playerData.level}</div>
        </div>
        <Badge variant="outline" className="text-green-400 border-green-400">
          <Zap className="h-3 w-3 mr-1" />
          {playerData.totalXP} XP
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

  // Loading state during registration
  if (isLoading) {
    return (
      <Card className="absolute top-16 right-4 w-80 bg-black/90 border-cyan-500/50 z-50">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono text-sm">
            {showRegistration ? 'REGISTERING GUARDIAN' : 'CONNECTING WALLET'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-2 py-8">
            <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
            <div className="text-center">
              <div className="text-cyan-400 font-mono text-sm">
                {showRegistration ? 'PROCESSING TRANSACTION' : 'CONNECTING...'}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {showRegistration 
                  ? 'Waiting for blockchain confirmation...'
                  : 'Please approve in MetaMask...'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Registration form
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

  // MetaMask not installed
  if (!window.ethereum) {
    return (
      <div className="text-red-400 font-mono text-sm">
        Please install MetaMask
      </div>
    );
  }

  // Connect wallet button
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
