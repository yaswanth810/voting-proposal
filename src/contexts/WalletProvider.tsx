import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '@/types';
import toast from 'react-hot-toast';

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToSepolia: () => Promise<void>;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

type WalletAction =
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_WALLET'; payload: { address: string; balance: string; chainId: number } }
  | { type: 'SET_BALANCE'; payload: string }
  | { type: 'SET_CHAIN_ID'; payload: number }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'SET_ERROR'; payload: string };

const initialState: WalletState = {
  address: null,
  balance: '0',
  chainId: null,
  isConnected: false,
  isConnecting: false,
};

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_CONFIG = {
  chainId: '0xaa36a7',
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload };
    case 'SET_WALLET':
      return {
        ...state,
        address: action.payload.address,
        balance: action.payload.balance,
        chainId: action.payload.chainId,
        isConnected: true,
        isConnecting: false,
      };
    case 'SET_BALANCE':
      return { ...state, balance: action.payload };
    case 'SET_CHAIN_ID':
      return { ...state, chainId: action.payload };
    case 'DISCONNECT_WALLET':
      return { ...initialState };
    default:
      return state;
  }
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const [provider, setProvider] = React.useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = React.useState<ethers.JsonRpcSigner | null>(null);

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();

        setProvider(provider);
        setSigner(signer);

        dispatch({
          type: 'SET_WALLET',
          payload: {
            address,
            balance: ethers.formatEther(balance),
            chainId: Number(network.chainId),
          },
        });
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error('MetaMask is not installed. Please install MetaMask to continue.');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      dispatch({ type: 'SET_CONNECTING', payload: true });

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();

        setProvider(provider);
        setSigner(signer);

        dispatch({
          type: 'SET_WALLET',
          payload: {
            address,
            balance: ethers.formatEther(balance),
            chainId: Number(network.chainId),
          },
        });

        toast.success('Wallet connected successfully!');

        // Auto-switch to Sepolia if not already on it
        if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
          await switchToSepolia();
        }
      }
    } catch (error: any) {
      dispatch({ type: 'SET_CONNECTING', payload: false });
      console.error('Error connecting wallet:', error);
      
      if (error.code === 4001) {
        toast.error('Please connect to MetaMask.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    dispatch({ type: 'DISCONNECT_WALLET' });
    toast.success('Wallet disconnected');
  };

  const switchToSepolia = async () => {
    try {
      if (!window.ethereum) return;

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG],
          });
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
          toast.error('Failed to add Sepolia network');
        }
      } else {
        console.error('Error switching to Sepolia:', switchError);
        toast.error('Failed to switch to Sepolia network');
      }
    }
  };

  const updateBalance = async () => {
    try {
      if (provider && state.address) {
        const balance = await provider.getBalance(state.address);
        dispatch({ type: 'SET_BALANCE', payload: ethers.formatEther(balance) });
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          checkIfWalletIsConnected();
        }
      };

      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        dispatch({ type: 'SET_CHAIN_ID', payload: newChainId });
        
        if (newChainId !== SEPOLIA_CHAIN_ID) {
          toast.warning('Please switch to Sepolia testnet for full functionality');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Update balance periodically
  useEffect(() => {
    if (state.isConnected) {
      updateBalance();
      const interval = setInterval(updateBalance, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [state.isConnected, state.address]);

  const value: WalletContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    provider,
    signer,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
