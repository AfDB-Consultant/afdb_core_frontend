'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'text-red-500',
    },
    warning: {
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: 'text-amber-500',
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: 'text-blue-500',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-200 dark:border-[rgb(30,30,30)] shadow-2xl p-6 max-w-sm mx-4">
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 ${styles.icon}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[rgb(30,30,30)] transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${styles.button}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
