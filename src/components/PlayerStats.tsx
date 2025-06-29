
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User, Star, Zap, HardDrive } from 'lucide-react';

interface PlayerStatsProps {
  playerData: {
    username: string;
    level: number;
    totalXP: number;
    storageUsed: number;
    downloadSpeed: number;
  };
}

export const PlayerStats = ({ playerData }: PlayerStatsProps) => {
  const nextLevelXP = (playerData.level + 1) * (playerData.level + 1) * 100;
  const currentLevelXP = playerData.level * playerData.level * 100;
  const progressInLevel = playerData.totalXP - currentLevelXP;
  const xpForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercentage = (progressInLevel / xpForNextLevel) * 100;

  return (
    <Card className="bg-gradient-to-r from-black/80 to-gray-900/80 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6 text-cyan-400" />
            <span className="text-white font-mono text-xl">{playerData.username}</span>
            <Badge className="bg-cyan-600 text-white font-mono">
              <Star className="h-3 w-3 mr-1" />
              LEVEL {playerData.level}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-cyan-400 font-mono text-lg">{playerData.totalXP.toLocaleString()} XP</div>
            <div className="text-gray-400 text-xs">TOTAL EXPERIENCE</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* XP Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-mono">PROGRESS TO LEVEL {playerData.level + 1}</span>
              <span className="text-white font-mono">
                {progressInLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
              </span>
            </div>
            <div className="relative">
              <Progress value={progressPercentage} className="h-3 bg-gray-800" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-cyan-500/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 font-mono">
                {Math.floor(playerData.storageUsed / 1024 / 1024)}
              </div>
              <div className="text-xs text-gray-400 font-mono">MB STORED</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 font-mono">
                {playerData.downloadSpeed}
              </div>
              <div className="text-xs text-gray-400 font-mono">MB/S SPEED</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 font-mono">
                {Math.floor(playerData.totalXP / 100)}
              </div>
              <div className="text-xs text-gray-400 font-mono">FILES SHARED</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 font-mono">
                #{Math.floor(Math.random() * 1000) + 1}
              </div>
              <div className="text-xs text-gray-400 font-mono">RANK</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
