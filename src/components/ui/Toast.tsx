'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const toastIcons: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-500 dark:text-green-400',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500 dark:text-red-400',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-500 dark:text-amber-400',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500 dark:text-blue-400',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = toastIcons[toast.type];
  const styles = toastStyles[toast.type];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-[420px] animate-in slide-in-from-bottom-full',
        styles.bg,
        styles.border
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', styles.icon)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
  }, []);

  const success = useCallback((title: string, message?: string) => {
    toast('success', title, message);
  }, [toast]);

  const error = useCallback((title: string, message?: string) => {
    toast('error', title, message);
  }, [toast]);

  const warning = useCallback((title: string, message?: string) => {
    toast('warning', title, message);
  }, [toast]);

  const info = useCallback((title: string, message?: string) => {
    toast('info', title, message);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
