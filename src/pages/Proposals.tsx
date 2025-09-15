import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Vote } from 'lucide-react';
import { useContract } from '@/contexts/ContractProvider';
import { useWallet } from '@/contexts/WalletProvider';
import { Proposal } from '@/types';
import { ProposalCard, ProposalCardSkeleton } from '@/components/ProposalCard';
import { ProposalForm } from '@/components/ProposalForm';
import { debounce } from '@/lib/utils';

export function Proposals() {
  const { getAllProposals, getProposal, isAdmin } = useContract();
  const { address, isConnected } = useWallet();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const proposalIds = await getAllProposals();
      
      const proposalPromises = proposalIds.map(id => getProposal(id));
      const proposalData = await Promise.all(proposalPromises);
      const validProposals = proposalData.filter(p => p !== null) as Proposal[];
      
      // Sort by creation time (newest first)
      validProposals.sort((a, b) => b.startTime - a.startTime);
      
      setProposals(validProposals);
      setFilteredProposals(validProposals);
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

  // Filter proposals based on search and filters
  useEffect(() => {
    let filtered = proposals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(proposal =>
        proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const now = Math.floor(Date.now() / 1000);
      filtered = filtered.filter(proposal => {
        const isActive = proposal.active && now >= proposal.startTime && now <= proposal.endTime;
        const isPending = proposal.active && now < proposal.startTime;
        const isEnded = !proposal.active || now > proposal.endTime;

        switch (statusFilter) {
          case 'active':
            return isActive;
          case 'pending':
            return isPending;
          case 'ended':
            return isEnded;
          default:
            return true;
        }
      });
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.category === categoryFilter);
    }

    setFilteredProposals(filtered);
  }, [proposals, searchTerm, statusFilter, categoryFilter]);

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleProposalSuccess = () => {
    fetchProposals();
  };

  const categories = Array.from(new Set(proposals.map(p => p.category)));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">All Proposals</h1>
          <p className="text-white/60 mt-2">Browse and vote on community proposals</p>
        </div>
        {isUserAdmin && (
          <button
            onClick={() => setShowProposalForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Proposal
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Search proposals..."
              onChange={handleSearchChange}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="all" className="bg-slate-800">All Status</option>
              <option value="active" className="bg-slate-800">Active</option>
              <option value="pending" className="bg-slate-800">Pending</option>
              <option value="ended" className="bg-slate-800">Ended</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field w-full"
            >
              <option value="all" className="bg-slate-800">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category} className="bg-slate-800">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-white/60 text-sm">
            Showing {filteredProposals.length} of {proposals.length} proposals
          </p>
        </div>
      </div>

      {/* Proposals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <ProposalCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProposals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProposals.map((proposal) => (
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
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
              ? 'No Matching Proposals' 
              : 'No Proposals Yet'
            }
          </h3>
          <p className="text-white/60 mb-6">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'Be the first to create a proposal!'
            }
          </p>
          {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
          )}
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
