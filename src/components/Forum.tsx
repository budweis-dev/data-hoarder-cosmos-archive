
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThumbsUp, ThumbsDown, Plus, Clock, User, RefreshCw } from 'lucide-react';
import { useForumActions } from '@/hooks/useWeb3';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ForumProposal } from '@/types/web3';

const categories = [
  "UAP Research",
  "Technical",
  "Governance",
  "Data Standards",
  "Security",
  "Community"
];

export const Forum = () => {
  const [proposals, setProposals] = useState<ForumProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { createProposal, vote, getProposals } = useForumActions();

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await getProposals();
      setProposals(data);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const filteredProposals = selectedCategory === "all" 
    ? proposals 
    : proposals.filter(p => p.category === selectedCategory);

  const handleCreateProposal = async () => {
    if (newProposal.title && newProposal.description && newProposal.category) {
      try {
        await createProposal(newProposal.title, newProposal.description, newProposal.category);
        setNewProposal({ title: '', description: '', category: '' });
        setShowCreateDialog(false);
        await loadProposals(); // Refresh proposals
      } catch (error) {
        console.error('Failed to create proposal:', error);
      }
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    try {
      await vote(proposalId, support);
      await loadProposals(); // Refresh proposals
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp * 1000; // Convert to milliseconds
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
        
        <div className="flex space-x-2">
          <Button
            onClick={loadProposals}
            disabled={loading}
            variant="outline"
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 font-mono"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            REFRESH
          </Button>
          
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
        {loading ? (
          <Card className="bg-black/60 border-cyan-500/30">
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-cyan-400 mx-auto mb-4 animate-spin" />
              <p className="text-cyan-400 font-mono">Loading proposals from blockchain...</p>
            </CardContent>
          </Card>
        ) : filteredProposals.length === 0 ? (
          <Card className="bg-black/60 border-gray-500/30">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400 font-mono">No proposals found. Create the first one!</p>
            </CardContent>
          </Card>
        ) : (
          filteredProposals.map(proposal => (
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
                      {proposal.votesFor + proposal.votesAgainst > 0 
                        ? Math.round((proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100) + '% approval'
                        : 'No votes yet'
                      }
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
          ))
        )}
      </div>
    </div>
  );
};
