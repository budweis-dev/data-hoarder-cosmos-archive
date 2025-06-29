import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Database, Users, Trophy, Zap, HardDrive, Wifi, MessageSquare } from 'lucide-react';
import { WalletConnection } from '@/components/WalletConnection';
import { FileManager } from '@/components/FileManager';
import { Leaderboard } from '@/components/Leaderboard';
import { QuestSystem } from '@/components/QuestSystem';
import { PlayerStats } from '@/components/PlayerStats';
import { Forum } from '@/components/Forum';
import { useUser } from '@/contexts/UserContext';

const Index = () => {
  const { isConnected, playerData, updatePlayerData } = useUser();
  
  // Simulated terminal boot sequence
  const [bootSequence, setBootSequence] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setBootSequence(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (bootSequence) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-pulse">INITIALIZING DATA HOARDER ARENA...</div>
          <div className="text-sm opacity-60">CONNECTING TO DECENTRALIZED NETWORK...</div>
          <div className="flex justify-center space-x-1 mt-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-green-400 rounded-full animate-ping"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-cyan-500/20 bg-black/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold text-white font-mono">
                  DATA HOARDER ARENA
                </h1>
                <p className="text-xs text-cyan-400 font-mono">
                  KNOWLEDGE PRESERVATION PROTOCOL v2.1
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-400 font-mono text-sm">
                <Wifi className="h-4 w-4" />
                <span>NETWORK: ACTIVE</span>
              </div>
              <WalletConnection />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {!isConnected ? (
            <div className="text-center py-20">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-white font-mono">
                    CONNECT TO THE NETWORK
                  </h2>
                  <p className="text-cyan-400 font-mono">
                    Join the decentralized knowledge preservation protocol
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <Card className="bg-black/60 border-cyan-500/30 hover:border-cyan-400/50 transition-colors">
                    <CardContent className="p-6 text-center">
                      <HardDrive className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                      <h3 className="text-white font-mono text-lg mb-2">PRESERVE</h3>
                      <p className="text-gray-400 text-sm">
                        Collect and categorize digital artifacts for the future
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black/60 border-green-500/30 hover:border-green-400/50 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Zap className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <h3 className="text-white font-mono text-lg mb-2">EARN XP</h3>
                      <p className="text-gray-400 text-sm">
                        Gain experience points and level up your preservation skills
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black/60 border-orange-500/30 hover:border-orange-400/50 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Trophy className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                      <h3 className="text-white font-mono text-lg mb-2">COMPETE</h3>
                      <p className="text-gray-400 text-sm">
                        Climb the leaderboards and become a Knowledge Guardian
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Player Stats Overview */}
              <PlayerStats playerData={playerData} />
              
              {/* Main Game Interface */}
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-6 bg-black/40 border border-cyan-500/20">
                  <TabsTrigger value="dashboard" className="font-mono">DASHBOARD</TabsTrigger>
                  <TabsTrigger value="files" className="font-mono">DATA MGR</TabsTrigger>
                  <TabsTrigger value="forum" className="font-mono">FORUM</TabsTrigger>
                  <TabsTrigger value="network" className="font-mono">NETWORK</TabsTrigger>
                  <TabsTrigger value="quests" className="font-mono">QUESTS</TabsTrigger>
                  <TabsTrigger value="leaderboard" className="font-mono">RANKINGS</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dashboard" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-black/60 border-cyan-500/30">
                      <CardHeader>
                        <CardTitle className="text-cyan-400 font-mono flex items-center">
                          <Zap className="h-5 w-5 mr-2" />
                          XP PROGRESS
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Level {playerData.level}</span>
                            <span className="text-white">{playerData.totalXP} XP</span>
                          </div>
                          <Progress value={(playerData.totalXP % 1000) / 10} className="h-2" />
                          <div className="text-xs text-gray-500 text-center">
                            {1000 - (playerData.totalXP % 1000)} XP to next level
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-black/60 border-green-500/30">
                      <CardHeader>
                        <CardTitle className="text-green-400 font-mono flex items-center">
                          <HardDrive className="h-5 w-5 mr-2" />
                          STORAGE
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-white font-mono">
                            {(playerData.storageUsed / 1024 / 1024 / 1024).toFixed(2)} GB
                          </div>
                          <div className="text-sm text-gray-400">Data preserved</div>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            ACTIVE GUARDIAN
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-black/60 border-orange-500/30">
                      <CardHeader>
                        <CardTitle className="text-orange-400 font-mono flex items-center">
                          <Wifi className="h-5 w-5 mr-2" />
                          NETWORK
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-white font-mono">
                            {playerData.downloadSpeed} MB/s
                          </div>
                          <div className="text-sm text-gray-400">Share capacity</div>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className="w-2 h-6 bg-orange-400 opacity-80"
                                style={{
                                  height: `${Math.random() * 24 + 8}px`,
                                  animation: `pulse ${Math.random() * 2 + 1}s infinite`
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="files">
                  <FileManager playerData={playerData} setPlayerData={updatePlayerData} />
                </TabsContent>
                
                <TabsContent value="forum">
                  <Forum />
                </TabsContent>
                
                <TabsContent value="network">
                  <Card className="bg-black/60 border-cyan-500/30">
                    <CardHeader>
                      <CardTitle className="text-cyan-400 font-mono">P2P NETWORK STATUS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Wifi className="h-16 w-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
                        <p className="text-white font-mono">NETWORK MODULE</p>
                        <p className="text-gray-400 text-sm mt-2">Coming in Phase 3</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="quests">
                  <QuestSystem playerData={playerData} setPlayerData={updatePlayerData} />
                </TabsContent>
                
                <TabsContent value="leaderboard">
                  <Leaderboard />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
