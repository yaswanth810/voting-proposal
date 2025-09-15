import React, { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle, XCircle, Calendar, Tag } from 'lucide-react';
import { Proposal, ProposalResults } from '@/types';
import { useContract } from '@/contexts/ContractProvider';
import { useWallet } from '@/contexts/WalletProvider';
import { formatTimeRemaining, formatDate, getProposalStatusColor, calculatePercentage } from '@/lib/utils';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { VotingPanel } from './VotingPanel';

interface ProposalCardProps {
  proposal: Proposal;
  onVoteSuccess?: () => void;
}

export function ProposalCard({ proposal, onVoteSuccess }: ProposalCardProps) {
  const { getProposalResults, hasVoted, isRegisteredVoter } = useContract();
  const { address, isConnected } = useWallet();
  const [results, setResults] = useState<ProposalResults | null>(null);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [isVoterRegistered, setIsVoterRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVotingPanel, setShowVotingPanel] = useState(false);

  const now = Math.floor(Date.now() / 1000);
  const isActive = proposal.active && now >= proposal.startTime && now <= proposal.endTime;
  const isPending = proposal.active && now < proposal.startTime;
  const isEnded = !proposal.active || now > proposal.endTime;

  const getStatus = () => {
    if (isPending) return 'pending';
    if (isEnded) return 'ended';
    if (isActive) return 'active';
    return 'ended';
  };

  const status = getStatus();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch proposal results
        const proposalResults = await getProposalResults(proposal.id);
        setResults(proposalResults);

        // Check if user has voted and is registered
        if (address && isConnected) {
          const [voted, registered] = await Promise.all([
            hasVoted(proposal.id, address),
            isRegisteredVoter(address)
          ]);
          setUserHasVoted(voted);
          setIsVoterRegistered(registered);
        }
      } catch (error) {
        console.error('Error fetching proposal data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [proposal.id, address, isConnected, getProposalResults, hasVoted, isRegisteredVoter]);

  const handleVoteSuccess = () => {
    setUserHasVoted(true);
    setShowVotingPanel(false);
    onVoteSuccess?.();
  };

  const canVote = isConnected && isVoterRegistered && isActive && !userHasVoted;

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner text="Loading proposal..." />
      </div>
    );
  }

  return (
    <div className="card hover:shadow-2xl transition-all duration-300">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{proposal.title}</h3>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(proposal.startTime)}</span>
              </div>
              {proposal.category && (
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span>{proposal.category}</span>
                </div>
              )}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getProposalStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>

        {/* Description */}
        <p className="text-white/80 leading-relaxed">{proposal.description}</p>

        {/* Voting Progress */}
        {results && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/60">Total Votes: {results.totalVotes}</span>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-white/60" />
                <span className="text-white/60">Participation</span>
              </div>
            </div>
            
            {results.totalVotes > 0 ? (
              <div className="space-y-2">
                {/* Yes votes */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success-400" />
                    <span className="text-sm text-white/80">Yes</span>
                  </div>
                  <span className="text-sm font-medium text-success-400">
                    {results.yesVotes} ({results.yesPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-success-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${results.yesPercentage}%` }}
                  />
                </div>

                {/* No votes */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-danger-400" />
                    <span className="text-sm text-white/80">No</span>
                  </div>
                  <span className="text-sm font-medium text-danger-400">
                    {results.noVotes} ({results.noPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-danger-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${results.noPercentage}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-white/60">
                No votes cast yet
              </div>
            )}
          </div>
        )}

        {/* Time Remaining */}
        {isActive && (
          <div className="flex items-center gap-2 text-sm text-primary-400">
            <Clock className="w-4 h-4" />
            <span>{formatTimeRemaining(proposal.endTime)}</span>
          </div>
        )}

        {/* Voting Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <div className="text-sm text-white/60">
            {userHasVoted && (
              <span className="flex items-center gap-1 text-success-400">
                <CheckCircle className="w-4 h-4" />
                You voted
              </span>
            )}
            {!isConnected && <span>Connect wallet to vote</span>}
            {isConnected && !isVoterRegistered && <span>Not registered to vote</span>}
            {isConnected && isVoterRegistered && !isActive && !userHasVoted && (
              <span>Voting {isPending ? 'not started' : 'ended'}</span>
            )}
          </div>

          {canVote && (
            <button
              onClick={() => setShowVotingPanel(true)}
              className="btn-primary"
            >
              Vote Now
            </button>
          )}
        </div>
      </div>

      {/* Voting Panel Modal */}
      {showVotingPanel && (
        <VotingPanel
          proposal={proposal}
          isOpen={showVotingPanel}
          onClose={() => setShowVotingPanel(false)}
          onVoteSuccess={handleVoteSuccess}
        />
      )}
    </div>
  );
}

export function ProposalCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-white/10 rounded w-3/4"></div>
          <div className="h-6 bg-white/10 rounded w-16"></div>
        </div>
        <div className="h-4 bg-white/10 rounded w-full"></div>
        <div className="h-4 bg-white/10 rounded w-2/3"></div>
        <div className="flex justify-between items-center">
          <div className="h-8 bg-white/10 rounded w-24"></div>
          <div className="h-8 bg-white/10 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}
