import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn('animate-spin text-primary-400', sizeClasses[size])} />
        {text && (
          <p className="text-sm text-white/70 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-white/10 rounded-lg', className)} />
  );
}

export function ProposalCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <LoadingSkeleton className="h-6 w-3/4" />
          <LoadingSkeleton className="h-6 w-16" />
        </div>
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-2/3" />
        <div className="flex justify-between items-center">
          <LoadingSkeleton className="h-8 w-24" />
          <LoadingSkeleton className="h-8 w-32" />
        </div>
      </div>
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg text-white/80">Loading...</p>
      </div>
    </div>
  );
}
