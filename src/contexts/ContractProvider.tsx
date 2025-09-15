import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletProvider';
import { Proposal, ContractState, ProposalResults, VoterRegistration } from '@/types';
import toast from 'react-hot-toast';

// Contract ABI - simplified for key functions
const VOTING_CONTRACT_ABI = [
  "function registerVoter(address _voter) external",
  "function registerVoters(address[] calldata _voters) external",
  "function unregisterVoter(address _voter) external",
  "function createProposal(string calldata _title, string calldata _description, uint256 _durationInMinutes, string calldata _category) external returns (uint256)",
  "function vote(uint256 _proposalId, bool _voteChoice) external",
  "function endProposal(uint256 _proposalId) external",
  "function getProposal(uint256 _proposalId) external view returns (uint256, string, string, uint256, uint256, uint256, uint256, bool, address, string)",
  "function getVoteCount(uint256 _proposalId) external view returns (uint256, uint256)",
  "function hasVoted(uint256 _proposalId, address _voter) external view returns (bool)",
  "function getVote(uint256 _proposalId, address _voter) external view returns (bool, bool, uint256)",
  "function isRegisteredVoter(address _voter) external view returns (bool)",
  "function isAdmin(address _address) external view returns (bool)",
  "function getActiveProposals() external view returns (uint256[])",
  "function getAllProposals() external view returns (uint256[])",
  "function getProposalStatus(uint256 _proposalId) external view returns (string)",
  "function getProposalResults(uint256 _proposalId) external view returns (uint256, uint256, uint256, uint256, uint256)",
  "function addAdmin(address _admin) external",
  "function removeAdmin(address _admin) external",
  "function proposalCounter() external view returns (uint256)",
  "event VoterRegistered(address indexed voter)",
  "event VoterUnregistered(address indexed voter)",
  "event ProposalCreated(uint256 indexed proposalId, string title, address indexed creator)",
  "event VoteCast(uint256 indexed proposalId, address indexed voter, bool voteChoice)",
  "event ProposalEnded(uint256 indexed proposalId)"
];

// Deployed VotingSystem contract address on Sepolia testnet
const CONTRACT_ADDRESS = "0xF6bc8b2B574194a899302047b9c95967514a7611";

interface ContractContextType extends ContractState {
  // Proposal functions
  createProposal: (title: string, description: string, durationInMinutes: number, category: string) => Promise<number | null>;
  vote: (proposalId: number, voteChoice: boolean) => Promise<boolean>;
  endProposal: (proposalId: number) => Promise<boolean>;
  getProposal: (proposalId: number) => Promise<Proposal | null>;
  getActiveProposals: () => Promise<number[]>;
  getAllProposals: () => Promise<number[]>;
  getProposalResults: (proposalId: number) => Promise<ProposalResults | null>;
  
  // Voter functions
  registerVoter: (voterAddress: string) => Promise<boolean>;
  registerVoters: (voterAddresses: string[]) => Promise<boolean>;
  unregisterVoter: (voterAddress: string) => Promise<boolean>;
  isRegisteredVoter: (address: string) => Promise<boolean>;
  hasVoted: (proposalId: number, address: string) => Promise<boolean>;
  
  // Admin functions
  isAdmin: (address: string) => Promise<boolean>;
  addAdmin: (adminAddress: string) => Promise<boolean>;
  removeAdmin: (adminAddress: string) => Promise<boolean>;
  
  // Utility functions
  clearError: () => void;
  refreshData: () => Promise<void>;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

type ContractAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TX_HASH'; payload: string | null }
  | { type: 'CLEAR_STATE' };

const initialState: ContractState = {
  isLoading: false,
  error: null,
  txHash: null,
};

function contractReducer(state: ContractState, action: ContractAction): ContractState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_TX_HASH':
      return { ...state, txHash: action.payload };
    case 'CLEAR_STATE':
      return { ...initialState };
    default:
      return state;
  }
}

interface ContractProviderProps {
  children: ReactNode;
}

