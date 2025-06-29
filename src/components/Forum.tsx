
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, ThumbsUp, ThumbsDown, Plus, Clock, User } from 'lucide-react';
import { useForumActions } from '@/hooks/useWeb3Data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Proposal {
  id: number;
  title: string;
  description: string;
  category: string;
  creator: string;
  votesFor: number;
  votesAgainst: number;
  isActive: boolean;
  timestamp: number;
  userVote?: 'for' | 'against' | null;
}

// Mock data for development - will be replaced by blockchain data
const mockProposals: Proposal[] = [
  {
    id: 1,
    title: "UAP Data Classification Standard",
    description: "Propose a standardized classification system for Unidentified Aerial Phenomena data to ensure consistent categorization across the network.",
    category: "UAP Research",
    creator: "0x1234...5678",
    votesFor: 147,
    votesAgainst: 23,
    isActive: true,
    timestamp: Date.now() - 86400000,
  },
  {
    id: 2,
    title: "Decentralized Archive Mirror Protocol",
    description: "Implement automatic mirroring of critical archives across multiple nodes to prevent data loss from censorship or technical failures.",
    category: "Technical",
    creator: "0x9876...4321",
    votesFor: 89,
    votesAgainst: 12,
    isActive: true,
    timestamp: Date.now() - 172800000,
  },
  {
    id: 3,
    title: "Knowledge Guardian Verification System",
    description: "Create a reputation-based system for verifying the authenticity and quality of submitted data pieces.",
    category: "Governance",
    creator: "0xabcd...efgh",
    votesFor: 156,
    votesAgainst: 34,
    isActive: true,
    timestamp: Date.now() - 259200000,
  },
];

const categories = [
  "UAP Research",
  "Technical",
  "Governance",
  "Data Standards",
  "Security",
  "Community"
];

export const Forum = () => {
  const [proposals] = useState<Proposal[]>(mockProposals);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { createProposal, vote } = useForumActions();

  const filteredProposals = selectedCategory === "all" 
    ? proposals 
    : proposals.filter(p => p.category === selectedCategory);

  const handleCreateProposal = async () => {
    if (newProposal.title && newProposal.description && newProposal.category) {
      await createProposal(newProposal.title, newProposal.description, newProposal.category);
      setNewProposal({ title: '', description: '', category: '' });
      setShowCreateDialog(false);
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    await vote(proposalId, support);
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-mono">GOVERNANCE FORUM</h2>
          <p className="text-cyan-400 text-sm font-mono">Decentralized decision making for the network</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono">
              <Plus className="h-4 w-4 mr-2" />
              NEW PROPOSAL
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/90 border-cyan-500/50 text-white">
            <DialogHeader>
              <DialogTitle className="text-cyan-400 font-mono">CREATE PROPOSAL</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-mono">TITLE</label>
                <Input
                  value={newProposal.title}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Proposal title..."
                  className="bg-black/60 border-cyan-500/30 text-white font-mono"
                />
              </div>
              
              <div>
                <label className="text-gray-400 text-xs font-mono">CATEGORY</label>
                <Select
                  value={newProposal.category}
                  onValueChange={(value) => setNewProposal(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-black/60 border-cyan-500/30 text-white">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-cyan-500/50">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-white hover:bg-cyan-500/20">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-gray-400 text-xs font-mono">DESCRIPTION</label>
                <Textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed proposal description..."
                  className="bg-black/60 border-cyan-500/30 text-white font-mono min-h-[100px]"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateProposal}
                  disabled={!newProposal.title || !newProposal.description || !newProposal.category}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono"
                >
                  SUBMIT PROPOSAL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  className="border-gray-500 text-gray-400 font-mono"
                >
                  CANCEL
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-4">
        <span className="text-gray-400 font-mono text-sm">FILTER:</span>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 bg-black/60 border-cyan-500/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-black border-cyan-500/50">
            <SelectItem value="all" className="text-white hover:bg-cyan-500/20">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat} className="text-white hover:bg-cyan-500/20">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map(proposal => (
          <Card key={proposal.id} className="bg-black/60 border-cyan-500/30 hover:border-cyan-400/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-white font-mono text-lg">{proposal.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-cyan-600/20 text-cyan-400 border-cyan-400/50">
                      {proposal.category}
                    </Badge>
                    <div className="flex items-center text-gray-400 text-xs font-mono">
                      <User className="h-3 w-3 mr-1" />
                      {proposal.creator.slice(0, 6)}...{proposal.creator.slice(-4)}
                    </div>
                    <div className="flex items-center text-gray-400 text-xs font-mono">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(proposal.timestamp)}
                    </div>
                  </div>
                </div>
                
                <Badge 
                  variant={proposal.isActive ? "default" : "secondary"}
                  className={proposal.isActive ? "bg-green-600/20 text-green-400 border-green-400/50" : ""}
                >
                  {proposal.isActive ? "ACTIVE" : "CLOSED"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-300 text-sm mb-4 font-mono leading-relaxed">
                {proposal.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <ThumbsUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-mono text-sm">{proposal.votesFor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ThumbsDown className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 font-mono text-sm">{proposal.votesAgainst}</span>
                  </div>
                  <div className="text-gray-400 font-mono text-xs">
                    {Math.round((proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100)}% approval
                  </div>
                </div>
                
                {proposal.isActive && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleVote(proposal.id, true)}
                      className="bg-green-600/20 border border-green-400/50 text-green-400 hover:bg-green-600/40 font-mono text-xs"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      FOR
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleVote(proposal.id, false)}
                      className="bg-red-600/20 border border-red-400/50 text-red-400 hover:bg-red-600/40 font-mono text-xs"
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      AGAINST
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
