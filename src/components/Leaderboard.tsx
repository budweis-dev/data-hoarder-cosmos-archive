
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Crown, Star, Zap, HardDrive, Users } from 'lucide-react';

export const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState({
    xp: [],
    level: [],
    storage: []
  });

  useEffect(() => {
    // Simulate leaderboard data
    const generateMockData = () => {
      const names = [
        'DataVault_Alpha', 'KnowledgeKeeper', 'ArchiveGuardian', 'InfoHoarder_X',
        'DigitalCurator', 'ByteCollector', 'CyberArchivist', 'DataPreserver_01',
        'TechnoGuardian', 'InfoSentinel', 'DataMiner_Pro', 'ArchiveMaster'
      ];

      const xpData = names.map((name, index) => ({
        rank: index + 1,
        username: name,
        totalXP: Math.floor(Math.random() * 5000) + 1000,
        level: Math.floor(Math.random() * 10) + 1,
        storageGB: Math.floor(Math.random() * 100) + 10
      })).sort((a, b) => b.totalXP - a.totalXP);

      const levelData = [...xpData].sort((a, b) => b.level - a.level);
      const storageData = [...xpData].sort((a, b) => b.storageGB - a.storageGB);

      setLeaderboardData({
        xp: xpData,
        level: levelData,
        storage: storageData
      });
    };

    generateMockData();
    const interval = setInterval(generateMockData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Star className="h-5 w-5 text-orange-400" />;
    return <span className="text-gray-400 font-mono">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-yellow-600 text-black";
    if (rank === 2) return "bg-gray-600 text-white";
    if (rank === 3) return "bg-orange-600 text-white";
    return "bg-gray-800 text-gray-300";
  };

  const LeaderboardTable = ({ data, type }: { data: any[], type: string }) => (
    <div className="space-y-2">
      {data.slice(0, 10).map((player, index) => (
        <Card key={player.username} className={`bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-colors ${
          index < 3 ? 'border-l-4 border-l-cyan-400' : ''
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index + 1)}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono font-bold">{player.username}</span>
                    <Badge className={getRankBadge(index + 1)}>
                      Level {player.level}
                    </Badge>
                  </div>
                  <div className="text-gray-400 text-sm font-mono">
                    Guardian #{Math.floor(Math.random() * 10000) + 1000}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {type === 'xp' && (
                  <div className="flex items-center text-green-400 font-mono">
                    <Zap className="h-4 w-4 mr-1" />
                    {player.totalXP.toLocaleString()} XP
                  </div>
                )}
                {type === 'level' && (
                  <div className="flex items-center text-cyan-400 font-mono">
                    <Star className="h-4 w-4 mr-1" />
                    Level {player.level}
                  </div>
                )}
                {type === 'storage' && (
                  <div className="flex items-center text-purple-400 font-mono">
                    <HardDrive className="h-4 w-4 mr-1" />
                    {player.storageGB} GB
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center">
            <Users className="h-5 w-5 mr-2" />
            GLOBAL RANKINGS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="xp" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-cyan-500/20">
              <TabsTrigger value="xp" className="font-mono">EXPERIENCE</TabsTrigger>
              <TabsTrigger value="level" className="font-mono">LEVEL</TabsTrigger>
              <TabsTrigger value="storage" className="font-mono">STORAGE</TabsTrigger>
            </TabsList>
            
            <TabsContent value="xp" className="mt-6">
              <LeaderboardTable data={leaderboardData.xp} type="xp" />
            </TabsContent>
            
            <TabsContent value="level" className="mt-6">
              <LeaderboardTable data={leaderboardData.level} type="level" />
            </TabsContent>
            
            <TabsContent value="storage" className="mt-6">
              <LeaderboardTable data={leaderboardData.storage} type="storage" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Network Stats */}
      <Card className="bg-black/60 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400 font-mono">NETWORK STATISTICS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 font-mono">
                {Math.floor(Math.random() * 5000) + 1000}
              </div>
              <div className="text-gray-400 text-sm font-mono">ACTIVE GUARDIANS</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 font-mono">
                {Math.floor(Math.random() * 50) + 10} TB
              </div>
              <div className="text-gray-400 text-sm font-mono">DATA PRESERVED</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 font-mono">
                {Math.floor(Math.random() * 100000) + 10000}
              </div>
              <div className="text-gray-400 text-sm font-mono">FILES ARCHIVED</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 font-mono">
                99.{Math.floor(Math.random() * 10)}%
              </div>
              <div className="text-gray-400 text-sm font-mono">UPTIME</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