export function ContractProvider({ children }: ContractProviderProps) {
  const [state, dispatch] = useReducer(contractReducer, initialState);
  const { signer, provider, isConnected, chainId } = useWallet();

  const getContract = useCallback(() => {
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }
    
    if (chainId !== 11155111) {
      throw new Error('Please switch to Sepolia testnet');
    }

    return new ethers.Contract(CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);
  }, [signer, isConnected, chainId]);

  const getReadOnlyContract = useCallback(() => {
    if (!provider) {
      throw new Error('Provider not available');
    }
    
    return new ethers.Contract(CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);
  }, [provider]);

  const handleTransaction = async (
    transactionPromise: Promise<ethers.ContractTransactionResponse>,
    successMessage: string
  ): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const tx = await transactionPromise;
      dispatch({ type: 'SET_TX_HASH', payload: tx.hash });

      toast.loading('Transaction submitted. Waiting for confirmation...', { id: tx.hash });

      const receipt = await tx.wait();
      
      if (receipt?.status === 1) {
        toast.success(successMessage, { id: tx.hash });
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      const errorMessage = error.reason || error.message || 'Transaction failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Proposal functions
  const createProposal = async (
    title: string,
    description: string,
    durationInMinutes: number,
    category: string
  ): Promise<number | null> => {
    try {
      const contract = getContract();
      const tx = await contract.createProposal(title, description, durationInMinutes, category);
      
      const success = await handleTransaction(
        Promise.resolve(tx),
        'Proposal created successfully!'
      );

      if (success) {
        // Get the proposal ID from the transaction receipt
        const receipt = await tx.wait();
        const event = receipt?.logs.find((log: any) => {
          try {
            const parsedLog = contract.interface.parseLog(log);
            return parsedLog?.name === 'ProposalCreated';
          } catch {
            return false;
          }
        });

        if (event) {
          const parsedLog = contract.interface.parseLog(event);
          return Number(parsedLog?.args[0]);
        }
      }
      return null;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    }
  };

  const vote = async (proposalId: number, voteChoice: boolean): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const contract = getContract();
      
      // Pre-flight checks to prevent transaction failures
      const isRegistered = await contract.isRegisteredVoter(signer?.address);
      if (!isRegistered) {
        throw new Error('You must be registered as a voter first. Please contact an admin.');
      }
      
      const hasVoted = await contract.hasVoted(proposalId, signer?.address);
      if (hasVoted) {
        throw new Error('You have already voted on this proposal.');
      }
      
      const proposal = await contract.getProposal(proposalId);
      if (proposal.endTime <= Math.floor(Date.now() / 1000)) {
        throw new Error('This proposal has already ended.');
      }
      
      // Estimate gas before sending transaction
      const gasEstimate = await contract.vote.estimateGas(proposalId, voteChoice);
      
      const tx = await contract.vote(proposalId, voteChoice, {
        gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
      });
      
      return await handleTransaction(
        tx,
        `Vote ${voteChoice ? 'YES' : 'NO'} cast successfully!`
      );
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const endProposal = async (proposalId: number): Promise<boolean> => {
    try {
      const contract = getContract();
      const tx = contract.endProposal(proposalId);
      
      return await handleTransaction(tx, 'Proposal ended successfully!');
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    }
  };

  const getProposal = async (proposalId: number): Promise<Proposal | null> => {
    try {
      const contract = getReadOnlyContract();
      const result = await contract.getProposal(proposalId);
      
      return {
        id: Number(result[0]),
        title: result[1],
        description: result[2],
        startTime: Number(result[3]),
        endTime: Number(result[4]),
        yesVotes: Number(result[5]),
        noVotes: Number(result[6]),
        active: result[7],
        creator: result[8],
        category: result[9],
      };
    } catch (error: any) {
      console.error('Error fetching proposal:', error);
      return null;
    }
  };

  const getActiveProposals = async (): Promise<number[]> => {
    try {
      const contract = getReadOnlyContract();
      const result = await contract.getActiveProposals();
      return result.map((id: any) => Number(id));
    } catch (error: any) {
      console.error('Error fetching active proposals:', error);
      return [];
    }
  };

  const getAllProposals = async (): Promise<number[]> => {
    try {
      const contract = getReadOnlyContract();
      const result = await contract.getAllProposals();
      return result.map((id: any) => Number(id));
    } catch (error: any) {
      console.error('Error fetching all proposals:', error);
      return [];
    }
  };

  const getProposalResults = async (proposalId: number): Promise<ProposalResults | null> => {
    try {
      const contract = getReadOnlyContract();
      const result = await contract.getProposalResults(proposalId);
      
      return {
        totalVotes: Number(result[0]),
        yesVotes: Number(result[1]),
        noVotes: Number(result[2]),
        yesPercentage: Number(result[3]),
        noPercentage: Number(result[4]),
      };
    } catch (error: any) {
      console.error('Error fetching proposal results:', error);
      return null;
    }
  };

  // Voter functions
  const registerVoter = async (voterAddress: string): Promise<boolean> => {
    try {
      const contract = getContract();
      const tx = contract.registerVoter(voterAddress);
      
      return await handleTransaction(tx, 'Voter registered successfully!');
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    }
  };

  const registerVoters = async (voterAddresses: string[]): Promise<boolean> => {
    try {
      const contract = getContract();
      const tx = contract.registerVoters(voterAddresses);
      
      return await handleTransaction(tx, `${voterAddresses.length} voters registered successfully!`);
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    }
  };

  const unregisterVoter = async (voterAddress: string): Promise<boolean> => {
    try {
      const contract = getContract();
      const tx = contract.unregisterVoter(voterAddress);
      
      return await handleTransaction(tx, 'Voter unregistered successfully!');
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    }
  };

  const isRegisteredVoter = async (address: string): Promise<boolean> => {
    try {
      const contract = getReadOnlyContract();
      return await contract.isRegisteredVoter(address);
    } catch (error: any) {
      console.error('Error checking voter registration:', error);
      return false;
    }
  };

  const hasVoted = async (proposalId: number, address: string): Promise<boolean> => {
    try {
      const contract = getReadOnlyContract();
      return await contract.hasVoted(proposalId, address);
    } catch (error: any) {
      console.error('Error checking vote status:', error);
      return false;
    }
  };

  // Admin functions
  const isAdmin = async (address: string): Promise<boolean> => {
    try {
      const contract = getReadOnlyContract();
      return await contract.isAdmin(address);
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const addAdmin = async (adminAddress: string): Promise<boolean> => {
    try {
      const contract = getContract();
      const tx = contract.addAdmin(adminAddress);
      
      return await handleTransaction(tx, 'Admin added successfully!');
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    }
  };

  const removeAdmin = async (adminAddress: string): Promise<boolean> => {
    try {
      const contract = getContract();
      const tx = contract.removeAdmin(adminAddress);
      
      return await handleTransaction(tx, 'Admin removed successfully!');
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    }
  };

  // Utility functions
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const refreshData = async () => {
    // This can be used to refresh cached data
    dispatch({ type: 'CLEAR_STATE' });
  };

  const value: ContractContextType = {
    ...state,
    createProposal,
    vote,
    endProposal,
    getProposal,
    getActiveProposals,
    getAllProposals,
    getProposalResults,
    registerVoter,
    registerVoters,
    unregisterVoter,
    isRegisteredVoter,
    hasVoted,
    isAdmin,
    addAdmin,
    removeAdmin,
    clearError,
    refreshData,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContract() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
}
