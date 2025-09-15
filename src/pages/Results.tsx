import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, Clock } from 'lucide-react';
import { useContract } from '@/contexts/ContractProvider';
import { Proposal, ProposalResults } from '@/types';
import { ResultsChart } from '@/components/ResultsChart';
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';

interface ProposalWithResults extends Proposal {
  results: ProposalResults;
}

export function Results() {
  const { getAllProposals, getProposal, getProposalResults } = useContract();
  const [proposals, setProposals] = useState<ProposalWithResults[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ProposalWithResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  const fetchProposalsWithResults = async () => {
    try {
      setLoading(true);
      const proposalIds = await getAllProposals();
      
      const proposalPromises = proposalIds.map(async (id) => {
        const [proposal, results] = await Promise.all([
          getProposal(id),
          getProposalResults(id)
        ]);
        
        if (proposal && results) {
          return { ...proposal, results };
        }
        return null;
      });

      const proposalData = await Promise.all(proposalPromises);
      const validProposals = proposalData.filter(p => p !== null) as ProposalWithResults[];
      
      // Sort by total votes (most voted first)
      validProposals.sort((a, b) => b.results.totalVotes - a.results.totalVotes);
      
      setProposals(validProposals);
      
      // Auto-select first proposal if available
      if (validProposals.length > 0) {
        setSelectedProposal(validProposals[0]);
      }
    } catch (error) {
      console.error('Error fetching proposals with results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposalsWithResults();
  }, []);

  const handleProposalSelect = async (proposal: ProposalWithResults) => {
    setLoadingResults(true);
    setSelectedProposal(proposal);
    setLoadingResults(false);
  };

  const getStatusBadge = (proposal: Proposal) => {
    const now = Math.floor(Date.now() / 1000);
    const isActive = proposal.active && now >= proposal.startTime && now <= proposal.endTime;
    const isPending = proposal.active && now < proposal.startTime;
    const isEnded = !proposal.active || now > proposal.endTime;

    if (isPending) return <span className="status-pending px-2 py-1 rounded-full text-xs">Pending</span>;
    if (isActive) return <span className="status-active px-2 py-1 rounded-full text-xs">Active</span>;
    if (isEnded) return <span className="status-ended px-2 py-1 rounded-full text-xs">Ended</span>;
    return <span className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full text-xs">Unknown</span>;
  };

  const getWinningOption = (results: ProposalResults) => {
    if (results.totalVotes === 0) return 'No votes';
    if (results.yesVotes > results.noVotes) return 'Yes';
    if (results.noVotes > results.yesVotes) return 'No';
    return 'Tie';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Voting Results</h1>
        <p className="text-white/60 mt-2">View detailed results and analytics for all proposals</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="lg:col-span-2">
            <LoadingSkeleton className="h-96" />
          </div>
        </div>
      ) : proposals.length === 0 ? (
        <div className="card text-center py-12">
          <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Results Available</h3>
          <p className="text-white/60">No proposals have been created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Proposal List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-400" />
              Proposals ({proposals.length})
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {proposals.map((proposal) => (
                <button
                  key={proposal.id}
                  onClick={() => handleProposalSelect(proposal)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selectedProposal?.id === proposal.id
                      ? 'bg-primary-500/20 border-primary-500/50'
                      : 'glass border-white/20 hover:border-white/30'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-white text-sm line-clamp-2">
                        {proposal.title}
                      </h3>
                      {getStatusBadge(proposal)}
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-white/60">
                      <span>{proposal.category}</span>
                      <span>{proposal.results.totalVotes} votes</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">{formatDate(proposal.startTime)}</span>
                      <span className={`font-medium ${
                        getWinningOption(proposal.results) === 'Yes' ? 'text-success-400' :
                        getWinningOption(proposal.results) === 'No' ? 'text-danger-400' :
                        'text-white/60'
                      }`}>
                        {getWinningOption(proposal.results)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2">
            {loadingResults ? (
              <div className="card">
                <LoadingSpinner text="Loading results..." />
              </div>
            ) : selectedProposal ? (
              <div className="space-y-6">
                {/* Selected Proposal Header */}
                <div className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {selectedProposal.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(selectedProposal.startTime)}
                        </span>
                        <span>Category: {selectedProposal.category}</span>
                      </div>
                    </div>
                    {getStatusBadge(selectedProposal)}
                  </div>
                  
                  <p className="text-white/80 leading-relaxed">
                    {selectedProposal.description}
                  </p>
                </div>

                {/* Results Chart */}
                <ResultsChart 
                  results={selectedProposal.results} 
                  proposalTitle={selectedProposal.title}
                />

                {/* Additional Stats */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-400" />
                    Voting Summary
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {selectedProposal.results.totalVotes}
                      </div>
                      <div className="text-white/60 text-sm">Total Votes</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success-400">
                        {selectedProposal.results.yesPercentage}%
                      </div>
                      <div className="text-white/60 text-sm">Support</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-danger-400">
                        {selectedProposal.results.noPercentage}%
                      </div>
                      <div className="text-white/60 text-sm">Opposition</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        getWinningOption(selectedProposal.results) === 'Yes' ? 'text-success-400' :
                        getWinningOption(selectedProposal.results) === 'No' ? 'text-danger-400' :
                        'text-white/60'
                      }`}>
                        {getWinningOption(selectedProposal.results)}
                      </div>
                      <div className="text-white/60 text-sm">Result</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a Proposal</h3>
                <p className="text-white/60">Choose a proposal from the list to view its results</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
