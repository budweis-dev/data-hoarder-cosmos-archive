
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Lock, CheckCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuestSystemProps {
  playerData: any;
  setPlayerData: (data: any) => void;
}

const quests = [
  {
    id: 'first-upload',
    title: 'First Data Preservation',
    description: 'Upload your first file to the network',
    requirements: { fileCount: 1 },
    xpReward: 100,
    unlockLevel: 1,
    category: 'Tutorial'
  },
  {
    id: 'data-curator',
    title: 'Data Curator',
    description: 'Preserve 10 files across different categories',
    requirements: { fileCount: 10, categoriesCount: 3 },
    xpReward: 500,
    unlockLevel: 2,
    category: 'Collection'
  },
  {
    id: 'knowledge-guardian',
    title: 'Knowledge Guardian',
    description: 'Reach 1000 XP and become a certified guardian',
    requirements: { totalXP: 1000 },
    xpReward: 200,
    unlockLevel: 3,
    category: 'Milestone'
  },
  {
    id: 'critical-preserver',
    title: 'Critical Information Preserver',
    description: 'Upload 5 critical survival documents',
    requirements: { categoryFiles: { critical: 5 } },
    xpReward: 750,
    unlockLevel: 4,
    category: 'Specialized'
  },
  {
    id: 'network-contributor',
    title: 'Network Contributor',
    description: 'Share 1GB of data with other guardians',
    requirements: { totalSize: 1024 * 1024 * 1024 },
    xpReward: 1000,
    unlockLevel: 5,
    category: 'Network'
  }
];

export const QuestSystem = ({ playerData, setPlayerData }: QuestSystemProps) => {
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const { toast } = useToast();

  const checkQuestProgress = (quest: any) => {
    if (quest.requirements.fileCount) {
      const filesCount = Math.floor(playerData.totalXP / 100);
      return Math.min(100, (filesCount / quest.requirements.fileCount) * 100);
    }
    
    if (quest.requirements.totalXP) {
      return Math.min(100, (playerData.totalXP / quest.requirements.totalXP) * 100);
    }
    
    if (quest.requirements.totalSize) {
      return Math.min(100, (playerData.storageUsed / quest.requirements.totalSize) * 100);
    }
    
    return 0;
  };

  const isQuestCompleted = (questId: string) => {
    return completedQuests.includes(questId);
  };

  const canCompleteQuest = (quest: any) => {
    const progress = checkQuestProgress(quest);
    return progress >= 100 && !isQuestCompleted(quest.id) && playerData.level >= quest.unlockLevel;
  };

  const completeQuest = (quest: any) => {
    if (canCompleteQuest(quest)) {
      setCompletedQuests(prev => [...prev, quest.id]);
      setPlayerData((prevData: any) => ({
        ...prevData,
        totalXP: prevData.totalXP + quest.xpReward
      }));
      
      toast({
        title: "Quest Completed!",
        description: `${quest.title} - +${quest.xpReward} XP`,
        duration: 5000,
      });
    }
  };

  const getQuestStatusColor = (quest: any) => {
    if (isQuestCompleted(quest.id)) return 'text-green-400 border-green-400';
    if (canCompleteQuest(quest)) return 'text-orange-400 border-orange-400';
    if (playerData.level < quest.unlockLevel) return 'text-gray-600 border-gray-600';
    return 'text-cyan-400 border-cyan-400';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Tutorial': 'bg-green-600',
      'Collection': 'bg-blue-600',
      'Milestone': 'bg-purple-600',
      'Specialized': 'bg-orange-600',
      'Network': 'bg-cyan-600'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-600';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            ACTIVE MISSIONS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {quests.map(quest => {
              const progress = checkQuestProgress(quest);
              const completed = isQuestCompleted(quest.id);
              const canComplete = canCompleteQuest(quest);
              const locked = playerData.level < quest.unlockLevel;
              
              return (
                <Card key={quest.id} className={`bg-gray-800/50 border ${getQuestStatusColor(quest)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-white font-mono font-bold">{quest.title}</h3>
                          <Badge className={getCategoryColor(quest.category)}>
                            {quest.category}
                          </Badge>
                          {locked && <Lock className="h-4 w-4 text-gray-600" />}
                          {completed && <CheckCircle className="h-4 w-4 text-green-400" />}
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{quest.description}</p>
                        
                        {!locked && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-white">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                        
                        {locked && (
                          <div className="text-gray-600 text-sm">
                            Unlocks at Level {quest.unlockLevel}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="flex items-center text-green-400 font-mono mb-2">
                          <Zap className="h-4 w-4 mr-1" />
                          +{quest.xpReward} XP
                        </div>
                        
                        {canComplete && (
                          <Button
                            size="sm"
                            onClick={() => completeQuest(quest)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-mono"
                          >
                            CLAIM
                          </Button>
                        )}
                        
                        {completed && (
                          <Badge className="bg-green-600 text-white">
                            COMPLETED
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
