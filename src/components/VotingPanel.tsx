import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Proposal } from '@/types';
import { useContract } from '@/contexts/ContractProvider';
import { Modal, ConfirmModal } from './ui/Modal';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface VotingPanelProps {
  proposal: Proposal;
  isOpen: boolean;
  onClose: () => void;
  onVoteSuccess: () => void;
}

export function VotingPanel({ proposal, isOpen, onClose, onVoteSuccess }: VotingPanelProps) {
  const { vote, isLoading } = useContract();
  const [selectedVote, setSelectedVote] = useState<boolean | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleVoteSelection = (voteChoice: boolean) => {
    setSelectedVote(voteChoice);
    setShowConfirmModal(true);
  };

  const handleConfirmVote = async () => {
    if (selectedVote === null) return;

    const success = await vote(proposal.id, selectedVote);
    if (success) {
      onVoteSuccess();
      setShowConfirmModal(false);
    }
  };

  const handleCloseConfirm = () => {
    setShowConfirmModal(false);
    setSelectedVote(null);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Cast Your Vote"
        size="md"
      >
        <div className="space-y-6">
          {/* Proposal Info */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">{proposal.title}</h3>
            <p className="text-white/80 text-sm">{proposal.description}</p>
          </div>

          {/* Voting Options */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Choose your vote:</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Yes Vote */}
              <button
                onClick={() => handleVoteSelection(true)}
                disabled={isLoading}
                className="group relative p-6 rounded-xl border-2 border-success-500/30 bg-success-500/10 hover:bg-success-500/20 hover:border-success-500/50 transition-all duration-200 disabled:opacity-50"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-success-500/20 rounded-full group-hover:bg-success-500/30 transition-colors">
                    <CheckCircle className="w-8 h-8 text-success-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-success-300">YES</div>
                    <div className="text-sm text-white/60">Support this proposal</div>
                  </div>
                </div>
              </button>

              {/* No Vote */}
              <button
                onClick={() => handleVoteSelection(false)}
                disabled={isLoading}
                className="group relative p-6 rounded-xl border-2 border-danger-500/30 bg-danger-500/10 hover:bg-danger-500/20 hover:border-danger-500/50 transition-all duration-200 disabled:opacity-50"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-danger-500/20 rounded-full group-hover:bg-danger-500/30 transition-colors">
                    <XCircle className="w-8 h-8 text-danger-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-danger-300">NO</div>
                    <div className="text-sm text-white/60">Oppose this proposal</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <div className="font-medium mb-1">Important:</div>
              <div>Your vote is permanent and cannot be changed once submitted. Please review your choice carefully.</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn-outline disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmVote}
        title="Confirm Your Vote"
        message={`Are you sure you want to vote "${selectedVote ? 'YES' : 'NO'}" on "${proposal.title}"? This action cannot be undone.`}
        confirmText="Confirm Vote"
        type="info"
        isLoading={isLoading}
      />
    </>
  );
}
