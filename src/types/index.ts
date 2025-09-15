export interface Proposal {
  id: number;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  yesVotes: number;
  noVotes: number;
  active: boolean;
  creator: string;
  category: string;
}

export interface Vote {
  hasVoted: boolean;
  voteChoice: boolean;
  timestamp: number;
}

export interface WalletState {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export interface ContractState {
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
}

export interface ProposalFormData {
  title: string;
  description: string;
  duration: number;
  durationUnit: 'minutes' | 'hours' | 'days';
  category: string;
}

export interface VoterRegistration {
  address: string;
  isRegistered: boolean;
  registrationDate?: number;
}

export interface ProposalResults {
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  yesPercentage: number;
  noPercentage: number;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
}

export type ProposalStatus = 'active' | 'ended' | 'pending' | 'expired';

export type Theme = 'light' | 'dark';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}
