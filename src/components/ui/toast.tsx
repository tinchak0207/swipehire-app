'use client';

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  onClose: (id: string) => void;
  action?: React.ReactElement;
}

/**
 * Toast notification component
 */
const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  description: message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration, handleClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-success" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-error" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-warning" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-info" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-info" />;
    }
  };

  const getAlertClass = () => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-info';
    }
  };

  return (
    <div
      className={`alert ${getAlertClass()} transform shadow-lg transition-all duration-300 ${
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      {getIcon()}
      <div className="flex-1">
        <h3 className="font-bold">{title}</h3>
        {message && <div className="text-sm opacity-80">{message}</div>}
      </div>
      <button
        onClick={handleClose}
        className="btn btn-sm btn-circle btn-ghost"
        aria-label="Close notification"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

/**
 * Toast container component
 */
export interface ToastContainerProps {
  toasts: ToastProps[];
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast toast-end z-50">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onRemoveToast} />
      ))}
    </div>
  );
};

export default Toast;
