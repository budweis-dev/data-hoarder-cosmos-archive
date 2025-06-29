
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { DATA_HOARDER_ABI, FORUM_VOTING_ABI, CONTRACTS } from '@/config/web3';
import { useToast } from '@/hooks/use-toast';

export interface PlayerData {
  username: string;
  totalXP: number;
  level: number;
  storageUsed: number;
  downloadSpeed: number;
}

export interface ForumProposal {
  title: string;
  description: string;
  category: string;
  creator: string;
  votesFor: number;
  votesAgainst: number;
  isActive: boolean;
  timestamp: number;
}

export const usePlayerData = () => {
  const { address } = useAccount();

  const { data: playerData, isLoading, error } = useReadContract({
    address: CONTRACTS.DATA_HOARDER_ARENA,
    abi: DATA_HOARDER_ABI,
    functionName: 'getPlayer',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    playerData: playerData as PlayerData | undefined,
    isLoading,
    error,
  };
};

export const useLeaderboard = () => {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACTS.DATA_HOARDER_ARENA,
    abi: DATA_HOARDER_ABI,
    functionName: 'getLeaderboard',
    args: [10n], // Top 10 players
  });

  return {
    leaderboard: data ? {
      players: data[0] as string[],
      scores: data[1] as bigint[],
    } : undefined,
    isLoading,
    error,
  };
};

export const usePlayerActions = () => {
  const { writeContract } = useWriteContract();
  const { toast } = useToast();

  const registerPlayer = async (username: string) => {
    try {
      await writeContract({
        address: CONTRACTS.DATA_HOARDER_ARENA,
        abi: DATA_HOARDER_ABI,
        functionName: 'registerPlayer',
        args: [username],
      });
      toast({
        title: "Registration Successful",
        description: `Welcome to the network, ${username}!`,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: "Unable to register player. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addXP = async (amount: number, category: string) => {
    try {
      await writeContract({
        address: CONTRACTS.DATA_HOARDER_ARENA,
        abi: DATA_HOARDER_ABI,
        functionName: 'addXP',
        args: [BigInt(amount), category],
      });
      toast({
        title: "XP Gained!",
        description: `+${amount} XP in ${category}`,
      });
    } catch (error) {
      console.error('XP addition failed:', error);
    }
  };

  return { registerPlayer, addXP };
};

export const useForumActions = () => {
  const { writeContract } = useWriteContract();
  const { toast } = useToast();

  const createProposal = async (title: string, description: string, category: string) => {
    try {
      await writeContract({
        address: CONTRACTS.FORUM_VOTING,
        abi: FORUM_VOTING_ABI,
        functionName: 'createProposal',
        args: [title, description, category],
      });
      toast({
        title: "Proposal Created",
        description: "Your proposal has been submitted to the network.",
      });
    } catch (error) {
      console.error('Proposal creation failed:', error);
      toast({
        title: "Proposal Failed",
        description: "Unable to create proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const vote = async (proposalId: number, support: boolean) => {
    try {
      await writeContract({
        address: CONTRACTS.FORUM_VOTING,
        abi: FORUM_VOTING_ABI,
        functionName: 'vote',
        args: [BigInt(proposalId), support],
      });
      toast({
        title: "Vote Recorded",
        description: `You voted ${support ? 'FOR' : 'AGAINST'} the proposal.`,
      });
    } catch (error) {
      console.error('Voting failed:', error);
      toast({
        title: "Vote Failed",
        description: "Unable to record vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { createProposal, vote };
};
