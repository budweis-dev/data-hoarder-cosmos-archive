
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useWeb3Connection } from '@/hooks/useWeb3';
import { switchToSepolia } from '@/config/web3';

export const NetworkStatus = () => {
  const { isConnected, chainId, isCorrectNetwork } = useWeb3Connection();

  const handleSwitchNetwork = async () => {
    try {
      await switchToSepolia();
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  if (!isConnected) {
    return (
      <Card className="bg-black/60 border-red-500/30">
        <CardContent className="p-4 flex items-center space-x-3">
          <WifiOff className="h-5 w-5 text-red-400" />
          <span className="text-red-400 font-mono text-sm">WALLET NOT CONNECTED</span>
        </CardContent>
      </Card>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Card className="bg-black/60 border-orange-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <div>
                <span className="text-orange-400 font-mono text-sm">WRONG NETWORK</span>
                <div className="text-gray-400 text-xs">
                  Connected to Chain ID: {chainId} (Expected: Sepolia)
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleSwitchNetwork}
              className="bg-orange-600 hover:bg-orange-700 text-white font-mono text-xs"
            >
              SWITCH TO SEPOLIA
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/60 border-green-500/30">
      <CardContent className="p-4 flex items-center space-x-3">
        <Wifi className="h-5 w-5 text-green-400" />
        <span className="text-green-400 font-mono text-sm">SEPOLIA TESTNET</span>
        <Badge className="bg-green-600/20 text-green-400 border-green-400/50 font-mono text-xs">
          CONNECTED
        </Badge>
      </CardContent>
    </Card>
  );
};
