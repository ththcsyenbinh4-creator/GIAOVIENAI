'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, message?: string) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { id, type, title, message };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({
  toasts,
  onClose
}: {
  toasts: Toast[];
  onClose: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success" strokeWidth={1.5} />,
    error: <XCircle className="h-5 w-5 text-error" strokeWidth={1.5} />,
    warning: <AlertCircle className="h-5 w-5 text-warning" strokeWidth={1.5} />,
    info: <Info className="h-5 w-5 text-mono-500" strokeWidth={1.5} />,
  };

  const borderColors = {
    success: 'border-success/20 dark:border-success/30',
    error: 'border-error/20 dark:border-error/30',
    warning: 'border-warning/20 dark:border-warning/30',
    info: 'border-mono-200 dark:border-mono-700',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl',
        'border shadow-medium',
        'bg-mono-white/95 dark:bg-mono-900/95',
        'backdrop-blur-lg',
        'animate-slide-up',
        borderColors[toast.type]
      )}
      role="alert"
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-mono-900 dark:text-mono-100">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-mono-500 dark:text-mono-400 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
      >
        <X className="h-4 w-4 text-mono-400 dark:text-mono-500" strokeWidth={1.5} />
      </button>
    </div>
  );
}
