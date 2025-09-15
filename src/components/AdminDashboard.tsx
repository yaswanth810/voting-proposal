import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Shield, Plus, Settings, BarChart3 } from 'lucide-react';
import { useContract } from '@/contexts/ContractProvider';
import { useWallet } from '@/contexts/WalletProvider';
import { isValidEthereumAddress } from '@/lib/utils';
import { Modal } from './ui/Modal';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ProposalForm } from './ProposalForm';

export function AdminDashboard() {
  const { 
    registerVoter, 
    registerVoters, 
    unregisterVoter, 
    isRegisteredVoter, 
    isAdmin, 
    addAdmin, 
    removeAdmin,
    getAllProposals,
    getActiveProposals,
    endProposal,
    isLoading 
  } = useContract();
  const { address, isConnected } = useWallet();

  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [showVoterModal, setShowVoterModal] = useState(false);
  const [showBulkModal, setBulkModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [voterAddress, setVoterAddress] = useState('');
  const [bulkAddresses, setBulkAddresses] = useState('');
  const [adminAddress, setAdminAddress] = useState('');
  const [stats, setStats] = useState({
    totalProposals: 0,
    activeProposals: 0,
    registeredVoters: 0
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (address && isConnected) {
        const adminStatus = await isAdmin(address);
        setIsUserAdmin(adminStatus);
      }
    };

    const loadStats = async () => {
      try {
        const [allProposals, activeProposals] = await Promise.all([
          getAllProposals(),
          getActiveProposals()
        ]);

        setStats({
          totalProposals: allProposals.length,
          activeProposals: activeProposals.length,
          registeredVoters: 0 // This would need to be tracked separately in a real implementation
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    checkAdminStatus();
    loadStats();
  }, [address, isConnected, isAdmin, getAllProposals, getActiveProposals]);

  const handleRegisterVoter = async () => {
    if (!isValidEthereumAddress(voterAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    const success = await registerVoter(voterAddress);
    if (success) {
      setVoterAddress('');
      setShowVoterModal(false);
    }
  };

  const handleBulkRegister = async () => {
    const addresses = bulkAddresses
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr && isValidEthereumAddress(addr));

    if (addresses.length === 0) {
      alert('Please enter valid Ethereum addresses');
      return;
    }

    const success = await registerVoters(addresses);
    if (success) {
      setBulkAddresses('');
      setBulkModal(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!isValidEthereumAddress(adminAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    const success = await addAdmin(adminAddress);
    if (success) {
      setAdminAddress('');
      setShowAdminModal(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card text-center py-12">
          <Shield className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Admin Dashboard</h2>
          <p className="text-white/60 mb-6">Please connect your wallet to access admin functions</p>
        </div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card text-center py-12">
          <Shield className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-white/60">You don't have admin privileges to access this dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
          <p className="text-white/60 mt-2">Manage voters, proposals, and system settings</p>
        </div>
        <button
          onClick={() => setShowProposalForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Proposal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <BarChart3 className="w-8 h-8 text-primary-400" />
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
              <Settings className="w-8 h-8 text-success-400" />
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
              <div className="text-2xl font-bold text-secondary-400">{stats.registeredVoters}</div>
              <div className="text-white/60">Registered Voters</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Voter Management */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <UserPlus className="w-6 h-6 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Voter Management</h3>
          </div>
          <p className="text-white/60 mb-4">Register new voters or manage existing ones</p>
          <div className="space-y-2">
            <button
              onClick={() => setShowVoterModal(true)}
              className="btn-primary w-full"
            >
              Register Single Voter
            </button>
            <button
              onClick={() => setBulkModal(true)}
              className="btn-outline w-full"
            >
              Bulk Register Voters
            </button>
          </div>
        </div>

        {/* Admin Management */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-secondary-400" />
            <h3 className="text-lg font-semibold text-white">Admin Management</h3>
          </div>
          <p className="text-white/60 mb-4">Add or remove admin privileges</p>
          <div className="space-y-2">
            <button
              onClick={() => setShowAdminModal(true)}
              className="btn-secondary w-full"
            >
              Add New Admin
            </button>
          </div>
        </div>

        {/* Proposal Management */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Plus className="w-6 h-6 text-success-400" />
            <h3 className="text-lg font-semibold text-white">Proposal Management</h3>
          </div>
          <p className="text-white/60 mb-4">Create and manage voting proposals</p>
          <div className="space-y-2">
            <button
              onClick={() => setShowProposalForm(true)}
              className="btn-primary w-full"
            >
              Create Proposal
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showVoterModal}
        onClose={() => setShowVoterModal(false)}
        title="Register Voter"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Voter Address
            </label>
            <input
              type="text"
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
              placeholder="0x..."
              className="input-field w-full"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowVoterModal(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleRegisterVoter}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Register'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showBulkModal}
        onClose={() => setBulkModal(false)}
        title="Bulk Register Voters"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Voter Addresses (one per line)
            </label>
            <textarea
              value={bulkAddresses}
              onChange={(e) => setBulkAddresses(e.target.value)}
              placeholder="0x1234...&#10;0x5678...&#10;0x9abc..."
              rows={8}
              className="input-field w-full resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setBulkModal(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkRegister}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Register All'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title="Add Admin"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Admin Address
            </label>
            <input
              type="text"
              value={adminAddress}
              onChange={(e) => setAdminAddress(e.target.value)}
              placeholder="0x..."
              className="input-field w-full"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowAdminModal(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleAddAdmin}
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Add Admin'}
            </button>
          </div>
        </div>
      </Modal>

      <ProposalForm
        isOpen={showProposalForm}
        onClose={() => setShowProposalForm(false)}
        onSuccess={() => {
          // Refresh stats
          setStats(prev => ({
            ...prev,
            totalProposals: prev.totalProposals + 1,
            activeProposals: prev.activeProposals + 1
          }));
        }}
      />
    </div>
  );
}
