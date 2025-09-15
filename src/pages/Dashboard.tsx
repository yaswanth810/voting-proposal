import React, { useState, useEffect } from 'react';
import { Vote, TrendingUp, Users, Clock, Plus } from 'lucide-react';
import { useContract } from '@/contexts/ContractProvider';
import { useWallet } from '@/contexts/WalletProvider';
import { Proposal } from '@/types';
import { ProposalCard, ProposalCardSkeleton } from '@/components/ProposalCard';
import { ProposalForm } from '@/components/ProposalForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function Dashboard() {
  const { getActiveProposals, getAllProposals, getProposal, isAdmin } = useContract();
  const { address, isConnected } = useWallet();
  const [activeProposals, setActiveProposals] = useState<Proposal[]>([]);
  const [recentProposals, setRecentProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [stats, setStats] = useState({
    totalProposals: 0,
    activeProposals: 0,
    userVotes: 0
  });

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const [activeIds, allIds] = await Promise.all([
        getActiveProposals(),
        getAllProposals()
      ]);

      // Fetch active proposals
      const activeProposalPromises = activeIds.map(id => getProposal(id));
      const activeProposalData = await Promise.all(activeProposalPromises);
      const validActiveProposals = activeProposalData.filter(p => p !== null) as Proposal[];

      // Fetch recent proposals (last 5)
      const recentIds = allIds.slice(-5).reverse();
      const recentProposalPromises = recentIds.map(id => getProposal(id));
      const recentProposalData = await Promise.all(recentProposalPromises);
      const validRecentProposals = recentProposalData.filter(p => p !== null) as Proposal[];

      setActiveProposals(validActiveProposals);
      setRecentProposals(validRecentProposals);
      setStats({
        totalProposals: allIds.length,
        activeProposals: activeIds.length,
        userVotes: 0 // This would need to be calculated based on user's voting history
      });
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (address && isConnected) {
        const adminStatus = await isAdmin(address);
        setIsUserAdmin(adminStatus);
      }
    };

    checkAdminStatus();
  }, [address, isConnected, isAdmin]);

  const handleProposalSuccess = () => {
    fetchProposals();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="p-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl animate-float">
            <Vote className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-4">
          Decentralized Voting
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Participate in transparent, secure, and democratic decision-making powered by blockchain technology
        </p>
        {isUserAdmin && (
          <button
            onClick={() => setShowProposalForm(true)}
            className="btn-primary mt-6 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create New Proposal
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <Vote className="w-8 h-8 text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalProposals}</div>
              <div className="text-white/60">Total Proposals</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-500/20 rounded-lg">
              <TrendingUp className="w-8 h-8 text-success-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-success-400">{stats.activeProposals}</div>
              <div className="text-white/60">Active Proposals</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary-500/20 rounded-lg">
              <Users className="w-8 h-8 text-secondary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary-400">{stats.userVotes}</div>
              <div className="text-white/60">Your Votes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Proposals */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary-400" />
            Active Proposals
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProposalCardSkeleton key={i} />
            ))}
          </div>
        ) : activeProposals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onVoteSuccess={handleProposalSuccess}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Clock className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Proposals</h3>
            <p className="text-white/60">There are currently no active proposals to vote on.</p>
            {isUserAdmin && (
              <button
                onClick={() => setShowProposalForm(true)}
                className="btn-primary mt-4"
              >
                Create First Proposal
              </button>
            )}
          </div>
        )}
      </section>

      {/* Recent Proposals */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-secondary-400" />
            Recent Proposals
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProposalCardSkeleton key={i} />
            ))}
          </div>
        ) : recentProposals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentProposals.slice(0, 4).map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onVoteSuccess={handleProposalSuccess}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Vote className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Proposals Yet</h3>
            <p className="text-white/60">Be the first to create a proposal!</p>
          </div>
        )}
      </section>

      {/* Call to Action */}
      {!isConnected && (
        <div className="card text-center py-12 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-primary-500/30">
          <h3 className="text-2xl font-semibold text-white mb-4">Ready to Participate?</h3>
          <p className="text-white/80 mb-6">
            Connect your wallet to start voting on proposals and participating in decentralized governance.
          </p>
        </div>
      )}

      {/* Proposal Form Modal */}
      <ProposalForm
        isOpen={showProposalForm}
        onClose={() => setShowProposalForm(false)}
        onSuccess={handleProposalSuccess}
      />
    </div>
  );
}
