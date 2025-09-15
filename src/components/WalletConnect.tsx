import React from 'react';
import { Wallet, Power, AlertCircle, CheckCircle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletProvider';
import { truncateAddress } from '@/lib/utils';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function WalletConnect() {
  const { 
    address, 
    balance, 
    chainId, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    switchToSepolia 
  } = useWallet();

  const isOnSepolia = chainId === 11155111;

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        {/* Network Status */}
        <div className="flex items-center gap-2">
          {isOnSepolia ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-success-500/20 border border-success-500/30 rounded-full">
              <CheckCircle className="w-4 h-4 text-success-400" />
              <span className="text-sm text-success-300">Sepolia</span>
            </div>
          ) : (
            <button
              onClick={switchToSepolia}
              className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full hover:bg-yellow-500/30 transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-300">Switch to Sepolia</span>
            </button>
          )}
        </div>

        {/* Wallet Info */}
        <div className="glass rounded-lg px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
            <div className="text-sm">
              <div className="text-white font-medium">
                {truncateAddress(address!)}
              </div>
              <div className="text-white/60">
                {parseFloat(balance).toFixed(4)} ETH
              </div>
            </div>
            <button
              onClick={disconnectWallet}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Disconnect Wallet"
            >
              <Power className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="btn-primary flex items-center gap-2 disabled:opacity-50"
    >
      {isConnecting ? (
        <>
          <LoadingSpinner size="sm" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
}
