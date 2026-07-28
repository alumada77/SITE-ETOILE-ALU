import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const bgColors = {
    success: 'bg-emerald-600 text-white dark:bg-emerald-700',
    error: 'bg-rose-600 text-white dark:bg-rose-700',
    info: 'bg-blue-600 text-white dark:bg-blue-700',
  };

  const Icons = {
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 animate-slide-up ${bgColors[type]}`}>
      {Icons[type]}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80 p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
