import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToastMessage } from '@/types';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-danger-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-primary-400" />;
    }
  };

  const getBackgroundClass = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-success-900/90 border-success-500/30';
      case 'error':
        return 'bg-danger-900/90 border-danger-500/30';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500/30';
      default:
        return 'bg-primary-900/90 border-primary-500/30';
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border backdrop-blur-md shadow-lg transform transition-all duration-300',
        getBackgroundClass(),
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      {getIcon()}
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white">{toast.title}</h4>
        <p className="text-sm text-white/80 mt-1">{toast.message}</p>
      </div>
      
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X className="w-4 h-4 text-white/60" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
